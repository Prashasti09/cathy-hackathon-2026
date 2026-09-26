// Owner: Prashasti (Prashasti09) - frontend UI
// Shared list screen for Receipts, Delivery, Transfers and Adjustments.
// NEW button, search by reference/contact, list or kanban view.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getOperations } from '../api/operationApi';
import { errorMessage } from '../api/client';
import { OPERATION_TYPES, STATUS_LABELS } from '../utils/status';
import { formatDate, isLate } from '../utils/date';
import SearchBar from './SearchBar.jsx';
import ViewToggle from './ViewToggle.jsx';
import KanbanBoard from './KanbanBoard.jsx';
import { StatusBadge } from './StatusBar.jsx';

export default function OperationList({ type }) {
  const cfg = OPERATION_TYPES[type];
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [q, setQ] = useState('');
  const [view, setView] = useState('list');
  const [ops, setOps] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    getOperations({ type, q: q || undefined, status: status || undefined })
      .then(setOps)
      .catch((e) => setError(errorMessage(e)));
  }, [type, q, status]);

  const open = (op) => navigate(`${cfg.path}/${op.id}`);
  const from = (op) => (type === 'IN' ? op.contact || 'Vendor' : op.from_location || '—');
  const to = (op) => (type === 'OUT' ? op.contact || 'Customer' : op.to_location || '—');

  return (
    <div>
      <div className="toolbar">
        <Link to={`${cfg.path}/new`} className="btn">New</Link>
        <h1>{cfg.title}</h1>
        <div className="toolbar-right">
          <select value={status} onChange={(e) => setParams(e.target.value ? { status: e.target.value } : {})} aria-label="Filter by status">
            <option value="">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <SearchBar onSearch={setQ} placeholder="Search reference or contact" />
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {error && <p className="alert">{error}</p>}
      {!ops && !error && <p className="muted">Loading…</p>}

      {ops && !ops.length && (
        <div className="empty">
          <p>No {cfg.title.toLowerCase()} {q || status ? 'match your search' : 'yet'}.</p>
          <Link to={`${cfg.path}/new`} className="btn">Create the first one</Link>
        </div>
      )}

      {ops && ops.length > 0 && view === 'list' && (
        <div className="table-wrap">
          <table className="table clickable">
            <thead>
              <tr>
                <th>Reference</th><th>From</th><th>To</th><th>Contact</th><th>Schedule date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ops.map((op) => (
                <tr key={op.id} onClick={() => open(op)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && open(op)}>
                  <td className="ref">{op.reference}</td>
                  <td>{from(op)}</td>
                  <td>{to(op)}</td>
                  <td>{op.contact || '—'}</td>
                  <td className={isLate(op) ? 'late' : ''}>{formatDate(op.schedule_date)}{isLate(op) && ' · late'}</td>
                  <td><StatusBadge status={op.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ops && ops.length > 0 && view === 'kanban' && (
        <KanbanBoard
          items={ops}
          onOpen={open}
          renderCard={(op) => (
            <>
              <strong className="ref">{op.reference}</strong>
              <span>{op.contact || '—'}</span>
              <span className={isLate(op) ? 'late' : 'muted'}>{formatDate(op.schedule_date)}</span>
            </>
          )}
        />
      )}
    </div>
  );
}
