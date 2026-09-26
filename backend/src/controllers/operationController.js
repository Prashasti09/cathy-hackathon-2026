// Owner: Devesh (kurozadev05) - backend
// Receipts (IN), Deliveries (OUT), Internal transfers (INT), Adjustments (ADJ).
// One operation has many product lines.
const pool = require('../config/db');
const httpError = require('../utils/httpError');
const { nextReference } = require('../services/referenceService');
const { findShortages } = require('../services/stockService');
const status = require('../services/statusService');

const TYPES = ['IN', 'OUT', 'INT', 'ADJ'];

const OP_SELECT = `
  SELECT o.*, u.login_id AS responsible_name,
    fw.short_code || '/' || fl.short_code AS from_location,
    tw.short_code || '/' || tl.short_code AS to_location,
    (o.schedule_date < CURRENT_DATE AND o.status IN ('draft','waiting','ready')) AS is_late
  FROM operations o
  LEFT JOIN users u      ON u.id = o.responsible_id
  LEFT JOIN locations fl ON fl.id = o.from_location_id
  LEFT JOIN warehouses fw ON fw.id = fl.warehouse_id
  LEFT JOIN locations tl ON tl.id = o.to_location_id
  LEFT JOIN warehouses tw ON tw.id = tl.warehouse_id`;

async function loadLines(db, opId) {
  const r = await db.query(
    `SELECT ol.id, ol.product_id, ol.quantity, p.name AS product_name, p.sku
     FROM operation_lines ol JOIN products p ON p.id = ol.product_id
     WHERE ol.operation_id = $1 ORDER BY ol.id`,
    [opId]
  );
  return r.rows;
}

async function loadOp(db, id, lock = false) {
  const r = await db.query(`SELECT * FROM operations WHERE id = $1 ${lock ? 'FOR UPDATE' : ''}`, [id]);
  if (!r.rows.length) throw httpError(404, 'Operation not found');
  return r.rows[0];
}

// Checks which locations each type needs.
function checkLocations(type, from, to) {
  if (type === 'IN' && !to) throw httpError(400, 'Pick the location to receive into');
  if (type === 'OUT' && !from) throw httpError(400, 'Pick the location to deliver from');
  if (type === 'INT' && (!from || !to)) throw httpError(400, 'Pick both from and to locations');
  if (type === 'INT' && String(from) === String(to)) throw httpError(400, 'From and to must be different');
  if (type === 'ADJ' && !to) throw httpError(400, 'Pick the location being counted');
}

function cleanLines(lines) {
  if (!Array.isArray(lines)) return [];
  return lines
    .filter((l) => l && l.productId)
    .map((l) => {
      if (Number(l.quantity) < 0 || l.quantity === '' || l.quantity === undefined) {
        throw httpError(400, 'Every product needs a quantity of 0 or more');
      }
      return { product_id: Number(l.productId), quantity: Number(l.quantity) };
    });
}

async function saveLines(client, opId, lines) {
  await client.query('DELETE FROM operation_lines WHERE operation_id = $1', [opId]);
  for (const l of lines) {
    await client.query('INSERT INTO operation_lines (operation_id, product_id, quantity) VALUES ($1, $2, $3)',
      [opId, l.product_id, l.quantity]);
  }
}

// Runs fn inside a database transaction (all-or-nothing).
async function inTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// GET /api/operations?type=IN&status=ready&q=WH/IN&warehouseId=1
exports.list = async (req, res) => {
  const { type, status: st, q, warehouseId } = req.query;
  const where = [];
  const params = [];
  if (type) { params.push(type); where.push(`o.type = $${params.length}`); }
  if (st) { params.push(st); where.push(`o.status = $${params.length}`); }
  if (warehouseId) { params.push(warehouseId); where.push(`o.warehouse_id = $${params.length}`); }
  if (q) { params.push(`%${q}%`); where.push(`(o.reference ILIKE $${params.length} OR o.contact ILIKE $${params.length})`); }
  const r = await pool.query(
    `${OP_SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY o.created_at DESC`,
    params
  );
  res.json(r.rows);
};

// GET /api/operations/:id  -> operation + its product lines (+ which lines are short)
exports.getOne = async (req, res) => {
  const r = await pool.query(`${OP_SELECT} WHERE o.id = $1`, [req.params.id]);
  if (!r.rows.length) throw httpError(404, 'Operation not found');
  const op = r.rows[0];
  const lines = await loadLines(pool, op.id);
  const shortages = ['done', 'canceled'].includes(op.status) ? [] : await findShortages(pool, op, lines);
  const shortIds = new Set(shortages.map((s) => s.productId));
  res.json({
    ...op,
    lines: lines.map((l) => ({ ...l, out_of_stock: shortIds.has(l.product_id) })),
    shortages,
  });
};

// POST /api/operations
// body: { type, warehouseId, fromLocationId, toLocationId, contact, deliveryAddress,
//         scheduleDate, lines: [{ productId, quantity }] }
exports.create = async (req, res) => {
  const b = req.body;
  if (!TYPES.includes(b.type)) throw httpError(400, 'Type must be IN, OUT, INT or ADJ');
  if (!b.warehouseId) throw httpError(400, 'Warehouse is required');
  checkLocations(b.type, b.fromLocationId, b.toLocationId);
  const lines = cleanLines(b.lines);

  const created = await inTransaction(async (client) => {
    const reference = await nextReference(client, b.warehouseId, b.type);
    const r = await client.query(
      `INSERT INTO operations (reference, type, warehouse_id, from_location_id, to_location_id,
         contact, delivery_address, schedule_date, responsible_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [reference, b.type, b.warehouseId, b.fromLocationId || null, b.toLocationId || null,
        b.contact || null, b.deliveryAddress || null, b.scheduleDate || null, req.user.id]
    );
    await saveLines(client, r.rows[0].id, lines);
    return r.rows[0];
  });
  res.status(201).json(created);
};

// PUT /api/operations/:id  (only while draft / waiting / ready)
exports.update = async (req, res) => {
  const b = req.body;
  const updated = await inTransaction(async (client) => {
    const op = await loadOp(client, req.params.id, true);
    status.assertEditable(op);
    const from = b.fromLocationId !== undefined ? b.fromLocationId || null : op.from_location_id;
    const to = b.toLocationId !== undefined ? b.toLocationId || null : op.to_location_id;
    checkLocations(op.type, from, to);
    const r = await client.query(
      `UPDATE operations SET from_location_id = $1, to_location_id = $2,
         contact = COALESCE($3, contact), delivery_address = COALESCE($4, delivery_address),
         schedule_date = COALESCE($5, schedule_date)
       WHERE id = $6 RETURNING *`,
      [from, to, b.contact, b.deliveryAddress, b.scheduleDate || null, op.id]
    );
    if (b.lines) await saveLines(client, op.id, cleanLines(b.lines));
    // If lines changed on a waiting/ready delivery, re-check stock.
    if (op.status !== 'draft') {
      const lines = await loadLines(client, op.id);
      const { status: next } = await status.markTodo(client, { ...r.rows[0], status: 'draft' }, lines);
      await client.query('UPDATE operations SET status = $1 WHERE id = $2', [next, op.id]);
    }
    return r.rows[0];
  });
  res.json(updated);
};

// POST /api/operations/:id/todo   ("To Do" button: draft -> ready, or waiting if stock is short)
exports.todo = async (req, res) => {
  const result = await inTransaction(async (client) => {
    const op = await loadOp(client, req.params.id, true);
    const lines = await loadLines(client, op.id);
    const { status: next, shortages } = await status.markTodo(client, op, lines);
    await client.query('UPDATE operations SET status = $1 WHERE id = $2', [next, op.id]);
    return { id: op.id, status: next, shortages };
  });
  res.json(result);
};

// POST /api/operations/:id/validate  ("Validate" button: -> done, stock changes)
exports.validate = async (req, res) => {
  const result = await inTransaction(async (client) => {
    const op = await loadOp(client, req.params.id, true);
    const lines = await loadLines(client, op.id);
    const next = await status.validate(client, op, lines);
    await client.query('UPDATE operations SET status = $1, validated_at = NOW() WHERE id = $2', [next, op.id]);
    return { id: op.id, status: next };
  });
  res.json(result);
};

// POST /api/operations/:id/cancel
exports.cancel = async (req, res) => {
  const result = await inTransaction(async (client) => {
    const op = await loadOp(client, req.params.id, true);
    status.assertEditable(op);
    await client.query("UPDATE operations SET status = 'canceled' WHERE id = $1", [op.id]);
    return { id: op.id, status: 'canceled' };
  });
  res.json(result);
};
