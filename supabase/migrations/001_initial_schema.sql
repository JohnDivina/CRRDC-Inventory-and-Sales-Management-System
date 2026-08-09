-- ============================================================
-- CRRDC Inventory & Sales Platform — Initial Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  description   TEXT,
  category      TEXT        NOT NULL CHECK (category IN ('seed', 'rice', 'other')),
  -- packet = seeds sold by packet
  -- kg     = rice sold loose by kilogram
  -- sack   = rice sold as a fixed 25 kg unit (can coexist with a paired kg product)
  -- other  = misc items with a fixed unit
  unit_type     TEXT        NOT NULL CHECK (unit_type IN ('packet', 'kg', 'sack', 'unit')),
  price_php     NUMERIC(10,2) NOT NULL CHECK (price_php >= 0),
  -- For rice: price_php is per kg; sack_price_php is the fixed 25-kg sack price
  -- NULL means sack pricing = price_php * 25 (no sack discount)
  sack_price_php NUMERIC(10,2) CHECK (sack_price_php >= 0),
  stock_qty     INTEGER     NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  image_url     TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- ORDERS  (guest-initiated — no auth required to create)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Ephemeral identifier stored client-side for order tracking only.
  -- Not a user account. Not tied to Supabase Auth.
  guest_id        UUID        NOT NULL DEFAULT gen_random_uuid(),
  status          TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'completed', 'cancelled')),
  total_price_php NUMERIC(10,2) NOT NULL CHECK (total_price_php >= 0),
  -- JSON payload encoded into the QR code: { orderId, totalPhp }
  qr_payload      TEXT        NOT NULL,
  -- Filled in when admin confirms payment
  confirmed_by    UUID        REFERENCES auth.users(id),
  confirmed_at    TIMESTAMPTZ,
  notes           TEXT,       -- optional admin note at confirmation
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- ORDER ITEMS  (price snapshot at purchase time)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID        NOT NULL REFERENCES orders(id)    ON DELETE CASCADE,
  product_id      UUID        NOT NULL REFERENCES products(id)  ON DELETE RESTRICT,
  -- Quantity in the product's native unit (packets, kg, or sacks)
  quantity        INTEGER     NOT NULL CHECK (quantity > 0),
  -- Snapshot of unit_type at purchase time (products can change)
  unit_type       TEXT        NOT NULL,
  -- Snapshot of unit price at purchase time
  unit_price_php  NUMERIC(10,2) NOT NULL CHECK (unit_price_php >= 0),
  line_total_php  NUMERIC(10,2) NOT NULL CHECK (line_total_php >= 0)
);

-- ─────────────────────────────────────────────────────────────
-- ADMIN USERS  (linked to Supabase Auth OAuth identities)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL UNIQUE,
  full_name   TEXT,
  -- Future: 'super_admin' | 'staff' — single tier for now
  role        TEXT        NOT NULL DEFAULT 'admin',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_active      ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product  ON order_items(product_id);

-- ─────────────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at on products
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
