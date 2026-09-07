-- ============================================================
-- CRRDC Platform — Security Hardening & Strict RLS Policies
-- Migration: 006_security_hardening_rls.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. HARDEN ADMIN PROFILES (Prevent Unauthorized Role Escalation)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles FORCE ROW LEVEL SECURITY;

-- Drop permissive legacy policies
DROP POLICY IF EXISTS "Admins can view admin_profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can update admin_profiles" ON admin_profiles;

-- Authenticated users can view administrative profiles
CREATE POLICY "authenticated_view_admin_profiles"
  ON admin_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Only active master admins can update admin profile roles/status, or users can update their own contact info
CREATE POLICY "master_admin_manage_profiles"
  ON admin_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role = 'master_admin'
        AND ap.status = 'active'
    )
    OR (auth.uid() = id)
  )
  WITH CHECK (
    -- If updating your own profile, you cannot escalate your own role or status
    (
      auth.uid() = id
      AND role = (SELECT ap2.role FROM admin_profiles ap2 WHERE ap2.id = auth.uid())
      AND status = (SELECT ap3.status FROM admin_profiles ap3 WHERE ap3.id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role = 'master_admin'
        AND ap.status = 'active'
    )
  );

-- Only active master admins can delete admin profiles
CREATE POLICY "master_admin_delete_profiles"
  ON admin_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role = 'master_admin'
        AND ap.status = 'active'
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 2. HARDEN ORDERS & ORDER ITEMS (Prevent Public Data Scraping)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items FORCE ROW LEVEL SECURITY;

-- Drop open public read policies that exposed all orders to any anonymous caller
DROP POLICY IF EXISTS "public_read_orders" ON orders;
DROP POLICY IF EXISTS "public_read_order_items" ON order_items;

-- Authenticated staff can view all orders in dashboard
CREATE POLICY "authenticated_staff_read_orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_staff_read_order_items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated staff can update orders (e.g. cancellations, status updates)
DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "authenticated_staff_update_orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 3. HARDEN PROJECT ORDERS & AUDIT LOGS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE project_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE inventory_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_audit_log FORCE ROW LEVEL SECURITY;
ALTER TABLE system_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_audit_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE archived_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_periods FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view project orders" ON project_orders;
DROP POLICY IF EXISTS "Admins can view audit logs" ON inventory_audit_log;
DROP POLICY IF EXISTS "Admins can view system_audit_logs" ON system_audit_logs;
DROP POLICY IF EXISTS "Admins can insert system_audit_logs" ON system_audit_logs;
DROP POLICY IF EXISTS "Admins can view archived_periods" ON archived_periods;
DROP POLICY IF EXISTS "Admins can insert archived_periods" ON archived_periods;

-- Restrict to authenticated staff sessions
CREATE POLICY "authenticated_read_project_orders"
  ON project_orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_manage_project_orders"
  ON project_orders
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_view_inventory_audit_log"
  ON inventory_audit_log
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_view_system_audit_logs"
  ON system_audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_system_audit_logs"
  ON system_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_view_archived_periods"
  ON archived_periods
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_archived_periods"
  ON archived_periods
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 4. PERFORMANCE INDEXES ON RLS CHECK COLUMNS
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role_status ON admin_profiles(id, role, status);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_actor ON system_audit_logs(actor_id, created_at DESC);
