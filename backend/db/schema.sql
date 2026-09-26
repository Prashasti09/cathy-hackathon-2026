-- Owner: Devesh (kurozadev05) - backend
-- Creates all database tables for StockSense.
-- Safe to re-run: it deletes the old tables first, then creates fresh ones.
-- WARNING: re-running this ERASES all data. Run seed.sql afterwards for demo data.

DROP TABLE IF EXISTS operation_lines CASCADE;
DROP TABLE IF EXISTS operations CASCADE;
DROP TABLE IF EXISTS stock CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- People who can log in.
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  login_id      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- A warehouse, e.g. "Main Warehouse" with short code "WH".
-- The short code is the first part of references like WH/IN/0001.
CREATE TABLE warehouses (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  short_code VARCHAR(10)  NOT NULL UNIQUE,
  address    TEXT
);

-- Places inside a warehouse: rooms, racks, shelves (e.g. "Stock1", "Rack A").
CREATE TABLE locations (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  short_code   VARCHAR(20)  NOT NULL,
  warehouse_id INTEGER      NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  UNIQUE (warehouse_id, short_code)
);

CREATE TABLE categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(150)  NOT NULL,
  sku             VARCHAR(50)   NOT NULL UNIQUE,
  category_id     INTEGER       REFERENCES categories(id) ON DELETE SET NULL,
  unit_of_measure VARCHAR(20)   NOT NULL DEFAULT 'Units',
  unit_cost       NUMERIC(12,2) NOT NULL DEFAULT 0,
  reorder_level   NUMERIC(12,2) NOT NULL DEFAULT 0,  -- below this = "low stock"
  created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- How many of each product sit at each location right now ("on hand").
CREATE TABLE stock (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER       NOT NULL REFERENCES products(id)  ON DELETE CASCADE,
  location_id INTEGER       NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  quantity    NUMERIC(12,2) NOT NULL DEFAULT 0,
  UNIQUE (product_id, location_id)
);

-- One receipt, delivery, internal transfer or adjustment.
--   type:   IN = receipt, OUT = delivery, INT = internal transfer, ADJ = adjustment
--   status: draft -> (waiting) -> ready -> done, or canceled
--   from/to location: NULL means "outside the company" (vendor or customer)
CREATE TABLE operations (
  id               SERIAL PRIMARY KEY,
  reference        VARCHAR(50)  NOT NULL UNIQUE,          -- e.g. WH/IN/0001
  type             VARCHAR(5)   NOT NULL CHECK (type IN ('IN', 'OUT', 'INT', 'ADJ')),
  status           VARCHAR(10)  NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft', 'waiting', 'ready', 'done', 'canceled')),
  warehouse_id     INTEGER      NOT NULL REFERENCES warehouses(id),
  from_location_id INTEGER      REFERENCES locations(id),
  to_location_id   INTEGER      REFERENCES locations(id),
  contact          VARCHAR(150),                          -- vendor or customer name
  delivery_address TEXT,                                  -- used by deliveries
  schedule_date    DATE,
  responsible_id   INTEGER      REFERENCES users(id),     -- auto-filled with logged-in user
  created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
  validated_at     TIMESTAMP
);

-- The products inside one operation (one row per product).
-- Move History = the lines of operations that are 'done'.
CREATE TABLE operation_lines (
  id           SERIAL PRIMARY KEY,
  operation_id INTEGER       NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  product_id   INTEGER       NOT NULL REFERENCES products(id),
  quantity     NUMERIC(12,2) NOT NULL CHECK (quantity >= 0)
);

-- Indexes make list pages and filters fast.
CREATE INDEX idx_operations_type_status ON operations (type, status);
CREATE INDEX idx_operation_lines_op     ON operation_lines (operation_id);
CREATE INDEX idx_stock_product          ON stock (product_id);
