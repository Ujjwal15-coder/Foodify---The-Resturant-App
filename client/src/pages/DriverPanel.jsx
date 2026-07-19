import { useState, useEffect } from 'react';
import LiveMap from '../components/LiveMap';
import { useToast } from '../components/Toast';

export default function DriverPanel() {
  const [driverLocation, setDriverLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState([28.6315, 77.2167]); // Default customer in Delhi
  const [isOnline, setIsOnline] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const toast = useToast();

  useEffect(() => {
    let watchId;
    if (isOnline && "geolocation" in navigator) {
      toast.info("Connecting to GPS...");
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setDriverLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn("GPS error:", error);
          toast.error("Failed to detect location. Please enable GPS.");
          // Fallback location for demo purposes
          setDriverLocation([28.6139, 77.2090]);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    } else {
      setDriverLocation(null);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isOnline, toast]);

  const handleToggleStatus = () => {
    const newState = !isOnline;
    setIsOnline(newState);
    if (newState) {
      // Simulate receiving an order after 3 seconds
      setTimeout(() => {
        setActiveOrder({
          id: 'FD-8921',
          restaurant: 'Burger King',
          customerName: 'Ujjwal',
          items: '2x Whopper, 1x Fries',
          total: 450,
          payment: 'Paid (UPI)',
          // Place customer 3km away from current driver location, or default if missing
        });
        toast.success("New Delivery Request!");
      }, 3000);
    } else {
      setActiveOrder(null);
    }
  };

  // Adjust customer location to be slightly offset from driver when order arrives
  useEffect(() => {
    if (activeOrder && driverLocation) {
      setCustomerLocation([driverLocation[0] + 0.03, driverLocation[1] + 0.03]);
    }
  }, [activeOrder, driverLocation]);

  return (
    <section className="page active" style={{ padding: '0' }}>
      <div style={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        
        {/* Left Sidebar */}
        <div style={{ width: '350px', background: 'var(--bg-card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
            <h2>Partner Panel</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '15px' }}>
              <div>
                <strong>Rahul S.</strong>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ID: RD-4412</p>
              </div>
              <div 
                className={`status-badge ${isOnline ? 'online' : 'offline'}`}
                style={{ 
                  background: isOnline ? 'var(--success)' : 'var(--text-muted)',
                  color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'
                }}
              >
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </div>
            </div>
            <button 
              className={`btn-main btn-full ${isOnline ? 'btn-outline' : ''}`}
              style={{ marginTop: '20px' }}
              onClick={handleToggleStatus}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>

          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: 'var(--bg-main)' }}>
            {!isOnline ? (
              <div className="empty-state" style={{ marginTop: '40px' }}>
                <i className="fas fa-power-off" style={{ fontSize: '40px', color: 'var(--text-muted)', marginBottom: '15px' }}></i>
                <h3>You are offline</h3>
                <p>Go online to start receiving delivery requests.</p>
              </div>
            ) : !activeOrder ? (
              <div className="empty-state" style={{ marginTop: '40px' }}>
                <i className="fas fa-radar fa-spin" style={{ fontSize: '40px', color: 'var(--primary)', marginBottom: '15px' }}></i>
                <h3>Searching for orders...</h3>
                <p>Keep the app open to receive new delivery requests nearby.</p>
              </div>
            ) : (
              <div className="active-order-card" style={{ animation: 'fadeUp 0.3s ease' }}>
                <div style={{ background: 'var(--primary-lighter)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', marginBottom: '10px' }}>
                  NEW ORDER
                </div>
                <h3>{activeOrder.restaurant}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Deliver to: {activeOrder.customerName}</p>
                <div style={{ margin: '15px 0', padding: '15px 0', borderTop: '1px dashed var(--border)', borderBottom: '1px dashed var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Items</span>
                    <span style={{ fontWeight: '500', fontSize: '13px' }}>{activeOrder.items}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Payment</span>
                    <span style={{ fontWeight: '500', fontSize: '13px', color: 'var(--success)' }}>{activeOrder.payment}</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button className="btn-outline" onClick={() => setActiveOrder(null)}>Reject</button>
                  <button className="btn-main" onClick={() => toast.success('Order Accepted! Navigate to restaurant.')}>Accept</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Map Area */}
        <div style={{ flex: 1, position: 'relative' }}>
          {isOnline ? (
            <LiveMap 
              driverPos={driverLocation} 
              customerPos={activeOrder ? customerLocation : null}
              height="100%"
            />
          ) : (
            <div style={{ height: '100%', width: '100%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#9ca3af', fontSize: '18px', fontWeight: '500' }}>
                <i className="fas fa-map-marked-alt" style={{ marginRight: '8px' }}></i> Map Offline
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
