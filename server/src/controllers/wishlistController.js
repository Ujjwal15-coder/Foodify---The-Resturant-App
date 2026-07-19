/**
 * Wishlist Controller — Toggle wishlist items
 */
const User = require('../models/User');
const Food = require('../models/Food');

// Simple wishlist using a separate collection approach
const mongoose = require('mongoose');

// We'll use a simple Wishlist schema
const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
}, { timestamps: true });

wishlistSchema.index({ user: 1, food: 1 }, { unique: true });

const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);

// @desc    Get wishlist
// @route   GET /api/wishlist
const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.find({ user: req.user._id })
      .populate({
        path: 'food',
        populate: { path: 'restaurant', select: 'name slug' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, wishlist: items });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle wishlist item
// @route   POST /api/wishlist/:foodId
const toggleWishlist = async (req, res, next) => {
  try {
    const { foodId } = req.params;

    const existing = await Wishlist.findOne({ user: req.user._id, food: foodId });

    if (existing) {
      await Wishlist.findByIdAndDelete(existing._id);
      res.json({ success: true, message: 'Removed from wishlist', isWishlisted: false });
    } else {
      await Wishlist.create({ user: req.user._id, food: foodId });
      res.json({ success: true, message: 'Added to wishlist', isWishlisted: true });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Check if item is wishlisted
// @route   GET /api/wishlist/check/:foodId
const checkWishlist = async (req, res, next) => {
  try {
    const existing = await Wishlist.findOne({ user: req.user._id, food: req.params.foodId });
    res.json({ success: true, isWishlisted: !!existing });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWishlist, toggleWishlist, checkWishlist };
