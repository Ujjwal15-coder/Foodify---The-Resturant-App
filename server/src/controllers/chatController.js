/**
 * Chat Controller
 */
const Chat = require('../models/Chat');

// @desc    Get messages for an order
// @route   GET /api/chat/:orderId
const getMessages = async (req, res, next) => {
  try {
    const messages = await Chat.find({ order: req.params.orderId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message
// @route   POST /api/chat/:orderId
const sendMessage = async (req, res, next) => {
  try {
    const { message, type = 'text' } = req.body;

    const chat = await Chat.create({
      order: req.params.orderId,
      sender: req.user._id,
      senderRole: req.user.role,
      message,
      type,
    });

    await chat.populate('sender', 'name avatar role');

    // Send via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${req.params.orderId}`).emit('new_message', chat);
    }

    res.status(201).json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, sendMessage };
