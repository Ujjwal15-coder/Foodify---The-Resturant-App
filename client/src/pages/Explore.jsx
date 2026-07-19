import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useToast } from '../components/Toast';
import api from '../api/axios';

function Explore() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { isAuthenticated } = useSelector(state => state.auth);

  // View toggle
  const [viewType, setViewType] = useState('grid');
  // Filter chip
  const [activeFilter, setActiveFilter] = useState('All');
  // Wishlist
  const [wishlist, setWishlist] = useState([]);

  // URL params
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialCuisine = queryParams.get('cuisine') || '';
  const [searchVal, setSearchVal] = useState(initialSearch);

  // API Data
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearchVal(initialSearch);
  }, [initialSearch]);

  // Fetch restaurants from API
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (initialSearch) params.set('search', initialSearch);
    if (initialCuisine) params.set('cuisine', initialCuisine);
    params.set('limit', '20');

    api.get(`/restaurants?${params.toString()}`)
      .then(res => {
        setAllRestaurants(res.data.restaurants || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error('Failed to load restaurants');
      });
  }, [initialSearch, initialCuisine]);

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

  // Client-side filtering on API results
  const filteredRestaurants = allRestaurants.filter(rest => {
    // Local search override
    const matchesSearch = searchVal
      ? rest.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        (rest.cuisines || []).join(', ').toLowerCase().includes(searchVal.toLowerCase())
      : true;

    if (!matchesSearch) return false;

    // Chip filters
    switch (activeFilter) {
      case 'Open Now': return rest.isOpen !== false;
      case 'Free Delivery': return rest.deliveryFee === 0;
      case 'Rating 4+': return (rest.avgRating || 0) >= 4.0;
      case 'Veg': return (rest.cuisines || []).some(c => ['Vegan', 'Salads', 'Healthy', 'South Indian', 'Sweets'].includes(c));
      case 'Non-Veg': return (rest.cuisines || []).some(c => ['Chicken', 'Biryani', 'Mughlai', 'BBQ', 'Kebabs'].includes(c));
      case 'Under 30 min': return (rest.avgDeliveryTime || 30) <= 30;
      case 'Popular': return (rest.totalRatings || 0) >= 10000;
      case 'Offers': return !!rest.currentOffer?.text;
      default: return true;
    }
  });

  return (
    <section id="page-restaurants" className="page active">
      <div className="page-inner">
        <div className="page-title-row">
          <h1>Explore Restaurants</h1>
          <div className="view-toggle">
            <button className={`vt ${viewType === 'grid' ? 'active' : ''}`} title="Grid" onClick={() => setViewType('grid')}>
              <i className="fas fa-table-cells"></i>
            </button>
            <button className={`vt ${viewType === 'list' ? 'active' : ''}`} title="List" onClick={() => setViewType('list')}>
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-bar" style={{ maxWidth: '100%', marginBottom: '20px' }}>
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Filter list by name or cuisine..." value={searchVal} onChange={(e) => setSearchVal(e.target.value)} />
          {searchVal && (
            <button onClick={() => setSearchVal('')} style={{ color: 'var(--text-muted)' }}>
              <i className="fas fa-xmark"></i>
            </button>
          )}
        </div>

        <div className="filter-chips">
          {['All', 'Open Now', 'Free Delivery', 'Rating 4+', 'Veg', 'Non-Veg', 'Under 30 min', 'Popular', 'Offers'].map(chip => (
            <button key={chip} className={`chip ${activeFilter === chip ? 'active' : ''}`} onClick={() => setActiveFilter(chip)}>
              {chip}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="restaurant-grid">
            {[1,2,3,4].map(i => (
              <div key={i} className="rest-card shimmer-card">
                <div className="shimmer-img shimmer" style={{ height: '180px' }}></div>
                <div className="rest-card-body">
                  <div className="shimmer-line shimmer" style={{ width: '60%', height: '16px', marginBottom: '10px' }}></div>
                  <div className="shimmer-line shimmer" style={{ width: '80%', height: '12px', marginBottom: '8px' }}></div>
                  <div className="shimmer-line shimmer" style={{ width: '50%', height: '12px' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <div className={viewType === 'grid' ? 'restaurant-grid' : 'food-list-v'}>
            {filteredRestaurants.map(rest => (
              <div
                key={rest._id}
                className={viewType === 'grid' ? 'rest-card' : 'food-list-item'}
                onClick={() => navigate(`/restaurant/${rest._id}`)}
              >
                {viewType === 'grid' ? (
                  <>
                    <div className="rest-card-img" style={{ 
                      backgroundImage: `url('${rest.images?.logo || rest.images?.banner || '/assets/restaurant-interior.png'}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}>
                      <div className="rest-overlay"></div>
                      {rest.currentOffer?.text && <span className="rest-offer">{rest.currentOffer.text}</span>}
                      <button
                        className={`wishlist-btn ${wishlist.includes(rest._id) ? 'liked' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(rest._id, rest.name); }}
                      >
                        <i className={wishlist.includes(rest._id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                      </button>
                    </div>
                    <div className="rest-card-body">
                      <div className="rest-header">
                        <div>
                          <h3>{rest.name}</h3>
                          <p className="rest-cuisine">{(rest.cuisines || []).join(', ')}</p>
                        </div>
                        <div className="rest-rating"><i className="fas fa-star"></i> {rest.avgRating || 0}</div>
                      </div>
                      <div className="rest-meta">
                        <span><i className="fas fa-clock"></i> {rest.avgDeliveryTime || 30} min</span>
                        <span><i className="fas fa-money-bill-wave"></i> {rest.deliveryFee === 0 ? 'Free' : `₹${rest.deliveryFee}`}</span>
                        <span className={rest.isOpen !== false ? 'rest-open' : 'rest-closed'}>
                          <i className="fas fa-circle"></i> {rest.isOpen !== false ? 'Open Now' : 'Closed'}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <img 
                      src={rest.images?.logo || rest.images?.banner || '/assets/restaurant-interior.png'} 
                      alt={rest.name}
                      style={{ objectFit: 'cover', border: '1px solid var(--border)' }}
                      onError={(e) => { e.target.src = '/assets/restaurant-interior.png'; }}
                    />
                    <div className="fli-info">
                      <div className="fli-top">
                        <h4>{rest.name}</h4>
                        <div className="rest-rating" style={{ transform: 'scale(0.85)', transformOrigin: 'left' }}>
                          <i className="fas fa-star"></i> {rest.avgRating || 0}
                        </div>
                      </div>
                      <p>{(rest.cuisines || []).join(', ')}</p>
                      <div className="fli-meta">
                        <span><i className="fas fa-clock"></i> {rest.avgDeliveryTime || 30} min</span>
                        <span><i className="fas fa-truck"></i> {rest.deliveryFee === 0 ? 'Free' : `₹${rest.deliveryFee}`}</span>
                      </div>
                    </div>
                    <div className="fli-right">
                      <button
                        className={`wishlist-btn ${wishlist.includes(rest._id) ? 'liked' : ''}`}
                        style={{ position: 'static' }}
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(rest._id, rest.name); }}
                      >
                        <i className={wishlist.includes(rest._id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                      </button>
                      <span className={rest.isOpen !== false ? 'rest-open' : 'rest-closed'} style={{ fontSize: '11px', fontWeight: 600 }}>
                        {rest.isOpen !== false ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="fas fa-utensils"></i></div>
            <h3>No Restaurants Found</h3>
            <p>We couldn't find any restaurants matching your search criteria or active filters.</p>
            <button className="btn-main btn-sm" onClick={() => { setSearchVal(''); setActiveFilter('All'); navigate('/explore'); }}>
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Explore;
