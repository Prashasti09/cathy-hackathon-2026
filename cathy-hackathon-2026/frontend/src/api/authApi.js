// Owner: Anmol (code-by-anmol) - logic & integration
import client from './client';

export const login = (loginId, password) => client.post('/auth/login', { loginId, password }).then((r) => r.data);
export const signup = (loginId, email, password) => client.post('/auth/signup', { loginId, email, password }).then((r) => r.data);
export const forgotPassword = (email) => client.post('/auth/forgot-password', { email }).then((r) => r.data);
export const resetPassword = (email, otp, newPassword) =>
  client.post('/auth/reset-password', { email, otp, newPassword }).then((r) => r.data);
export const me = () => client.get('/auth/me').then((r) => r.data);
