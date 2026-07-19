/**
 * Order Controller — Create, track, manage orders
 */
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

// @desc    Create order
// @route   POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod, specialInstructions, couponCode } = req.body;

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No items in order');
    }

    // Validate restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isActive) {
      res.status(400);
      throw new Error('Restaurant not found or inactive');
    }

    // Build order items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const food = await Food.findById(item.food);
      if (!food || !food.isAvailable) continue;

      const customizationTotal = (item.customizations || []).reduce((s, c) => s + (c.price || 0), 0);
      const itemTotal = (food.price + customizationTotal) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        food: food._id,
        name: food.name,
        thumbnail: food.thumbnail,
        quantity: item.quantity,
        price: food.price,
        customizations: item.customizations || [],
        itemTotal,
      });

      // Update food order count
      food.totalOrders += item.quantity;
      await food.save({ validateBeforeSave: false });
    }

    const deliveryFee = restaurant.deliveryFee || 0;
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% tax
    const discount = 0; // Apply coupon logic here if needed
    const total = subtotal + deliveryFee + tax - discount;

    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurantId,
      items: orderItems,
      subtotal,
      deliveryFee,
      tax,
      discount,
      couponCode,
      total,
      deliveryAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      estimatedDeliveryTime: restaurant.avgDeliveryTime + restaurant.avgPrepTime,
      specialInstructions,
      statusHistory: [{ status: 'pending', timestamp: new Date() }],
    });

    // Update restaurant stats
    restaurant.totalOrders += 1;
    restaurant.totalRevenue += total;
    await restaurant.save({ validateBeforeSave: false });

    // Update user order count
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalOrders: 1 } });

    // Clear user's cart
    await Cart.findOneAndDelete({ user: req.user._id });

    // Create notification
    await Notification.create({
      user: req.user._id,
      type: 'order',
      title: 'Order Placed!',
      message: `Your order ${order.orderNumber} has been placed successfully.`,
      metadata: { orderId: order._id, restaurantId },
    });

    // Send via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${req.user._id}`).emit('order_update', { order });
      io.to(`restaurant_${restaurantId}`).emit('new_order', { order });
    }

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(req.user.email, order);
    } catch (e) { /* email is non-critical */ }

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'order_create',
      description: `Order ${order.orderNumber} created`,
      metadata: { orderId: order._id, total },
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my orders
// @route   GET /api/orders/my
const getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('restaurant', 'name slug images')
        .skip(skip).limit(limit)
        .sort({ createdAt: -1 }),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name slug images phone')
      .populate('user', 'name email phone')
      .populate('rider', 'name phone');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check permission
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'rider'
    ) {
      // Check if restaurant owner
      const restaurant = await Restaurant.findById(order.restaurant._id || order.restaurant);
      if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this order');
      }
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const restaurantId = req.query.restaurant;

    const filter = {};
    if (status) filter.status = status;
    if (restaurantId) filter.restaurant = restaurantId;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .populate('restaurant', 'name')
        .skip(skip).limit(limit)
        .sort({ createdAt: -1 }),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date(), note });

    // Set timestamps based on status
    if (status === 'ready') order.preparedAt = new Date();
    if (status === 'out_for_delivery') order.pickedUpAt = new Date();
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.actualDeliveryTime = new Date();
      order.paymentStatus = 'paid';
    }
    if (status === 'cancelled') {
      order.cancelledAt = new Date();
      order.cancelReason = note;
    }

    await order.save();

    // Notify user via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${order.user}`).emit('order_update', { orderId: order._id, status });
      io.to(`order_${order._id}`).emit('order_status_change', { status });
    }

    // Create notification
    const statusMessages = {
      confirmed: 'Your order has been confirmed by the restaurant!',
      preparing: 'Your food is being prepared!',
      ready: 'Your order is ready for pickup!',
      out_for_delivery: 'Your order is on the way!',
      delivered: 'Your order has been delivered. Enjoy!',
      cancelled: 'Your order has been cancelled.',
    };

    if (statusMessages[status]) {
      await Notification.create({
        user: order.user,
        type: 'order',
        title: `Order ${status.replace('_', ' ')}`,
        message: statusMessages[status],
        metadata: { orderId: order._id },
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant orders
// @route   GET /api/orders/restaurant/:restaurantId
const getRestaurantOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = { restaurant: req.params.restaurantId };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .skip(skip).limit(limit)
        .sort({ createdAt: -1 }),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      res.status(400);
      throw new Error('Cannot cancel order at this stage');
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || 'Cancelled by user';
    order.statusHistory.push({ status: 'cancelled', timestamp: new Date(), note: order.cancelReason });
    await order.save();

    res.json({ success: true, message: 'Order cancelled', order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getOrders,
  updateOrderStatus,
  getRestaurantOrders,
  cancelOrder,
};
