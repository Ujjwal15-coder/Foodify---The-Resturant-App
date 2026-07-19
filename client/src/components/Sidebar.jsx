import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { items } = useSelector(state => state.cart);
  const cartCount = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isActive = (path) => location.pathname === path ? ' active' : '';

  const handleNavClick = (path) => {
    if (onClose) onClose();
    navigate(path);
  };

  return (
    <aside className={`sidebar${isOpen ? ' mobile-open' : ''}`} id="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo" onClick={() => handleNavClick('/')}>
          <i className="fas fa-utensils"></i>
        </div>
      </div>
      <nav className="sidebar-nav">
        <button onClick={() => handleNavClick('/')} className={`nav-item${isActive('/')}`} title="Home">
          <i className="fas fa-house"></i>
          <span className="nav-label">Home</span>
          <span className="nav-tooltip">Home</span>
        </button>
        <button onClick={() => handleNavClick('/explore')} className={`nav-item${isActive('/explore')}`} title="Restaurants">
          <i className="fas fa-store"></i>
          <span className="nav-label">Explore</span>
          <span className="nav-tooltip">Restaurants</span>
        </button>
        <button onClick={() => handleNavClick('/orders')} className={`nav-item${isActive('/orders')}`} title="Orders">
          <i className="fas fa-bag-shopping"></i>
          <span className="nav-label">Orders</span>
          <span className="nav-tooltip">My Orders</span>
          {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
        </button>
        <button onClick={() => handleNavClick('/wishlist')} className={`nav-item${isActive('/wishlist')}`} title="Wishlist">
          <i className="fas fa-heart"></i>
          <span className="nav-label">Wishlist</span>
          <span className="nav-tooltip">Wishlist</span>
        </button>
        <button onClick={() => handleNavClick('/offers')} className={`nav-item${isActive('/offers')}`} title="Offers">
          <i className="fas fa-ticket"></i>
          <span className="nav-label">Offers</span>
          <span className="nav-tooltip">Offers</span>
          <span className="nav-badge hot">!</span>
        </button>
        <button onClick={() => handleNavClick('/wallet')} className={`nav-item${isActive('/wallet')}`} title="Wallet">
          <i className="fas fa-wallet"></i>
          <span className="nav-label">Wallet</span>
          <span className="nav-tooltip">Wallet</span>
        </button>
        <button onClick={() => handleNavClick('/chat')} className={`nav-item${isActive('/chat')}`} title="Support">
          <i className="fas fa-headset"></i>
          <span className="nav-label">Support</span>
          <span className="nav-tooltip">Chat Support</span>
        </button>
        {!isAuthenticated && (
          <button onClick={() => handleNavClick('/register')} className={`nav-item${isActive('/register')}`} title="Register">
            <i className="fas fa-user-plus"></i>
            <span className="nav-label">Register</span>
            <span className="nav-tooltip">Create Account</span>
          </button>
        )}
      </nav>
      <div className="sidebar-bottom">
        <button className="theme-toggle" title="Toggle Theme" onClick={toggleTheme}>
          <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`} id="theme-icon"></i>
          <span className="nav-tooltip">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
        {isAuthenticated && user ? (
          <button onClick={() => handleNavClick('/profile')} className="nav-item" title="Profile">
            <div className="sidebar-avatar">{user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}</div>
            <span className="nav-tooltip">Profile</span>
          </button>
        ) : (
          <button onClick={() => handleNavClick('/login')} className="nav-item" title="Sign In">
            <div className="sidebar-avatar"><i className="fas fa-user"></i></div>
            <span className="nav-tooltip">Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;

