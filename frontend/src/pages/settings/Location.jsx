// Owner: Prashasti (Prashasti09) - frontend UI
// Settings -> Locations: rooms/racks inside a warehouse (name, short code, warehouse).
import { useEffect, useState } from 'react';
import { getWarehouses, getLocations, createLocation } from '../../api/warehouseApi';
import { errorMessage } from '../../api/client';

export default function Location() {
  const [warehouses, setWarehouses] = useState([]);
  const [list, setList] = useState([]);
  const [f, setF] = useState({ name: '', shortCode: '', warehouseId: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const load = () => getLocations().then(setList).catch((e) => setError(errorMessage(e)));

  useEffect(() => {
    load();
    getWarehouses().then((w) => { setWarehouses(w); if (w[0]) set('warehouseId', w[0].id); });
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError(''); setNotice('');
    try {
      await createLocation({ ...f, warehouseId: Number(f.warehouseId) });
      setNotice('Location added');
      setF((x) => ({ ...x, name: '', shortCode: '' }));
      load();
    } catch (err) { setError(errorMessage(err)); }
  }

  return (
    <div className="settings">
      <div className="toolbar"><h1>Locations</h1></div>
      <form className="sheet fields narrow" onSubmit={submit}>
        {error && <p className="alert">{error}</p>}
        {notice && <p className="notice">{notice}</p>}
        <label>Name<input value={f.name} onChange={(e) => set('name', e.target.value)} required placeholder="e.g. Rack A" /></label>
        <label>Short code<input value={f.shortCode} onChange={(e) => set('shortCode', e.target.value)} required placeholder="e.g. RackA" /></label>
        <label>Warehouse
          <select value={f.warehouseId} onChange={(e) => set('warehouseId', e.target.value)} required>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.short_code} — {w.name}</option>)}
          </select>
        </label>
        <div className="buttons"><button type="submit" className="btn">Add location</button></div>
      </form>
      <table className="table">
        <thead><tr><th>Full code</th><th>Name</th><th>Warehouse</th></tr></thead>
        <tbody>
          {list.map((l) => (
            <tr key={l.id}><td className="ref">{l.full_code}</td><td>{l.name}</td><td>{l.warehouse_name}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
