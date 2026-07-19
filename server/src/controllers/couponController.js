/**
 * Coupon Controller
 */
const Coupon = require('../models/Coupon');

// @desc    Get active coupons
// @route   GET /api/coupons
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      validTill: { $gte: new Date() },
    }).sort({ createdAt: -1 });

    res.json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Create coupon (admin)
// @route   POST /api/coupons
const createCoupon = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate and apply coupon
// @route   POST /api/coupons/validate
const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validTill: { $gte: new Date() },
    });

    if (!coupon) {
      res.status(400);
      throw new Error('Invalid or expired coupon code');
    }

    // Check usage limit
    if (coupon.usageLimit !== -1 && coupon.usedCount >= coupon.usageLimit) {
      res.status(400);
      throw new Error('Coupon usage limit reached');
    }

    // Check per-user limit
    const userUsage = coupon.usedBy.filter(
      (u) => u.user.toString() === req.user._id.toString()
    ).length;
    if (userUsage >= coupon.perUserLimit) {
      res.status(400);
      throw new Error('You have already used this coupon');
    }

    // Check minimum order
    if (orderAmount < coupon.minOrderAmount) {
      res.status(400);
      throw new Error(`Minimum order amount is ₹${coupon.minOrderAmount}`);
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
      },
      discount: Math.round(discount * 100) / 100,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon (admin)
// @route   PUT /api/coupons/:id
const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }
    res.json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon (admin)
// @route   DELETE /api/coupons/:id
const deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCoupons, createCoupon, validateCoupon, updateCoupon, deleteCoupon };
