// Owner: Prashasti (Prashasti09) - frontend UI
// Cards grouped into columns by status.
import { KANBAN_COLUMNS, STATUS_LABELS } from '../utils/status';

export default function KanbanBoard({ items, renderCard, onOpen, keyOf = (i) => i.id }) {
  const columns = KANBAN_COLUMNS.filter((s) => s !== 'canceled' || items.some((i) => i.status === s));
  return (
    <div className="kanban">
      {columns.map((status) => {
        const inCol = items.filter((i) => i.status === status);
        return (
          <section key={status} className="kanban-col">
            <h3>
              {STATUS_LABELS[status]} <span className="count">{inCol.length}</span>
            </h3>
            {inCol.map((item) => (
              <button type="button" key={keyOf(item)} className="kanban-card" onClick={() => onOpen?.(item)}>
                {renderCard(item)}
              </button>
            ))}
            {!inCol.length && <p className="kanban-empty">Nothing here</p>}
          </section>
        );
      })}
    </div>
  );
}
