-- Owner: Devesh (kurozadev05) - backend
-- Demo data so the app isn't empty. Run AFTER schema.sql.
-- Demo login:  login id = admin   password = admin123

INSERT INTO users (login_id, email, password_hash) VALUES
  ('admin', 'admin@stocksense.local', '$2b$10$OxJcue.Pn1TOsW/MeHNREOR1vhmstTxlDZVPYB6XcVZDaUsOENxta');

INSERT INTO warehouses (name, short_code, address) VALUES
  ('Main Warehouse', 'WH', 'Hyderabad');

INSERT INTO locations (name, short_code, warehouse_id) VALUES
  ('Stock 1',          'Stock1', 1),
  ('Stock 2',          'Stock2', 1),
  ('Production Floor', 'Prod',   1);

INSERT INTO categories (name) VALUES
  ('Furniture'),
  ('Raw Material');

INSERT INTO products (name, sku, category_id, unit_of_measure, unit_cost, reorder_level) VALUES
  ('Desk',        'DESK001',  1, 'Units', 3000, 10),
  ('Table',       'TABLE001', 1, 'Units', 3000, 10),
  ('Chair',       'CHAIR001', 1, 'Units', 1200, 20),
  ('Steel Rods',  'STEEL001', 2, 'kg',     80,  50);

-- Starting stock (all in Stock 1). Chair is deliberately low for the demo.
INSERT INTO stock (product_id, location_id, quantity) VALUES
  (1, 1, 50),
  (2, 1, 50),
  (3, 1, 5),
  (4, 1, 100);
