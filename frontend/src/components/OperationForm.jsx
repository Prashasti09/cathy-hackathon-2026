// Owner: Prashasti (Prashasti09) - frontend UI
// Shared form for one Receipt / Delivery / Transfer / Adjustment.
// Buttons from the mockup: To Do (draft) / Validate (ready) / Print (done) / Cancel.
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import * as opApi from '../api/operationApi';
import { getProducts } from '../api/productApi';
import { getWarehouses, getLocations } from '../api/warehouseApi';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import { OPERATION_TYPES, isOpen } from '../utils/status';
import { formatDate, today } from '../utils/date';
import StatusBar from './StatusBar.jsx';
import ProductLines from './ProductLines.jsx';

const emptyForm = {
  warehouseId: '', fromLocationId: '', toLocationId: '', contact: '',
  deliveryAddress: '', scheduleDate: today(), lines: [{ productId: '', quantity: 1 }],
};

export default function OperationForm({ type }) {
  const cfg = OPERATION_TYPES[type];
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [op, setOp] = useState(null);           // saved operation from the server
  const [form, setForm] = useState(emptyForm);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  // Load dropdown data once.
  useEffect(() => {
    Promise.all([getWarehouses(), getLocations(), getProducts()])
      .then(([w, l, p]) => {
        setWarehouses(w); setLocations(l); setProducts(p);
        if (isNew && w.length) {
          const first = l.find((x) => x.warehouse_id === w[0].id);
          setForm((f) => ({
            ...f,
            warehouseId: w[0].id,
            fromLocationId: cfg.needsFrom ? first?.id || '' : '',
            toLocationId: cfg.needsTo ? first?.id || '' : '',
          }));
        }
      })
      .catch((e) => setError(errorMessage(e)));
  }, [isNew, cfg.needsFrom, cfg.needsTo]);

  // Load the operation when opening an existing one.
  function load() {
    return opApi.getOperation(id).then((data) => {
      setOp(data);
      setForm({
        warehouseId: data.warehouse_id,
        fromLocationId: data.from_location_id || '',
        toLocationId: data.to_location_id || '',
        contact: data.contact || '',
        deliveryAddress: data.delivery_address || '',
        scheduleDate: data.schedule_date || '',
        lines: data.lines.map((l) => ({ productId: l.product_id, quantity: l.quantity, outOfStock: l.out_of_stock })),
      });
    });
  }
  useEffect(() => {
    setError(''); setNotice('');
    if (isNew) { setOp(null); setForm((f) => ({ ...emptyForm, warehouseId: f.warehouseId, fromLocationId: f.fromLocationId, toLocationId: f.toLocationId, lines: [{ productId: '', quantity: 1 }] })); }
    else load().catch((e) => setError(errorMessage(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const editable = isNew || (op && isOpen(op.status));
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const whLocations = locations.filter((l) => String(l.warehouse_id) === String(form.warehouseId));

  function payload() {
    return {
      type,
      warehouseId: Number(form.warehouseId),
      fromLocationId: cfg.needsFrom ? Number(form.fromLocationId) || null : null,
      toLocationId: cfg.needsTo ? Number(form.toLocationId) || null : null,
      contact: form.contact,
      deliveryAddress: form.deliveryAddress,
      scheduleDate: form.scheduleDate || null,
      lines: form.lines.filter((l) => l.productId).map((l) => ({ productId: Number(l.productId), quantity: Number(l.quantity) })),
    };
  }

  // Runs an action, shows errors, reloads the form.
  async function run(action, message) {
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await action();
      if (message) setNotice(typeof message === 'function' ? message(result) : message);
      if (!isNew) await load();
      return result;
    } catch (e) {
      setError(errorMessage(e));
      if (!isNew) await load().catch(() => {});
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!payload().lines.length) return setError('Add at least one product');
    if (isNew) {
      const created = await run(() => opApi.createOperation(payload()));
      if (created) navigate(`${cfg.path}/${created.id}`, { replace: true });
    } else {
      await run(() => opApi.updateOperation(id, payload()), 'Saved');
    }
  }

  // Saves unsaved edits first, then moves the status forward.
  async function saveThen(action, message) {
    if (!payload().lines.length) return setError('Add at least one product');
    setBusy(true);
    try { await opApi.updateOperation(id, payload()); } catch (e) { setBusy(false); return setError(errorMessage(e)); }
    await run(action, message);
  }

  // When stock is short the red alert below explains it, so no green message then.
  const todo = () => saveThen(() => opApi.markTodo(id), (r) => (r.status === 'waiting' ? '' : 'Marked as ready'));
  const validate = () => saveThen(() => opApi.validateOperation(id), 'Validated. Stock has been updated.');
  const cancel = () => window.confirm('Cancel this operation?') && run(() => opApi.cancelOperation(id), 'Canceled');

  const locationSelect = (field, label) => (
    <label>
      {label}
      <select value={form[field]} onChange={(e) => set(field, e.target.value)} disabled={!editable}>
        <option value="">Select a location</option>
        {whLocations.map((l) => <option key={l.id} value={l.id}>{l.full_code} — {l.name}</option>)}
      </select>
    </label>
  );

  const shortCount = form.lines.filter((l) => l.outOfStock).length;

  return (
    <div className="form-page">
      <div className="toolbar no-print">
        <Link to={`${cfg.path}/new`} className="btn-ghost">New</Link>
        <h1>{cfg.single}</h1>
      </div>

      <div className="form-actions no-print">
        <div className="buttons">
          {isNew && <button type="button" className="btn" onClick={save} disabled={busy}>Save</button>}
          {op && isOpen(op.status) && (
            <>
              {op.status !== 'ready' && (
                <button type="button" className="btn" onClick={todo} disabled={busy}>To Do</button>
              )}
              {op.status === 'ready' && (
                <button type="button" className="btn" onClick={validate} disabled={busy}>Validate</button>
              )}
              <button type="button" className="btn-ghost" onClick={save} disabled={busy}>Save</button>
            </>
          )}
          {op?.status === 'done' && <button type="button" className="btn-ghost" onClick={() => window.print()}>Print</button>}
          {op && isOpen(op.status) && <button type="button" className="btn-ghost danger" onClick={cancel} disabled={busy}>Cancel</button>}
        </div>
        {op && <StatusBar type={type} status={op.status} />}
      </div>

      {error && <p className="alert">{error}</p>}
      {notice && !error && <p className="notice">{notice}</p>}
      {shortCount > 0 && op && isOpen(op.status) && (
        <p className="alert">{shortCount === 1 ? 'One product is' : `${shortCount} products are`} not in stock at the chosen location. The lines are marked in red.</p>
      )}

      <div className="sheet">
        <h2 className="ref big">{isNew ? `New ${cfg.single.toLowerCase()}` : op?.reference || '…'}</h2>

        <div className="fields">
          <label>
            {cfg.contactLabel}
            <input value={form.contact} onChange={(e) => set('contact', e.target.value)} disabled={!editable} />
          </label>
          <label>
            Schedule date
            <input type="date" value={form.scheduleDate || ''} onChange={(e) => set('scheduleDate', e.target.value)} disabled={!editable} />
          </label>
          {cfg.hasAddress && (
            <label>
              Delivery address
              <input value={form.deliveryAddress} onChange={(e) => set('deliveryAddress', e.target.value)} disabled={!editable} />
            </label>
          )}
          <label>
            Responsible
            <input value={op?.responsible_name || user?.loginId || ''} disabled />
          </label>
          {warehouses.length > 1 && (
            <label>
              Warehouse
              <select value={form.warehouseId} onChange={(e) => setForm((f) => ({ ...f, warehouseId: e.target.value, fromLocationId: '', toLocationId: '' }))} disabled={!isNew}>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.short_code} — {w.name}</option>)}
              </select>
            </label>
          )}
          {cfg.needsFrom && locationSelect('fromLocationId', cfg.fromLabel)}
          {cfg.needsTo && locationSelect('toLocationId', cfg.toLabel)}
          <label>
            Operation type
            <input value={cfg.single} disabled />
          </label>
          {op?.status === 'done' && (
            <label>
              Validated on
              <input value={formatDate(op.validated_at)} disabled />
            </label>
          )}
        </div>

        <h3>Products</h3>
        <ProductLines
          lines={form.lines}
          products={products}
          editable={editable}
          quantityLabel={cfg.quantityLabel}
          onChange={(lines) => set('lines', lines)}
        />
      </div>
    </div>
  );
}
