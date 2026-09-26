// Owner: Anmol (code-by-anmol) - logic & integration
// The ONLY place where stock quantities change.
//   IN  (receipt):   + quantity at "to" location
//   OUT (delivery):  - quantity at "from" location
//   INT (transfer):  - at "from", + at "to" (total stays the same)
//   ADJ (adjustment): quantity = the COUNTED amount; stock is set to it
const httpError = require('../utils/httpError');

async function getQty(client, productId, locationId) {
  const r = await client.query(
    'SELECT quantity FROM stock WHERE product_id = $1 AND location_id = $2',
    [productId, locationId]
  );
  return r.rows.length ? Number(r.rows[0].quantity) : 0;
}

async function changeQty(client, productId, locationId, delta) {
  await client.query(
    `INSERT INTO stock (product_id, location_id, quantity) VALUES ($1, $2, $3)
     ON CONFLICT (product_id, location_id) DO UPDATE SET quantity = stock.quantity + $3`,
    [productId, locationId, delta]
  );
}

// Returns a list of products that don't have enough stock for this operation.
// Only OUT and INT take stock away, so only they can be short.
async function findShortages(client, op, lines) {
  if (op.type !== 'OUT' && op.type !== 'INT') return [];
  const need = {};
  for (const l of lines) need[l.product_id] = (need[l.product_id] || 0) + Number(l.quantity);

  const shortages = [];
  for (const productId of Object.keys(need)) {
    const available = await getQty(client, productId, op.from_location_id);
    if (available < need[productId]) {
      const p = await client.query('SELECT name FROM products WHERE id = $1', [productId]);
      shortages.push({ productId: Number(productId), name: p.rows[0]?.name, available, needed: need[productId] });
    }
  }
  return shortages;
}

async function applyOperation(client, op, lines) {
  const shortages = await findShortages(client, op, lines);
  if (shortages.length) {
    const s = shortages[0];
    throw httpError(400, `Not enough ${s.name}: ${s.available} available, ${s.needed} needed`);
  }
  for (const l of lines) {
    const qty = Number(l.quantity);
    if (op.type === 'IN') {
      await changeQty(client, l.product_id, op.to_location_id, qty);
    } else if (op.type === 'OUT') {
      await changeQty(client, l.product_id, op.from_location_id, -qty);
    } else if (op.type === 'INT') {
      await changeQty(client, l.product_id, op.from_location_id, -qty);
      await changeQty(client, l.product_id, op.to_location_id, qty);
    } else if (op.type === 'ADJ') {
      const current = await getQty(client, l.product_id, op.to_location_id);
      await changeQty(client, l.product_id, op.to_location_id, qty - current);
    }
  }
}

module.exports = { getQty, findShortages, applyOperation };
