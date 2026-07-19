/**
 * Auth Routes
 */
const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, verifyEmail, resendOTP, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/verify-email', protect, verifyEmail);
router.post('/resend-otp', protect, resendOTP);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;
