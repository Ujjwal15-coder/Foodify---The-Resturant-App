import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../store/authSlice';
import { useToast } from '../components/Toast';
import { useState, useEffect } from 'react';

function Profile() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const [darkMode, setDarkMode] = useState(
    document.documentElement.getAttribute('data-theme') === 'dark'
  );

  useEffect(() => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setDarkMode(isDark);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = darkMode ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    setDarkMode(!darkMode);
    toast.success(`${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode enabled!`);
  };

  const handleLogout = async () => {
    const confirm = window.confirm('Are you sure you want to sign out from FOODIFY?');
    if (!confirm) return;

    await dispatch(logoutUser());
    toast.success('Successfully logged out.');
    navigate('/login');
  };

  if (!user) {
    return (
      <section id="page-profile" className="page active">
        <div className="page-inner" style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Please log in to view your profile.</h2>
          <button className="btn-main mt-4" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </section>
    );
  }

  return (
    <section id="page-profile" className="page active">
      <div className="page-inner stagger-in">
        <h1 className="page-title">My Profile</h1>
        <div className="profile-layout">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar-lg">{user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}</div>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <span className="profile-member"><i className="fas fa-crown"></i> Gold Member</span>
            </div>
            <div className="profile-stats">
              <div className="pstat" onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>
                <strong>1</strong>
                <small>Active Order</small>
              </div>
              <div className="pstat" onClick={() => navigate('/wishlist')} style={{ cursor: 'pointer' }}>
                <strong>3</strong>
                <small>Favorites</small>
              </div>
              <div className="pstat" onClick={() => toast.info('Loyalty points system coming soon!')} style={{ cursor: 'pointer' }}>
                <strong>450</strong>
                <small>Points</small>
              </div>
            </div>
          </div>
          <div className="profile-menu-list">
            <div className="pm-section">
              <h4>Account</h4>
              <div className="pm-item" onClick={() => toast.info('Profile edit simulation!')}><i className="fas fa-user-pen"></i><span>Edit Profile</span><i className="fas fa-chevron-right"></i></div>
              <div className="pm-item" onClick={() => toast.info('Saved Addresses list!')}><i className="fas fa-location-dot"></i><span>Saved Addresses</span><i className="fas fa-chevron-right"></i></div>
              <div className="pm-item" onClick={() => navigate('/wallet')}><i className="fas fa-wallet"></i><span>Wallet & Payments</span><i className="fas fa-chevron-right"></i></div>
            </div>
            <div className="pm-section">
              <h4>Activity</h4>
              <div className="pm-item" onClick={() => navigate('/orders')}><i className="fas fa-bag-shopping"></i><span>Order History</span><i className="fas fa-chevron-right"></i></div>
              <div className="pm-item" onClick={() => navigate('/wishlist')}><i className="fas fa-heart"></i><span>Wishlist</span><i className="fas fa-chevron-right"></i></div>
              <div className="pm-item" onClick={() => navigate('/offers')}><i className="fas fa-trophy"></i><span>Rewards & Loyalty</span><i className="fas fa-chevron-right"></i></div>
            </div>
            <div className="pm-section">
              <h4>Preferences</h4>
              <div className="pm-item"><i className="fas fa-globe"></i><span>Language</span><small>English</small><i className="fas fa-chevron-right"></i></div>
              <div className="pm-item">
                <i className="fas fa-moon"></i>
                <span>Dark Mode</span>
                <label className="switch">
                  <input type="checkbox" checked={darkMode} onChange={handleToggleTheme} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            <div className="pm-section">
              <h4>Support</h4>
              <div className="pm-item" onClick={() => navigate('/chat')}><i className="fas fa-headset"></i><span>Help & Support</span><i className="fas fa-chevron-right"></i></div>
              <div className="pm-item" onClick={() => toast.info('FOODIFY v2.1.0 © 2026')}><i className="fas fa-info-circle"></i><span>About FOODIFY</span><small>v2.1.0</small><i className="fas fa-chevron-right"></i></div>
            </div>
            <div className="pm-section">
              <div className="pm-item danger" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                <i className="fas fa-right-from-bracket"></i><span>Logout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;

