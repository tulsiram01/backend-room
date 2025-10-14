const express = require('express');
const {
  getDashboardStats,
  getUsers,
  getAllProperties,
  toggleUserStatus,
  getActivityLogs
} = require('../controllers/adminController');
const { adminAuth } = require('../middlewares/auth');

const router = express.Router();

router.get('/dashboard-stats', adminAuth, getDashboardStats);
router.get('/users', adminAuth, getUsers);
router.get('/properties', adminAuth, getAllProperties);
router.get('/activity-logs', adminAuth, getActivityLogs);
router.patch('/users/:id/toggle-status', adminAuth, toggleUserStatus);

module.exports = router;