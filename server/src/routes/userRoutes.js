/**
 * User Routes
 */
const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateProfile, updateAvatar, addAddress, updateAddress, deleteAddress, getUserStats } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/stats', protect, getUserStats);
router.get('/:id', protect, getUser);
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, uploadSingle('avatar'), updateAvatar);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

module.exports = router;
