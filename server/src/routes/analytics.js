const router = require('express').Router();
const { getDashboard, getBookingTrends, getPropertyPerformance, getEmployeeRanking } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Admin only
router.get('/dashboard', authenticate, authorize('admin'), getDashboard);
router.get('/bookings/trends', authenticate, authorize('admin'), getBookingTrends);
router.get('/properties/performance', authenticate, authorize('admin'), getPropertyPerformance);
router.get('/employees/ranking', authenticate, authorize('admin'), getEmployeeRanking);

module.exports = router;
