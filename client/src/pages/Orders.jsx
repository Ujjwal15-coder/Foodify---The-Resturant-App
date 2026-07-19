import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import LiveMap from '../components/LiveMap';

function Orders() {
  const toast = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Active');
  const [customerLocation, setCustomerLocation] = useState(null);
  
  // Load and manage orders in state
  const [placedOrders, setPlacedOrders] = useState([]);

  useEffect(() => {
    const loadOrders = () => {
      const orders = JSON.parse(localStorage.getItem('placedOrders')) || [];
      setPlacedOrders(orders);
    };

    loadOrders();
    
    // Listen for storage changes
    window.addEventListener('storage', loadOrders);
    
    // Request customer location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCustomerLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn("Geolocation denied or failed:", error);
          // Default location if denied (Connaught Place, Delhi)
          setCustomerLocation([28.6315, 77.2167]);
        }
      );
    } else {
      setCustomerLocation([28.6315, 77.2167]);
    }

    return () => window.removeEventListener('storage', loadOrders);
  }, []);

  // 6-step tracking: Confirmed → Preparing → Food Ready → Picked Up → On The Way → Delivered
  const trackingSteps = ['Confirmed', 'Preparing', 'Food Ready', 'Picked Up', 'On The Way', 'Delivered'];

  // Effect to dynamically transition tracking steps over time
  useEffect(() => {
    const interval = setInterval(() => {
      let updated = false;
      const newOrders = placedOrders.map(order => {
        if (order.status !== 'Active') return order;

        const ageMs = Date.now() - (order.timestamp || Date.now());
        let newStep = order.step;
        let newStatus = order.status;

        // Transition logic (realistic timing)
        if (ageMs > 180000) { // 3 min → Delivered & Completed
          newStep = 'Delivered';
          newStatus = 'Completed';
          updated = true;
          toast.success(`Order #${order.id} from ${order.restaurant} has been delivered! 🎉`);
        } else if (ageMs > 140000) { // 2:20 → On The Way
          if (order.step !== 'On The Way') {
            newStep = 'On The Way';
            updated = true;
            toast.info(`Order #${order.id} is out for delivery! 🛵`);
          }
        } else if (ageMs > 100000) { // 1:40 → Picked Up
          if (order.step !== 'Picked Up') {
            newStep = 'Picked Up';
            updated = true;
            toast.info(`Order #${order.id} has been picked up by the rider! 📦`);
          }
        } else if (ageMs > 60000) { // 1 min → Food Ready
          if (order.step !== 'Food Ready') {
            newStep = 'Food Ready';
            updated = true;
            toast.info(`Order #${order.id} food is ready for pickup! ✅`);
          }
        } else if (ageMs > 20000) { // 20 sec → Preparing
          if (order.step !== 'Preparing') {
            newStep = 'Preparing';
            updated = true;
            toast.info(`Order #${order.id} is being prepared by the kitchen. 🍳`);
          }
        }

        if (newStep !== order.step || newStatus !== order.status) {
          return { ...order, step: newStep, status: newStatus };
        }
        return order;
      });

      if (updated) {
        setPlacedOrders(newOrders);
        localStorage.setItem('placedOrders', JSON.stringify(newOrders));
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [placedOrders, toast]);

  const completedOrdersList = placedOrders.filter(o => o.status === 'Completed');
  const cancelledOrdersList = placedOrders.filter(o => o.status === 'Cancelled');
  const activeOrdersList = placedOrders.filter(o => o.status === 'Active');

  const getStepIndex = (step) => trackingSteps.indexOf(step);

  const handleCancelOrder = (orderId) => {
    const confirm = window.confirm(`Are you sure you want to cancel order #${orderId}?`);
    if (!confirm) return;

    const newOrders = placedOrders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'Cancelled' };
      }
      return o;
    });
    setPlacedOrders(newOrders);
    localStorage.setItem('placedOrders', JSON.stringify(newOrders));
    toast.warning(`Order #${orderId} was cancelled successfully.`);
  };

  const handleReorder = (order) => {
    toast.success(`Added items from ${order.restaurant} back to cart!`);
    navigate('/explore');
  };

  // Calculate simulated driver position based on step
  const getDriverLocation = (step, dest) => {
    if (!dest) return null;
    
    // Starting point is slightly offset from customer (simulate restaurant)
    // 0.02 lat/lng is roughly 2km
    const start = [dest[0] - 0.02, dest[1] - 0.02];
    
    const progress = { 
      'Confirmed': 0, 
      'Preparing': 0, 
      'Food Ready': 0, 
      'Picked Up': 0.1, 
      'On The Way': 0.6, 
      'Delivered': 1 
    }[step] || 0;

    return [
      start[0] + (dest[0] - start[0]) * progress,
      start[1] + (dest[1] - start[1]) * progress
    ];
  };

  return (
    <section id="page-orders" className="page active">
      <div className="page-inner stagger-in">
        <h1 className="page-title">My Orders</h1>
        
        <div className="order-tabs">
          {['Active', 'Completed', 'Cancelled'].map(tab => (
            <button 
              key={tab} 
              className={`otab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Active' ? `Active (${activeOrdersList.length})` : tab === 'Completed' ? `Completed (${completedOrdersList.length})` : `Cancelled (${cancelledOrdersList.length})`}
            </button>
          ))}
        </div>
        
        {/* Active Order Live Tracker */}
        {activeTab === 'Active' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activeOrdersList.map(order => (
              <div key={order.id} className="active-order-card" style={{ animation: 'fadeUp 0.4s ease', position: 'relative' }}>
                <div className="tracking-card">
                  <div className="tracking-header">
                    <div>
                      <small>Order #{order.id}</small>
                      <h3>Your order from {order.restaurant} is {order.step.toLowerCase()}! 🛵</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{order.items}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Paid: ₹{typeof order.total === 'number' ? order.total.toFixed(2) : order.total} via {order.paymentMethod || 'UPI'}
                      </p>
                    </div>
                    {/* ETA + Cancel — stacked, no overlap */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flexShrink: 0 }}>
                      <span className="tracking-eta">
                        <i className="fas fa-clock"></i>{' '}
                        {order.step === 'Confirmed' ? 'ETA: 30 min' : order.step === 'Preparing' ? 'ETA: 25 min' : order.step === 'Food Ready' ? 'ETA: 15 min' : order.step === 'Picked Up' ? 'ETA: 10 min' : 'ETA: 5 min'}
                      </span>
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          border: '1.5px solid var(--danger)',
                          color: 'var(--danger)',
                          background: 'var(--danger-bg)',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.target.style.background = 'var(--danger)'; e.target.style.color = '#fff'; }}
                        onMouseLeave={e => { e.target.style.background = 'var(--danger-bg)'; e.target.style.color = 'var(--danger)'; }}
                      >
                        <i className="fas fa-xmark" style={{ marginRight: '4px' }}></i>Cancel Order
                      </button>
                    </div>
                  </div>
                  
                  {/* Real Live Map */}
                  <div className="tracking-map" style={{ height: '300px', width: '100%', marginBottom: '20px' }}>
                    <LiveMap 
                      customerPos={customerLocation} 
                      driverPos={getDriverLocation(order.step, customerLocation)}
                    />
                  </div>
                  
                  {/* 6-Step Tracking */}
                  <div className="tracking-steps">
                    {trackingSteps.map((step, idx) => {
                      const currentIdx = getStepIndex(order.step);
                      const isDone = idx <= currentIdx;
                      const isActive = idx === currentIdx + 1;
                      const isLast = idx === trackingSteps.length - 1;
                      return (
                        <div key={step} className={`tstep ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                          <div className="tstep-dot">
                            {isDone ? <i className="fas fa-check"></i> : isActive ? <div className="pulse-dot"></div> : null}
                          </div>
                          {!isLast && <div className="tstep-line"></div>}
                          <div className="tstep-info" style={{ display: 'block' }}>
                            <strong>{step}</strong>
                            <small>{isDone ? '✓ Done' : isActive ? 'In Progress' : 'Pending'}</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="rider-card">
                    <div className="rider-avatar">RS</div>
                    <div className="rider-info">
                      <strong>Rahul S.</strong>
                      <small>Honda Activa • UP-32 XX 1234</small>
                    </div>
                    <div className="rider-actions">
                      <button className="rider-btn call" onClick={() => toast.success('Calling rider Rahul S...')}>
                        <i className="fas fa-phone"></i>
                      </button>
                      <button className="rider-btn msg" onClick={() => toast.info('Opening chat with rider...')}>
                        <i className="fas fa-message"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {activeOrdersList.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon"><i className="fas fa-receipt"></i></div>
                <h3>No Active Orders</h3>
                <p>Order some delicious food to track it here in real time!</p>
                <button className="btn-main btn-sm" onClick={() => navigate('/explore')} style={{ marginTop: '12px' }}>
                  Explore Restaurants
                </button>
              </div>
            )}
          </div>
        )}

        {/* Completed Orders List */}
        {activeTab === 'Completed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'fadeUp 0.4s ease' }}>
            {completedOrdersList.map(order => (
              <div key={order.id} className="order-history-card">
                <div className="oh-header">
                  <div className="oh-rest">
                    <h4>{order.restaurant}</h4>
                    <small>{order.date} • Order #{order.id}</small>
                  </div>
                  <span className="oh-status delivered">
                    <i className="fas fa-circle-check"></i> Delivered
                  </span>
                </div>
                <div className="oh-items">{order.items}</div>
                <div className="oh-footer">
                  <div>
                    <span className="oh-total">Total: ₹{typeof order.total === 'number' ? order.total.toFixed(2) : order.total}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                      via {order.paymentMethod || 'UPI'}
                    </span>
                  </div>
                  <button 
                    className="btn-outline btn-sm" 
                    onClick={() => handleReorder(order)}
                  >
                    Reorder <i className="fas fa-rotate-right"></i>
                  </button>
                </div>
              </div>
            ))}
            {completedOrdersList.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon"><i className="fas fa-circle-check"></i></div>
                <h3>No Completed Orders</h3>
                <p>Orders that you have successfully received will be listed here.</p>
              </div>
            )}
          </div>
        )}

        {/* Cancelled Orders List */}
        {activeTab === 'Cancelled' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'fadeUp 0.4s ease' }}>
            {cancelledOrdersList.map(order => (
              <div key={order.id} className="order-history-card">
                <div className="oh-header">
                  <div className="oh-rest">
                    <h4>{order.restaurant}</h4>
                    <small>{order.date} • Order #{order.id}</small>
                  </div>
                  <span className="oh-status cancelled">
                    <i className="fas fa-circle-xmark"></i> Cancelled
                  </span>
                </div>
                <div className="oh-items">{order.items}</div>
                <div className="oh-footer">
                  <span className="oh-total">Cancelled Amount: ₹{typeof order.total === 'number' ? order.total.toFixed(2) : order.total}</span>
                  <span className="oh-refund"><i className="fas fa-circle-check"></i> Refunded to Wallet</span>
                </div>
              </div>
            ))}
            {cancelledOrdersList.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon"><i className="fas fa-ban"></i></div>
                <h3>No Cancelled Orders</h3>
                <p>You haven't cancelled any orders yet.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}

export default Orders;
