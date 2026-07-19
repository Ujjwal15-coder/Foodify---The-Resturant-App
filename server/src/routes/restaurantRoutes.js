/**
 * Restaurant Routes
 */
const express = require('express');
const router = express.Router();
const { getRestaurants, getRestaurant, createRestaurant, updateRestaurant, deleteRestaurant, getNearbyRestaurants, getRestaurantStats, getMyRestaurants } = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getRestaurants);
router.get('/nearby', getNearbyRestaurants);
router.get('/my', protect, authorize('restaurant_owner', 'admin'), getMyRestaurants);
router.get('/:id', getRestaurant);
router.get('/:id/stats', protect, authorize('restaurant_owner', 'admin'), getRestaurantStats);
router.post('/', protect, authorize('restaurant_owner', 'admin'), createRestaurant);
router.put('/:id', protect, authorize('restaurant_owner', 'admin'), updateRestaurant);
router.delete('/:id', protect, authorize('restaurant_owner', 'admin'), deleteRestaurant);

module.exports = router;
