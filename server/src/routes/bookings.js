const router = require('express').Router();
const { create, getMyBookings, getAll, updateStatus, autoCheckIn, cancel } = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Customer+
router.post('/', authenticate, create);
router.get('/my', authenticate, getMyBookings);
router.delete('/:id', authenticate, cancel);

// Employee+
router.get('/', authenticate, authorize('employee', 'admin'), getAll);
router.patch('/:id/status', authenticate, authorize('employee', 'admin'), updateStatus);
router.post('/auto-checkin', authenticate, authorize('employee', 'admin'), autoCheckIn);

module.exports = router;
