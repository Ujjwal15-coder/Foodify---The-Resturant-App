/**
 * Wishlist Routes
 */
const express = require('express');
const router = express.Router();
const { getWishlist, toggleWishlist, checkWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWishlist);
router.post('/:foodId', protect, toggleWishlist);
router.get('/check/:foodId', protect, checkWishlist);

module.exports = router;
