-- ============================================================
-- CRRDC Platform — Development Seed Data
-- supabase/seed.sql
-- ============================================================
-- Run this after migrations to populate dev data.
-- DO NOT run in production.

INSERT INTO products (name, description, category, unit_type, price_php, stock_qty, is_active)
VALUES
  -- ── Seeds ────────────────────────────────────────────────────
  (
    'RC 222 Foundation Seeds',
    'Certified foundation seeds of RC 222, a high-yielding inbred rice variety developed by CLSU. Ideal for irrigated lowland conditions.',
    'seed', 'packet', 450.00, 200, true
  ),
  (
    'NSIC Rc 216 Registered Seeds',
    'Registered class seeds of NSIC Rc 216. Short duration variety with excellent eating quality.',
    'seed', 'packet', 380.00, 150, true
  ),
  (
    'Sweet Corn Hybrid Seeds',
    'Premium sweet corn hybrid seeds. High sugar content, suitable for fresh market and processing.',
    'seed', 'packet', 250.00, 80, true
  ),
  (
    'Mungbean Seeds (Pagasa 3)',
    'High-yielding mungbean variety. Short maturing, tolerant to Cercospora leaf spot.',
    'seed', 'packet', 120.00, 300, true
  ),
  (
    'Peanut Seeds (BPI Pn-1)',
    'Certified peanut seeds suitable for rain-fed upland areas. High shelling percentage.',
    'seed', 'packet', 180.00, 120, true
  ),

  -- ── Rice (sold by kg or sack) ─────────────────────────────────
  (
    'RC 222 Milled Rice (Loose)',
    'Premium milled rice from CRRDC's own RC 222 variety. Soft texture, slightly sticky. Sold per kilogram.',
    'rice', 'kg', 52.00, 500, true
  ),
  (
    'RC 222 Milled Rice (Sack)',
    'Premium milled rice from CRRDC's own RC 222 variety — 25 kg sack. Ideal for families and small canteens.',
    'rice', 'sack', 1250.00, 40, true
  ),
  (
    'CLSU Brown Rice (Loose)',
    'Minimally-milled brown rice retaining the bran layer. Rich in fiber. Sold per kilogram.',
    'rice', 'kg', 58.00, 200, true
  ),

  -- ── Other agricultural products ───────────────────────────────
  (
    'Vermicompost (5 kg bag)',
    'Organic vermicompost produced by CRRDC's vermiculture unit. Improves soil structure and fertility.',
    'other', 'unit', 95.00, 60, true
  ),
  (
    'Azolla Starter Culture',
    'Live Azolla pinnata culture. Nitrogen-fixing bio-fertilizer for paddy fields. Per tray.',
    'other', 'unit', 75.00, 30, true
  );
