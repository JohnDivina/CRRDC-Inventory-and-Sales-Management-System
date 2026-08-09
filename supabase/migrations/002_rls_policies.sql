-- ============================================================
-- CRRDC Platform — Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can read active products (catalog browsing)
CREATE POLICY "public_read_active_products"
  ON products
  FOR SELECT
  USING (is_active = true);

-- Only admins can insert/update/delete products
CREATE POLICY "admin_full_access_products"
  ON products
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM admin_users)
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- ─────────────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Guests can INSERT a new order (confirmed_by must be NULL — they can't self-confirm)
CREATE POLICY "guest_insert_order"
  ON orders
  FOR INSERT
  WITH CHECK (
    confirmed_by IS NULL
    AND status = 'pending'
  );

-- Anyone can read an order by ID (the order UUID IS the access token for guests)
-- Guests use the orderId to poll status; admins query their dashboard.
CREATE POLICY "public_read_orders"
  ON orders
  FOR SELECT
  USING (true);

-- Only admins can update orders (status change, confirm)
-- The actual status change is handled by the confirm_order() SECURITY DEFINER fn,
-- but this policy covers any direct admin dashboard edits (cancel, add notes).
CREATE POLICY "admin_update_orders"
  ON orders
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- ─────────────────────────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Guests can insert order items (via the checkout API route)
CREATE POLICY "guest_insert_order_items"
  ON order_items
  FOR INSERT
  WITH CHECK (true);

-- Anyone can read order items (paired with order read policy)
CREATE POLICY "public_read_order_items"
  ON order_items
  FOR SELECT
  USING (true);

-- Only admins can modify order items (shouldn't happen after creation,
-- but safety rail for corrections)
CREATE POLICY "admin_modify_order_items"
  ON order_items
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- ─────────────────────────────────────────────────────────────
-- ADMIN USERS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admins can only read their own row
CREATE POLICY "admin_read_self"
  ON admin_users
  FOR SELECT
  USING (auth.uid() = id);

-- Only existing admins can insert new admins
-- (or use a service-role server action for initial seeding)
CREATE POLICY "admin_insert_admin"
  ON admin_users
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users)
  );
