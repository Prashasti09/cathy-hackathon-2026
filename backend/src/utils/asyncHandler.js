// Owner: Devesh (kurozadev05) - backend
// Wraps async controllers so thrown errors reach the error handler in app.js.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
