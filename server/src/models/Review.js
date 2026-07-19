/**
 * Review Model — Reviews for food items and restaurants
 */
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    maxlength: 100,
  },
  comment: {
    type: String,
    maxlength: 500,
  },
  images: [String],
  // Helpful votes
  helpfulCount: { type: Number, default: 0 },
  // Response from restaurant
  response: {
    text: String,
    respondedAt: Date,
  },
  isVerified: { type: Boolean, default: false }, // verified purchase
}, {
  timestamps: true,
});

// Indexes
reviewSchema.index({ food: 1, user: 1 }, { unique: true, sparse: true });
reviewSchema.index({ restaurant: 1, user: 1 });
reviewSchema.index({ rating: -1 });

// Static: calculate average rating for a food item
reviewSchema.statics.calcAverageRating = async function (foodId) {
  const result = await this.aggregate([
    { $match: { food: foodId } },
    {
      $group: {
        _id: '$food',
        avgRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await mongoose.model('Food').findByIdAndUpdate(foodId, {
      avgRating: Math.round(result[0].avgRating * 10) / 10,
      totalRatings: result[0].totalRatings,
    });
  }
};

// Static: calculate average rating for a restaurant
reviewSchema.statics.calcRestaurantRating = async function (restaurantId) {
  const result = await this.aggregate([
    { $match: { restaurant: restaurantId } },
    {
      $group: {
        _id: '$restaurant',
        avgRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await mongoose.model('Restaurant').findByIdAndUpdate(restaurantId, {
      avgRating: Math.round(result[0].avgRating * 10) / 10,
      totalRatings: result[0].totalRatings,
      totalReviews: result[0].totalReviews,
    });
  }
};

// Recalculate ratings after save
reviewSchema.post('save', async function () {
  if (this.food) await this.constructor.calcAverageRating(this.food);
  if (this.restaurant) await this.constructor.calcRestaurantRating(this.restaurant);
});

module.exports = mongoose.model('Review', reviewSchema);
