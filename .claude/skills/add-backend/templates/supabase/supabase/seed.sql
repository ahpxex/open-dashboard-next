-- =============================================================================
-- Seed data for the `products` table.
-- =============================================================================
-- Applied automatically by `supabase db reset` / `supabase start` (config.toml
-- → [db.seed].sql_paths). Mirrors the frontend's `demo-data.ts` so the dashboard
-- shows the same catalogue on either backend.
--
-- Fixed UUIDs + ON CONFLICT DO NOTHING make this idempotent: re-seeding will not
-- duplicate rows. created_at/updated_at are set explicitly here (the trigger only
-- fires on UPDATE, not INSERT) so the demo timestamps match the reference data.
-- =============================================================================

insert into public.products
  (id, name, sku, category, price, stock, status, description, created_at, updated_at)
values
  ('11111111-1111-4111-8111-000000000001', 'Aurora Wireless Headphones', 'AUR-WH-001', 'Electronics',    199.99,  42, 'available',    'Over-ear noise-cancelling headphones with 30h battery.', '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
  ('11111111-1111-4111-8111-000000000002', 'Nimbus Mechanical Keyboard', 'NMB-KB-002', 'Electronics',    129.00,   0, 'out_of_stock', 'Hot-swappable 75% mechanical keyboard.',                 '2026-01-06T12:30:00Z', '2026-01-12T08:15:00Z'),
  ('11111111-1111-4111-8111-000000000003', 'Terra Cotton T-Shirt',       'TER-TS-003', 'Apparel',         24.50, 318, 'available',    'Organic cotton crew-neck tee.',                          '2026-01-08T15:45:00Z', '2026-01-08T15:45:00Z'),
  ('11111111-1111-4111-8111-000000000004', 'Solis Insulated Bottle',     'SOL-BT-004', 'Home & Kitchen',  32.00,  87, 'available',    '1L vacuum-insulated stainless steel bottle.',            '2026-01-09T10:00:00Z', '2026-01-10T11:20:00Z'),
  ('11111111-1111-4111-8111-000000000005', 'Helio Desk Lamp',            'HEL-DL-005', 'Home & Kitchen',  58.75,  12, 'available',    'Dimmable LED desk lamp with USB-C charging.',            '2026-01-11T14:10:00Z', '2026-01-11T14:10:00Z'),
  ('11111111-1111-4111-8111-000000000006', 'Vega Running Shoes',         'VEG-RS-006', 'Sports',          89.99,  56, 'available',    'Lightweight road-running shoes.',                        '2026-01-12T09:30:00Z', '2026-01-12T09:30:00Z'),
  ('11111111-1111-4111-8111-000000000007', 'Lumen Pocket Notebook',      'LUM-NB-007', 'Books',           12.00, 240, 'available',    'Dot-grid A6 notebook, 192 pages.',                       '2026-01-13T16:00:00Z', '2026-01-13T16:00:00Z'),
  ('11111111-1111-4111-8111-000000000008', 'Cobalt Bluetooth Speaker',   'COB-SP-008', 'Electronics',     74.99,   0, 'discontinued', 'Portable splash-proof speaker (legacy model).',          '2026-01-02T08:00:00Z', '2026-01-14T13:40:00Z'),
  ('11111111-1111-4111-8111-000000000009', 'Marin Yoga Mat',             'MAR-YM-009', 'Sports',          39.00, 134, 'available',    '6mm non-slip TPE yoga mat.',                             '2026-01-14T11:05:00Z', '2026-01-14T11:05:00Z'),
  ('11111111-1111-4111-8111-000000000010', 'Orchid Ceramic Mug Set',     'ORC-MG-010', 'Home & Kitchen',  28.00,  64, 'available',    'Set of 4 hand-glazed 350ml mugs.',                       '2026-01-15T10:20:00Z', '2026-01-15T10:20:00Z'),
  ('11111111-1111-4111-8111-000000000011', 'Pulse Fitness Tracker',      'PUL-FT-011', 'Electronics',    149.00,  23, 'available',    'Heart-rate and sleep tracking wristband.',               '2026-01-16T09:50:00Z', '2026-01-16T09:50:00Z'),
  ('11111111-1111-4111-8111-000000000012', 'Cedar Wool Beanie',          'CED-BN-012', 'Apparel',         19.99,   0, 'out_of_stock', 'Merino wool ribbed beanie.',                             '2026-01-17T12:00:00Z', '2026-01-17T12:00:00Z')
on conflict (id) do nothing;
