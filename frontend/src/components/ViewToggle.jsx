// Owner: Prashasti (Prashasti09) - frontend UI
// List / Kanban switch.
export default function ViewToggle({ view, onChange }) {
  return (
    <div className="toggle" role="group" aria-label="View">
      <button type="button" className={view === 'list' ? 'on' : ''} onClick={() => onChange('list')}>List</button>
      <button type="button" className={view === 'kanban' ? 'on' : ''} onClick={() => onChange('kanban')}>Kanban</button>
    </div>
  );
}
