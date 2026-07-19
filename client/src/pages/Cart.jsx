import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../store/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { items, subtotal, restaurant, loading } = useSelector(state => state.cart);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdate = (itemId, quantity, name) => {
    if (quantity < 1) {
      dispatch(removeFromCart(itemId));
      toast.success(`${name} removed from cart`);
    } else {
      dispatch(updateCartItem({ itemId, quantity }));
    }
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success('Cart cleared successfully');
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      toast.warning('Please log in to proceed to checkout');
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="page active">
        <div className="page-inner" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: 'var(--primary)', marginBottom: '16px' }}></i>
          <p>Loading your cart details...</p>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <section className="page active">
        <div className="page-inner">
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="fas fa-cart-shopping"></i>
            </div>
            <h3>Your Cart is Empty</h3>
            <p>Looks like you haven't added anything to your cart yet. Let's find something delicious!</p>
            <Link to="/" className="btn-main" style={{ marginTop: '16px' }}>
              Explore Restaurants
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Smart delivery fee: Free above ₹299, otherwise ₹40
  const deliveryFee = subtotal >= 299 ? 0 : 40;
  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
  const total = subtotal + deliveryFee + tax;

  return (
    <section className="page active">
      <div className="page-inner stagger-in">
        <h1 className="page-title">Your Cart</h1>
        {restaurant && (
          <h3 style={{ marginBottom: '20px', fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}>
            Ordering from: <span style={{ color: 'var(--primary)' }}>{restaurant.name}</span>
          </h3>
        )}
        
        <div className="cart-container-main" style={{ display: 'grid', gap: '24px' }}>
          
          <div className="cart-items-list" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-sm)' }}>
            {items.map(item => (
              <div 
                key={item._id} 
                className="cart-item" 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '16px 0', 
                  borderBottom: '1px solid var(--border-light)',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: '1 1 200px' }}>
                  <img 
                    src={item.food?.thumbnail || item.food?.images?.[0] || '/assets/hero-burger.png'} 
                    alt={item.food?.name} 
                    style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-lg)', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/assets/hero-burger.png'; }}
                  />
                  <div>
                    <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '15px' }}>{item.food?.name || 'Item'}</h4>
                    <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>₹{item.price.toFixed(2)}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div className="qty-ctrl">
                    <button onClick={() => handleUpdate(item._id, item.quantity - 1, item.food?.name)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleUpdate(item._id, item.quantity + 1, item.food?.name)}>+</button>
                  </div>
                  <strong style={{ fontSize: '15px', color: 'var(--text)', minWidth: '60px', textAlign: 'right' }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </strong>
                  <button 
                    onClick={() => handleUpdate(item._id, 0, item.food?.name)} 
                    style={{ color: 'var(--danger)', cursor: 'pointer' }}
                  >
                    <i className="fas fa-trash-can"></i>
                  </button>
                </div>
              </div>
            ))}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn-ghost" onClick={handleClearCart} style={{ color: 'var(--danger)' }}>
                <i className="fas fa-trash-arrow-up"></i> Clear Cart
              </button>
            </div>
          </div>

          <div className="cart-summary-side" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-sm)', height: 'fit-content' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
              Order Details
            </h3>
            <div className="ct-row" style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="ct-row" style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
              <span>GST (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="ct-row" style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
              <span>Delivery Fee</span>
              <span style={{ color: deliveryFee === 0 ? 'var(--success)' : 'inherit' }}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            {deliveryFee === 0 && (
              <div style={{ fontSize: '11px', color: 'var(--success)', marginBottom: '4px' }}>
                <i className="fas fa-check-circle"></i> Free delivery on orders above ₹299
              </div>
            )}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '12px 0' }} />
            <div className="ct-row total" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '17px', color: 'var(--text)' }}>
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            
            <button 
              className="btn-main btn-full btn-lg" 
              onClick={handleProceedToCheckout} 
              style={{ marginTop: '24px' }}
            >
              Proceed to Checkout <i className="fas fa-arrow-right"></i>
            </button>
          </div>
          
        </div>
      </div>
    </section>
  );
}

export default Cart;
