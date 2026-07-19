import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/authSlice';
import { useToast } from '../components/Toast';

function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
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

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!password) return { percent: '0%', text: 'None', color: 'var(--text-muted)' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { percent: '33%', text: 'Weak ⚠️', color: 'var(--danger)' };
    if (score <= 4) return { percent: '66%', text: 'Medium 👍', color: 'var(--warning)' };
    return { percent: '100%', text: 'Strong 💪', color: 'var(--success)' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    if (!agreedToTerms) {
      toast.error('Please agree to the Terms & Conditions to create your account.');
      return;
    }
    const resultAction = await dispatch(registerUser({ name, phone, email, password }));
    if (registerUser.fulfilled.match(resultAction)) {
      toast.success('Account created successfully! Welcome to FOODIFY.');
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
            <h2>Join the foodie family!</h2>
            <p>Create your account and start exploring amazing food near you.</p>
            <img src="/assets/promo-pizza.png" alt="Food" className="auth-left-img" />
          </div>
        </div>
        <div className="auth-right">
          <form className="auth-form-wrap" onSubmit={handleSubmit}>
            <h2>Create Account</h2>
            <p className="auth-subtitle">Fill in your details to get started.</p>

            <div className="input-row-2col">
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-wrap">
                  <i className="fas fa-user"></i>
                  <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                </div>
              </div>
              <div className="input-group">
                <label>Phone</label>
                <div className="input-wrap">
                  <i className="fas fa-phone"></i>
                  <input type="tel" placeholder="+91 99999 99999" value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrap">
                <i className="fas fa-envelope"></i>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="input-row-2col">
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
              <div className="input-group">
                <label>Confirm Password</label>
                <div className="input-wrap">
                  <i className="fas fa-lock"></i>
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    required 
                  />
                  <button 
                    type="button" 
                    className="input-toggle-pw"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="pw-strength">
              <div className="pw-bar">
                <div 
                  className="pw-fill" 
                  style={{ width: strength.percent, backgroundColor: strength.color }}
                ></div>
              </div>
              <span style={{ color: strength.color }}>{strength.text}</span>
            </div>

            <label className="checkbox-wrap">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={e => setAgreedToTerms(e.target.checked)}
              />
              <span className="custom-check"></span>
              I agree to the <a href="#" className="text-link" onClick={(e) => { e.preventDefault(); toast.info('Terms & Conditions popup coming soon!'); }}>Terms &amp; Conditions</a>
            </label>

            <button type="submit" className="btn-main btn-full" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creating...
                </>
              ) : (
                <>
                  Create Account <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>

            <p className="auth-switch-text">Already have an account? <Link to="/login">Sign In</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;

