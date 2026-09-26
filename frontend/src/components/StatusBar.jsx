// Owner: Prashasti (Prashasti09) - frontend UI
// "Draft > Ready > Done" indicator with the current step highlighted.
import { STATUS_FLOW, STATUS_LABELS } from '../utils/status';

export default function StatusBar({ type, status }) {
  if (status === 'canceled') return <div className="statusbar"><span className="step current canceled">Canceled</span></div>;
  const flow = STATUS_FLOW[type];
  const at = flow.indexOf(status);
  return (
    <ol className="statusbar" aria-label="Status">
      {flow.map((s, i) => (
        <li key={s} className={'step' + (i === at ? ' current' : '') + (i < at ? ' passed' : '')}>
          {STATUS_LABELS[s]}
        </li>
      ))}
    </ol>
  );
}

export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABELS[status] || status}</span>;
}
