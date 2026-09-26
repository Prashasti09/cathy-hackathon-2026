// Owner: Devesh (kurozadev05) - backend
const router = require('express').Router();
const a = require('../utils/asyncHandler');
const c = require('../controllers/warehouseController');

router.get('/', a(c.list));
router.post('/', a(c.create));
router.put('/:id', a(c.update));

module.exports = router;
