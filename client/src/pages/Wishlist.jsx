import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../store/cartSlice';
import { useToast } from '../components/Toast';

function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { isAuthenticated } = useSelector(state => state.auth);

  // Tabs state
  const [activeTab, setActiveTab] = useState('All');
  
  // Custom mock wishlist state
  const [wishlistItems, setWishlistItems] = useState([
    { id: 1, type: 'food', name: 'Smash Burger XL', restaurant: 'Burger Queen', restaurantId: 1, image: '/assets/hero-burger.png', rating: 4.8, price: 12.99, time: '25 min' },
    { id: 2, type: 'food', name: 'Grilled Steak Platter', restaurant: 'The Grill House', restaurantId: 3, image: '/assets/food-banner-deals.png', rating: 4.7, price: 24.99, time: '20 min' },
    { id: 3, type: 'food', name: 'Margherita Supreme', restaurant: 'Pizza Paradise', restaurantId: 2, image: '/assets/promo-pizza.png', rating: 4.9, price: 14.99, time: '30 min' }
  ]);

  const handleRemove = (id, name) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
    toast.success(`${name} removed from wishlist`);
  };

  const handleAddToCart = async (food) => {
    if (!isAuthenticated) {
      toast.warning('Please login to add items to cart');
      navigate('/login');
      return;
    }
    const cartData = {
      foodId: food.id,
      quantity: 1,
      price: food.price,
      restaurantId: food.restaurantId
    };
    const result = await dispatch(addToCart(cartData));
    if (addToCart.fulfilled.match(result)) {
      toast.success(`${food.name} added to cart!`);
    } else {
      toast.error('Failed to add item to cart');
    }
  };

  const filteredItems = wishlistItems.filter(item => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Foods') return item.type === 'food';
    return item.type === 'restaurant';
  });

  return (
    <section id="page-wishlist" className="page active">
      <div className="page-inner stagger-in">
        <h1 className="page-title">My Wishlist ❤️</h1>
        
        <div className="filter-tabs">
          <button 
            className={`ftab ${activeTab === 'All' ? 'active' : ''}`}
            onClick={() => setActiveTab('All')}
          >
            All ({wishlistItems.length})
          </button>
          <button 
            className={`ftab ${activeTab === 'Foods' ? 'active' : ''}`}
            onClick={() => setActiveTab('Foods')}
          >
            Foods ({wishlistItems.filter(i => i.type === 'food').length})
          </button>
          <button 
            className={`ftab ${activeTab === 'Restaurants' ? 'active' : ''}`}
            onClick={() => setActiveTab('Restaurants')}
          >
            Restaurants ({wishlistItems.filter(i => i.type === 'restaurant').length})
          </button>
        </div>
        
        {filteredItems.length > 0 ? (
          <div className="food-grid-h">
            {filteredItems.map(item => (
              <div key={item.id} className="food-card" onClick={() => navigate(`/restaurant/${item.restaurantId}`)}>
                <div className="food-card-img" style={{ backgroundImage: `url('${item.image}')` }}>
                  <button 
                    className="wishlist-btn liked" 
                    onClick={(e) => { e.stopPropagation(); handleRemove(item.id, item.name); }}
                  >
                    <i className="fas fa-heart"></i>
                  </button>
                  <div className="food-time"><i className="fas fa-clock"></i> {item.time}</div>
                </div>
                <div className="food-card-body">
                  <div className="food-rating"><i className="fas fa-star"></i> {item.rating}</div>
                  <h3>{item.name}</h3>
                  <p className="food-restaurant">{item.restaurant}</p>
                  <div className="food-bottom">
                    <div className="food-price">${item.price}</div>
                    <button 
                      className="add-btn"
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
                    >
                      <i className="fas fa-cart-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="fas fa-heart-crack"></i>
            </div>
            <h3>Wishlist is empty</h3>
            <p>You haven't liked any items in this category yet. Explore restaurants and add your favorites!</p>
            <button className="btn-main btn-sm" onClick={() => navigate('/')}>
              Browse Home
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Wishlist;

