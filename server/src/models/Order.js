/**
 * Order Model — Tracks customer orders
 */
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  name: String,
  thumbnail: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  customizations: [{
    name: String,
    option: String,
    price: Number,
  }],
  itemTotal: Number,
}, { _id: true });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  items: [orderItemSchema],
  // Pricing
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  couponCode: String,
  total: { type: Number, required: true },
  // Delivery
  deliveryAddress: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zipCode: String,
    lat: Number,
    lng: Number,
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
  }],
  // Payment
  paymentMethod: {
    type: String,
    enum: ['cod', 'card', 'upi', 'wallet', 'netbanking'],
    default: 'cod',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentId: String,
  // Delivery partner
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Timing
  estimatedDeliveryTime: Number, // minutes
  actualDeliveryTime: Date,
  preparedAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancelReason: String,
  // Special instructions
  specialInstructions: String,
  // Rating (linked after delivery)
  isRated: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ rider: 1 });

// Generate order number before saving
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'FDY-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(-3).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
