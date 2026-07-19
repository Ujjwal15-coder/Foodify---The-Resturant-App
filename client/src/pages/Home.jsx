import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { useToast } from '../components/Toast';
import api from '../api/axios';

function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { isAuthenticated } = useSelector(state => state.auth);

  // ── Data from API ──
  const [trendingFoods, setTrendingFoods] = useState([]);
  const [popularRestaurants, setPopularRestaurants] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [loadingRests, setLoadingRests] = useState(true);

  useEffect(() => {
    // Fetch trending foods
    api.get('/foods?limit=6&sortBy=totalOrders')
      .then(res => {
        setTrendingFoods(res.data.foods || []);
        setLoadingFoods(false);
      })
      .catch(() => setLoadingFoods(false));

    // Fetch popular restaurants
    api.get('/restaurants?limit=6&sortBy=avgRating')
      .then(res => {
        setPopularRestaurants(res.data.restaurants || []);
        setLoadingRests(false);
      })
      .catch(() => setLoadingRests(false));
  }, []);

  // ── Carousel ──
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselSlides = [
    { badge: 'HOT DEAL', title: '50% Off on First 3 Orders', desc: 'Order from top restaurants near you. Fastest delivery guaranteed!', bg: '/assets/hero-burger.png', overlay: 'linear-gradient(135deg, rgba(255, 107, 0, 0.95) 0%, rgba(255, 140, 66, 0.75) 45%, transparent 100%)', align: 'right center' },
    { badge: 'WEEKEND SPECIAL', title: 'Free Delivery on Pizza', desc: 'Domino\'s, La Pino\'z & more — fresh hot pizzas at your doorstep.', bg: '/assets/promo-pizza.png', overlay: 'linear-gradient(135deg, rgba(46, 204, 113, 0.95) 0%, rgba(26, 188, 156, 0.75) 45%, transparent 100%)', align: 'center center' },
    { badge: 'SWEET TREAT', title: 'Buy 1 Get 1 on Desserts', desc: 'Belgian Waffles, Gulab Jamun & more — satisfy your sweet cravings!', bg: '/assets/splash-illustration.png', overlay: 'linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(167, 139, 250, 0.75) 45%, transparent 100%)', align: 'right center' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % carouselSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  const handlePrevSlide = () => setCarouselIndex(prev => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  const handleNextSlide = () => setCarouselIndex(prev => (prev + 1) % carouselSlides.length);

  // ── Filter Tabs ──
  const [activeTab, setActiveTab] = useState('Nearby');
  const tabs = ['Nearby', 'Promotion', 'Newcomers', 'Best Sellers', 'Top Rated', 'All'];

  // ── Wishlist ──
  const [wishlist, setWishlist] = useState([]);
  const toggleWishlist = (id, name) => {
    if (!isAuthenticated) { toast.warning('Please login to manage your wishlist'); navigate('/login'); return; }
    if (wishlist.includes(id)) {
      setWishlist(prev => prev.filter(item => item !== id));
      toast.success(`${name} removed from wishlist`);
    } else {
      setWishlist(prev => [...prev, id]);
      toast.success(`${name} added to wishlist! ❤️`);
    }
  };

  // ── Add to Cart (REAL) ──
  const handleAddToCart = async (food) => {
    if (!isAuthenticated) { toast.warning('Please sign in to add items to cart'); navigate('/login'); return; }
    const result = await dispatch(addToCart({ foodId: food._id, quantity: 1 }));
    if (addToCart.fulfilled.match(result)) {
      toast.success(`${food.name} added to cart!`);
    } else {
      toast.error(result.payload || 'Failed to add item to cart');
    }
  };

  // Shimmer placeholder
  const ShimmerCard = () => (
    <div className="food-card shimmer-card">
      <div className="shimmer-img shimmer"></div>
      <div className="food-card-body">
        <div className="shimmer-line shimmer" style={{ width: '60%', height: '14px', marginBottom: '8px' }}></div>
        <div className="shimmer-line shimmer" style={{ width: '80%', height: '12px', marginBottom: '6px' }}></div>
        <div className="shimmer-line shimmer" style={{ width: '40%', height: '12px' }}></div>
      </div>
    </div>
  );

  return (
    <section id="page-home" className="page active">
      <div className="page-inner stagger-in">
        
        {/* Hero Carousel */}
        <div className="hero-carousel" id="hero-carousel">
          {carouselSlides.map((slide, idx) => (
            <div key={idx} className={`hero-slide${idx === carouselIndex ? ' active' : ''}`} style={{ backgroundImage: `url('${slide.bg}')`, backgroundPosition: slide.align || 'center', backgroundSize: 'cover' }}>
              <div className="hero-overlay" style={slide.overlay ? { background: slide.overlay } : {}}></div>
              <div className="hero-content">
                <span className="hero-badge"><i className="fas fa-fire"></i> {slide.badge}</span>
                <h1>{slide.title}</h1>
                <p>{slide.desc}</p>
                <button className="hero-cta" onClick={() => navigate('/explore')}>Order Now <i className="fas fa-arrow-right"></i></button>
              </div>
            </div>
          ))}
          <div className="hero-nav">
            <button className="hero-arrow left" onClick={handlePrevSlide}><i className="fas fa-chevron-left"></i></button>
            <div className="hero-dots">
              {carouselSlides.map((_, idx) => (
                <span key={idx} className={`dot ${idx === carouselIndex ? 'active' : ''}`} onClick={() => setCarouselIndex(idx)}></span>
              ))}
            </div>
            <button className="hero-arrow right" onClick={handleNextSlide}><i className="fas fa-chevron-right"></i></button>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="ai-recommend-bar">
          <div className="ai-icon"><i className="fas fa-wand-magic-sparkles"></i></div>
          <div className="ai-text">
            <strong>AI Picks for You</strong>
            <span>Based on your taste profile & order history</span>
          </div>
          <button className="btn-sm btn-outline-primary" onClick={() => navigate('/explore')}>View All <i className="fas fa-arrow-right"></i></button>
        </div>

        {/* Category Scroll */}
        <div className="section-head"><h2>What's on your mind?</h2></div>
        <div className="category-scroll">
          <div className="cat-item" onClick={() => navigate('/explore?cuisine=North Indian')}>
            <div className="cat-icon"><img src="/assets/menu_1.png" alt="North Indian" /></div>
            <span>North Indian</span>
          </div>
          <div className="cat-item" onClick={() => navigate('/explore?cuisine=Pizza')}>
            <div className="cat-icon"><img src="/assets/menu_7.png" alt="Pizza" /></div>
            <span>Pizza</span>
          </div>
          <div className="cat-item" onClick={() => navigate('/explore?cuisine=Biryani')}>
            <div className="cat-icon"><img src="/assets/menu_3.png" alt="Biryani" /></div>
            <span>Biryani</span>
          </div>
          <div className="cat-item" onClick={() => navigate('/explore?cuisine=South Indian')}>
            <div className="cat-icon"><img src="/assets/menu_8.png" alt="South Indian" /></div>
            <span>South Indian</span>
          </div>
          <div className="cat-item" onClick={() => navigate('/explore?cuisine=Desserts')}>
            <div className="cat-icon"><img src="/assets/menu_6.png" alt="Desserts" /></div>
            <span>Desserts</span>
          </div>
          <div className="cat-item" onClick={() => navigate('/explore?cuisine=Burgers')}>
            <div className="cat-icon">🍔</div>
            <span>Burgers</span>
          </div>
          <div className="cat-item" onClick={() => navigate('/explore?cuisine=Chinese')}>
            <div className="cat-icon">🥡</div>
            <span>Chinese</span>
          </div>
          <div className="cat-item" onClick={() => navigate('/explore?cuisine=Street Food')}>
            <div className="cat-icon">🌮</div>
            <span>Street Food</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {tabs.map(tab => (
            <button key={tab} className={`ftab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'Nearby' ? '🔥 Nearby' : tab === 'Promotion' ? '🎯 Promotion' : tab === 'Newcomers' ? '🆕 Newcomers' : tab === 'Best Sellers' ? '⭐ Best Sellers' : tab === 'Top Rated' ? '🏆 Top Rated' : '📦 All'}
            </button>
          ))}
        </div>

        {/* Popular Restaurants (from API) */}
        <div className="section-head">
          <h2>🏪 Popular Restaurants</h2>
          <Link to="/explore" className="see-all">See All <i className="fas fa-chevron-right"></i></Link>
        </div>
        <div className="restaurant-grid">
          {loadingRests ? (
            <>
              <div className="rest-card shimmer-card"><div className="shimmer-img shimmer"></div><div className="rest-card-body"><div className="shimmer-line shimmer" style={{ width: '60%', height: '16px', marginBottom: '8px' }}></div><div className="shimmer-line shimmer" style={{ width: '80%', height: '12px' }}></div></div></div>
              <div className="rest-card shimmer-card"><div className="shimmer-img shimmer"></div><div className="rest-card-body"><div className="shimmer-line shimmer" style={{ width: '60%', height: '16px', marginBottom: '8px' }}></div><div className="shimmer-line shimmer" style={{ width: '80%', height: '12px' }}></div></div></div>
            </>
          ) : popularRestaurants.length > 0 ? (
            popularRestaurants.map(rest => (
              <div key={rest._id} className="rest-card" onClick={() => navigate(`/restaurant/${rest._id}`)}>
                <div className="rest-card-img" style={{ 
                  backgroundImage: `url('${rest.images?.logo || rest.images?.banner || '/assets/restaurant-interior.png'}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                  <div className="rest-overlay"></div>
                  {rest.currentOffer?.text && <span className="rest-offer">{rest.currentOffer.text}</span>}
                  <button className="wishlist-btn" onClick={(e) => { e.stopPropagation(); toggleWishlist(rest._id + '_r', rest.name); }}>
                    <i className={wishlist.includes(rest._id + '_r') ? 'fas fa-heart' : 'far fa-heart'}></i>
                  </button>
                </div>
                <div className="rest-card-body">
                  <div className="rest-header">
                    <div>
                      <h3>{rest.name}</h3>
                      <p className="rest-cuisine">{rest.cuisines?.join(', ')}</p>
                    </div>
                    <div className="rest-rating"><i className="fas fa-star"></i> {rest.avgRating}</div>
                  </div>
                  <div className="rest-meta">
                    <span><i className="fas fa-clock"></i> {rest.avgDeliveryTime || 30} min</span>
                    <span><i className="fas fa-money-bill-wave"></i> {rest.deliveryFee === 0 ? 'Free' : `₹${rest.deliveryFee}`}</span>
                    <span className="rest-open"><i className="fas fa-circle"></i> {rest.isOpen ? 'Open' : 'Closed'}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No restaurants found.</p>
          )}
        </div>

        {/* Trending Now (from API) */}
        <div className="section-head">
          <h2>🔥 Trending Now</h2>
          <Link to="/explore" className="see-all">See All <i className="fas fa-chevron-right"></i></Link>
        </div>
        <div className="food-grid-h">
          {loadingFoods ? (
            <>
              <ShimmerCard /><ShimmerCard /><ShimmerCard />
            </>
          ) : trendingFoods.length > 0 ? (
            trendingFoods.map(food => (
              <div key={food._id} className="food-card" onClick={() => navigate(`/restaurant/${food.restaurant?._id || food.restaurant}`)}>
                <div className="food-card-img" style={{ backgroundImage: `url('${food.thumbnail || food.images?.[0] || '/assets/hero-burger.png'}')` }}>
                  {food.isBestseller && <span className="food-badge">BESTSELLER</span>}
                  {food.isNew && <span className="food-badge" style={{ background: 'var(--secondary)' }}>NEW</span>}
                  {food.offer?.offerText && <span className="food-badge">{food.offer.offerText}</span>}
                  <button
                    className={`wishlist-btn ${wishlist.includes(food._id) ? 'liked' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(food._id, food.name); }}
                  >
                    <i className={wishlist.includes(food._id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                  </button>
                  <div className="food-time"><i className="fas fa-clock"></i> {food.preparationTime || 25} min</div>
                </div>
                <div className="food-card-body">
                  <div className="food-rating"><i className="fas fa-star"></i> {food.avgRating || 0} <span>({food.totalRatings || 0})</span></div>
                  <h3>{food.name}</h3>
                  <p className="food-restaurant">{food.restaurant?.name || ''}</p>
                  <div className="food-meta">
                    {food.nutrition?.calories && <span className="food-cal"><i className="fas fa-fire-flame-curved"></i> {food.nutrition.calories} cal</span>}
                    <span className={`food-tag ${food.foodType === 'veg' || food.foodType === 'vegan' ? 'veg' : 'non-veg'}`}>
                      <i className="fas fa-circle"></i>
                    </span>
                  </div>
                  <div className="food-bottom">
                    <div className="food-price">
                      ₹{food.price}
                      {food.originalPrice && <s>₹{food.originalPrice}</s>}
                    </div>
                    <button className="add-btn" onClick={(e) => { e.stopPropagation(); handleAddToCart(food); }}>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No trending items found.</p>
          )}
        </div>

        {/* Special Offers Carousel */}
        <div className="section-head">
          <h2>🎁 Special Offers</h2>
          <Link to="/offers" className="see-all">See All <i className="fas fa-chevron-right"></i></Link>
        </div>
        <div className="offer-scroll">
          <div className="offer-card grad-1" onClick={() => navigate('/offers')}>
            <div className="offer-card-content">
              <span className="offer-tag">Limited Time</span>
              <h3>50% OFF</h3>
              <p>On your first 3 orders</p>
              <span className="offer-code">WELCOME50</span>
            </div>
            <div className="offer-card-art"><i className="fas fa-gift"></i></div>
          </div>
          <div className="offer-card grad-2" onClick={() => navigate('/offers')}>
            <div className="offer-card-content">
              <span className="offer-tag">Free Delivery</span>
              <h3>₹0 Delivery</h3>
              <p>On orders above ₹299</p>
              <span className="offer-code">FREERIDE</span>
            </div>
            <div className="offer-card-art"><i className="fas fa-truck-fast"></i></div>
          </div>
          <div className="offer-card grad-3" onClick={() => navigate('/offers')}>
            <div className="offer-card-content">
              <span className="offer-tag">Cashback</span>
              <h3>20% Cashback</h3>
              <p>Pay via FOODIFY Wallet</p>
              <span className="offer-code">WALLET20</span>
            </div>
            <div className="offer-card-art"><i className="fas fa-coins"></i></div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Home;
