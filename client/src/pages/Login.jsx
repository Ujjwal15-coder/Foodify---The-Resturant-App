import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/authSlice';
import { useToast } from '../components/Toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      toast.success('Successfully signed in! Welcome back.');
      navigate('/');
    }
  };


  return (
    <div className="auth-overlay">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-left-content">
            <div className="auth-brand">
              <div className="auth-brand-icon"><i className="fas fa-utensils"></i></div>
              <span>FOODIFY</span>
            </div>
            <h2>Welcome back, foodie!</h2>
            <p>Order your favorite meals from the best restaurants in your city.</p>
            <div className="auth-features">
              <div className="auth-feature"><i className="fas fa-bolt"></i> Lightning fast delivery</div>
              <div className="auth-feature"><i className="fas fa-percent"></i> Exclusive daily deals</div>
              <div className="auth-feature"><i className="fas fa-heart"></i> Curated recommendations</div>
            </div>
            <img src="/assets/food-grid.png" alt="Food" className="auth-left-img" />
          </div>
        </div>
        <div className="auth-right">
          <form className="auth-form-wrap" onSubmit={handleSubmit}>
            <h2>Sign In</h2>
            <p className="auth-subtitle">Welcome back! Please enter your details.</p>

            <div className="social-btns">
              <button 
                type="button" 
                className="social-btn" 
                onClick={() => toast.info('Google login simulation coming soon!')}
              >
                <i className="fab fa-google"></i> Google
              </button>
              <button 
                type="button" 
                className="social-btn" 
                onClick={() => toast.info('Apple login simulation coming soon!')}
              >
                <i className="fab fa-apple"></i> Apple
              </button>
            </div>

            <div className="auth-divider"><span>or continue with email</span></div>

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrap">
                <i className="fas fa-envelope"></i>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrap">
                <i className="fas fa-lock"></i>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button" 
                  className="input-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                </button>
              </div>
            </div>

            <div className="input-row">
              <label className="checkbox-wrap">
                <input type="checkbox" defaultChecked />
                <span className="custom-check"></span>
                Remember me
              </label>
              <button 
                type="button" 
                className="text-link" 
                onClick={() => toast.info('Password reset simulation coming soon!')}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="btn-main btn-full" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Signing In...
                </>
              ) : (
                <>
                  Sign In <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>

            <p className="auth-switch-text">Don't have an account? <Link to="/register">Sign Up</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
