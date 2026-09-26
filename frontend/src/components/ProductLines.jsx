// Owner: Prashasti (Prashasti09) - frontend UI
// Product + quantity rows inside a receipt/delivery form. Lines out of stock turn red.
export default function ProductLines({ lines, products, editable, onChange, quantityLabel = 'Quantity' }) {
  const update = (i, field, value) => onChange(lines.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  const remove = (i) => onChange(lines.filter((_, idx) => idx !== i));
  const add = () => onChange([...lines, { productId: '', quantity: 1 }]);
  const productName = (id) => {
    const p = products.find((x) => String(x.id) === String(id));
    return p ? `[${p.sku}] ${p.name}` : '—';
  };

  return (
    <div className="lines">
      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th className="num">{quantityLabel}</th>
            {editable && <th aria-label="Remove" />}
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i} className={l.outOfStock ? 'row-short' : ''}>
              <td>
                {editable ? (
                  <select value={l.productId} onChange={(e) => update(i, 'productId', e.target.value)} aria-label="Product">
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>[{p.sku}] {p.name} — {p.on_hand} on hand</option>
                    ))}
                  </select>
                ) : (
                  productName(l.productId)
                )}
                {l.outOfStock && <span className="short-note">Not enough in stock</span>}
              </td>
              <td className="num">
                {editable ? (
                  <input type="number" min="0" step="any" value={l.quantity}
                    onChange={(e) => update(i, 'quantity', e.target.value)} aria-label={quantityLabel} />
                ) : (
                  l.quantity
                )}
              </td>
              {editable && (
                <td className="num">
                  <button type="button" className="btn-ghost small" onClick={() => remove(i)} aria-label="Remove line">Remove</button>
                </td>
              )}
            </tr>
          ))}
          {!lines.length && (
            <tr><td colSpan={3} className="muted">No products yet</td></tr>
          )}
        </tbody>
      </table>
      {editable && (
        <button type="button" className="btn-ghost add-line" onClick={add}>Add a product</button>
      )}
    </div>
  );
}
