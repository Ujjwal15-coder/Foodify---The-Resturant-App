import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Send cookies with requests
});

// Add a request interceptor to attach JWT if we store it in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor to handle token expiry or global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    const isAlreadyOnLogin = window.location.pathname === '/login' || window.location.pathname === '/register';

    if (error.response?.status === 401 && !isAuthEndpoint && !isAlreadyOnLogin) {
      // Clear local storage on token expiry
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use React Router-compatible navigation to avoid full page blank
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
