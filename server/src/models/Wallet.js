/**
 * Wallet Transaction Model
 */
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  balance: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  reference: {
    type: String, // order ID, refund ID, etc.
  },
  category: {
    type: String,
    enum: ['top_up', 'order_payment', 'refund', 'cashback', 'referral_bonus', 'other'],
    default: 'other',
  },
}, {
  timestamps: true,
});

walletSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Wallet', walletSchema);
