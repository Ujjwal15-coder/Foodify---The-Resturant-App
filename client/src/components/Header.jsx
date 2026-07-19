import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useToast } from './Toast';

function Header({ toggleCart, toggleSidebar }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { items } = useSelector(state => state.cart);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const cartCount = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  const [searchVal, setSearchVal] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [locationAddress, setLocationAddress] = useState(localStorage.getItem('userLocation') || 'B-12, Sector 62, Noida');
  const [isLocating, setIsLocating] = useState(false);
  
  // Voice search state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  
  const notificationRef = useRef(null);

  const notifications = [
    { id: 1, title: 'Order Delivered! 🛵', desc: 'Your Chicken Biryani has been delivered.', time: '10 min ago', unread: true },
    { id: 2, title: '50% Off Offer! 🎁', desc: 'Use coupon WELCOME50 for 50% discount.', time: '2 hours ago', unread: true },
    { id: 3, title: 'Wallet Cashback credited 💰', desc: '₹50.00 cashback added successfully.', time: '1 day ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-detect location on mount if not stored
  useEffect(() => {
    if (!localStorage.getItem('userLocation') && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data && data.address) {
              const addr = data.address;
              const street = addr.road || addr.street || addr.neighbourhood || addr.suburb || '';
              const city = addr.city || addr.town || addr.village || addr.city_district || addr.county || addr.state || '';
              const displayAddress = [street, city].filter(Boolean).join(', ') || addr.country || 'Unknown Location';
              
              const finalAddr = displayAddress.replace(/,\s*$/, '').trim();
              setLocationAddress(finalAddr);
              localStorage.setItem('userLocation', finalAddr);
            }
          } catch (error) {
            console.error("Auto-location failed:", error);
          }
        },
        (error) => console.warn("Auto-location blocked:", error),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setSearchVal(transcript);
        
        // If final result, navigate to search
        if (event.results[0].isFinal) {
          setIsListening(false);
          if (transcript.trim()) {
            navigate(`/explore?search=${encodeURIComponent(transcript.trim())}`);
            toast.success(`Searching for "${transcript.trim()}"`);
          }
        }
      };
      
      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission denied. Please allow microphone access in browser settings.');
        } else if (event.error === 'no-speech') {
          toast.warning('No speech detected. Please try again.');
        } else {
          toast.error(`Voice search error: ${event.error}`);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
      }
    };
  }, [navigate, toast]);

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      toast.error('Voice search is not supported in your browser. Please try Chrome.');
      return;
    }
    
    if (isListening) {
      // Stop listening
      recognitionRef.current.stop();
      setIsListening(false);
      toast.info('Voice search stopped');
    } else {
      // Start listening
      setIsListening(true);
      setSearchVal('');
      toast.info('Listening... Speak now 🎙️');
      try {
        recognitionRef.current.start();
      } catch (e) {
        setIsListening(false);
        toast.error('Could not start voice search. Please try again.');
      }
    }
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    toast.info('Fetching your location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const street = addr.road || addr.street || addr.neighbourhood || addr.suburb || '';
            const city = addr.city || addr.town || addr.village || addr.city_district || addr.county || addr.state || '';
            const displayAddress = [street, city].filter(Boolean).join(', ') || addr.country || 'Unknown Location';
            
            const finalAddr = displayAddress.replace(/,\s*$/, '').trim();
            setLocationAddress(finalAddr);
            localStorage.setItem('userLocation', finalAddr);
            toast.success('Location updated successfully!');
          } else {
            const fallback = `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
            setLocationAddress(fallback);
            localStorage.setItem('userLocation', fallback);
            toast.success('Location updated (coordinates)!');
          }
        } catch (error) {
          console.error(error);
          const fallback = `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
          setLocationAddress(fallback);
          localStorage.setItem('userLocation', fallback);
          toast.success('Location updated (coordinates fallback)!');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error(error);
        toast.error('Unable to retrieve location. Please check browser permissions.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchVal.trim()) {
        navigate(`/explore?search=${encodeURIComponent(searchVal.trim())}`);
      }
    }
  };

  return (
    <header className="top-bar">
      <button className="mobile-menu-btn" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </button>
      <div className="location-pill" onClick={handleFetchLocation} style={{ cursor: 'pointer' }}>
        <i className={isLocating ? "fas fa-spinner fa-spin" : "fas fa-location-dot"}></i>
        <div>
          <small>Deliver to</small>
          <strong>{isLocating ? 'Locating...' : locationAddress}</strong>
        </div>
        <i className="fas fa-chevron-down"></i>
      </div>
      <div className="search-bar">
        <i className="fas fa-search"></i>
        <input 
          type="text" 
          placeholder={isListening ? 'Listening... 🎙️' : 'Search food, restaurants, cuisines...'} 
          id="global-search" 
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          onKeyDown={handleSearchSubmit}
          style={isListening ? { borderColor: 'var(--primary)', background: 'var(--primary-lighter)' } : {}}
        />
        <button 
          className={`voice-search-btn ${isListening ? 'listening' : ''}`}
          title={isListening ? 'Stop Listening' : 'Voice Search'} 
          onClick={handleVoiceSearch}
          style={isListening ? { color: 'var(--danger)', animation: 'pulse 1s infinite' } : {}}
        >
          <i className={isListening ? 'fas fa-stop' : 'fas fa-microphone'}></i>
        </button>
        <button 
          className="filter-btn" 
          title="Filters"
          onClick={() => navigate('/explore')}
        >
          <i className="fas fa-sliders"></i>
        </button>
      </div>
      <div className="header-right">
        <div 
          className="notifications-wrapper" 
          ref={notificationRef}
          style={{ position: 'relative' }}
        >
          <button 
            className="hdr-icon-btn" 
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <i className="fas fa-bell"></i>
            {unreadCount > 0 && <span className="hdr-badge">{unreadCount}</span>}
          </button>
          
          {showNotifications && (
            <div className="notifications-dropdown" style={{
              position: 'absolute',
              top: '50px',
              right: '0',
              width: '320px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1000,
              padding: '16px',
              animation: 'fadeUp 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>Notifications</h4>
                <small style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Mark all as read</small>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    background: n.unread ? 'var(--primary-lighter)' : 'transparent',
                    borderBottom: '1px solid var(--border-light)'
                  }}>
                    <strong style={{ fontSize: '13px', display: 'block' }}>{n.title}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', margin: '2px 0' }}>{n.desc}</span>
                    <small style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{n.time}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


        <button className="hdr-icon-btn cart-btn" title="Cart" onClick={toggleCart}>
          <i className="fas fa-shopping-cart"></i>
          <span className="hdr-badge cart-count">{cartCount}</span>
        </button>
        
        {isAuthenticated && user ? (
          <Link to="/profile" className="hdr-user">
            <div className="hdr-avatar">{user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}</div>
            <div className="hdr-user-info">
              <small>Hello 👋</small>
              <strong>{user.name}</strong>
            </div>
          </Link>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/login" className="hdr-user">
              <div className="hdr-avatar"><i className="fas fa-user"></i></div>
              <div className="hdr-user-info">
                <small>Welcome 👋</small>
                <strong>Sign In</strong>
              </div>
            </Link>
            <Link 
              to="/register" 
              className="btn-main" 
              style={{ 
                padding: '8px 16px', 
                fontSize: '12px', 
                fontWeight: '700',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
