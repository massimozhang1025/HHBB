const router = require('express').Router();
const { getMyCode, getMyReferrals, claimReferral, getPendingClaims, reviewClaim } = require('../controllers/referralController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Authenticated users
router.get('/my-code', authenticate, getMyCode);
router.get('/my-referrals', authenticate, getMyReferrals);

// Employee only
router.post('/claim', authenticate, authorize('employee'), claimReferral);

// Admin only
router.get('/pending', authenticate, authorize('admin'), getPendingClaims);
router.patch('/:id/review', authenticate, authorize('admin'), reviewClaim);

module.exports = router;
