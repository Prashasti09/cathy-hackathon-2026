// Owner: Prashasti (Prashasti09) - frontend UI
// Every product line of every operation. In = green, out = red.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMoves } from '../api/moveApi';
import { errorMessage } from '../api/client';
import { OPERATION_TYPES } from '../utils/status';
import { formatDate } from '../utils/date';
import SearchBar from '../components/SearchBar.jsx';
import ViewToggle from '../components/ViewToggle.jsx';
import KanbanBoard from '../components/KanbanBoard.jsx';
import { StatusBadge } from '../components/StatusBar.jsx';

export default function MoveHistory() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [view, setView] = useState('list');
  const [moves, setMoves] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMoves({ q: q || undefined, type: type || undefined }).then(setMoves).catch((e) => setError(errorMessage(e)));
  }, [q, type]);

  const open = (m) => navigate(`${OPERATION_TYPES[m.type].path}/${m.operation_id}`);

  return (
    <div>
      <div className="toolbar">
        <h1>Move history</h1>
        <div className="toolbar-right">
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
            <option value="">All types</option>
            {Object.entries(OPERATION_TYPES).map(([k, v]) => <option key={k} value={k}>{v.title}</option>)}
          </select>
          <SearchBar onSearch={setQ} placeholder="Search reference or contact" />
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {error && <p className="alert">{error}</p>}
      {!moves && !error && <p className="muted">Loading…</p>}
      {moves && !moves.length && <div className="empty"><p>No moves {q || type ? 'match your search' : 'yet'}.</p></div>}

      {moves && moves.length > 0 && view === 'list' && (
        <div className="table-wrap">
          <table className="table clickable">
            <thead>
              <tr><th>Reference</th><th>Date</th><th>Contact</th><th>Product</th><th>From</th><th>To</th><th className="num">Quantity</th><th>Status</th></tr>
            </thead>
            <tbody>
              {moves.map((m) => (
                <tr key={m.id} className={`move-${m.direction}`} onClick={() => open(m)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && open(m)}>
                  <td className="ref">{m.reference}</td>
                  <td>{formatDate(m.date)}</td>
                  <td>{m.contact || '—'}</td>
                  <td>{m.product_name}</td>
                  <td>{m.from_label || '—'}</td>
                  <td>{m.to_label || '—'}</td>
                  <td className="num qty">{m.direction === 'in' ? '+' : m.direction === 'out' ? '−' : ''}{m.quantity}</td>
                  <td><StatusBadge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {moves && moves.length > 0 && view === 'kanban' && (
        <KanbanBoard
          items={moves}
          onOpen={open}
          renderCard={(m) => (
            <>
              <strong className="ref">{m.reference}</strong>
              <span>{m.product_name}</span>
              <span className={`qty move-${m.direction}`}>{m.direction === 'in' ? '+' : m.direction === 'out' ? '−' : ''}{m.quantity}</span>
            </>
          )}
        />
      )}
    </div>
  );
}
