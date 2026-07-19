/**
 * Chat Routes
 */
const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:orderId', protect, getMessages);
router.post('/:orderId', protect, sendMessage);

module.exports = router;
