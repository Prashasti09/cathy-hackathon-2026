// Owner: Devesh (kurozadev05) - backend
// Small helper: throw httpError(400, 'message') inside any controller/service
// and app.js turns it into a JSON error response with that status.
module.exports = function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
};
