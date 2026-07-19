/**
 * Cart Controller
 */
const Cart = require('../models/Cart');
const Food = require('../models/Food');

// @desc    Get user's cart
// @route   GET /api/cart
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.food', 'name thumbnail price isAvailable restaurant')
      .populate('restaurant', 'name slug deliveryFee minOrderAmount');

    if (!cart) {
      cart = { items: [], subtotal: 0, restaurant: null };
    }

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
const addToCart = async (req, res, next) => {
  try {
    const { foodId, quantity = 1, customizations = [] } = req.body;

    const food = await Food.findById(foodId);
    if (!food || !food.isAvailable) {
      res.status(400);
      throw new Error('Food item not available');
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, restaurant: food.restaurant, items: [] });
    }

    // Check if adding from different restaurant
    if (cart.restaurant && cart.items.length > 0 && cart.restaurant.toString() !== food.restaurant.toString()) {
      // Clear cart and start fresh
      cart.items = [];
      cart.restaurant = food.restaurant;
    }

    // Check if item already in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.food.toString() === foodId
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        food: foodId,
        quantity,
        customizations,
        price: food.price,
      });
    }

    cart.restaurant = food.restaurant;
    await cart.save();

    // Populate and return
    cart = await Cart.findById(cart._id)
      .populate('items.food', 'name thumbnail price isAvailable')
      .populate('restaurant', 'name slug deliveryFee minOrderAmount');

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      res.status(404);
      throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
      cart.items.pull(req.params.itemId);
    } else {
      item.quantity = quantity;
    }

    if (cart.items.length === 0) {
      cart.restaurant = null;
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.food', 'name thumbnail price isAvailable')
      .populate('restaurant', 'name slug deliveryFee minOrderAmount');

    res.json({ success: true, cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    cart.items.pull(req.params.itemId);
    if (cart.items.length === 0) cart.restaurant = null;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.food', 'name thumbnail price isAvailable')
      .populate('restaurant', 'name slug deliveryFee minOrderAmount');

    res.json({ success: true, cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
