-- supabase/migrations/005_unified_audit_log.sql — Unified Audit Logs, Snapshot Archiving & Security Hardening

-- 1. UNIFIED SYSTEM AUDIT LOGS (Append-Only)
CREATE TABLE IF NOT EXISTS system_audit_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id          UUID REFERENCES auth.users(id),
  actor_name        TEXT NOT NULL DEFAULT 'System / Staff',
  actor_designation TEXT DEFAULT 'Staff Administrator',
  action_type       TEXT NOT NULL CHECK (action_type IN (
                      'inventory_addition', 
                      'inventory_edit', 
                      'cashier_payment_confirm', 
                      'seed_lab_release', 
                      'data_reset'
                    )),
  target_table      TEXT NOT NULL,
  record_id         TEXT NOT NULL,
  quantity          INTEGER DEFAULT 0,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ARCHIVED PERIODS (Data Reset Snapshots)
CREATE TABLE IF NOT EXISTS archived_periods (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_name      TEXT NOT NULL,
  archived_by      UUID REFERENCES auth.users(id),
  archived_by_name TEXT NOT NULL DEFAULT 'Master Administrator',
  orders_count     INTEGER NOT NULL DEFAULT 0,
  total_sales_php  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  snapshot_data    JSONB NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. UPDATE CONFIRM PAYMENT FUNCTION WITH STAFF ATTRIBUTION
CREATE OR REPLACE FUNCTION confirm_order_payment(
  p_order_id UUID,
  p_cashier_id UUID,
  p_cashier_name TEXT DEFAULT 'CRRDC Cashier',
  p_amount_paid NUMERIC(10,2) DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_billing_num TEXT;
  v_new_status TEXT;
  v_final_amount NUMERIC(10,2);
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Order not found.');
  END IF;

  IF v_order.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Order is already processed.');
  END IF;

  v_billing_num := generate_daily_billing_number();

  IF v_order.order_type = 'project' THEN
    v_new_status := 'project_pending';
    v_final_amount := 0;
  ELSIF v_order.order_type = 'complimentary' THEN
    v_new_status := 'payment_confirmed';
    v_final_amount := 0;
  ELSE
    v_new_status := 'payment_confirmed';
    v_final_amount := COALESCE(p_amount_paid, v_order.total_price_php);
  END IF;

  UPDATE orders
  SET status = v_new_status,
      billing_number = v_billing_num,
      confirmed_by = p_cashier_id,
      confirmed_at = now(),
      amount_paid_php = v_final_amount
  WHERE id = p_order_id;

  -- Insert into Unified System Audit Log
  INSERT INTO system_audit_logs (
    actor_id, actor_name, actor_designation, action_type, target_table, record_id, notes
  ) VALUES (
    p_cashier_id,
    COALESCE(p_cashier_name, 'CRRDC Cashier'),
    'Cashier Staff',
    'cashier_payment_confirm',
    'orders',
    p_order_id::text,
    'Confirmed payment. Billing Reference No: ' || v_billing_num
  );

  RETURN jsonb_build_object(
    'ok', true,
    'billing_number', v_billing_num,
    'status', v_new_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. UPDATE RELEASE FUNCTION WITH STAFF ATTRIBUTION
CREATE OR REPLACE FUNCTION release_order_items(
  p_order_id UUID,
  p_staff_id UUID,
  p_staff_name TEXT DEFAULT 'Seed Lab Staff'
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_product RECORD;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Order not found.');
  END IF;

  IF v_order.status <> 'payment_confirmed' AND v_order.status <> 'project_pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Order is not ready for item release.');
  END IF;

  FOR v_item IN SELECT * FROM order_items WHERE order_id = p_order_id LOOP
    SELECT * INTO v_product FROM products WHERE id = v_item.product_id FOR UPDATE;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Product missing.');
    END IF;

    IF v_product.stock_qty < v_item.quantity THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Insufficient stock for ' || v_product.name);
    END IF;

    UPDATE products
    SET stock_qty = stock_qty - v_item.quantity,
        updated_at = now()
    WHERE id = v_item.product_id;

    -- Legacy inventory log entry for backwards compatibility
    INSERT INTO inventory_audit_log (product_id, changed_by, changed_by_name, change_type, old_stock_qty, new_stock_qty, note)
    VALUES (
      v_item.product_id,
      p_staff_id,
      p_staff_name,
      'order_deduction',
      v_product.stock_qty,
      v_product.stock_qty - v_item.quantity,
      'Auto-deducted from Order #' || p_order_id
    );

    -- Unified Audit Log entry
    INSERT INTO system_audit_logs (
      actor_id, actor_name, actor_designation, action_type, target_table, record_id, quantity, notes
    ) VALUES (
      p_staff_id,
      COALESCE(p_staff_name, 'Seed Lab Staff'),
      'Seed Lab Staff',
      'seed_lab_release',
      'products',
      v_item.product_id::text,
      v_item.quantity,
      'Released product "' || v_product.name || '" for Order #' || p_order_id
    );
  END LOOP;

  UPDATE orders
  SET status = 'completed',
      released_by = p_staff_id,
      released_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('ok', true, 'status', 'completed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS POLICIES FOR UNIFIED AUDIT LOG & ARCHIVED PERIODS
ALTER TABLE system_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_periods ENABLE ROW LEVEL SECURITY;

-- Append-only Policy: Allow SELECT & INSERT for authenticated admins, DENY UPDATE/DELETE
CREATE POLICY "Admins can view system_audit_logs" ON system_audit_logs FOR SELECT USING (true);
CREATE POLICY "Admins can insert system_audit_logs" ON system_audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view archived_periods" ON archived_periods FOR SELECT USING (true);
CREATE POLICY "Admins can insert archived_periods" ON archived_periods FOR INSERT WITH CHECK (true);
