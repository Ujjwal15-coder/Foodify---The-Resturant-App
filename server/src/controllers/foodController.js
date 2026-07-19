/**
 * Food Controller — CRUD, search with filters & pagination
 */
const Food = require('../models/Food');

// @desc    Get foods (with search, filters, pagination)
// @route   GET /api/foods
const getFoods = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category;
    const foodType = req.query.foodType;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const restaurant = req.query.restaurant;
    const sortBy = req.query.sortBy || 'popular';

    const filter = { isAvailable: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (foodType) filter.foodType = foodType;
    if (restaurant) filter.restaurant = restaurant;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const sortOptions = {};
    if (sortBy === 'popular') sortOptions.totalOrders = -1;
    else if (sortBy === 'rating') sortOptions.avgRating = -1;
    else if (sortBy === 'priceLow') sortOptions.price = 1;
    else if (sortBy === 'priceHigh') sortOptions.price = -1;
    else if (sortBy === 'newest') sortOptions.createdAt = -1;
    else sortOptions.totalOrders = -1;

    const [foods, total] = await Promise.all([
      Food.find(filter).populate('restaurant', 'name slug images avgRating').skip(skip).limit(limit).sort(sortOptions),
      Food.countDocuments(filter),
    ]);

    res.json({
      success: true,
      foods,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food
// @route   GET /api/foods/:id
const getFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id).populate('restaurant', 'name slug images avgRating deliveryFee avgDeliveryTime');
    if (!food) {
      res.status(404);
      throw new Error('Food item not found');
    }
    res.json({ success: true, food });
  } catch (error) {
    next(error);
  }
};

// @desc    Create food item
// @route   POST /api/foods
const createFood = async (req, res, next) => {
  try {
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map((f) => `/uploads/${f.filename}`);
      req.body.thumbnail = `/uploads/${req.files[0].filename}`;
    }

    const food = await Food.create(req.body);
    res.status(201).json({ success: true, food });
  } catch (error) {
    next(error);
  }
};

// @desc    Update food item
// @route   PUT /api/foods/:id
const updateFood = async (req, res, next) => {
  try {
    let food = await Food.findById(req.params.id);
    if (!food) {
      res.status(404);
      throw new Error('Food item not found');
    }

    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map((f) => `/uploads/${f.filename}`);
      req.body.thumbnail = `/uploads/${req.files[0].filename}`;
    }

    food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, food });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete food item
// @route   DELETE /api/foods/:id
const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      res.status(404);
      throw new Error('Food item not found');
    }
    await Food.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Food item deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Search foods
// @route   GET /api/foods/search
const searchFoods = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      res.status(400);
      throw new Error('Search query required');
    }

    const foods = await Food.find(
      { $text: { $search: q }, isAvailable: true },
      { score: { $meta: 'textScore' } }
    )
      .populate('restaurant', 'name slug')
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);

    res.json({ success: true, foods });
  } catch (error) {
    next(error);
  }
};

// @desc    Get food categories list
// @route   GET /api/foods/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Food.distinct('category', { isAvailable: true });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFoods,
  getFood,
  createFood,
  updateFood,
  deleteFood,
  searchFoods,
  getCategories,
};
