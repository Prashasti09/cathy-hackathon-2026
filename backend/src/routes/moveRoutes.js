// Owner: Devesh (kurozadev05) - backend
const router = require('express').Router();
const a = require('../utils/asyncHandler');
const c = require('../controllers/moveController');

router.get('/', a(c.list));

module.exports = router;
