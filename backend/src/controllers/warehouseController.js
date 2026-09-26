// Owner: Devesh (kurozadev05) - backend
// Settings -> Warehouse (name, short code, address)
const pool = require('../config/db');
const httpError = require('../utils/httpError');

exports.list = async (req, res) => {
  const r = await pool.query('SELECT * FROM warehouses ORDER BY name');
  res.json(r.rows);
};

exports.create = async (req, res) => {
  const { name, shortCode, address } = req.body;
  if (!name || !shortCode) throw httpError(400, 'Name and short code are required');
  try {
    const r = await pool.query(
      'INSERT INTO warehouses (name, short_code, address) VALUES ($1, UPPER($2), $3) RETURNING *',
      [name, shortCode, address || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') throw httpError(409, 'That short code is already used');
    throw e;
  }
};

exports.update = async (req, res) => {
  const { name, shortCode, address } = req.body;
  const r = await pool.query(
    `UPDATE warehouses SET name = COALESCE($1, name), short_code = COALESCE(UPPER($2), short_code),
       address = COALESCE($3, address) WHERE id = $4 RETURNING *`,
    [name, shortCode, address, req.params.id]
  );
  if (!r.rows.length) throw httpError(404, 'Warehouse not found');
  res.json(r.rows[0]);
};
