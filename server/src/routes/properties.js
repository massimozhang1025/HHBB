const router = require('express').Router();
const { getAll, getById, create, update, remove } = require('../controllers/propertyController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Public
router.get('/', getAll);
router.get('/:id', getById);

// Admin only
router.post('/', authenticate, authorize('admin'), create);
router.put('/:id', authenticate, authorize('admin'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);

module.exports = router;
