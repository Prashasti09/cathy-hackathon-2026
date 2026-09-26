// Owner: Devesh (kurozadev05) - backend
// Blocks requests from users who are not logged in.
// The frontend sends:  Authorization: Bearer <token>
const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ error: 'Please log in' });
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET || 'dev_secret');
    next();
  } catch {
    res.status(401).json({ error: 'Session expired, please log in again' });
  }
};
