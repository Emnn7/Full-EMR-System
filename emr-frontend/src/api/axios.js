import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
instance.interceptors.request.use(config => {
  if (!config.url.includes('/auth/login')) {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    // Normalize login response structure
    if (response.config.url.includes('/auth/login')) {
      return {
        ...response,
        data: {
          user: response.data.data?.user || response.data.user,
          token: response.data.token,
          status: response.data.status
        }
      };
    }
    return response;
  },
  (error) => {
    // Enhanced error handling
    const errorInfo = {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      code: error.code,
      isRateLimit: error.response?.status === 429
    };

    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }

    return Promise.reject(errorInfo);
  }
);

export default instance;


