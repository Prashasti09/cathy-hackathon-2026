// Owner: Devesh (kurozadev05) - backend
const router = require('express').Router();
const a = require('../utils/asyncHandler');
const c = require('../controllers/operationController');

router.get('/', a(c.list));
router.post('/', a(c.create));
router.get('/:id', a(c.getOne));
router.put('/:id', a(c.update));
router.post('/:id/todo', a(c.todo));
router.post('/:id/validate', a(c.validate));
router.post('/:id/cancel', a(c.cancel));

module.exports = router;
