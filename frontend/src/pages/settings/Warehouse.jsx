// Owner: Prashasti (Prashasti09) - frontend UI
// Settings -> Warehouse: name, short code, address.
import { useEffect, useState } from 'react';
import { getWarehouses, createWarehouse, updateWarehouse } from '../../api/warehouseApi';
import { errorMessage } from '../../api/client';

const blank = { name: '', shortCode: '', address: '' };

export default function Warehouse() {
  const [list, setList] = useState([]);
  const [f, setF] = useState(blank);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const load = () => getWarehouses().then(setList).catch((e) => setError(errorMessage(e)));
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    setError(''); setNotice('');
    try {
      if (editId) await updateWarehouse(editId, f); else await createWarehouse(f);
      setNotice(editId ? 'Warehouse saved' : 'Warehouse added');
      setF(blank); setEditId(null); load();
    } catch (err) { setError(errorMessage(err)); }
  }

  return (
    <div className="settings">
      <div className="toolbar"><h1>Warehouse</h1></div>
      <form className="sheet fields narrow" onSubmit={submit}>
        {error && <p className="alert">{error}</p>}
        {notice && <p className="notice">{notice}</p>}
        <label>Name<input value={f.name} onChange={(e) => set('name', e.target.value)} required /></label>
        <label>Short code<input value={f.shortCode} onChange={(e) => set('shortCode', e.target.value.toUpperCase())} maxLength={10} required placeholder="e.g. WH" /></label>
        <label>Address<input value={f.address} onChange={(e) => set('address', e.target.value)} /></label>
        <div className="buttons">
          <button type="submit" className="btn">{editId ? 'Save warehouse' : 'Add warehouse'}</button>
          {editId && <button type="button" className="btn-ghost" onClick={() => { setF(blank); setEditId(null); }}>Cancel</button>}
        </div>
      </form>
      <table className="table">
        <thead><tr><th>Short code</th><th>Name</th><th>Address</th><th /></tr></thead>
        <tbody>
          {list.map((w) => (
            <tr key={w.id}>
              <td className="ref">{w.short_code}</td><td>{w.name}</td><td>{w.address || '—'}</td>
              <td className="num"><button type="button" className="btn-ghost small" onClick={() => { setEditId(w.id); setF({ name: w.name, shortCode: w.short_code, address: w.address || '' }); }}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
