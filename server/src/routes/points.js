const router = require('express').Router();
const { getMyPoints, getEmployeePoints, adjustPoints, getLeaderboard } = require('../controllers/pointsController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Employee
router.get('/my', authenticate, authorize('employee'), getMyPoints);
router.get('/leaderboard', authenticate, authorize('employee', 'admin'), getLeaderboard);

// Admin
router.get('/employee/:id', authenticate, authorize('admin'), getEmployeePoints);
router.post('/adjust', authenticate, authorize('admin'), adjustPoints);

module.exports = router;
