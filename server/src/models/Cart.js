/**
 * Cart Model — Shopping cart per user
 */
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  customizations: [{
    name: String,
    option: String,
    price: { type: Number, default: 0 },
  }],
  price: { type: Number, required: true },
  itemTotal: Number,
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
  },
  items: [cartItemSchema],
  subtotal: { type: Number, default: 0 },
  couponCode: String,
  discount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Calculate subtotal before saving
cartSchema.pre('save', function (next) {
  this.subtotal = this.items.reduce((sum, item) => {
    const customizationTotal = (item.customizations || []).reduce((s, c) => s + (c.price || 0), 0);
    item.itemTotal = (item.price + customizationTotal) * item.quantity;
    return sum + item.itemTotal;
  }, 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
