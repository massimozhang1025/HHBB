const router = require('express').Router();
const { body, param, query } = require('express-validator');
const { search, getById, create, update, updateStatus } = require('../controllers/roomController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// ═══════════════════════════════════════════
// Public
// ═══════════════════════════════════════════
router.get('/', [
  query('property_id').optional().isInt({ min: 1 }),
  query('type').optional().isIn(['single', 'double', 'suite', 'family']),
  query('min_price').optional().isFloat({ min: 0 }),
  query('max_price').optional().isFloat({ min: 0 }),
  query('check_in').optional().isDate(),
  query('check_out').optional().isDate()
], search);

router.get('/:id', [
  param('id').isInt({ min: 1 })
], getById);

// ═══════════════════════════════════════════
// Admin only
// ═══════════════════════════════════════════
router.post('/', authenticate, authorize('admin'), [
  body('property_id').isInt({ min: 1 }).withMessage('Valid property_id required'),
  body('room_number').trim().notEmpty().isLength({ max: 10 }).withMessage('Room number required (max 10 chars)'),
  body('type').isIn(['single', 'double', 'suite', 'family']).withMessage('Invalid room type'),
  body('price_per_night').isFloat({ min: 1, max: 99999 }).withMessage('Price must be 1-99999'),
  body('capacity').isInt({ min: 1, max: 20 }).withMessage('Capacity must be 1-20'),
  body('floor').optional().isInt({ min: 0, max: 99 }),
  body('description').optional().isString().isLength({ max: 1000 })
], create);

router.put('/:id', authenticate, authorize('admin'), [
  param('id').isInt({ min: 1 }),
  body('room_number').optional().trim().isLength({ max: 10 }),
  body('type').optional().isIn(['single', 'double', 'suite', 'family']),
  body('price_per_night').optional().isFloat({ min: 1, max: 99999 }),
  body('capacity').optional().isInt({ min: 1, max: 20 })
], update);

// ═══════════════════════════════════════════
// Employee+
// ═══════════════════════════════════════════
router.patch('/:id/status', authenticate, authorize('employee', 'admin'), [
  param('id').isInt({ min: 1 }).withMessage('Valid room id required'),
  body('status').isIn(['available', 'occupied', 'cleaning', 'maintenance']).withMessage('Invalid room status')
], updateStatus);

module.exports = router;
