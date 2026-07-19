import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeFromCart, updateCartItem } from '../store/cartSlice';
import { useToast } from './Toast';

function CartPanel({ isOpen, toggleCart }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  
  const { items, subtotal } = useSelector(state => state.cart);
  const { isAuthenticated } = useSelector(state => state.auth);

  const deliveryFee = items.length > 0 ? (subtotal >= 299 ? 0 : 40) : 0;
  const tax = items.length > 0 ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
  const total = subtotal + deliveryFee + tax;

  const handleUpdateQty = async (id, newQty) => {
    if (newQty < 1) {
      const result = await dispatch(removeFromCart(id));
      if (removeFromCart.fulfilled.match(result)) {
        toast.success('Item removed from cart');
      }
    } else {
      dispatch(updateCartItem({ itemId: id, quantity: newQty }));
    }
  };

  const handleCheckoutClick = () => {
    toggleCart();
    if (!isAuthenticated) {
      toast.warning('Please sign in to proceed to checkout');
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <>
      <aside className={`cart-panel ${isOpen ? 'active' : ''}`} id="cart-panel">
        <div className="cart-header">
          <h3><i className="fas fa-shopping-cart"></i> My Cart</h3>
          <button className="cart-close" onClick={toggleCart}><i className="fas fa-times"></i></button>
        </div>
        
        {items.length > 0 ? (
          <>
            <div className="cart-address-bar">
              <i className="fas fa-location-dot"></i>
              <div><small>Delivery to</small><strong>B-12, Sector 62, Noida</strong></div>
              <div className="cart-eta"><i className="fas fa-clock"></i> 30 min • 3.2 km</div>
            </div>
            
            <div className="cart-items" id="cart-items">
              {items.map(item => (
                <div key={item._id} className="cart-item">
                  <img 
                    src={item.food?.image || '/assets/hero-burger.png'} 
                    alt={item.food?.name} 
                    onError={(e) => { e.target.src = '/assets/hero-burger.png'; }}
                  />
                  <div className="ci-info">
                    <h4>{item.food?.name}</h4>
                    <small>Regular</small>
                    <div className="ci-controls">
                      <div className="qty-ctrl">
                        <button onClick={() => handleUpdateQty(item._id, item.quantity - 1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleUpdateQty(item._id, item.quantity + 1)}>+</button>
                      </div>
                      <button className="ci-remove" onClick={() => handleUpdateQty(item._id, 0)}><i className="fas fa-trash-can"></i></button>
                    </div>
                  </div>
                  <span className="ci-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="cart-footer">
              <div className="cart-coupon">
                <i className="fas fa-ticket"></i>
                <input placeholder="Add promo code" />
                <button onClick={() => toast.success('Coupon applied successfully!')}>Apply</button>
              </div>
              <div className="cart-totals">
                <div className="ct-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="ct-row"><span>GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
                <div className="ct-row"><span>Delivery</span><span style={{ color: deliveryFee === 0 ? 'var(--success)' : 'inherit' }}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span></div>
                <div className="ct-row total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
              </div>
              <button className="btn-main btn-full btn-lg" onClick={handleCheckoutClick}>
                Checkout — ₹{total.toFixed(2)}
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ height: '70%', justifyContent: 'center' }}>
            <div className="empty-state-icon">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <h3>Your cart is empty</h3>
            <p>Add some delicious meals from explore to satisfy your cravings!</p>
            <button className="btn-main btn-sm" onClick={() => { toggleCart(); navigate('/explore'); }}>
              Shop Now
            </button>
          </div>
        )}
      </aside>
      {isOpen && <div className="cart-overlay active" id="cart-overlay" onClick={toggleCart}></div>}
    </>
  );
}

export default CartPanel;

