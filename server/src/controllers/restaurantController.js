/**
 * Restaurant Controller — CRUD, search, nearby, stats
 */
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');

// @desc    Get all restaurants (with filters & pagination)
// @route   GET /api/restaurants
const getRestaurants = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const cuisine = req.query.cuisine;
    const priceRange = req.query.priceRange;
    const sortBy = req.query.sortBy || 'avgRating';

    const filter = { isActive: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisines: { $regex: search, $options: 'i' } },
      ];
    }
    if (cuisine) filter.cuisines = { $in: [cuisine] };
    if (priceRange) filter.priceRange = priceRange;

    const sortOptions = {};
    if (sortBy === 'avgRating') sortOptions.avgRating = -1;
    else if (sortBy === 'deliveryTime') sortOptions.avgDeliveryTime = 1;
    else if (sortBy === 'totalOrders') sortOptions.totalOrders = -1;
    else sortOptions.createdAt = -1;

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter).skip(skip).limit(limit).sort(sortOptions),
      Restaurant.countDocuments(filter),
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

// @desc    Get single restaurant with menu
// @route   GET /api/restaurants/:id
const getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('menuItems');
    if (!restaurant) {
      res.status(404);
      throw new Error('Restaurant not found');
    }
    res.json({ success: true, restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Create restaurant
// @route   POST /api/restaurants
const createRestaurant = async (req, res, next) => {
  try {
    req.body.owner = req.user._id;
    const restaurant = await Restaurant.create(req.body);

    res.status(201).json({ success: true, restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
const updateRestaurant = async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      res.status(404);
      throw new Error('Restaurant not found');
    }

    // Check ownership (unless admin)
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this restaurant');
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      res.status(404);
      throw new Error('Restaurant not found');
    }

    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized');
    }

    await Restaurant.findByIdAndDelete(req.params.id);
    // Also delete all food items for this restaurant
    await Food.deleteMany({ restaurant: req.params.id });

    res.json({ success: true, message: 'Restaurant deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby restaurants
// @route   GET /api/restaurants/nearby
const getNearbyRestaurants = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      res.status(400);
      throw new Error('Please provide latitude and longitude');
    }

    const restaurants = await Restaurant.find({
      isActive: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000, // Convert km to meters
        },
      },
    }).limit(20);

    res.json({ success: true, restaurants });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant stats (for owner)
// @route   GET /api/restaurants/:id/stats
const getRestaurantStats = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      res.status(404);
      throw new Error('Restaurant not found');
    }

    const menuCount = await Food.countDocuments({ restaurant: req.params.id });

    res.json({
      success: true,
      stats: {
        totalOrders: restaurant.totalOrders,
        totalRevenue: restaurant.totalRevenue,
        avgRating: restaurant.avgRating,
        totalRatings: restaurant.totalRatings,
        totalReviews: restaurant.totalReviews,
        menuItemCount: menuCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my restaurants (for restaurant owner)
// @route   GET /api/restaurants/my
const getMyRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id });
    res.json({ success: true, restaurants });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getNearbyRestaurants,
  getRestaurantStats,
  getMyRestaurants,
};
