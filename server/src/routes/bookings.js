const router = require('express').Router();
const { body, param, query } = require('express-validator');
const { create, getMyBookings, getAll, updateStatus, autoCheckIn, cancel } = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// ═══════════════════════════════════════════
// Customer+
// ═══════════════════════════════════════════
router.post('/', authenticate, [
  body('room_id').isInt({ min: 1 }).withMessage('Valid room_id required'),
  body('check_in').isDate().withMessage('Valid check_in date required (YYYY-MM-DD)'),
  body('check_out').isDate().withMessage('Valid check_out date required (YYYY-MM-DD)'),
  body('guests').optional().isInt({ min: 1, max: 20 }).withMessage('Guests must be 1-20'),
  body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes max 500 chars'),
  body('referral_code').optional().isString().isLength({ max: 12 })
], create);

router.get('/my', authenticate, getMyBookings);

router.delete('/:id', authenticate, [
  param('id').isInt({ min: 1 }).withMessage('Valid booking id required')
], cancel);

// ═══════════════════════════════════════════
// Employee+ (RBAC protected)
// ═══════════════════════════════════════════
router.get('/', authenticate, authorize('employee', 'admin'), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['confirmed', 'checked_in', 'checked_out', 'cancelled']),
  query('property_id').optional().isInt({ min: 1 })
], getAll);

router.patch('/:id/status', authenticate, authorize('employee', 'admin'), [
  param('id').isInt({ min: 1 }).withMessage('Valid booking id required'),
  body('status').isIn(['checked_in', 'checked_out', 'cancelled']).withMessage('Invalid status value')
], updateStatus);

router.post('/auto-checkin', authenticate, authorize('employee', 'admin'), [
  body('property_id').optional().isInt({ min: 1 })
], autoCheckIn);

module.exports = router;
