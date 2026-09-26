// Owner: Anmol (code-by-anmol) - logic & integration
// Generates references like WH/IN/0001, WH/OUT/0002
//   <warehouse short code>/<operation type>/<4-digit number>
const httpError = require('../utils/httpError');

async function nextReference(client, warehouseId, type) {
  // Lock so two people creating at the same moment can't get the same number.
  await client.query('SELECT pg_advisory_xact_lock($1)', [warehouseId]);

  const wh = await client.query('SELECT short_code FROM warehouses WHERE id = $1', [warehouseId]);
  if (!wh.rows.length) throw httpError(400, 'Warehouse not found');

  const prefix = `${wh.rows[0].short_code}/${type}/`;
  const last = await client.query(
    `SELECT MAX(CAST(SUBSTRING(reference FROM LENGTH($1) + 1) AS INTEGER)) AS n
     FROM operations WHERE reference LIKE $1 || '%'`,
    [prefix]
  );
  const next = (last.rows[0].n || 0) + 1;
  return prefix + String(next).padStart(4, '0');
}

module.exports = { nextReference };
