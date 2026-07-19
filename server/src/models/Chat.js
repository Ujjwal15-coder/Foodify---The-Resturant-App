/**
 * Chat Model — Messages linked to orders
 */
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderRole: {
    type: String,
    enum: ['customer', 'rider', 'restaurant_owner', 'admin'],
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'location', 'system'],
    default: 'text',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

chatSchema.index({ order: 1, createdAt: 1 });

module.exports = mongoose.model('Chat', chatSchema);
