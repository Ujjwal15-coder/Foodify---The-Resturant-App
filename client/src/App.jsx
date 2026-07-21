import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from './store/cartSlice';
import { ToastProvider } from './components/Toast';
import ScrollToTop from './components/ScrollToTop';
import MainLayout from './layouts/MainLayout';

// Lazy load all pages for faster initial load
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const RestaurantDetails = lazy(() => import('./pages/RestaurantDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Explore = lazy(() => import('./pages/Explore'));
const Orders = lazy(() => import('./pages/Orders'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Offers = lazy(() => import('./pages/Offers'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Chat = lazy(() => import('./pages/Chat'));
const Profile = lazy(() => import('./pages/Profile'));
const Checkout = lazy(() => import('./pages/Checkout'));
const NotFound = lazy(() => import('./pages/NotFound'));
const DriverPanel = lazy(() => import('./pages/DriverPanel'));

// Lightweight page loading fallback
function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: '28px', color: 'var(--primary)' }}></i>
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);

  // Fetch cart whenever auth state changes to authenticated
  useEffect(() => {
    if (isAuthenticated && localStorage.getItem('token')) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="explore" element={<Explore />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="restaurant/:id" element={<RestaurantDetails />} />
              <Route path="cart" element={<Cart />} />
              <Route path="orders" element={<Orders />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="offers" element={<Offers />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="chat" element={<Chat />} />
              <Route path="profile" element={<Profile />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="driver" element={<DriverPanel />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ToastProvider>
  );
}

export default App;
