// Owner: Prashasti (Prashasti09) - frontend UI
// Stock page: product, per-unit cost, on hand, free to use. Create/edit products and update stock here.
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, createProduct, updateProduct, setStock, getCategories, createCategory } from '../api/productApi';
import { getLocations } from '../api/warehouseApi';
import { errorMessage } from '../api/client';
import SearchBar from '../components/SearchBar.jsx';
import Modal from '../components/Modal.jsx';

const blank = { name: '', sku: '', categoryId: '', newCategory: '', unitOfMeasure: 'Units', unitCost: '', reorderLevel: '', initialStock: '', locationId: '' };
const money = (n) => Number(n).toLocaleString('en-IN') + ' Rs';

export default function Stock() {
  const [params, setParams] = useSearchParams();
  const lowOnly = params.get('low') === '1';
  const [q, setQ] = useState('');
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);   // product form (new or edit)
  const [stockFor, setStockFor] = useState(null); // update-stock form

  const load = () =>
    getProducts({ q: q || undefined, lowStock: lowOnly ? 'true' : undefined }).then(setProducts).catch((e) => setError(errorMessage(e)));

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, lowOnly]);
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getLocations().then(setLocations).catch(() => {});
  }, []);

  return (
    <div>
      <div className="toolbar">
        <button type="button" className="btn" onClick={() => setEditing({ ...blank, locationId: locations[0]?.id || '' })}>New product</button>
        <h1>Stock</h1>
        <div className="toolbar-right">
          <label className="check">
            <input type="checkbox" checked={lowOnly} onChange={(e) => setParams(e.target.checked ? { low: '1' } : {})} />
            Low stock only
          </label>
          <SearchBar onSearch={setQ} placeholder="Search name or SKU" />
        </div>
      </div>

      {error && <p className="alert">{error}</p>}
      {!products && !error && <p className="muted">Loading…</p>}
      {products && !products.length && (
        <div className="empty"><p>{q || lowOnly ? 'No products match.' : 'No products yet.'}</p></div>
      )}

      {products && products.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th><th>SKU</th><th>Category</th><th className="num">Per unit cost</th>
                <th className="num">On hand</th><th className="num">Free to use</th><th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const low = p.on_hand <= p.reorder_level;
                return (
                  <tr key={p.id} className={low ? 'row-low' : ''}>
                    <td>{p.name}{low && <span className="tag">{p.on_hand <= 0 ? 'Out of stock' : 'Low'}</span>}</td>
                    <td className="ref">{p.sku}</td>
                    <td>{p.category_name || '—'}</td>
                    <td className="num">{money(p.unit_cost)}</td>
                    <td className="num">{p.on_hand} {p.unit_of_measure}</td>
                    <td className="num">{p.free_to_use}</td>
                    <td className="num"><div className="actions">
                      <button type="button" className="btn-ghost small" onClick={() => setStockFor({ product: p, locationId: locations[0]?.id || '', quantity: '' })}>Update stock</button>
                      <button type="button" className="btn-ghost small" onClick={() => setEditing({
                        id: p.id, name: p.name, sku: p.sku, categoryId: p.category_id || '', newCategory: '',
                        unitOfMeasure: p.unit_of_measure, unitCost: p.unit_cost, reorderLevel: p.reorder_level,
                      })}>Edit</button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ProductModal
          initial={editing}
          categories={categories}
          locations={locations}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); setCategories(await getCategories()); load(); }}
        />
      )}
      {stockFor && (
        <StockModal
          initial={stockFor}
          locations={locations}
          onClose={() => setStockFor(null)}
          onSaved={() => { setStockFor(null); load(); }}
        />
      )}
    </div>
  );
}

function ProductModal({ initial, categories, locations, onClose, onSaved }) {
  const [f, setF] = useState(initial);
  const [error, setError] = useState('');
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const isEdit = Boolean(f.id);

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      let categoryId = f.categoryId || null;
      if (f.categoryId === 'new') categoryId = (await createCategory(f.newCategory)).id;
      const data = {
        name: f.name, sku: f.sku, categoryId, unitOfMeasure: f.unitOfMeasure,
        unitCost: f.unitCost === '' ? 0 : Number(f.unitCost), reorderLevel: f.reorderLevel === '' ? 0 : Number(f.reorderLevel),
      };
      if (isEdit) await updateProduct(f.id, data);
      else await createProduct({ ...data, initialStock: Number(f.initialStock) || 0, locationId: f.locationId || null });
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <Modal title={isEdit ? 'Edit product' : 'New product'} onClose={onClose}>
      <form onSubmit={submit} className="modal-form">
        {error && <p className="alert">{error}</p>}
        <label>Name<input value={f.name} onChange={(e) => set('name', e.target.value)} required autoFocus /></label>
        <label>SKU / code<input value={f.sku} onChange={(e) => set('sku', e.target.value)} required /></label>
        <label>Category
          <select value={f.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
            <option value="">No category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="new">+ New category</option>
          </select>
        </label>
        {f.categoryId === 'new' && <label>New category name<input value={f.newCategory} onChange={(e) => set('newCategory', e.target.value)} required /></label>}
        <div className="row2">
          <label>Unit of measure<input value={f.unitOfMeasure} onChange={(e) => set('unitOfMeasure', e.target.value)} /></label>
          <label>Per unit cost (Rs)<input type="number" min="0" step="any" value={f.unitCost} onChange={(e) => set('unitCost', e.target.value)} /></label>
        </div>
        <label>Low stock alert below<input type="number" min="0" step="any" value={f.reorderLevel} onChange={(e) => set('reorderLevel', e.target.value)} /></label>
        {!isEdit && (
          <div className="row2">
            <label>Initial stock (optional)<input type="number" min="0" step="any" value={f.initialStock} onChange={(e) => set('initialStock', e.target.value)} /></label>
            <label>At location
              <select value={f.locationId} onChange={(e) => set('locationId', e.target.value)}>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.full_code}</option>)}
              </select>
            </label>
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn">{isEdit ? 'Save changes' : 'Create product'}</button>
        </div>
      </form>
    </Modal>
  );
}

function StockModal({ initial, locations, onClose, onSaved }) {
  const [locationId, setLocationId] = useState(initial.locationId);
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const p = initial.product;

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await setStock(p.id, Number(locationId), Number(quantity));
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <Modal title={`Update stock: ${p.name}`} onClose={onClose}>
      <form onSubmit={submit} className="modal-form">
        {error && <p className="alert">{error}</p>}
        <p className="muted">Enter the quantity you counted. It's saved as an adjustment in Move History.</p>
        <label>Location
          <select value={locationId} onChange={(e) => setLocationId(e.target.value)} required>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.full_code} — {l.name}</option>)}
          </select>
        </label>
        <label>Counted quantity<input type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} required autoFocus /></label>
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn">Update stock</button>
        </div>
      </form>
    </Modal>
  );
}
