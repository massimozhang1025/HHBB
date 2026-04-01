const router = require('express').Router();
const { body, param } = require('express-validator');
const { getAll, getById, create, update, remove } = require('../controllers/propertyController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// ═══════════════════════════════════════════
// Public
// ═══════════════════════════════════════════
router.get('/', getAll);
router.get('/:id', [
  param('id').isInt({ min: 1 })
], getById);

// ═══════════════════════════════════════════
// Admin only
// ═══════════════════════════════════════════
router.post('/', authenticate, authorize('admin'), [
  body('name').trim().notEmpty().isLength({ max: 255 }).withMessage('Property name required (max 255)'),
  body('address').trim().notEmpty().isLength({ max: 500 }).withMessage('Address required'),
  body('city').trim().notEmpty().isLength({ max: 100 }).withMessage('City required'),
  body('country').trim().notEmpty().isLength({ max: 100 }).withMessage('Country required'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('phone').optional().isString().isLength({ max: 20 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('description').optional().isString().isLength({ max: 2000 })
], create);

router.put('/:id', authenticate, authorize('admin'), [
  param('id').isInt({ min: 1 }),
  body('name').optional().trim().isLength({ max: 255 }),
  body('address').optional().trim().isLength({ max: 500 }),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 })
], update);

router.delete('/:id', authenticate, authorize('admin'), [
  param('id').isInt({ min: 1 }).withMessage('Valid property id required')
], remove);

module.exports = router;
