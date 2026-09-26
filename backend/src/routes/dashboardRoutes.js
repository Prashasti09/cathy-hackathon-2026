// Owner: Devesh (kurozadev05) - backend
const router = require('express').Router();
const a = require('../utils/asyncHandler');
const c = require('../controllers/dashboardController');

router.get('/', a(c.get));

module.exports = router;
