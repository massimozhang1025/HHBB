const router = require('express').Router();
const { body, param } = require('express-validator');
const { getMyPoints, getEmployeePoints, adjustPoints, getLeaderboard } = require('../controllers/pointsController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// ═══════════════════════════════════════════
// Employee
// ═══════════════════════════════════════════
router.get('/my', authenticate, authorize('employee'), getMyPoints);
router.get('/leaderboard', authenticate, authorize('employee', 'admin'), getLeaderboard);

// ═══════════════════════════════════════════
// Admin
// ═══════════════════════════════════════════
router.get('/employee/:id', authenticate, authorize('admin'), [
  param('id').isInt({ min: 1 }).withMessage('Valid employee id required')
], getEmployeePoints);

router.post('/adjust', authenticate, authorize('admin'), [
  body('employee_id').isInt({ min: 1 }).withMessage('Valid employee_id required'),
  body('points').isInt({ min: -1000, max: 1000 }).withMessage('Points must be between -1000 and 1000'),
  body('type').isIn(['manual_bonus', 'penalty', 'referral_reward']).withMessage('Invalid point type'),
  body('reason').trim().notEmpty().isLength({ max: 500 }).withMessage('Reason required (max 500 chars)')
], adjustPoints);

module.exports = router;
