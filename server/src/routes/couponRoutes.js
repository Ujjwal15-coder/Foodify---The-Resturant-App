/**
 * Coupon Routes
 */
const express = require('express');
const router = express.Router();
const { getCoupons, createCoupon, validateCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getCoupons);
router.post('/validate', protect, validateCoupon);
router.post('/', protect, authorize('admin'), createCoupon);
router.put('/:id', protect, authorize('admin'), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

module.exports = router;
