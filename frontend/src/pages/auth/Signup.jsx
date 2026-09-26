// Owner: Prashasti (Prashasti09) - frontend UI
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { errorMessage } from '../../api/client';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ loginId: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (f.password !== f.confirm) return setError('The two passwords do not match');
    if (f.password.length < 6) return setError('Password must be at least 6 characters');
    setBusy(true); setError('');
    try {
      await signup(f.loginId, f.email, f.password);
      navigate('/dashboard');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-logo">StockSense</div>
        <h1>Create an account</h1>
        {error && <p className="alert">{error}</p>}
        <label>Login ID<input value={f.loginId} onChange={(e) => set('loginId', e.target.value)} required autoFocus /></label>
        <label>Email<input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} required /></label>
        <label>Password<input type="password" value={f.password} onChange={(e) => set('password', e.target.value)} autoComplete="new-password" required /></label>
        <label>Re-enter password<input type="password" value={f.confirm} onChange={(e) => set('confirm', e.target.value)} autoComplete="new-password" required /></label>
        <button type="submit" className="btn wide" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
        <p className="auth-links"><Link to="/login">Already have an account? Log in</Link></p>
      </form>
    </div>
  );
}
