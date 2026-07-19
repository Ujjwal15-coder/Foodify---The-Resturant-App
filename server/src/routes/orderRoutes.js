/**
 * Order Routes
 */
const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, getOrders, updateOrderStatus, getRestaurantOrders, cancelOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.get('/', protect, authorize('admin'), getOrders);
router.put('/:id/status', protect, authorize('restaurant_owner', 'rider', 'admin'), updateOrderStatus);
router.get('/restaurant/:restaurantId', protect, authorize('restaurant_owner', 'admin'), getRestaurantOrders);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
