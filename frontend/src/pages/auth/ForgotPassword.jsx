// Owner: Prashasti (Prashasti09) - frontend UI
// Step 1: enter email -> OTP is sent (printed in the backend terminal for the demo).
// Step 2: enter OTP + new password.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../api/authApi';
import { errorMessage } from '../../api/client';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      if (step === 1) {
        await forgotPassword(email);
        setNotice('We sent a 6-digit code to your email. (Demo: it appears in the backend terminal.)');
        setStep(2);
      } else {
        await resetPassword(email, otp, password);
        setNotice('Password changed. Taking you to log in…');
        setTimeout(() => navigate('/login'), 1200);
      }
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
        <h1>Reset password</h1>
        {error && <p className="alert">{error}</p>}
        {notice && <p className="notice">{notice}</p>}
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={step === 2} /></label>
        {step === 2 && (
          <>
            <label>OTP code<input value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" required autoFocus /></label>
            <label>New password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required /></label>
          </>
        )}
        <button type="submit" className="btn wide" disabled={busy}>{step === 1 ? 'Send code' : 'Change password'}</button>
        <p className="auth-links"><Link to="/login">Back to log in</Link></p>
      </form>
    </div>
  );
}
