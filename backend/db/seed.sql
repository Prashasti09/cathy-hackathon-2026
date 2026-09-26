-- Owner: Devesh (kurozadev05) - backend
-- Realistic demo data for the hackathon video. Run AFTER schema.sql.
-- Dates use CURRENT_DATE, so "late" and "upcoming" work on any day you run it.
--
-- Logins (all use password admin123):
--   admin, prashasti, devesh, anmol

-- ---------- users ----------
INSERT INTO users (id, login_id, email, password_hash) VALUES
  (1, 'admin',     'admin@stocksense.local',     '$2b$10$OxJcue.Pn1TOsW/MeHNREOR1vhmstTxlDZVPYB6XcVZDaUsOENxta'),
  (2, 'prashasti', 'prashasti@stocksense.local', '$2b$10$OxJcue.Pn1TOsW/MeHNREOR1vhmstTxlDZVPYB6XcVZDaUsOENxta'),
  (3, 'devesh',    'devesh@stocksense.local',    '$2b$10$OxJcue.Pn1TOsW/MeHNREOR1vhmstTxlDZVPYB6XcVZDaUsOENxta'),
  (4, 'anmol',     'anmol@stocksense.local',     '$2b$10$OxJcue.Pn1TOsW/MeHNREOR1vhmstTxlDZVPYB6XcVZDaUsOENxta');

-- ---------- warehouses & locations ----------
INSERT INTO warehouses (id, name, short_code, address) VALUES
  (1, 'Main Warehouse',        'WH', 'Plot 14, IDA Uppal, Hyderabad'),
  (2, 'Secunderabad Store',    'SW', 'SP Road, Secunderabad');

INSERT INTO locations (id, name, short_code, warehouse_id) VALUES
  (1, 'Stock 1',          'Stock1', 1),
  (2, 'Stock 2',          'Stock2', 1),
  (3, 'Production Floor', 'Prod',   1),
  (4, 'Main Stock',       'Stock',  2);

-- ---------- categories & products ----------
INSERT INTO categories (id, name) VALUES
  (1, 'Furniture'), (2, 'Raw Material'), (3, 'Office Supplies');

INSERT INTO products (id, name, sku, category_id, unit_of_measure, unit_cost, reorder_level) VALUES
  (1, 'Desk',          'DESK001',  1, 'Units',  3000, 10),
  (2, 'Table',         'TABLE001', 1, 'Units',  3000, 10),
  (3, 'Chair',         'CHAIR001', 1, 'Units',  1200, 25),
  (4, 'Steel Rods',    'STEEL001', 2, 'kg',       80, 50),
  (5, 'Office Lamp',   'LAMP001',  3, 'Units',   650,  5),
  (6, 'Bookshelf',     'SHELF001', 1, 'Units',  4500,  3),
  (7, 'Wooden Plank',  'WOOD001',  2, 'Units',   220, 40),
  (8, 'Printer Paper', 'PAPER001', 3, 'Boxes',   300, 20);

-- ---------- current stock (already includes the finished operations below) ----------
-- Chair and Printer Paper are LOW, Bookshelf is OUT of stock (for the dashboard).
INSERT INTO stock (product_id, location_id, quantity) VALUES
  (1, 1, 45),    -- Desk          WH/Stock1
  (2, 1, 30),    -- Table         WH/Stock1
  (3, 1, 20),    -- Chair         WH/Stock1   (low: below 25)
  (4, 1, 77),    -- Steel Rods    WH/Stock1
  (4, 3, 20),    -- Steel Rods    WH/Prod     (moved by WH/INT/0001)
  (5, 2, 15),    -- Office Lamp   WH/Stock2
  (7, 4, 200),   -- Wooden Plank  SW/Stock
  (8, 2, 8);     -- Printer Paper WH/Stock2   (low: below 20)
  -- Bookshelf has no stock anywhere -> out of stock

-- ---------- operations ----------
-- type: IN receipt, OUT delivery, INT transfer, ADJ adjustment
INSERT INTO operations (id, reference, type, status, warehouse_id, from_location_id, to_location_id,
                        contact, delivery_address, schedule_date, responsible_id, created_at, validated_at) VALUES
  -- finished (these fill Move History)
  (1,  'WH/IN/0001',  'IN',  'done',    1, NULL, 1, 'Azure Interior',     NULL, CURRENT_DATE - 6, 2, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  (2,  'WH/IN/0002',  'IN',  'done',    1, NULL, 1, 'Deccan Steel Co.',   NULL, CURRENT_DATE - 5, 3, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  (3,  'WH/INT/0001', 'INT', 'done',    1, 1,    3, 'For frame production', NULL, CURRENT_DATE - 4, 4, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  (4,  'WH/OUT/0001', 'OUT', 'done',    1, 1, NULL, 'Brightway Offices',  'Hitech City, Hyderabad', CURRENT_DATE - 3, 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  (5,  'WH/ADJ/0001', 'ADJ', 'done',    1, NULL, 1, '3 kg steel damaged', NULL, CURRENT_DATE - 2, 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

  -- open receipts -> dashboard "3 to receive, 1 late"
  (6,  'WH/IN/0003',  'IN',  'ready',   1, NULL, 1, 'Azure Interior',     NULL, CURRENT_DATE - 1, 2, NOW() - INTERVAL '2 days', NULL),
  (7,  'WH/IN/0004',  'IN',  'ready',   1, NULL, 2, 'Office Mart',        NULL, CURRENT_DATE,     4, NOW() - INTERVAL '1 day',  NULL),
  (8,  'WH/IN/0005',  'IN',  'ready',   1, NULL, 1, 'Deccan Steel Co.',   NULL, CURRENT_DATE + 3, 3, NOW(),                     NULL),
  (9,  'WH/IN/0006',  'IN',  'draft',   1, NULL, 1, 'Woodcraft Traders',  NULL, CURRENT_DATE + 5, 2, NOW(),                     NULL),

  -- open deliveries -> dashboard "2 to deliver, 1 late, 1 waiting"
  (10, 'WH/OUT/0002', 'OUT', 'ready',   1, 1, NULL, 'Brightway Offices',  'Hitech City, Hyderabad',  CURRENT_DATE,     2, NOW() - INTERVAL '1 day',  NULL),
  (11, 'WH/OUT/0003', 'OUT', 'waiting', 1, 1, NULL, 'Sunrise School',     'Kukatpally, Hyderabad',   CURRENT_DATE + 2, 4, NOW() - INTERVAL '1 day',  NULL),
  (12, 'WH/OUT/0004', 'OUT', 'ready',   1, 1, NULL, 'Nova Coworking',     'Banjara Hills, Hyderabad', CURRENT_DATE - 1, 3, NOW() - INTERVAL '3 days', NULL),
  (13, 'WH/OUT/0005', 'OUT', 'draft',   1, 2, NULL, 'Greenleaf Clinic',   'Madhapur, Hyderabad',     CURRENT_DATE + 4, 2, NOW(),                     NULL),

  -- scheduled transfer
  (14, 'WH/INT/0002', 'INT', 'draft',   1, 1,    2, 'Move chairs to Stock 2', NULL, CURRENT_DATE + 1, 4, NOW(), NULL);

INSERT INTO operation_lines (operation_id, product_id, quantity) VALUES
  (1, 1, 20), (1, 3, 30),          -- WH/IN/0001:  20 Desk, 30 Chair
  (2, 4, 100),                     -- WH/IN/0002:  100 kg Steel
  (3, 4, 20),                      -- WH/INT/0001: 20 kg Steel Stock1 -> Prod
  (4, 1, 5), (4, 3, 10),           -- WH/OUT/0001: 5 Desk, 10 Chair
  (5, 4, 77),                      -- WH/ADJ/0001: counted 77 kg (was 80, 3 damaged)
  (6, 2, 10), (6, 6, 5),           -- WH/IN/0003:  10 Table, 5 Bookshelf (late)
  (7, 8, 30), (7, 5, 10),          -- WH/IN/0004:  30 Paper, 10 Lamp
  (8, 4, 150),                     -- WH/IN/0005:  150 kg Steel
  (9, 7, 60),                      -- WH/IN/0006:  60 Wooden Plank
  (10, 1, 4), (10, 2, 2),          -- WH/OUT/0002: 4 Desk, 2 Table
  (11, 6, 4), (11, 3, 6),          -- WH/OUT/0003: 4 Bookshelf (none in stock -> waiting), 6 Chair
  (12, 3, 8),                      -- WH/OUT/0004: 8 Chair (late)
  (13, 5, 3), (13, 8, 2),          -- WH/OUT/0005: 3 Lamp, 2 Paper
  (14, 3, 5);                      -- WH/INT/0002: 5 Chair Stock1 -> Stock2

-- Explicit ids were used above, so move the counters past them.
SELECT setval('users_id_seq',           (SELECT MAX(id) FROM users));
SELECT setval('warehouses_id_seq',      (SELECT MAX(id) FROM warehouses));
SELECT setval('locations_id_seq',       (SELECT MAX(id) FROM locations));
SELECT setval('categories_id_seq',      (SELECT MAX(id) FROM categories));
SELECT setval('products_id_seq',        (SELECT MAX(id) FROM products));
SELECT setval('operations_id_seq',      (SELECT MAX(id) FROM operations));