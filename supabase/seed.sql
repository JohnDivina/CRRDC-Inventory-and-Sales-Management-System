-- ============================================================
-- CRRDC Platform — Development Seed Data
-- supabase/seed.sql
-- ============================================================
-- Run this after migrations to populate dev data.
-- DO NOT run in production.

INSERT INTO products (id, name, description, category, unit_type, price_php, stock_qty, is_active)
VALUES
  -- ── Seeds ────────────────────────────────────────────────────
  (
    '11111111-1111-1111-1111-111111111111',
    'RC 222 Foundation Seeds',
    'Certified foundation seeds of RC 222, a high-yielding inbred rice variety developed by CLSU. Ideal for irrigated lowland conditions.',
    'seed', 'packet', 450.00, 200, true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'NSIC Rc 216 Registered Seeds',
    'Registered class seeds of NSIC Rc 216. Short duration variety with excellent eating quality.',
    'seed', 'packet', 380.00, 150, true
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Sweet Corn Hybrid Seeds',
    'Premium sweet corn hybrid seeds. High sugar content, suitable for fresh market and processing.',
    'seed', 'packet', 250.00, 80, true
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    'Mungbean Seeds (Pagasa 3)',
    'High-yielding mungbean variety. Short maturing, tolerant to Cercospora leaf spot.',
    'seed', 'packet', 120.00, 300, true
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    'Peanut Seeds (BPI Pn-1)',
    'Certified peanut seeds suitable for rain-fed upland areas. High shelling percentage.',
    'seed', 'packet', 180.00, 120, true
  ),

  -- ── Rice (sold by kg or sack) ─────────────────────────────────
  (
    '44444444-4444-4444-4444-444444444444',
    'RC 222 Milled Rice (Loose)',
    'Premium milled rice from CRRDC''s own RC 222 variety. Soft texture, slightly sticky. Sold per kilogram.',
    'rice', 'kg', 52.00, 500, true
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'RC 222 Milled Rice (25 kg Sack)',
    'Premium milled rice from CRRDC''s own RC 222 variety — 25 kg sack. Ideal for families and small canteens.',
    'rice', 'sack', 1250.00, 40, true
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    'CLSU Brown Rice (Loose)',
    'Minimally-milled brown rice retaining the bran layer. Rich in fiber. Sold per kilogram.',
    'rice', 'kg', 58.00, 200, true
  ),

  -- ── Other agricultural products ───────────────────────────────
  (
    '66666666-6666-6666-6666-666666666666',
    'Vermicompost (5 kg bag)',
    'Organic vermicompost produced by CRRDC''s vermiculture unit. Improves soil structure and fertility.',
    'other', 'unit', 95.00, 60, true
  ),
  (
    'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0',
    'Azolla Starter Culture',
    'Live Azolla pinnata culture. Nitrogen-fixing bio-fertilizer for paddy fields. Per tray.',
    'other', 'unit', 75.00, 30, true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_php = EXCLUDED.price_php,
  stock_qty = EXCLUDED.stock_qty,
  is_active = EXCLUDED.is_active;

