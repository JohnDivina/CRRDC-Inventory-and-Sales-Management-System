-- ============================================================
-- CRRDC Inventory & Sales Platform — Phase 2 Migration
-- Migration: 004_phase2_schema.sql
-- ============================================================

-- 1. ADMIN PROFILES & ROLES
CREATE TABLE IF NOT EXISTS admin_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  position    TEXT,
  designation TEXT,
  office      TEXT,
  role        TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('master_admin', 'cashier', 'seed_lab', 'admin')),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  approved_by UUID REFERENCES admin_profiles(id),
  approved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admin_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();


-- 2. DAILY BILLING NUMBER COUNTER (MM-DD-XX format)
CREATE TABLE IF NOT EXISTS daily_billing_counter (
  date    DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  counter INTEGER NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION generate_daily_billing_number()
RETURNS TEXT AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  next_val INTEGER;
  month_str TEXT;
  day_str TEXT;
  seq_str TEXT;
BEGIN
  INSERT INTO daily_billing_counter (date, counter)
  VALUES (today_date, 1)
  ON CONFLICT (date)
  DO UPDATE SET counter = daily_billing_counter.counter + 1
  RETURNING counter INTO next_val;

  month_str := lpad(extract(month from today_date)::text, 2, '0');
  day_str   := lpad(extract(day from today_date)::text, 2, '0');
  seq_str   := lpad(next_val::text, 2, '0');

  RETURN month_str || '-' || day_str || '-' || seq_str;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. EXPAND ORDERS TABLE
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'payment_confirmed', 'project_pending', 'completed', 'cancelled'));

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT NOT NULL DEFAULT 'regular'
  CHECK (order_type IN ('regular', 'institutional', 'project', 'complimentary'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_org TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS purpose TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS preferred_pickup_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS released_by UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_paid_php NUMERIC(10,2) DEFAULT 0.00 CHECK (amount_paid_php >= 0);

-- 4. PROJECT ORDERS TABLE (Delayed billing tracking)
CREATE TABLE IF NOT EXISTS project_orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  requestioner_name     TEXT NOT NULL,
  organization          TEXT NOT NULL,
  project_code          TEXT,
  project_title         TEXT,
  billing_number        TEXT,
  follow_up_date        DATE NOT NULL,
  payment_confirmed_at  TIMESTAMPTZ,
  payment_confirmed_by  UUID REFERENCES auth.users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. PRODUCTS LOW STOCK THRESHOLD & AUDIT LOG
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0);
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

CREATE TABLE IF NOT EXISTS inventory_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  changed_by      UUID REFERENCES auth.users(id),
  changed_by_name TEXT,
  change_type     TEXT NOT NULL CHECK (change_type IN ('manual_edit', 'order_deduction', 'manual_adjustment')),
  old_stock_qty   INTEGER NOT NULL,
  new_stock_qty   INTEGER NOT NULL,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. ATOMIC CONFIRM & RELEASE FUNCTIONS
CREATE OR REPLACE FUNCTION confirm_order_payment(
  p_order_id UUID,
  p_cashier_id UUID,
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

  RETURN jsonb_build_object(
    'ok', true,
    'billing_number', v_billing_num,
    'status', v_new_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION release_order_items(
  p_order_id UUID,
  p_staff_id UUID
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

    INSERT INTO inventory_audit_log (product_id, changed_by, change_type, old_stock_qty, new_stock_qty, note)
    VALUES (
      v_item.product_id,
      p_staff_id,
      'order_deduction',
      v_product.stock_qty,
      v_product.stock_qty - v_item.quantity,
      'Auto-deducted from Order #' || p_order_id
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

-- RLS & GRANTS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_billing_counter ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin_profiles" ON admin_profiles FOR SELECT USING (true);
CREATE POLICY "Admins can update admin_profiles" ON admin_profiles FOR ALL USING (true);
CREATE POLICY "Admins can view audit logs" ON inventory_audit_log FOR SELECT USING (true);
CREATE POLICY "Admins can view project orders" ON project_orders FOR SELECT USING (true);
