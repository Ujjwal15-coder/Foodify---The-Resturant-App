import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import CartPanel from '../components/CartPanel';

function MainLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { items } = useSelector(state => state.cart);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const cartCount = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const playWelcomeVoice = (userName) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const greeting = userName
      ? `Welcome to Foodify, ${userName}! The app is proudly developed by Ujjwal, Afroz, Saurabh, and Akshat.`
      : `Welcome to Foodify! The app is proudly developed by Ujjwal, Afroz, Saurabh, and Akshat.`;

    const speak = (voices) => {
      const utterance = new SpeechSynthesisUtterance(greeting);

      // Priority order for Indian English female voice
      const voice =
        voices.find(v => v.name === 'Google हिन्दी') ||
        voices.find(v => v.lang === 'en-IN' && v.name.toLowerCase().includes('female')) ||
        voices.find(v => v.lang === 'en-IN') ||
        voices.find(v => v.name.includes('Heera')) ||
        voices.find(v => v.name.includes('Raveena')) ||
        voices.find(v => v.name === 'Google UK English Female') ||
        voices.find(v => v.name === 'Google US English') ||
        voices.find(v => v.name.includes('Zira')) ||
        voices.find(v => v.name.includes('Susan')) ||
        voices.find(v => v.name.includes('Samantha')) ||
        voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
        voices.find(v => v.lang.startsWith('en'));

      if (voice) utterance.voice = voice;

      utterance.lang = 'en-IN';
      utterance.rate = 0.88;
      utterance.pitch = 1.15;
      utterance.volume = 1.0;

      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      speak(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        speak(window.speechSynthesis.getVoices());
      };
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      const hasGreeted = sessionStorage.getItem('welcomeGreeted');
      if (!hasGreeted) {
        // Small delay to allow voices to register
        const timer = setTimeout(() => {
          playWelcomeVoice(user.name);
          sessionStorage.setItem('welcomeGreeted', 'true');
        }, 800);
        return () => clearTimeout(timer);
      }
    } else if (!isAuthenticated) {
      sessionStorage.removeItem('welcomeGreeted');
    }
  }, [isAuthenticated, user]);

  const getActiveCls = (path) => location.pathname === path ? 'bn-item active' : 'bn-item';

  return (
    <div id="app-shell" className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="main-area">
        <Header toggleCart={toggleCart} toggleSidebar={toggleSidebar} />
        <div className="page-transition">
          <Outlet />
        </div>
      </main>
      <CartPanel isOpen={isCartOpen} toggleCart={toggleCart} />
      
      {/* MOBILE BOTTOM NAV */}
      <nav className="bottom-nav" id="bottom-nav">
        <button className={getActiveCls('/')} onClick={() => navigate('/')}>
          <i className="fas fa-house"></i>
          <span>Home</span>
        </button>
        <button className={getActiveCls('/explore')} onClick={() => navigate('/explore')}>
          <i className="fas fa-compass"></i>
          <span>Explore</span>
        </button>
        <button className="bn-item cart-bn" onClick={toggleCart}>
          <i className="fas fa-shopping-bag"></i>
          <span className="bn-badge">{cartCount}</span>
        </button>
        <button className={getActiveCls('/wishlist')} onClick={() => navigate('/wishlist')}>
          <i className="fas fa-heart"></i>
          <span>Wishlist</span>
        </button>
        <button className={getActiveCls('/profile')} onClick={() => navigate('/profile')}>
          <i className="fas fa-user"></i>
          <span>Profile</span>
        </button>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay active" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default MainLayout;

