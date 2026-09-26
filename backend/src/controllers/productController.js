// Owner: Devesh (kurozadev05) - backend
// Products + the Stock page (on hand, free to use) + categories.
const pool = require('../config/db');
const httpError = require('../utils/httpError');
const { nextReference } = require('../services/referenceService');
const { applyOperation } = require('../services/stockService');

// on_hand     = total quantity across all locations
// free_to_use = on_hand minus what's already promised to open deliveries
const PRODUCT_SELECT = `
  SELECT p.*, c.name AS category_name,
    COALESCE((SELECT SUM(quantity) FROM stock s WHERE s.product_id = p.id), 0) AS on_hand,
    GREATEST(0, COALESCE((SELECT SUM(quantity) FROM stock s WHERE s.product_id = p.id), 0)
      - COALESCE((SELECT SUM(ol.quantity) FROM operation_lines ol
                  JOIN operations o ON o.id = ol.operation_id
                  WHERE ol.product_id = p.id AND o.type = 'OUT' AND o.status IN ('waiting', 'ready')), 0))
      AS free_to_use
  FROM products p LEFT JOIN categories c ON c.id = p.category_id`;

exports.list = async (req, res) => {
  const { q, categoryId, lowStock } = req.query;
  const where = [];
  const params = [];
  if (q) { params.push(`%${q}%`); where.push(`(p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`); }
  if (categoryId) { params.push(categoryId); where.push(`p.category_id = $${params.length}`); }
  let sql = `SELECT * FROM (${PRODUCT_SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''}) x`;
  if (lowStock === 'true') sql += ' WHERE on_hand <= reorder_level';
  sql += ' ORDER BY name';
  const r = await pool.query(sql, params);
  res.json(r.rows);
};

exports.getOne = async (req, res) => {
  const r = await pool.query(`${PRODUCT_SELECT} WHERE p.id = $1`, [req.params.id]);
  if (!r.rows.length) throw httpError(404, 'Product not found');
  const perLocation = await pool.query(
    `SELECT l.id AS location_id, w.short_code || '/' || l.short_code AS location, s.quantity
     FROM stock s JOIN locations l ON l.id = s.location_id JOIN warehouses w ON w.id = l.warehouse_id
     WHERE s.product_id = $1 ORDER BY location`,
    [req.params.id]
  );
  res.json({ ...r.rows[0], stock_by_location: perLocation.rows });
};

exports.create = async (req, res) => {
  const { name, sku, categoryId, unitOfMeasure, unitCost, reorderLevel, initialStock, locationId } = req.body;
  if (!name || !sku) throw httpError(400, 'Name and SKU are required');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const r = await client.query(
      `INSERT INTO products (name, sku, category_id, unit_of_measure, unit_cost, reorder_level)
       VALUES ($1, UPPER($2), $3, COALESCE($4, 'Units'), COALESCE($5, 0), COALESCE($6, 0)) RETURNING *`,
      [name, sku, categoryId || null, unitOfMeasure || null, unitCost ?? null, reorderLevel ?? null]
    );
    if (Number(initialStock) > 0) {
      if (!locationId) throw httpError(400, 'Pick a location for the initial stock');
      await client.query('INSERT INTO stock (product_id, location_id, quantity) VALUES ($1, $2, $3)',
        [r.rows[0].id, locationId, initialStock]);
    }
    await client.query('COMMIT');
    res.status(201).json(r.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    if (e.code === '23505') throw httpError(409, 'That SKU already exists');
    throw e;
  } finally {
    client.release();
  }
};

exports.update = async (req, res) => {
  const { name, sku, categoryId, unitOfMeasure, unitCost, reorderLevel } = req.body;
  try {
    const r = await pool.query(
      `UPDATE products SET name = COALESCE($1, name), sku = COALESCE(UPPER($2), sku),
         category_id = COALESCE($3, category_id), unit_of_measure = COALESCE($4, unit_of_measure),
         unit_cost = COALESCE($5, unit_cost), reorder_level = COALESCE($6, reorder_level)
       WHERE id = $7 RETURNING *`,
      [name, sku, categoryId, unitOfMeasure, unitCost, reorderLevel, req.params.id]
    );
    if (!r.rows.length) throw httpError(404, 'Product not found');
    res.json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') throw httpError(409, 'That SKU already exists');
    throw e;
  }
};

// Stock page: "user must be able to update the stock from here".
// Saved as a finished adjustment (WH/ADJ/000X) so it shows in Move History.
exports.setStock = async (req, res) => {
  const { locationId, quantity } = req.body;
  if (!locationId || quantity === undefined || Number(quantity) < 0) {
    throw httpError(400, 'Location and a quantity of 0 or more are required');
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const loc = await client.query('SELECT warehouse_id FROM locations WHERE id = $1', [locationId]);
    if (!loc.rows.length) throw httpError(400, 'Location not found');
    const reference = await nextReference(client, loc.rows[0].warehouse_id, 'ADJ');
    const op = await client.query(
      `INSERT INTO operations (reference, type, status, warehouse_id, to_location_id, contact,
         schedule_date, responsible_id, validated_at)
       VALUES ($1, 'ADJ', 'done', $2, $3, 'Stock update', CURRENT_DATE, $4, NOW()) RETURNING *`,
      [reference, loc.rows[0].warehouse_id, locationId, req.user.id]
    );
    const line = { product_id: Number(req.params.id), quantity: Number(quantity) };
    await client.query('INSERT INTO operation_lines (operation_id, product_id, quantity) VALUES ($1, $2, $3)',
      [op.rows[0].id, line.product_id, line.quantity]);
    await applyOperation(client, op.rows[0], [line]);
    await client.query('COMMIT');
    res.json({ message: 'Stock updated', reference });
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

exports.listCategories = async (req, res) => {
  const r = await pool.query('SELECT * FROM categories ORDER BY name');
  res.json(r.rows);
};

exports.createCategory = async (req, res) => {
  if (!req.body.name) throw httpError(400, 'Category name is required');
  try {
    const r = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [req.body.name]);
    res.status(201).json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') throw httpError(409, 'Category already exists');
    throw e;
  }
};