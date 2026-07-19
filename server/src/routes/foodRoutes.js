/**
 * Food Routes
 */
const express = require('express');
const router = express.Router();
const { getFoods, getFood, createFood, updateFood, deleteFood, searchFoods, getCategories } = require('../controllers/foodController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadMultiple } = require('../middleware/uploadMiddleware');

router.get('/', getFoods);
router.get('/search', searchFoods);
router.get('/categories', getCategories);
router.get('/:id', getFood);
router.post('/', protect, authorize('restaurant_owner', 'admin'), uploadMultiple('images', 5), createFood);
router.put('/:id', protect, authorize('restaurant_owner', 'admin'), uploadMultiple('images', 5), updateFood);
router.delete('/:id', protect, authorize('restaurant_owner', 'admin'), deleteFood);

module.exports = router;
