/**
 * Admin Routes
 */
const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, getAllOrders, getAllRestaurants, toggleUserStatus, verifyRestaurant, getActivityLogs, exportReport } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/orders', getAllOrders);
router.get('/restaurants', getAllRestaurants);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.put('/restaurants/:id/verify', verifyRestaurant);
router.get('/activity-logs', getActivityLogs);
router.get('/export/:type/:format', exportReport);

module.exports = router;
