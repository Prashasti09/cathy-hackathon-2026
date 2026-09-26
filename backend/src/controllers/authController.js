// Owner: Devesh (kurozadev05) - backend
// Signup, login, and OTP password reset.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const httpError = require('../utils/httpError');
const { createOtp, checkOtp } = require('../utils/otp');

function makeToken(user) {
  return jwt.sign({ id: user.id, loginId: user.login_id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
}
const publicUser = (u) => ({ id: u.id, loginId: u.login_id, email: u.email });

exports.signup = async (req, res) => {
  const { loginId, email, password } = req.body;
  if (!loginId || !email || !password) throw httpError(400, 'Login ID, email and password are required');
  if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  const taken = await pool.query('SELECT 1 FROM users WHERE login_id = $1 OR email = $2', [loginId, email]);
  if (taken.rows.length) throw httpError(409, 'That login ID or email is already registered');
  const hash = await bcrypt.hash(password, 10);
  const r = await pool.query(
    'INSERT INTO users (login_id, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
    [loginId, email, hash]
  );
  res.status(201).json({ token: makeToken(r.rows[0]), user: publicUser(r.rows[0]) });
};

exports.login = async (req, res) => {
  const { loginId, password } = req.body;
  const r = await pool.query('SELECT * FROM users WHERE login_id = $1', [loginId]);
  const user = r.rows[0];
  if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
    throw httpError(401, 'Wrong login ID or password');
  }
  res.json({ token: makeToken(user), user: publicUser(user) });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const r = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
  if (r.rows.length) createOtp(email);
  res.json({ message: 'If this email is registered, an OTP has been sent' });
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  if (!checkOtp(email, otp)) throw httpError(400, 'Wrong or expired OTP');
  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, email]);
  res.json({ message: 'Password changed. You can log in now.' });
};

exports.me = async (req, res) => {
  const r = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  if (!r.rows.length) throw httpError(404, 'User not found');
  res.json(publicUser(r.rows[0]));
};

exports.listUsers = async (req, res) => {
  const r = await pool.query('SELECT id, login_id, email FROM users ORDER BY login_id');
  res.json(r.rows.map(publicUser));
};
