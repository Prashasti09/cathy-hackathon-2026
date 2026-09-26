// Owner: Prashasti (Prashasti09) - frontend UI
// Receipt card + Delivery card (from the mockup) and a strip of stock numbers.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api/dashboardApi';
import { errorMessage } from '../api/client';

function Stat({ value, label, to, tone }) {
  const body = (<><strong>{value}</strong> {label}</>);
  return to && value > 0 ? <Link to={to} className={`stat ${tone || ''}`}>{body}</Link> : <span className={`stat ${tone || ''}`}>{body}</span>;
}

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard().then(setD).catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <p className="alert">{error}</p>;
  if (!d) return <p className="muted">Loading…</p>;

  return (
    <div>
      <div className="toolbar"><h1>Dashboard</h1></div>

      <div className="cards">
        <section className="card">
          <h2>Receipt</h2>
          <Link to="/operations/receipts?status=ready" className="btn">{d.receipts.toReceive} to receive</Link>
          <div className="stats">
            <Stat value={d.receipts.late} label="late" tone="danger" to="/operations/receipts" />
            <Stat value={d.receipts.operations} label="upcoming" to="/operations/receipts" />
            <Stat value={d.receipts.open} label="open in total" to="/operations/receipts" />
          </div>
        </section>

        <section className="card">
          <h2>Delivery</h2>
          <Link to="/operations/deliveries?status=ready" className="btn">{d.deliveries.toDeliver} to deliver</Link>
          <div className="stats">
            <Stat value={d.deliveries.late} label="late" tone="danger" to="/operations/deliveries" />
            <Stat value={d.deliveries.waiting} label="waiting for stock" tone="warn" to="/operations/deliveries?status=waiting" />
            <Stat value={d.deliveries.operations} label="upcoming" to="/operations/deliveries" />
          </div>
        </section>
      </div>

      <div className="numbers">
        <Link to="/stock" className="number"><strong>{d.totalProducts}</strong><span>Products</span></Link>
        <Link to="/stock?low=1" className={'number' + (d.lowStock ? ' warn' : '')}><strong>{d.lowStock}</strong><span>Low on stock</span></Link>
        <Link to="/stock?low=1" className={'number' + (d.outOfStock ? ' danger' : '')}><strong>{d.outOfStock}</strong><span>Out of stock</span></Link>
        <Link to="/operations/transfers" className="number"><strong>{d.transfersScheduled}</strong><span>Transfers scheduled</span></Link>
      </div>
    </div>
  );
}
