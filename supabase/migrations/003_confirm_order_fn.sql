-- ============================================================
-- CRRDC Platform — Atomic Order Confirmation Function
-- Migration: 003_confirm_order_fn.sql
-- ============================================================
--
-- This function is called by the admin confirm API route (server-side only).
-- It runs as SECURITY DEFINER to bypass RLS for the UPDATE operations.
-- The caller (API route) must verify the admin's identity BEFORE calling this.
--
-- Concurrency safety:
--   - SELECT ... FOR UPDATE on the orders row prevents double-confirmation
--     if two admin tabs submit simultaneously.
--   - SELECT ... FOR UPDATE on each products row prevents overselling
--     if two orders for the same item are confirmed simultaneously.
--   - Any failure rolls back the entire transaction — no partial decrements.
--
-- Returns: { ok: true } on success
--          { ok: false, error: "..." } on known failures
--          Raises an exception (500) on unexpected errors

CREATE OR REPLACE FUNCTION confirm_order(
  p_order_id UUID,
  p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item         RECORD;
  v_current_stock INTEGER;
  v_order_status  TEXT;
BEGIN
  -- ── 1. Lock and validate the order ──────────────────────────
  SELECT status INTO v_order_status
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;  -- exclusive lock — second concurrent call waits here

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Order not found'
    );
  END IF;

  IF v_order_status != 'pending' THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Order is already ' || v_order_status
    );
  END IF;

  -- ── 2. Validate admin identity ───────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM admin_users WHERE id = p_admin_id
  ) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Unauthorized: not an admin'
    );
  END IF;

  -- ── 3. Check stock and decrement atomically ──────────────────
  FOR v_item IN
    SELECT oi.product_id, oi.quantity, p.name AS product_name
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = p_order_id
  LOOP
    -- Lock each product row to prevent concurrent overselling
    SELECT stock_qty INTO v_current_stock
    FROM products
    WHERE id = v_item.product_id
    FOR UPDATE;

    IF v_current_stock < v_item.quantity THEN
      -- This will roll back the entire transaction automatically
      RAISE EXCEPTION
        'Insufficient stock for "%": % requested, % available',
        v_item.product_name, v_item.quantity, v_current_stock;
    END IF;

    -- Decrement stock
    UPDATE products
    SET
      stock_qty  = stock_qty - v_item.quantity,
      updated_at = now()
    WHERE id = v_item.product_id;
  END LOOP;

  -- ── 4. Mark order as completed ───────────────────────────────
  UPDATE orders
  SET
    status       = 'completed',
    confirmed_by = p_admin_id,
    confirmed_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('ok', true);

EXCEPTION
  WHEN OTHERS THEN
    -- Transaction is rolled back automatically.
    -- Re-raise so the API route receives a 500 with the message.
    RAISE;
END;
$$;

-- Revoke public execute — only service_role (server API) should call this
REVOKE ALL ON FUNCTION confirm_order(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION confirm_order(UUID, UUID) TO service_role;
