import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import { useToast } from '../components/Toast';

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  
  const { subtotal, items, restaurant } = useSelector(state => state.cart);
  const { isAuthenticated } = useSelector(state => state.auth);

  // Redirect if cart is empty or not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('Please log in to checkout');
      navigate('/login');
      return;
    }
    if (!items || items.length === 0) {
      toast.warning('Your cart is empty! Add some items first.');
      navigate('/');
    }
  }, [items, isAuthenticated, navigate, toast]);

  const deliveryFee = subtotal >= 299 ? 0 : 40;
  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST

  // Selection states
  const [selectedAddress, setSelectedAddress] = useState('Home');
  const [selectedPayment, setSelectedPayment] = useState('UPI');
  const [riderTip, setRiderTip] = useState(20); // Default tip ₹20
  const [customTipActive, setCustomTipActive] = useState(false);
  const [customTipVal, setCustomTipVal] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  
  // Placement states
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const handleTipChange = (tipAmt) => {
    setCustomTipActive(false);
    setRiderTip(tipAmt);
  };

  const handleCustomTipChange = (e) => {
    const val = parseFloat(e.target.value);
    setCustomTipVal(e.target.value);
    if (!isNaN(val) && val >= 0) {
      setRiderTip(val);
    } else {
      setRiderTip(0);
    }
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) { toast.warning('Please enter a coupon code'); return; }
    
    // Simple coupon validation
    const coupons = {
      'WELCOME50': { percent: 50, maxDiscount: 100, minOrder: 199 },
      'FLAT100': { flat: 100, minOrder: 499 },
      'FREERIDE': { freeDelivery: true, minOrder: 299 },
      'SAVE20': { percent: 20, maxDiscount: 150, minOrder: 299 },
    };

    const coupon = coupons[code];
    if (!coupon) {
      toast.error('Invalid coupon code');
      return;
    }
    if (subtotal < coupon.minOrder) {
      toast.warning(`Minimum order of ₹${coupon.minOrder} required for this coupon`);
      return;
    }

    let discount = 0;
    if (coupon.percent) {
      discount = Math.min(Math.round(subtotal * coupon.percent / 100), coupon.maxDiscount || Infinity);
    } else if (coupon.flat) {
      discount = coupon.flat;
    }

    setCouponDiscount(discount);
    setCouponApplied(true);
    toast.success(`Coupon applied! You save ₹${discount}`);
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(false);
    toast.info('Coupon removed');
  };

  const handlePlaceOrder = () => {
    if (subtotal <= 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    setIsPlacingOrder(true);
    
    // Simulate API request to place order
    setTimeout(() => {
      setIsPlacingOrder(false);
      setShowSuccessOverlay(true);
      
      // Save order to localStorage with timestamp for tracking
      const orders = JSON.parse(localStorage.getItem('placedOrders')) || [];
      const newOrder = {
        id: `FD-${Math.floor(1000 + Math.random() * 9000)}`,
        restaurant: restaurant?.name || 'Restaurant',
        eta: '25-30 min',
        items: items.map(i => `${i.quantity}x ${i.food?.name || 'Item'}`).join(', '),
        total: total,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        tax: tax,
        discount: couponDiscount,
        paymentMethod: selectedPayment,
        status: 'Active',
        step: 'Confirmed',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: Date.now()
      };
      orders.unshift(newOrder);
      localStorage.setItem('placedOrders', JSON.stringify(orders));

      // Clear redux cart
      dispatch(clearCart());
    }, 2000);
  };

  const handleSuccessClose = () => {
    setShowSuccessOverlay(false);
    navigate('/orders');
  };

  const total = subtotal + deliveryFee + tax + riderTip - couponDiscount;

  if (!items || items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <section id="page-checkout" className="page active">
      <div className="page-inner stagger-in">
        <h1 className="page-title">Checkout</h1>
        <div className="checkout-grid">
          <div className="checkout-left">
            
            {/* Delivery Address */}
            <div className="checkout-section">
              <div className="cs-head"><span className="cs-step">1</span><h3>Delivery Address</h3></div>
              <div className="address-grid">
                <div 
                  className={`addr-card ${selectedAddress === 'Home' ? 'selected' : ''}`}
                  onClick={() => setSelectedAddress('Home')}
                >
                  <div className="addr-icon"><i className="fas fa-house"></i></div>
                  <div className="addr-info">
                    <strong>Home</strong>
                    <p>B-12, Sector 62, Near Metro Station, Noida</p>
                  </div>
                  {selectedAddress === 'Home' && <i className="fas fa-check-circle"></i>}
                </div>
                
                <div 
                  className={`addr-card ${selectedAddress === 'Office' ? 'selected' : ''}`}
                  onClick={() => setSelectedAddress('Office')}
                >
                  <div className="addr-icon"><i className="fas fa-briefcase"></i></div>
                  <div className="addr-info">
                    <strong>Office</strong>
                    <p>Tower C, 5th Floor, Cyber City, Gurugram</p>
                  </div>
                  {selectedAddress === 'Office' && <i className="fas fa-check-circle"></i>}
                </div>
                
                <div 
                  className="addr-card add-new"
                  onClick={() => toast.info('Add new address feature coming soon!')}
                >
                  <i className="fas fa-plus"></i>
                  <span>Add New</span>
                </div>
              </div>
              
              <div className="delivery-instructions">
                <label>Delivery Instructions</label>
                <textarea placeholder="Ring the doorbell, leave at door, call on arrival, etc."></textarea>
              </div>
            </div>

            {/* Payment */}
            <div className="checkout-section">
              <div className="cs-head"><span className="cs-step">2</span><h3>Payment Method</h3></div>
              <div className="payment-list">
                <div 
                  className={`pay-option ${selectedPayment === 'UPI' ? 'selected' : ''}`}
                  onClick={() => setSelectedPayment('UPI')}
                >
                  <div className="pay-icon"><i className="fas fa-mobile-screen-button"></i></div>
                  <div className="pay-info">
                    <strong>UPI</strong>
                    <small>Google Pay, PhonePe, Paytm</small>
                  </div>
                  <div className="pay-radio"></div>
                </div>

                <div 
                  className={`pay-option ${selectedPayment === 'Wallet' ? 'selected' : ''}`}
                  onClick={() => setSelectedPayment('Wallet')}
                >
                  <div className="pay-icon"><i className="fas fa-wallet"></i></div>
                  <div className="pay-info">
                    <strong>FOODIFY Wallet</strong>
                    <small>Balance: ₹500.00</small>
                  </div>
                  <div className="pay-radio"></div>
                </div>

                <div 
                  className={`pay-option ${selectedPayment === 'Card' ? 'selected' : ''}`}
                  onClick={() => setSelectedPayment('Card')}
                >
                  <div className="pay-icon"><i className="fas fa-credit-card"></i></div>
                  <div className="pay-info">
                    <strong>Credit / Debit Card</strong>
                    <small>Visa, Mastercard, RuPay</small>
                  </div>
                  <div className="pay-radio"></div>
                </div>

                <div 
                  className={`pay-option ${selectedPayment === 'COD' ? 'selected' : ''}`}
                  onClick={() => setSelectedPayment('COD')}
                >
                  <div className="pay-icon"><i className="fas fa-money-bill-wave"></i></div>
                  <div className="pay-info">
                    <strong>Cash on Delivery</strong>
                    <small>Pay when delivered</small>
                  </div>
                  <div className="pay-radio"></div>
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className="checkout-section">
              <div className="cs-head"><span className="cs-step">3</span><h3>Tip Your Rider</h3></div>
              <div className="tip-options">
                <button className={`tip-btn ${!customTipActive && riderTip === 10 ? 'active' : ''}`} onClick={() => handleTipChange(10)}>
                  ₹10
                </button>
                <button className={`tip-btn ${!customTipActive && riderTip === 20 ? 'active' : ''}`} onClick={() => handleTipChange(20)}>
                  ₹20
                </button>
                <button className={`tip-btn ${!customTipActive && riderTip === 30 ? 'active' : ''}`} onClick={() => handleTipChange(30)}>
                  ₹30
                </button>
                <button className={`tip-btn ${!customTipActive && riderTip === 50 ? 'active' : ''}`} onClick={() => handleTipChange(50)}>
                  ₹50
                </button>
                
                <button 
                  className={`tip-btn ${customTipActive ? 'active' : ''}`}
                  onClick={() => { setCustomTipActive(true); setRiderTip(parseFloat(customTipVal) || 0); }}
                >
                  Other
                </button>

                {customTipActive && (
                  <input 
                    type="number" 
                    placeholder="Enter tip amount"
                    value={customTipVal}
                    onChange={handleCustomTipChange}
                    style={{
                      border: '1.5px solid var(--primary)',
                      borderRadius: 'var(--radius-full)',
                      padding: '8px 16px',
                      fontSize: '13px',
                      maxWidth: '130px',
                      outline: 'none'
                    }}
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="checkout-right">
            <div className="order-summary-card">
              <h3>Order Summary</h3>

              {/* Coupon Code Input */}
              <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                {!couponApplied ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="Enter coupon code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      style={{
                        flex: 1,
                        border: '1.5px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '8px 12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        outline: 'none',
                      }}
                    />
                    <button className="btn-main btn-sm" onClick={handleApplyCoupon}>Apply</button>
                  </div>
                ) : (
                  <div style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--primary-lighter)', padding: '8px 12px', borderRadius: 'var(--radius-md)' 
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)' }}>
                      <i className="fas fa-check-circle"></i> {couponCode} applied — ₹{couponDiscount} off
                    </span>
                    <button onClick={handleRemoveCoupon} style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: 600 }}>
                      Remove
                    </button>
                  </div>
                )}
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Try: WELCOME50, FLAT100, SAVE20
                </div>
              </div>

              <div className="os-breakdown" style={{ marginTop: '12px' }}>
                <div className="os-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="os-row"><span>GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
                <div className="os-row">
                  <span>Delivery Fee</span>
                  <span style={{ color: deliveryFee === 0 ? 'var(--success)' : 'inherit' }}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="os-row"><span>Rider Tip</span><span>₹{riderTip.toFixed(2)}</span></div>
                {couponDiscount > 0 && (
                  <div className="os-row" style={{ color: 'var(--success)' }}>
                    <span>Coupon Discount</span><span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="os-row total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
              </div>
              <div className="os-delivery-time"><i className="fas fa-clock"></i> Estimated delivery in <strong>25-35 min</strong></div>
              
              <button 
                className="btn-main btn-full btn-lg" 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Placing Order...
                  </>
                ) : (
                  <>
                    Place Order — ₹{total.toFixed(2)} <i className="fas fa-arrow-right"></i>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Success Overlay */}
      {showSuccessOverlay && (
        <div className="order-success-overlay">
          <div className="order-success-card">
            <div className="order-success-icon">
              <i className="fas fa-check"></i>
            </div>
            <h2>Order Placed Successfully!</h2>
            <p>Your delicious food is being prepared. You can track your order status in real time now.</p>
            <button className="btn-main btn-full" onClick={handleSuccessClose}>
              Track My Order <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Checkout;
