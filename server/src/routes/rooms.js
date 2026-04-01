const router = require('express').Router();
const { search, getById, create, update, updateStatus } = require('../controllers/roomController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Public
router.get('/', search);
router.get('/:id', getById);

// Admin only
router.post('/', authenticate, authorize('admin'), create);
router.put('/:id', authenticate, authorize('admin'), update);

// Employee+
router.patch('/:id/status', authenticate, authorize('employee', 'admin'), updateStatus);

module.exports = router;
