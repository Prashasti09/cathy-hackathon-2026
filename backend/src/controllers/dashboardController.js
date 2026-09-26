// Owner: Devesh (kurozadev05) - backend
// Dashboard numbers from the mockup:
//   Receipt card:  to receive, late, operations (scheduled in the future)
//   Delivery card: to deliver, late, waiting, operations
//   Late = schedule date < today   |   Operations = schedule date > today
const pool = require('../config/db');

const cardSql = `
  SELECT
    COUNT(*) FILTER (WHERE status = 'ready')                                   AS to_process,
    COUNT(*) FILTER (WHERE schedule_date < CURRENT_DATE)                       AS late,
    COUNT(*) FILTER (WHERE status = 'waiting')                                 AS waiting,
    COUNT(*) FILTER (WHERE schedule_date > CURRENT_DATE)                       AS upcoming,
    COUNT(*)                                                                   AS open_total
  FROM operations WHERE type = $1 AND status IN ('draft', 'waiting', 'ready')`;

exports.get = async (req, res) => {
  const [inCard, outCard, intCard, stock] = await Promise.all([
    pool.query(cardSql, ['IN']),
    pool.query(cardSql, ['OUT']),
    pool.query(cardSql, ['INT']),
    pool.query(`
      SELECT COUNT(*) AS total_products,
        COUNT(*) FILTER (WHERE on_hand > 0 AND on_hand <= reorder_level) AS low_stock,
        COUNT(*) FILTER (WHERE on_hand <= 0) AS out_of_stock
      FROM (SELECT p.reorder_level,
              COALESCE((SELECT SUM(quantity) FROM stock s WHERE s.product_id = p.id), 0) AS on_hand
            FROM products p) x`),
  ]);
  const num = (row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, Number(v)]));
  const r = num(inCard.rows[0]);
  const d = num(outCard.rows[0]);
  const s = num(stock.rows[0]);
  res.json({
    receipts: { toReceive: r.to_process, late: r.late, operations: r.upcoming, open: r.open_total },
    deliveries: { toDeliver: d.to_process, late: d.late, waiting: d.waiting, operations: d.upcoming, open: d.open_total },
    transfersScheduled: Number(intCard.rows[0].open_total),
    totalProducts: s.total_products,
    lowStock: s.low_stock,
    outOfStock: s.out_of_stock,
  });
};
