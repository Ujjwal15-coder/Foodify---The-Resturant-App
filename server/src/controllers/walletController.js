/**
 * Wallet Controller
 */
const User = require('../models/User');
const Wallet = require('../models/Wallet');

// @desc    Get wallet balance
// @route   GET /api/wallet/balance
const getBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, balance: user.walletBalance });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wallet transactions
// @route   GET /api/wallet/transactions
const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Wallet.find({ user: req.user._id }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Wallet.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add funds to wallet
// @route   POST /api/wallet/add
const addFunds = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      res.status(400);
      throw new Error('Invalid amount');
    }

    const user = await User.findById(req.user._id);
    user.walletBalance += amount;
    await user.save({ validateBeforeSave: false });

    const transaction = await Wallet.create({
      user: req.user._id,
      type: 'credit',
      amount,
      balance: user.walletBalance,
      description: 'Wallet top-up',
      category: 'top_up',
    });

    res.json({ success: true, balance: user.walletBalance, transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Deduct from wallet (internal use)
const deductFunds = async (userId, amount, description, category = 'order_payment') => {
  const user = await User.findById(userId);
  if (user.walletBalance < amount) {
    throw new Error('Insufficient wallet balance');
  }

  user.walletBalance -= amount;
  await user.save({ validateBeforeSave: false });

  await Wallet.create({
    user: userId,
    type: 'debit',
    amount,
    balance: user.walletBalance,
    description,
    category,
  });

  return user.walletBalance;
};

module.exports = { getBalance, getTransactions, addFunds, deductFunds };
