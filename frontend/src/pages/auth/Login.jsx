// Owner: Prashasti (Prashasti09) - frontend UI
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { errorMessage } from '../../api/client';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await login(loginId, password);
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
        <h1>Log in</h1>
        {error && <p className="alert">{error}</p>}
        <label>Login ID<input value={loginId} onChange={(e) => setLoginId(e.target.value)} autoComplete="username" required autoFocus /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
        <button type="submit" className="btn wide" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
