// Owner: Devesh (kurozadev05) - backend
// OTP for password reset. For the hackathon demo the code is PRINTED in the
// backend terminal instead of being emailed.
const store = new Map(); // email -> { code, expiresAt }

function createOtp(email) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  store.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000 });
  console.log(`\n>>> OTP for ${email}: ${code}  (valid 10 minutes)\n`);
  return code;
}

function checkOtp(email, code) {
  const entry = store.get(email);
  if (!entry || Date.now() > entry.expiresAt || entry.code !== String(code)) return false;
  store.delete(email);
  return true;
}

module.exports = { createOtp, checkOtp };
