// Owner: Devesh (kurozadev05) - backend
const router = require('express').Router();
const a = require('../utils/asyncHandler');
const auth = require('../middleware/auth');
const c = require('../controllers/authController');

router.post('/signup', a(c.signup));
router.post('/login', a(c.login));
router.post('/forgot-password', a(c.forgotPassword));
router.post('/reset-password', a(c.resetPassword));
router.get('/me', auth, a(c.me));
router.get('/users', auth, a(c.listUsers));

module.exports = router;
