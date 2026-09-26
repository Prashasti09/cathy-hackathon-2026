// Owner: Devesh (kurozadev05) - backend
// Move History: one row per product line. direction = 'in' (green) / 'out' (red) / 'internal'.
// GET /api/moves?type=IN&status=done&q=WH/IN&warehouseId=1
const pool = require('../config/db');

exports.list = async (req, res) => {
  const { type, status, q, warehouseId } = req.query;
  const where = ["o.status <> 'canceled'"];
  const params = [];
  if (type) { params.push(type); where.push(`o.type = $${params.length}`); }
  if (status) { params.push(status); where.push(`o.status = $${params.length}`); }
  if (warehouseId) { params.push(warehouseId); where.push(`o.warehouse_id = $${params.length}`); }
  if (q) { params.push(`%${q}%`); where.push(`(o.reference ILIKE $${params.length} OR o.contact ILIKE $${params.length})`); }

  const r = await pool.query(
    `SELECT ol.id, o.id AS operation_id, o.reference, o.type, o.status, o.contact,
       COALESCE(o.validated_at, o.created_at) AS date, o.schedule_date,
       p.name AS product_name, p.sku, ol.quantity,
       CASE WHEN o.type = 'IN' THEN COALESCE(o.contact, 'Vendor')
            WHEN o.type = 'ADJ' THEN 'Inventory adjustment'
            ELSE fw.short_code || '/' || fl.short_code END AS from_label,
       CASE WHEN o.type = 'OUT' THEN COALESCE(o.contact, 'Customer')
            ELSE tw.short_code || '/' || tl.short_code END AS to_label,
       CASE WHEN o.type = 'IN' THEN 'in' WHEN o.type = 'OUT' THEN 'out'
            WHEN o.type = 'ADJ' THEN 'adjustment' ELSE 'internal' END AS direction
     FROM operation_lines ol
     JOIN operations o ON o.id = ol.operation_id
     JOIN products p ON p.id = ol.product_id
     LEFT JOIN locations fl ON fl.id = o.from_location_id
     LEFT JOIN warehouses fw ON fw.id = fl.warehouse_id
     LEFT JOIN locations tl ON tl.id = o.to_location_id
     LEFT JOIN warehouses tw ON tw.id = tl.warehouse_id
     WHERE ${where.join(' AND ')}
     ORDER BY date DESC, ol.id`,
    params
  );
  res.json(r.rows);
};
