import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { useToast } from '../components/Toast';
import api from '../api/axios';

function RestaurantDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const toast = useToast();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  // API data
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active menu category tab
  const [activeMenuTab, setActiveMenuTab] = useState('All');
  
  // Reviews state
  const [userReviewText, setUserReviewText] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [reviewsList, setReviewsList] = useState([
    { id: 1, name: 'Sarah K.', rating: 5, time: '2 days ago', content: 'Best food in town! Absolutely incredible flavors. Perfectly cooked, juicy, and the sauce is divine. 🔥', likes: 24, liked: false }
  ]);

  // Fetch restaurant + menu from API
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/restaurants/${id}`),
      api.get(`/foods?restaurant=${id}&limit=50`)
    ])
      .then(([restRes, foodRes]) => {
        setRestaurant(restRes.data.restaurant);
        setMenuItems(foodRes.data.foods || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load restaurant details');
        setLoading(false);
      });
  }, [id]);

  // Get unique categories from menu items
  const categories = ['All', 'Bestsellers', ...new Set(menuItems.map(item => item.category))];

  // Filter menu items
  const filteredMenuItems = menuItems.filter(item => {
    if (activeMenuTab === 'All') return true;
    if (activeMenuTab === 'Bestsellers') return item.isBestseller;
    return item.category === activeMenuTab;
  });

  // Add to cart with REAL food._id
  const handleAddToCart = async (item) => {
    if (!isAuthenticated) { toast.warning('Please login to add items to your cart'); navigate('/login'); return; }
    const result = await dispatch(addToCart({ foodId: item._id, quantity: 1 }));
    if (addToCart.fulfilled.match(result)) {
      toast.success(`${item.name} added to cart!`);
    } else {
      toast.error(result.payload || 'Failed to add item');
    }
  };

  const handleLikeReview = (reviewId) => {
    setReviewsList(prev =>
      prev.map(r => {
        if (r.id === reviewId) return { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 };
        return r;
      })
    );
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.warning('Please log in to submit a review'); navigate('/login'); return; }
    if (!userReviewText.trim()) return;
    const newReviewObj = {
      id: Date.now(),
      name: user?.name || 'Anonymous User',
      rating: userRating,
      time: 'Just now',
      content: userReviewText,
      likes: 0,
      liked: false
    };
    setReviewsList(prev => [newReviewObj, ...prev]);
    setUserReviewText('');
    toast.success('Thank you for sharing your review!');
  };

  if (loading) {
    return (
      <section id="page-restaurant-detail" className="page active">
        <div className="page-inner" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: 'var(--primary)', marginBottom: '16px' }}></i>
          <p>Loading restaurant...</p>
        </div>
      </section>
    );
  }

  if (!restaurant) {
    return (
      <section id="page-restaurant-detail" className="page active">
        <div className="page-inner">
          <div className="empty-state">
            <div className="empty-state-icon"><i className="fas fa-store-slash"></i></div>
            <h3>Restaurant Not Found</h3>
            <p>The restaurant you're looking for doesn't exist or has been removed.</p>
            <button className="btn-main" onClick={() => navigate('/explore')}>Explore Restaurants</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="page-restaurant-detail" className="page active">
      <div className="page-inner">
        <div className="rest-detail-hero" style={{ 
          backgroundImage: `url('${restaurant.images?.logo || restaurant.images?.banner || '/assets/restaurant-interior.png'}')`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundColor: '#fff'
        }}>
          <div className="rest-detail-overlay"></div>
          <button className="back-btn" onClick={() => navigate(-1)}><i className="fas fa-arrow-left"></i></button>
          <div className="rest-detail-info">
            <h1>{restaurant.name}</h1>
            <p>{(restaurant.cuisines || []).join(', ')} • {restaurant.priceForTwo ? `₹${restaurant.priceForTwo} for two` : restaurant.priceRange || '₹₹'}</p>
            <div className="rest-detail-stats">
              <span><i className="fas fa-star"></i> {restaurant.avgRating} ({restaurant.totalRatings || 0}+ reviews)</span>
              <span><i className="fas fa-clock"></i> {restaurant.avgDeliveryTime || 30} min</span>
              <span><i className="fas fa-truck"></i> {restaurant.deliveryFee === 0 ? 'Free Delivery' : `₹${restaurant.deliveryFee} delivery`}</span>
            </div>
          </div>
        </div>

        <div className="rest-info-strip">
          <div className="info-pill"><strong>{restaurant.avgRating || 0}</strong><small>Rating</small></div>
          <div className="info-pill"><strong>{restaurant.avgDeliveryTime || 30}</strong><small>Minutes</small></div>
          <div className="info-pill"><strong>{restaurant.deliveryFee === 0 ? 'Free' : `₹${restaurant.deliveryFee}`}</strong><small>Delivery</small></div>
          <div className="info-pill"><strong>₹{restaurant.minOrderAmount || 0}</strong><small>Min Order</small></div>
        </div>

        {/* Menu Category Tabs */}
        <div className="menu-tabs">
          {categories.map(tab => (
            <button
              key={tab}
              className={`mtab ${activeMenuTab === tab ? 'active' : ''}`}
              onClick={() => setActiveMenuTab(tab)}
              style={{ textTransform: 'capitalize' }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="menu-section">
          <h3 className="menu-sec-title">
            {activeMenuTab} Items <span className="menu-count">({filteredMenuItems.length} items)</span>
          </h3>
          <div className="menu-list">
            {filteredMenuItems.map(item => (
              <div key={item._id} className="menu-item">
                <div className="menu-item-left">
                  <span className={`veg-badge ${item.foodType === 'veg' || item.foodType === 'vegan' ? 'veg' : 'non-veg'}`}></span>
                  <div className="menu-item-info">
                    <h4>{item.name} {item.isBestseller && <span style={{ color: 'var(--accent-dark)', fontSize: '11px' }}>⭐ BESTSELLER</span>}</h4>
                    <p>{item.description}</p>
                    <div className="menu-item-meta">
                      <span><i className="fas fa-star"></i> {item.avgRating || 0} ({item.totalRatings || 0})</span>
                      {item.nutrition?.calories && <span><i className="fas fa-fire-flame-curved"></i> {item.nutrition.calories} cal</span>}
                    </div>
                    <span className="menu-item-price">
                      ₹{item.price}
                      {item.originalPrice && <s style={{ marginLeft: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>₹{item.originalPrice}</s>}
                    </span>
                  </div>
                </div>
                <div className="menu-item-right">
                  <img
                    src={item.thumbnail || item.images?.[0] || '/assets/hero-burger.png'}
                    alt={item.name}
                    onError={(e) => { e.target.src = '/assets/hero-burger.png'; }}
                  />
                  <button className="menu-add-btn" onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}>
                    ADD
                  </button>
                </div>
              </div>
            ))}

            {filteredMenuItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <p>No items found in this category.</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <div className="section-head"><h2>⭐ Reviews & Ratings</h2></div>
          
          <form onSubmit={handleAddReview} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-xl)', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ marginBottom: '10px' }}>Leave a Review</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span>Your Rating:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" onClick={() => setUserRating(star)} style={{ color: star <= userRating ? 'var(--accent-dark)' : 'var(--text-muted)' }}>
                    <i className="fas fa-star"></i>
                  </button>
                ))}
              </div>
            </div>
            <textarea className="special-notes" placeholder="Tell us what you liked or disliked..." value={userReviewText} onChange={e => setUserReviewText(e.target.value)} style={{ minHeight: '80px', marginBottom: '12px', width: '100%' }} required></textarea>
            <button type="submit" className="btn-main btn-sm">Submit Review</button>
          </form>

          <div className="reviews-summary">
            <div className="review-big-score">
              <h2>{restaurant.avgRating || 0}</h2>
              <div className="stars">
                {[1,2,3,4,5].map(s => (
                  <i key={s} className={s <= Math.floor(restaurant.avgRating || 0) ? 'fas fa-star' : s - 0.5 <= (restaurant.avgRating || 0) ? 'fas fa-star-half-stroke' : 'far fa-star'}></i>
                ))}
              </div>
              <p>{restaurant.totalRatings || 0} reviews</p>
            </div>
            <div className="review-bars">
              <div className="rbar"><span>5</span><div className="rbar-track"><div className="rbar-fill" style={{ width: '65%' }}></div></div><span>65%</span></div>
              <div className="rbar"><span>4</span><div className="rbar-track"><div className="rbar-fill" style={{ width: '20%' }}></div></div><span>20%</span></div>
              <div className="rbar"><span>3</span><div className="rbar-track"><div className="rbar-fill" style={{ width: '10%' }}></div></div><span>10%</span></div>
              <div className="rbar"><span>2</span><div className="rbar-track"><div className="rbar-fill" style={{ width: '3%' }}></div></div><span>3%</span></div>
              <div className="rbar"><span>1</span><div className="rbar-track"><div className="rbar-fill" style={{ width: '2%' }}></div></div><span>2%</span></div>
            </div>
          </div>

          <div className="review-list">
            {reviewsList.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-user">
                  <div className="review-avatar">{review.name.substring(0, 2).toUpperCase()}</div>
                  <div>
                    <strong>{review.name}</strong>
                    <div className="review-stars">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <i key={index} className={index < review.rating ? 'fas fa-star' : 'far fa-star'} style={{ color: 'var(--accent-dark)' }}></i>
                      ))}
                    </div>
                  </div>
                  <small>{review.time}</small>
                </div>
                <p>{review.content}</p>
                <div className="review-actions">
                  <button onClick={() => handleLikeReview(review.id)} style={{ color: review.liked ? 'var(--primary)' : 'var(--text-muted)' }}>
                    <i className="fas fa-thumbs-up"></i> {review.likes}
                  </button>
                  <button onClick={() => toast.info('Replying coming soon!')}><i className="fas fa-reply"></i> Reply</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default RestaurantDetails;
