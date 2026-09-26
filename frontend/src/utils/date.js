// Owner: Anmol (code-by-anmol) - logic & integration
// Date helpers. Dates come from the backend as 'YYYY-MM-DD'.

export function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Late = scheduled before today and still not finished.
export function isLate(op) {
  return Boolean(op.schedule_date) && op.schedule_date < today() && ['draft', 'waiting', 'ready'].includes(op.status);
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value.length === 10 ? value + 'T00:00:00' : value);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
