/**
 * Review Controller
 */
const Review = require('../models/Review');

// @desc    Get reviews for a food or restaurant
// @route   GET /api/reviews
const getReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { food, restaurant } = req.query;

    const filter = {};
    if (food) filter.food = food;
    if (restaurant) filter.restaurant = restaurant;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name avatar')
        .skip(skip).limit(limit)
        .sort({ createdAt: -1 }),
      Review.countDocuments(filter),
    ]);

    res.json({
      success: true,
      reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review
// @route   POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const { food, restaurant, order, rating, title, comment } = req.body;

    // Check if already reviewed
    if (food) {
      const existing = await Review.findOne({ user: req.user._id, food });
      if (existing) {
        res.status(400);
        throw new Error('You have already reviewed this food item');
      }
    }

    const review = await Review.create({
      user: req.user._id,
      food,
      restaurant,
      order,
      rating,
      title,
      comment,
      isVerified: !!order,
    });

    await review.populate('user', 'name avatar');

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
const updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    if (review.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('user', 'name avatar');

    res.json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized');
    }

    const foodId = review.food;
    const restaurantId = review.restaurant;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate ratings
    if (foodId) await Review.calcAverageRating(foodId);
    if (restaurantId) await Review.calcRestaurantRating(restaurantId);

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReviews, createReview, updateReview, deleteReview };
