/**
 * User Model — Customers, Restaurant Owners, Riders, Admins
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const addressSchema = new mongoose.Schema({
  type: { type: String, enum: ['home', 'office', 'other'], default: 'home' },
  label: { type: String, default: 'Home' },
  addressLine1: { type: String, required: true },
  addressLine2: String,
  city: String,
  state: String,
  zipCode: String,
  country: { type: String, default: 'India' },
  lat: Number,
  lng: Number,
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false, // Don't include in queries by default
  },
  avatar: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['customer', 'restaurant_owner', 'rider', 'admin'],
    default: 'customer',
  },
  addresses: [addressSchema],
  // Wallet
  walletBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Loyalty
  loyaltyPoints: {
    type: Number,
    default: 0,
  },
  loyaltyTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze',
  },
  // Preferences
  preferences: {
    darkMode: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    pushNotifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    dietaryPreferences: [String], // veg, non-veg, vegan, etc.
  },
  // Saved payment methods (tokens only, not actual card data)
  savedPayments: [{
    type: { type: String, enum: ['card', 'upi', 'netbanking'] },
    last4: String,
    brand: String,
    token: String,
    isDefault: Boolean,
  }],
  // OTP
  otp: { type: String, select: false },
  otpExpire: { type: Date, select: false },
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  // Referral
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  totalOrders: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Index for geospatial queries on addresses
userSchema.index({ 'addresses.lat': 1, 'addresses.lng': 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate referral code on creation
userSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = this.name
      .toUpperCase()
      .replace(/\s+/g, '')
      .slice(0, 6) + Math.random().toString(36).slice(-4).toUpperCase();
  }
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Generate OTP
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpire = Date.now() + (parseInt(process.env.OTP_EXPIRE_MINUTES) || 5) * 60 * 1000;
  return otp;
};

// Update loyalty tier based on points
userSchema.methods.updateLoyaltyTier = function () {
  if (this.loyaltyPoints >= 5000) this.loyaltyTier = 'platinum';
  else if (this.loyaltyPoints >= 2000) this.loyaltyTier = 'gold';
  else if (this.loyaltyPoints >= 500) this.loyaltyTier = 'silver';
  else this.loyaltyTier = 'bronze';
};

module.exports = mongoose.model('User', userSchema);
