/**
 * Activity Log Model — Admin audit trail
 */
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_register', 'user_login', 'user_logout',
      'order_create', 'order_update', 'order_cancel',
      'restaurant_create', 'restaurant_update', 'restaurant_verify',
      'food_create', 'food_update', 'food_delete',
      'review_create', 'coupon_create', 'coupon_update',
      'admin_action', 'payment_received', 'refund_processed',
      'profile_update', 'other',
    ],
  },
  description: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true,
});

activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
