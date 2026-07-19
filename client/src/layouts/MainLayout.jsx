import { useState } from 'react';
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
  const cartCount = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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

