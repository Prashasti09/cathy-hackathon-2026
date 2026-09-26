// Owner: Anmol (code-by-anmol) - logic & integration
// Status rules from the mockup:
//   Receipt  (IN):  draft -> ready -> done
//   Delivery (OUT): draft -> waiting (if stock is short) -> ready -> done
//   Transfer/Adjustment follow the same path as receipts/deliveries.
// "To Do" button  = move a draft forward (to ready, or waiting if short)
// "Validate" button = ready -> done, and stock actually changes.
const httpError = require('../utils/httpError');
const { findShortages, applyOperation } = require('./stockService');

const OPEN = ['draft', 'waiting', 'ready'];

async function markTodo(client, op, lines) {
  // 'ready' is allowed too, so pressing To Do again just re-checks stock.
  if (!OPEN.includes(op.status)) {
    throw httpError(400, `Can't move a "${op.status}" operation to ready`);
  }
  if (!lines.length) throw httpError(400, 'Add at least one product first');
  const shortages = await findShortages(client, op, lines);
  return { status: shortages.length ? 'waiting' : 'ready', shortages };
}

async function validate(client, op, lines) {
  if (op.status === 'draft' || op.status === 'waiting') {
    // Allow validating straight from draft too, as long as stock is available.
    const { status } = await markTodo(client, op, lines);
    if (status === 'waiting') {
      const shortages = await findShortages(client, op, lines);
      const s = shortages[0];
      throw httpError(400, `Not enough ${s.name}: ${s.available} available, ${s.needed} needed`);
    }
  } else if (op.status !== 'ready') {
    throw httpError(400, `Can't validate a "${op.status}" operation`);
  }
  await applyOperation(client, op, lines);
  return 'done';
}

function assertEditable(op) {
  if (!OPEN.includes(op.status)) throw httpError(400, `A "${op.status}" operation can't be changed`);
}

module.exports = { markTodo, validate, assertEditable, OPEN };
