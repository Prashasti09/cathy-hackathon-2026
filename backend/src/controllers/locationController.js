// Owner: Devesh (kurozadev05) - backend
// Settings -> Location (name, short code, which warehouse). ?warehouseId= filters.
const pool = require('../config/db');
const httpError = require('../utils/httpError');

exports.list = async (req, res) => {
  const params = [];
  let where = '';
  if (req.query.warehouseId) { params.push(req.query.warehouseId); where = 'WHERE l.warehouse_id = $1'; }
  const r = await pool.query(
    `SELECT l.*, w.name AS warehouse_name, w.short_code AS warehouse_code,
            w.short_code || '/' || l.short_code AS full_code
     FROM locations l JOIN warehouses w ON w.id = l.warehouse_id ${where}
     ORDER BY w.short_code, l.id`,
    params
  );
  res.json(r.rows);
};

exports.create = async (req, res) => {
  const { name, shortCode, warehouseId } = req.body;
  if (!name || !shortCode || !warehouseId) throw httpError(400, 'Name, short code and warehouse are required');
  try {
    const r = await pool.query(
      'INSERT INTO locations (name, short_code, warehouse_id) VALUES ($1, $2, $3) RETURNING *',
      [name, shortCode, warehouseId]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') throw httpError(409, 'That short code already exists in this warehouse');
    if (e.code === '23503') throw httpError(400, 'Warehouse not found');
    throw e;
  }
};

exports.update = async (req, res) => {
  const { name, shortCode } = req.body;
  const r = await pool.query(
    `UPDATE locations SET name = COALESCE($1, name), short_code = COALESCE($2, short_code)
     WHERE id = $3 RETURNING *`,
    [name, shortCode, req.params.id]
  );
  if (!r.rows.length) throw httpError(404, 'Location not found');
  res.json(r.rows[0]);
};
