import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchCart } from './store/cartSlice';
import { ToastProvider } from './components/Toast';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MainLayout from './layouts/MainLayout';
import RestaurantDetails from './pages/RestaurantDetails';
import Cart from './pages/Cart';
import Explore from './pages/Explore';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Offers from './pages/Offers';
import Wallet from './pages/Wallet';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import NotFound from './pages/NotFound';
import DriverPanel from './pages/DriverPanel';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(fetchCart());
    }
  }, [dispatch]);

  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
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
      </Router>
    </ToastProvider>
  );
}

export default App;

