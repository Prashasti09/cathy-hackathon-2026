// Owner: Devesh (kurozadev05) - backend
const router = require('express').Router();
const a = require('../utils/asyncHandler');
const c = require('../controllers/productController');

// categories must come before /:id
router.get('/categories', a(c.listCategories));
router.post('/categories', a(c.createCategory));

router.get('/', a(c.list));
router.post('/', a(c.create));
router.get('/:id', a(c.getOne));
router.put('/:id', a(c.update));
router.post('/:id/stock', a(c.setStock));

module.exports = router;
