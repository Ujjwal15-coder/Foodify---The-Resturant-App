/**
 * Restaurant Model
 */
const mongoose = require('mongoose');

const operatingHoursSchema = new mongoose.Schema({
  day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
  open: String,  // "09:00"
  close: String, // "22:00"
  isClosed: { type: Boolean, default: false },
}, { _id: false });

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    maxlength: 100,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  cuisines: [{
    type: String,
    trim: true,
  }],
  // Location
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' },
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  // Media
  images: {
    logo: String,
    banner: String,
    gallery: [String],
  },
  // Ratings
  avgRating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  // Delivery
  deliveryRadius: { type: Number, default: 10 }, // km
  deliveryFee: { type: Number, default: 0 },
  minOrderAmount: { type: Number, default: 0 },
  avgDeliveryTime: { type: Number, default: 30 }, // minutes
  freeDeliveryAbove: Number,
  // Pricing
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$', '₹', '₹₹', '₹₹₹', '₹₹₹₹'],
    default: '₹₹',
  },
  priceForTwo: { type: Number, default: 400 }, // ₹ for two people
  // Status
  isActive: { type: Boolean, default: true },
  isOpen: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  // Operating Hours
  operatingHours: [operatingHoursSchema],
  // Tags
  tags: [String], // 'veg-friendly', 'fast-delivery', 'new', 'promoted'
  // Offer
  currentOffer: {
    text: String,
    discountPercent: Number,
    minOrder: Number,
    validTill: Date,
  },
  // Stats
  totalOrders: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  // Commission
  commissionRate: { type: Number, default: 15 }, // percentage
  // Preparation
  avgPrepTime: { type: Number, default: 20 }, // minutes
  // Contact
  phone: String,
  email: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Geospatial index for nearby search
restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ isActive: 1, isOpen: 1 });
restaurantSchema.index({ avgRating: -1 });
restaurantSchema.index({ cuisines: 1 });

// Generate slug before saving
restaurantSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
  }
  next();
});

// Virtual: menu items
restaurantSchema.virtual('menuItems', {
  ref: 'Food',
  localField: '_id',
  foreignField: 'restaurant',
});

// Virtual: reviews
restaurantSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'restaurant',
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
