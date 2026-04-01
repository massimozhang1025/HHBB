const router = require('express').Router();
const { body, param } = require('express-validator');
const { getMyCode, getMyReferrals, claimReferral, getPendingClaims, reviewClaim } = require('../controllers/referralController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// ═══════════════════════════════════════════
// Authenticated users
// ═══════════════════════════════════════════
router.get('/my-code', authenticate, getMyCode);
router.get('/my-referrals', authenticate, getMyReferrals);

// ═══════════════════════════════════════════
// Employee only
// ═══════════════════════════════════════════
router.post('/claim', authenticate, authorize('employee'), [
  body('referral_id').isInt({ min: 1 }).withMessage('Valid referral_id required'),
  body('notes').optional().isString().isLength({ max: 500 })
], claimReferral);

// ═══════════════════════════════════════════
// Admin only
// ═══════════════════════════════════════════
router.get('/pending', authenticate, authorize('admin'), getPendingClaims);

router.patch('/:id/review', authenticate, authorize('admin'), [
  param('id').isInt({ min: 1 }).withMessage('Valid claim id required'),
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('points_awarded').optional().isInt({ min: 0, max: 500 }).withMessage('Points 0-500')
], reviewClaim);

module.exports = router;
