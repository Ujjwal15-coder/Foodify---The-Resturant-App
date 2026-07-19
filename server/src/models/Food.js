/**
 * Food Item Model
 */
const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  calories: Number,
  protein: Number,   // grams
  fat: Number,       // grams
  carbs: Number,     // grams
  fiber: Number,     // grams
}, { _id: false });

const customizationSchema = new mongoose.Schema({
  name: { type: String, required: true },       // "Size", "Extra Toppings"
  type: { type: String, enum: ['radio', 'checkbox'], default: 'radio' },
  required: { type: Boolean, default: false },
  maxSelect: { type: Number, default: 1 },
  options: [{
    name: { type: String, required: true },      // "Large", "Extra Cheese"
    price: { type: Number, default: 0 },         // Additional price
    isDefault: { type: Boolean, default: false },
  }],
}, { _id: true });

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food item name is required'],
    trim: true,
    maxlength: 100,
  },
  slug: {
    type: String,
    lowercase: true,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'burgers', 'pizza', 'chicken', 'salads', 'sushi', 'tacos',
      'desserts', 'coffee', 'asian', 'indian', 'pasta', 'bakery',
      'drinks', 'sides', 'combos', 'breakfast', 'healthy', 'other',
      'north-indian', 'south-indian', 'chinese', 'continental',
      'street-food', 'biryani', 'rolls', 'thali', 'snacks',
      'beverages', 'starters', 'main-course', 'breads', 'mandi',
    ],
  },
  subcategory: String,
  // Pricing
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  originalPrice: Number, // For showing discount
  // Media
  images: [String],
  thumbnail: String,
  // Details
  foodType: {
    type: String,
    enum: ['veg', 'non-veg', 'vegan', 'egg'],
    required: true,
  },
  spiceLevel: {
    type: String,
    enum: ['none', 'mild', 'medium', 'hot', 'extra-hot'],
    default: 'medium',
  },
  servingSize: { type: String, default: 'Serves 1' },
  preparationTime: { type: Number, default: 20 }, // minutes
  // Nutrition
  nutrition: nutritionSchema,
  // Ingredients
  ingredients: [String],
  allergens: [String],
  // Customizations
  customizations: [customizationSchema],
  // Tags & Flags
  tags: [String], // 'bestseller', 'new', 'chef-special', 'trending'
  isBestseller: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  // Stock
  isAvailable: { type: Boolean, default: true },
  stockCount: { type: Number, default: -1 }, // -1 = unlimited
  // Ratings
  avgRating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  // Stats
  totalOrders: { type: Number, default: 0 },
  // Offer
  offer: {
    discountPercent: Number,
    discountFlat: Number,
    offerText: String,
    validTill: Date,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
foodSchema.index({ restaurant: 1, category: 1 });
foodSchema.index({ name: 'text', description: 'text' });
foodSchema.index({ isAvailable: 1, isBestseller: -1 });
foodSchema.index({ avgRating: -1, totalOrders: -1 });
foodSchema.index({ price: 1 });

// Generate slug
foodSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Food', foodSchema);
