/**
 * Database Seeder — Realistic Indian Restaurants & Dishes
 * Run: npm run seed
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Cart = require('../models/Cart');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/foodify');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Connection Error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear all collections
    await User.deleteMany();
    await Restaurant.deleteMany();
    await Food.deleteMany();
    await Cart.deleteMany();
    console.log('🗑️  All data cleared');

    // ── Users ──────────────────────────────────────────
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@foodify.com',
      password: 'password123',
      phone: '9876543210',
      role: 'admin',
      isEmailVerified: true,
    });

    const owner = await User.create({
      name: 'Restaurant Owner',
      email: 'owner@foodify.com',
      password: 'password123',
      phone: '9876543211',
      role: 'restaurant_owner',
      isEmailVerified: true,
    });

    const customer = await User.create({
      name: 'Arjun Sharma',
      email: 'arjun@example.com',
      password: 'password123',
      phone: '9876543212',
      role: 'customer',
      isEmailVerified: true,
      walletBalance: 500,
      addresses: [{
        type: 'home',
        label: 'Home',
        addressLine1: 'B-12, Sector 62',
        addressLine2: 'Near Metro Station',
        city: 'Noida',
        state: 'Uttar Pradesh',
        zipCode: '201301',
        country: 'India',
        isDefault: true,
      }, {
        type: 'office',
        label: 'Office',
        addressLine1: 'Tower C, 5th Floor, Cyber City',
        city: 'Gurugram',
        state: 'Haryana',
        zipCode: '122002',
        country: 'India',
      }],
    });

    console.log('👤 Users created');

    // ── Restaurants ────────────────────────────────────
    const restaurantsData = [
      {
        name: "Domino's Pizza",
        owner: owner._id,
        description: "India's most loved pizza chain. Freshly baked pizzas with a variety of toppings, garlic breads, pasta, and more. 30-minute delivery guaranteed!",
        cuisines: ['Pizza', 'Italian', 'Fast Food'],
        address: { street: 'Connaught Place', city: 'New Delhi', state: 'Delhi', zipCode: '110001' },
        images: { logo: '/assets/dominos_logo.svg', banner: '/assets/promo-pizza.png' },
        avgRating: 4.3, totalRatings: 12500, deliveryFee: 0, minOrderAmount: 199, avgDeliveryTime: 30,
        priceRange: '₹₹', priceForTwo: 400, isVerified: true, isActive: true, isOpen: true, isFeatured: true,
        currentOffer: { text: '50% OFF up to ₹100', discountPercent: 50, minOrder: 199 },
        tags: ['fast-delivery', 'promoted'],
      },
      {
        name: 'Burger King',
        owner: owner._id,
        description: 'Home of the Whopper. Flame-grilled burgers, crispy chicken, loaded fries, and refreshing shakes. Have it your way!',
        cuisines: ['Burgers', 'American', 'Fast Food'],
        address: { street: 'Rajouri Garden', city: 'New Delhi', state: 'Delhi', zipCode: '110027' },
        images: { logo: '/assets/bk-user-logo.png', banner: '/assets/hero-burger.png' },
        avgRating: 4.1, totalRatings: 8900, deliveryFee: 25, minOrderAmount: 149, avgDeliveryTime: 25,
        priceRange: '₹₹', priceForTwo: 350, isVerified: true, isActive: true, isOpen: true, isFeatured: true,
        currentOffer: { text: 'Buy 1 Get 1 Free', discountPercent: 50, minOrder: 249 },
        tags: ['fast-delivery', 'promoted'],
      },
      {
        name: 'KFC',
        owner: owner._id,
        description: "Finger Lickin' Good! Original Recipe chicken, Zinger burgers, Hot Wings, Popcorn Chicken and more. India's favourite fried chicken.",
        cuisines: ['Chicken', 'Fast Food', 'American'],
        address: { street: 'Lajpat Nagar', city: 'New Delhi', state: 'Delhi', zipCode: '110024' },
        images: { logo: '/assets/kfc.png', banner: '/assets/kfc.png' },
        avgRating: 4.2, totalRatings: 15200, deliveryFee: 30, minOrderAmount: 199, avgDeliveryTime: 25,
        priceRange: '₹₹', priceForTwo: 450, isVerified: true, isActive: true, isOpen: true, isFeatured: true,
        currentOffer: { text: '20% OFF above ₹499', discountPercent: 20, minOrder: 499 },
        tags: ['fast-delivery'],
      },
      {
        name: 'Biryani By Kilo',
        owner: owner._id,
        description: 'Authentic dum biryani cooked in handis, delivered in handis. Slow-cooked Hyderabadi, Lucknowi & Kolkata biryanis with premium meats and aromatic spices.',
        cuisines: ['Biryani', 'North Indian', 'Mughlai'],
        address: { street: 'Karol Bagh', city: 'New Delhi', state: 'Delhi', zipCode: '110005' },
        images: { logo: '/assets/bbk-user-logo.png', banner: '/assets/food_9.png' },
        avgRating: 4.5, totalRatings: 22000, deliveryFee: 0, minOrderAmount: 299, avgDeliveryTime: 45,
        priceRange: '₹₹₹', priceForTwo: 600, isVerified: true, isActive: true, isOpen: true, isFeatured: true,
        currentOffer: { text: 'Free Gulab Jamun on ₹599+', discountPercent: 0, minOrder: 599 },
        tags: ['veg-friendly'],
      },
      {
        name: 'Haldiram\'s',
        owner: owner._id,
        description: 'India\'s most trusted name in sweets, snacks & restaurants since 1937. Pure vegetarian delights — chaats, thalis, sweets, namkeens & more.',
        cuisines: ['North Indian', 'South Indian', 'Sweets', 'Street Food'],
        address: { street: 'Chandni Chowk', city: 'New Delhi', state: 'Delhi', zipCode: '110006' },
        images: { logo: '/assets/haldiram-user-logo.png', banner: '/assets/food-categories.png' },
        avgRating: 4.4, totalRatings: 31000, deliveryFee: 20, minOrderAmount: 150, avgDeliveryTime: 35,
        priceRange: '₹₹', priceForTwo: 350, isVerified: true, isActive: true, isOpen: true,
        currentOffer: { text: '₹75 OFF above ₹499', discountPercent: 0, minOrder: 499 },
        tags: ['veg-friendly'],
      },
      {
        name: 'Behrouz Biryani',
        owner: owner._id,
        description: 'Royal Biryani inspired by Persian recipes. Premium long-grain basmati rice, tender meats & secret spices slow-cooked to perfection in a sealed handi.',
        cuisines: ['Biryani', 'Mughlai', 'North Indian'],
        address: { street: 'Saket', city: 'New Delhi', state: 'Delhi', zipCode: '110017' },
        images: { logo: '/assets/food_10.png', banner: '/assets/food_10.png' },
        avgRating: 4.3, totalRatings: 18500, deliveryFee: 0, minOrderAmount: 249, avgDeliveryTime: 40,
        priceRange: '₹₹₹', priceForTwo: 550, isVerified: true, isActive: true, isOpen: true,
        currentOffer: { text: '30% OFF up to ₹150', discountPercent: 30, minOrder: 349 },
      },
      {
        name: 'The Belgian Waffle Co.',
        owner: owner._id,
        description: 'Freshly made Belgian waffles, pancakes, and desserts. From classic chocolate to exotic fruit flavours — every bite is a sweet escape!',
        cuisines: ['Desserts', 'Waffles', 'Bakery'],
        address: { street: 'Hauz Khas Village', city: 'New Delhi', state: 'Delhi', zipCode: '110016' },
        images: { logo: '/assets/food_29.png', banner: '/assets/food_29.png' },
        avgRating: 4.6, totalRatings: 9800, deliveryFee: 15, minOrderAmount: 100, avgDeliveryTime: 20,
        priceRange: '₹₹', priceForTwo: 300, isVerified: true, isActive: true, isOpen: true, isFeatured: true,
        currentOffer: { text: 'Buy 1 Get 1 Free Waffles', discountPercent: 50, minOrder: 199 },
        tags: ['new'],
      },
      {
        name: 'Sagar Ratna',
        owner: owner._id,
        description: 'Authentic South Indian cuisine since 1986. Crispy dosas, fluffy idlis, vadas, uttapams & filter coffee made the traditional way.',
        cuisines: ['South Indian', 'North Indian', 'Chinese'],
        address: { street: 'Defence Colony', city: 'New Delhi', state: 'Delhi', zipCode: '110024' },
        images: { logo: '/assets/menu_1.png', banner: '/assets/restaurant-interior.png' },
        avgRating: 4.2, totalRatings: 14200, deliveryFee: 25, minOrderAmount: 150, avgDeliveryTime: 30,
        priceRange: '₹₹', priceForTwo: 350, isVerified: true, isActive: true, isOpen: true,
        tags: ['veg-friendly'],
      },
      {
        name: "La Pino'z Pizza",
        owner: owner._id,
        description: 'Giant size pizzas at unbeatable prices! Known for generous toppings, cheesy crust, and huge portion sizes. India\'s fastest growing pizza chain.',
        cuisines: ['Pizza', 'Italian', 'Fast Food'],
        address: { street: 'Dwarka Sector 12', city: 'New Delhi', state: 'Delhi', zipCode: '110075' },
        images: { logo: '/assets/lapinoz_logo.png', banner: '/assets/promo-pizza.png' },
        avgRating: 4.0, totalRatings: 7600, deliveryFee: 0, minOrderAmount: 199, avgDeliveryTime: 35,
        priceRange: '₹', priceForTwo: 300, isVerified: true, isActive: true, isOpen: true,
        currentOffer: { text: '60% OFF up to ₹120', discountPercent: 60, minOrder: 199 },
        tags: ['fast-delivery'],
      },
      {
        name: 'Barbeque Nation',
        owner: owner._id,
        description: 'India\'s pioneer of live-on-the-table grill concept. Premium kebabs, unlimited buffet, and the finest grilled meats & veggies.',
        cuisines: ['North Indian', 'Kebabs', 'BBQ', 'Continental'],
        address: { street: 'Vasant Kunj', city: 'New Delhi', state: 'Delhi', zipCode: '110070' },
        images: { logo: '/assets/bbq_logo.png', banner: '/assets/restaurant-interior.png' },
        avgRating: 4.4, totalRatings: 11800, deliveryFee: 40, minOrderAmount: 399, avgDeliveryTime: 45,
        priceRange: '₹₹₹', priceForTwo: 800, isVerified: true, isActive: true, isOpen: true,
        tags: ['promoted'],
      },
      {
        name: 'Barkhas Full Mutton Mandi',
        owner: owner._id,
        description: 'Authentic Arabian Mutton Mandi cooked traditionally in an underground pit. Tender, fall-off-the-bone mutton served on a bed of aromatic seasoned rice.',
        cuisines: ['Arabian', 'Mandi', 'Middle Eastern', 'Mughlai'],
        address: { street: 'Okhla', city: 'New Delhi', state: 'Delhi', zipCode: '110025' },
        images: { logo: '/assets/barkhas-mandi.png', banner: '/assets/barkhas-mandi.png' },
        avgRating: 4.8, totalRatings: 5600, deliveryFee: 0, minOrderAmount: 499, avgDeliveryTime: 45,
        priceRange: '₹₹₹', priceForTwo: 1000, isVerified: true, isActive: true, isOpen: true, isFeatured: true,
        currentOffer: { text: 'Free Sahawiq & Kunafa on ₹999+', discountPercent: 0, minOrder: 999 },
        tags: ['bestseller', 'trending'],
      },
    ];

    const restaurants = await Restaurant.create(restaurantsData);
    console.log(`🏪 ${restaurants.length} Restaurants created`);

    // Helper to find restaurant by name
    const r = (name) => restaurants.find(rest => rest.name === name)._id;

    // ── Food Items ─────────────────────────────────────
    const foodsData = [
      // ▸ Domino's Pizza (5 items)
      { name: 'Margherita Pizza', restaurant: r("Domino's Pizza"), category: 'pizza', description: 'A classic delight with 100% real mozzarella cheese on a fresh pan crust', price: 149, originalPrice: 199, foodType: 'veg', isBestseller: true, avgRating: 4.5, totalRatings: 4200, totalOrders: 12000, preparationTime: 20, thumbnail: '/assets/food_5.png', nutrition: { calories: 600, protein: 22, fat: 20, carbs: 78 }, tags: ['bestseller', 'trending'] },
      { name: 'Farmhouse Pizza', restaurant: r("Domino's Pizza"), category: 'pizza', description: 'Delightful combination of onion, capsicum, tomato & grilled mushroom on mozzarella cheese', price: 299, originalPrice: 399, foodType: 'veg', isBestseller: true, avgRating: 4.6, totalRatings: 3100, totalOrders: 8500, preparationTime: 22, thumbnail: '/assets/food_6.png', nutrition: { calories: 720, protein: 28, fat: 26, carbs: 85 }, tags: ['bestseller'] },
      { name: 'Chicken Dominator', restaurant: r("Domino's Pizza"), category: 'pizza', description: 'Loaded with double pepper barbecue chicken, peri-peri chicken, chicken tikka & grilled chicken', price: 449, foodType: 'non-veg', avgRating: 4.4, totalRatings: 2800, totalOrders: 6200, preparationTime: 25, thumbnail: '/assets/food_7.png', nutrition: { calories: 850, protein: 42, fat: 35, carbs: 80 } },
      { name: 'Garlic Breadsticks', restaurant: r("Domino's Pizza"), category: 'sides', description: 'Freshly baked breadsticks brushed with garlic butter, served with cheesy dip', price: 99, foodType: 'veg', avgRating: 4.3, totalRatings: 1900, totalOrders: 9000, preparationTime: 10, thumbnail: '/assets/food_8.png' },
      { name: 'Choco Lava Cake', restaurant: r("Domino's Pizza"), category: 'desserts', description: 'Soft chocolate cake with a molten chocolate centre. Pure indulgence!', price: 109, foodType: 'veg', isBestseller: true, avgRating: 4.7, totalRatings: 5600, totalOrders: 15000, preparationTime: 5, thumbnail: '/assets/food_30.png', tags: ['bestseller'] },

      // ▸ Burger King (5 items)
      { name: 'Veg Whopper', restaurant: r('Burger King'), category: 'burgers', description: 'Flame-grilled veg patty topped with juicy tomatoes, fresh lettuce, creamy mayo, ketchup & crunchy onions on a toasted sesame seed bun', price: 169, originalPrice: 219, foodType: 'veg', isBestseller: true, avgRating: 4.2, totalRatings: 3500, totalOrders: 9800, preparationTime: 12, thumbnail: '/assets/food_1.png', nutrition: { calories: 420, protein: 18, fat: 22, carbs: 48 }, tags: ['bestseller'] },
      { name: 'Chicken Whopper', restaurant: r('Burger King'), category: 'burgers', description: 'Flame-grilled chicken patty with fresh veggies, creamy mayo & tangy sauce in a sesame bun', price: 199, foodType: 'non-veg', isBestseller: true, avgRating: 4.4, totalRatings: 4100, totalOrders: 11000, preparationTime: 15, thumbnail: '/assets/food_2.png', nutrition: { calories: 520, protein: 32, fat: 28, carbs: 42 }, tags: ['bestseller'] },
      { name: 'Crispy Veg Burger', restaurant: r('Burger King'), category: 'burgers', description: 'Crunchy veg patty with shredded lettuce, mayo & ketchup', price: 89, foodType: 'veg', avgRating: 4.0, totalRatings: 2100, totalOrders: 7500, preparationTime: 10, thumbnail: '/assets/food_3.png' },
      { name: 'French Fries (Large)', restaurant: r('Burger King'), category: 'sides', description: 'Golden crispy fries with a pinch of salt. The perfect companion to any burger', price: 119, foodType: 'veg', avgRating: 4.3, totalRatings: 2800, totalOrders: 14000, preparationTime: 8, thumbnail: '/assets/food_19.png', nutrition: { calories: 320, protein: 4, fat: 16, carbs: 42 } },
      { name: 'Chocolate Shake', restaurant: r('Burger King'), category: 'beverages', description: 'Thick and creamy chocolate milkshake made with rich chocolate ice cream', price: 139, foodType: 'veg', avgRating: 4.5, totalRatings: 1800, totalOrders: 5200, preparationTime: 5, thumbnail: '/assets/food_4.png', nutrition: { calories: 380, protein: 8, fat: 14, carbs: 58 } },

      // ▸ KFC (6 items)
      { name: 'KFC Original Chicken Bucket (8 pcs)', restaurant: r('KFC'), category: 'chicken', description: 'The original secret recipe chicken bucket, crispy on the outside, juicy on the inside!', price: 699, originalPrice: 799, foodType: 'non-veg', isBestseller: true, avgRating: 4.8, totalRatings: 12500, totalOrders: 40000, preparationTime: 20, thumbnail: '/assets/kfc.png', nutrition: { calories: 1200, protein: 85, fat: 75, carbs: 40 }, tags: ['bestseller', 'trending'] },
      { name: 'Hot Wings (6 pcs)', restaurant: r('KFC'), category: 'chicken', description: 'Spicy & crispy chicken wings marinated in a fiery blend of peppers', price: 249, foodType: 'non-veg', isBestseller: true, avgRating: 4.5, totalRatings: 6200, totalOrders: 18000, preparationTime: 15, thumbnail: '/assets/food_21.png', nutrition: { calories: 480, protein: 36, fat: 28, carbs: 20 }, tags: ['bestseller', 'trending'] },
      { name: 'Chicken Zinger Burger', restaurant: r('KFC'), category: 'burgers', description: 'Crunchy chicken fillet with spicy mayo, lettuce & pickles in a sesame bun', price: 199, originalPrice: 249, foodType: 'non-veg', isBestseller: true, avgRating: 4.6, totalRatings: 8900, totalOrders: 22000, preparationTime: 12, thumbnail: '/assets/food_2.png', nutrition: { calories: 550, protein: 30, fat: 26, carbs: 48 }, tags: ['bestseller'] },
      { name: 'Chicken Popcorn', restaurant: r('KFC'), category: 'snacks', description: 'Bite-sized boneless chicken pieces, lightly seasoned and fried until perfectly crispy', price: 179, foodType: 'non-veg', avgRating: 4.3, totalRatings: 4500, totalOrders: 12000, preparationTime: 10, thumbnail: '/assets/food_23.png' },
      { name: 'Veg Rice Bowlz', restaurant: r('KFC'), category: 'combos', description: 'Flavoured rice topped with crispy veg strips, onions, jalapenos & signature sauce', price: 149, foodType: 'veg', avgRating: 4.0, totalRatings: 1200, totalOrders: 3500, preparationTime: 10, thumbnail: '/assets/food_22.png' },
      { name: 'Cold Coffee', restaurant: r('KFC'), category: 'beverages', description: 'Chilled creamy cold coffee to complement your meal', price: 109, foodType: 'veg', avgRating: 4.1, totalRatings: 900, totalOrders: 2800, preparationTime: 5, thumbnail: '/assets/food_31.png' },

      // ▸ Biryani By Kilo (5 items)
      { name: 'Chicken Biryani', restaurant: r('Biryani By Kilo'), category: 'biryani', description: 'Hyderabadi-style dum biryani with tender chicken pieces, long-grain basmati rice, saffron, fried onions & secret spice blend. Served in handi.', price: 399, originalPrice: 499, foodType: 'non-veg', isBestseller: true, avgRating: 4.7, totalRatings: 9200, totalOrders: 25000, preparationTime: 30, thumbnail: '/assets/food_9.png', nutrition: { calories: 650, protein: 35, fat: 22, carbs: 78 }, tags: ['bestseller', 'trending'] },
      { name: 'Veg Biryani', restaurant: r('Biryani By Kilo'), category: 'biryani', description: 'Aromatic basmati rice layered with mixed vegetables, paneer, saffron & whole spices. Cooked dum-style in sealed handi.', price: 299, foodType: 'veg', isBestseller: true, avgRating: 4.4, totalRatings: 5800, totalOrders: 14000, preparationTime: 25, thumbnail: '/assets/food_25.png', nutrition: { calories: 520, protein: 15, fat: 16, carbs: 82 }, tags: ['bestseller'] },
      { name: 'Mutton Biryani', restaurant: r('Biryani By Kilo'), category: 'biryani', description: 'Slow-cooked Lucknowi mutton biryani with tender mutton on the bone, aromatic rice & rose water', price: 549, foodType: 'non-veg', avgRating: 4.8, totalRatings: 6100, totalOrders: 16000, preparationTime: 40, thumbnail: '/assets/food_10.png', nutrition: { calories: 720, protein: 40, fat: 30, carbs: 72 } },
      { name: 'Chicken Tikka (8 pcs)', restaurant: r('Biryani By Kilo'), category: 'starters', description: 'Juicy boneless chicken pieces marinated in yoghurt & spices, chargrilled in tandoor', price: 329, foodType: 'non-veg', isBestseller: true, avgRating: 4.6, totalRatings: 4200, totalOrders: 11000, preparationTime: 20, thumbnail: '/assets/food_17.png', tags: ['bestseller'] },
      { name: 'Gulab Jamun (2 pcs)', restaurant: r('Biryani By Kilo'), category: 'desserts', description: 'Soft, melt-in-mouth milk solid dumplings soaked in warm rose-cardamom sugar syrup', price: 79, foodType: 'veg', avgRating: 4.5, totalRatings: 3800, totalOrders: 20000, preparationTime: 5, thumbnail: '/assets/food_20.png' },

      // ▸ Haldiram's (5 items)
      { name: 'Chole Bhature', restaurant: r("Haldiram's"), category: 'north-indian', description: 'Fluffy deep-fried bhature served with spicy chickpea curry, pickled onions & green chutney. A Delhi favourite!', price: 179, foodType: 'veg', isBestseller: true, avgRating: 4.5, totalRatings: 7200, totalOrders: 20000, preparationTime: 15, thumbnail: '/assets/food_11.png', nutrition: { calories: 520, protein: 16, fat: 22, carbs: 68 }, tags: ['bestseller', 'trending'] },
      { name: 'Paneer Butter Masala', restaurant: r("Haldiram's"), category: 'north-indian', description: 'Soft paneer cubes simmered in rich tomato-butter-cream gravy with aromatic spices. Best paired with naan or rice.', price: 249, foodType: 'veg', isBestseller: true, avgRating: 4.6, totalRatings: 8900, totalOrders: 22000, preparationTime: 20, thumbnail: '/assets/food_12.png', nutrition: { calories: 450, protein: 20, fat: 30, carbs: 25 }, tags: ['bestseller'] },
      { name: 'Dal Makhani', restaurant: r("Haldiram's"), category: 'north-indian', description: 'Black lentils & kidney beans slow-cooked overnight with butter, cream & spices. Rich, creamy & iconic.', price: 199, foodType: 'veg', avgRating: 4.4, totalRatings: 5100, totalOrders: 15000, preparationTime: 20, thumbnail: '/assets/food_24.png', nutrition: { calories: 380, protein: 18, fat: 16, carbs: 42 } },
      { name: 'Butter Naan (2 pcs)', restaurant: r("Haldiram's"), category: 'breads', description: 'Soft tandoor-baked flatbread brushed with generous amounts of butter. Perfect with any gravy.', price: 69, foodType: 'veg', avgRating: 4.3, totalRatings: 4800, totalOrders: 30000, preparationTime: 8, thumbnail: '/assets/food_8.png' },
      { name: 'Raj Kachori', restaurant: r("Haldiram's"), category: 'street-food', description: 'Large crispy kachori filled with yoghurt, chutneys, sprouted moong, potatoes & sev. A chaat masterpiece!', price: 129, foodType: 'veg', isNew: true, avgRating: 4.3, totalRatings: 2100, totalOrders: 6000, preparationTime: 10, thumbnail: '/assets/food_19.png', tags: ['new'] },

      // ▸ Behrouz Biryani (4 items)
      { name: 'Murgh Makhani Biryani', restaurant: r('Behrouz Biryani'), category: 'biryani', description: 'Royal biryani with butter chicken gravy, tender chicken pieces, saffron-infused basmati & caramelized onions', price: 449, foodType: 'non-veg', isBestseller: true, avgRating: 4.6, totalRatings: 5800, totalOrders: 14000, preparationTime: 35, thumbnail: '/assets/food_9.png', tags: ['bestseller', 'trending'] },
      { name: 'Paneer Lucknowi Biryani', restaurant: r('Behrouz Biryani'), category: 'biryani', description: 'Fragrant Lucknowi-style biryani with marinated paneer tikka, basmati rice & ittar (floral essence)', price: 349, foodType: 'veg', avgRating: 4.3, totalRatings: 3200, totalOrders: 7500, preparationTime: 30, thumbnail: '/assets/food_25.png' },
      { name: 'Kebab Platter', restaurant: r('Behrouz Biryani'), category: 'starters', description: 'Assorted seekh kebabs, chicken tikka & malai kebab served with mint chutney & onion rings', price: 399, foodType: 'non-veg', avgRating: 4.5, totalRatings: 2800, totalOrders: 5500, preparationTime: 20, thumbnail: '/assets/food_17.png' },
      { name: 'Shahi Tukda', restaurant: r('Behrouz Biryani'), category: 'desserts', description: 'Royal Mughlai dessert — golden fried bread soaked in saffron-cardamom milk, topped with reduced rabri', price: 129, foodType: 'veg', avgRating: 4.4, totalRatings: 1500, totalOrders: 4000, preparationTime: 5, thumbnail: '/assets/food_29.png' },

      // ▸ The Belgian Waffle Co. (4 items)
      { name: 'Chocolate Belgian Waffle', restaurant: r('The Belgian Waffle Co.'), category: 'desserts', description: 'Warm, crispy Belgian waffle drizzled with rich chocolate sauce, whipped cream & chocolate chips', price: 159, foodType: 'veg', isBestseller: true, avgRating: 4.7, totalRatings: 4800, totalOrders: 13000, preparationTime: 10, thumbnail: '/assets/food_30.png', tags: ['bestseller'] },
      { name: 'Red Velvet Waffle', restaurant: r('The Belgian Waffle Co.'), category: 'desserts', description: 'Red velvet flavoured waffle with cream cheese frosting, white chocolate shavings & strawberry sauce', price: 189, foodType: 'veg', avgRating: 4.6, totalRatings: 3200, totalOrders: 8500, preparationTime: 10, thumbnail: '/assets/food_29.png' },
      { name: 'Nutella Pancakes', restaurant: r('The Belgian Waffle Co.'), category: 'desserts', description: 'Fluffy pancake stack loaded with Nutella, sliced bananas, crushed hazelnuts & maple syrup', price: 199, foodType: 'veg', avgRating: 4.5, totalRatings: 2100, totalOrders: 5800, preparationTime: 12, thumbnail: '/assets/food_27.png' },
      { name: 'Cold Coffee Frappe', restaurant: r('The Belgian Waffle Co.'), category: 'beverages', description: 'Iced blended coffee with vanilla ice cream, whipped cream & chocolate drizzle', price: 149, foodType: 'veg', avgRating: 4.4, totalRatings: 1800, totalOrders: 5000, preparationTime: 5, thumbnail: '/assets/food_31.png' },

      // ▸ Sagar Ratna (5 items)
      { name: 'Masala Dosa', restaurant: r('Sagar Ratna'), category: 'south-indian', description: 'Crispy golden dosa filled with spiced potato masala, served with sambhar & coconut chutney', price: 149, foodType: 'veg', isBestseller: true, avgRating: 4.5, totalRatings: 6500, totalOrders: 18000, preparationTime: 15, thumbnail: '/assets/food_11.png', nutrition: { calories: 380, protein: 10, fat: 14, carbs: 56 }, tags: ['bestseller'] },
      { name: 'Idli Sambhar (4 pcs)', restaurant: r('Sagar Ratna'), category: 'south-indian', description: 'Soft steamed rice cakes served with piping hot sambhar & fresh coconut chutney', price: 99, foodType: 'veg', avgRating: 4.3, totalRatings: 4200, totalOrders: 14000, preparationTime: 10, thumbnail: '/assets/food_16.png', nutrition: { calories: 250, protein: 8, fat: 4, carbs: 48 } },
      { name: 'Veg Fried Rice', restaurant: r('Sagar Ratna'), category: 'chinese', description: 'Wok-tossed basmati rice with mixed vegetables, spring onions, soy sauce & a hint of pepper', price: 169, foodType: 'veg', avgRating: 4.2, totalRatings: 2800, totalOrders: 8500, preparationTime: 15, thumbnail: '/assets/food_22.png', nutrition: { calories: 420, protein: 10, fat: 12, carbs: 68 } },
      { name: 'Hakka Noodles', restaurant: r('Sagar Ratna'), category: 'chinese', description: 'Stir-fried noodles with crunchy vegetables, garlic, soy sauce & chilli flakes', price: 159, foodType: 'veg', avgRating: 4.1, totalRatings: 2400, totalOrders: 7200, preparationTime: 12, thumbnail: '/assets/food_22.png' },
      { name: 'Filter Coffee', restaurant: r('Sagar Ratna'), category: 'beverages', description: 'Authentic South Indian filter coffee — dark roasted, decoction-brewed & served in a traditional tumbler', price: 59, foodType: 'veg', avgRating: 4.6, totalRatings: 3100, totalOrders: 9800, preparationTime: 5, thumbnail: '/assets/food_31.png' },

      // ▸ La Pino'z Pizza (4 items)
      { name: 'Paneer Tikka Pizza', restaurant: r("La Pino'z Pizza"), category: 'pizza', description: 'Loaded with marinated paneer tikka, onions, capsicum, jalapeños & mozzarella on a thick crust', price: 249, originalPrice: 349, foodType: 'veg', isBestseller: true, avgRating: 4.3, totalRatings: 3800, totalOrders: 9500, preparationTime: 20, thumbnail: '/assets/food_5.png', tags: ['bestseller'] },
      { name: 'Tandoori Chicken Pizza', restaurant: r("La Pino'z Pizza"), category: 'pizza', description: 'Spicy tandoori chicken, red onions, green chillies & mozzarella cheese on a thin crust', price: 299, foodType: 'non-veg', avgRating: 4.4, totalRatings: 2900, totalOrders: 7200, preparationTime: 22, thumbnail: '/assets/food_6.png' },
      { name: 'Cheesy Garlic Bread', restaurant: r("La Pino'z Pizza"), category: 'sides', description: 'Crunchy garlic bread loaded with melted cheese and herbs', price: 99, foodType: 'veg', avgRating: 4.2, totalRatings: 1800, totalOrders: 6500, preparationTime: 10, thumbnail: '/assets/food_8.png' },
      { name: 'Cold Coffee', restaurant: r("La Pino'z Pizza"), category: 'beverages', description: 'Thick and creamy cold coffee blended with ice cream', price: 99, foodType: 'veg', avgRating: 4.3, totalRatings: 1200, totalOrders: 4000, preparationTime: 5, thumbnail: '/assets/food_31.png' },

      // ▸ Barbeque Nation (4 items)
      { name: 'Paneer Tikka Starter', restaurant: r('Barbeque Nation'), category: 'starters', description: 'Chargrilled cottage cheese cubes marinated in tandoori masala, served with mint chutney & grilled veggies', price: 349, foodType: 'veg', isBestseller: true, avgRating: 4.5, totalRatings: 3500, totalOrders: 8000, preparationTime: 20, thumbnail: '/assets/food_11.png', tags: ['bestseller'] },
      { name: 'Chicken Seekh Kebab', restaurant: r('Barbeque Nation'), category: 'starters', description: 'Minced chicken kebabs seasoned with aromatic spices, grilled on skewers until perfectly charred', price: 399, foodType: 'non-veg', avgRating: 4.6, totalRatings: 4100, totalOrders: 9500, preparationTime: 20, thumbnail: '/assets/food_17.png' },
      { name: 'Veg Biryani (Pot)', restaurant: r('Barbeque Nation'), category: 'biryani', description: 'Fragrant basmati rice with seasonal vegetables, saffron & whole spices in a clay pot', price: 299, foodType: 'veg', avgRating: 4.2, totalRatings: 2200, totalOrders: 5500, preparationTime: 25, thumbnail: '/assets/food_25.png' },
      { name: 'Gulab Jamun (4 pcs)', restaurant: r('Barbeque Nation'), category: 'desserts', description: 'Classic Indian dessert — deep fried milk solids soaked in warm cardamom-saffron sugar syrup', price: 149, foodType: 'veg', avgRating: 4.7, totalRatings: 5200, totalOrders: 14000, preparationTime: 5, thumbnail: '/assets/food_20.png' },

      // ▸ Barkhas Full Mutton Mandi (7 items)
      { name: 'Full Mutton Mandi', restaurant: r('Barkhas Full Mutton Mandi'), category: 'mandi', description: 'The iconic Arabian masterpiece. Whole slow-cooked leg of lamb served on a massive bed of aromatic mandi rice, garnished with roasted dry fruits and served with spicy tomato sahawiq.', price: 1299, originalPrice: 1599, foodType: 'non-veg', isBestseller: true, avgRating: 4.9, totalRatings: 3400, totalOrders: 9000, preparationTime: 45, thumbnail: '/assets/barkhas-mandi.png', nutrition: { calories: 2500, protein: 180, fat: 120, carbs: 140 }, tags: ['bestseller', 'trending'] },
      { name: 'Chicken Faham Mandi', restaurant: r('Barkhas Full Mutton Mandi'), category: 'mandi', description: 'Charcoal-grilled Arabian spiced chicken served with fragrant mandi rice and chutney.', price: 449, foodType: 'non-veg', avgRating: 4.6, totalRatings: 2100, totalOrders: 6500, preparationTime: 30, thumbnail: '/assets/barkhas-mandi.png' },
      { name: 'Mutton Madghout', restaurant: r('Barkhas Full Mutton Mandi'), category: 'mandi', description: 'Rice and mutton cooked together in tomato puree and spices under pressure, making it incredibly juicy and flavourful.', price: 699, foodType: 'non-veg', avgRating: 4.7, totalRatings: 1800, totalOrders: 4200, preparationTime: 35, thumbnail: '/assets/barkhas-mandi.png' },
      { name: 'Mutton Juicy Mandi', restaurant: r('Barkhas Full Mutton Mandi'), category: 'mandi', description: 'Tender, juicy mutton pieces cooked to perfection and served over flavourful Arabian mandi rice.', price: 749, foodType: 'non-veg', isBestseller: true, avgRating: 4.8, totalRatings: 1500, totalOrders: 3200, preparationTime: 40, thumbnail: '/assets/barkhas-mandi.png' },
      { name: 'Mutton Fry Mandi', restaurant: r('Barkhas Full Mutton Mandi'), category: 'mandi', description: 'Crispy fried mutton chunks tossed in special Arabian spices, served with fragrant mandi rice.', price: 689, foodType: 'non-veg', avgRating: 4.5, totalRatings: 1200, totalOrders: 2800, preparationTime: 35, thumbnail: '/assets/barkhas-mandi.png' },
      { name: 'Mutton Soup (Marag)', restaurant: r('Barkhas Full Mutton Mandi'), category: 'starters', description: 'A rich and spicy Arabian mutton soup slow-cooked with bone-in mutton and traditional spices.', price: 249, foodType: 'non-veg', avgRating: 4.6, totalRatings: 900, totalOrders: 1500, preparationTime: 20, thumbnail: '/assets/food_21.png' },
      { name: 'Kunafa', restaurant: r('Barkhas Full Mutton Mandi'), category: 'desserts', description: 'Warm Middle Eastern cheese pastry soaked in sweet, sugar-based syrup.', price: 299, foodType: 'veg', isBestseller: true, avgRating: 4.8, totalRatings: 2500, totalOrders: 8000, preparationTime: 15, thumbnail: '/assets/food_30.png', tags: ['trending'] },
    ];

    const foods = await Food.create(foodsData);
    console.log(`🍔 ${foods.length} Food items created`);

    console.log('\n════════════════════════════════════════════');
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('════════════════════════════════════════════');
    console.log('🔑 Admin   : admin@foodify.com / password123');
    console.log('🔑 Owner   : owner@foodify.com / password123');
    console.log('🔑 Customer: arjun@example.com / password123');
    console.log('════════════════════════════════════════════\n');

    process.exit();
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
