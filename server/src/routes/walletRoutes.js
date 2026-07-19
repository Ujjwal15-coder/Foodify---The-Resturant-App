/**
 * Wallet Routes
 */
const express = require('express');
const router = express.Router();
const { getBalance, getTransactions, addFunds } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.get('/balance', protect, getBalance);
router.get('/transactions', protect, getTransactions);
router.post('/add', protect, addFunds);

module.exports = router;
