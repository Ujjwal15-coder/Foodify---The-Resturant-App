/**
 * Admin Controller — Dashboard stats, management, exports
 */
const User = require('../models/User');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Review = require('../models/Review');
const ActivityLog = require('../models/ActivityLog');
const { generatePDFReport, generateExcelReport } = require('../utils/exportService');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      totalOrders,
      totalRestaurants,
      totalFoods,
      monthlyOrders,
      lastMonthOrders,
      revenueAgg,
      monthlyRevenueAgg,
      recentOrders,
      ordersByStatus,
      monthlyOrderTrend,
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Restaurant.countDocuments(),
      Food.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: thisMonth } }),
      Order.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thisMonth }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.find().populate('user', 'name').populate('restaurant', 'name').sort({ createdAt: -1 }).limit(10),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Monthly trend for last 6 months
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
          },
        },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
            revenue: { $sum: '$total' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;
    const orderGrowth = lastMonthOrders > 0
      ? Math.round(((monthlyOrders - lastMonthOrders) / lastMonthOrders) * 100)
      : 100;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalRestaurants,
        totalFoods,
        totalRevenue,
        monthlyOrders,
        monthlyRevenue,
        orderGrowth,
        recentOrders,
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        monthlyOrderTrend: monthlyOrderTrend.map((item) => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          orders: item.count,
          revenue: item.revenue,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status) filter.status = status;

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

// @desc    Get all restaurants (admin)
// @route   GET /api/admin/restaurants
const getAllRestaurants = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [restaurants, total] = await Promise.all([
      Restaurant.find()
        .populate('owner', 'name email')
        .skip(skip).limit(limit)
        .sort({ createdAt: -1 }),
      Restaurant.countDocuments(),
    ]);

    res.json({
      success: true,
      restaurants,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (admin)
// @route   PUT /api/admin/users/:id/toggle-status
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    await ActivityLog.create({
      user: req.user._id,
      action: 'admin_action',
      description: `${user.isActive ? 'Activated' : 'Deactivated'} user: ${user.email}`,
    });

    res.json({ success: true, isActive: user.isActive });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify restaurant (admin)
// @route   PUT /api/admin/restaurants/:id/verify
const verifyRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      res.status(404);
      throw new Error('Restaurant not found');
    }

    restaurant.isVerified = !restaurant.isVerified;
    await restaurant.save({ validateBeforeSave: false });

    await ActivityLog.create({
      user: req.user._id,
      action: 'restaurant_verify',
      description: `${restaurant.isVerified ? 'Verified' : 'Unverified'} restaurant: ${restaurant.name}`,
    });

    res.json({ success: true, isVerified: restaurant.isVerified });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity logs (admin)
// @route   GET /api/admin/activity-logs
const getActivityLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const action = req.query.action;

    const filter = {};
    if (action) filter.action = action;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('user', 'name email role')
        .skip(skip).limit(limit)
        .sort({ createdAt: -1 }),
      ActivityLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export report (admin)
// @route   GET /api/admin/export/:type/:format
const exportReport = async (req, res, next) => {
  try {
    const { type, format } = req.params; // type: orders|users, format: pdf|excel

    let data;
    if (type === 'orders') {
      data = await Order.find()
        .populate('user', 'name email')
        .populate('restaurant', 'name')
        .sort({ createdAt: -1 })
        .limit(500);
    } else if (type === 'users') {
      data = await User.find().select('-password').sort({ createdAt: -1 }).limit(500);
    } else {
      res.status(400);
      throw new Error('Invalid report type');
    }

    if (format === 'pdf') {
      const pdfBuffer = await generatePDFReport(data, type);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=foodify-${type}-report.pdf`,
      });
      res.send(pdfBuffer);
    } else if (format === 'excel') {
      const excelBuffer = await generateExcelReport(data, type);
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=foodify-${type}-report.xlsx`,
      });
      res.send(excelBuffer);
    } else {
      res.status(400);
      throw new Error('Invalid format. Use pdf or excel.');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
  getAllRestaurants,
  toggleUserStatus,
  verifyRestaurant,
  getActivityLogs,
  exportReport,
};
