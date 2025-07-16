import axios from './axios';

/**
 * Authentication API Service
 * Provides methods for user authentication and password management
 */
const authAPI = {
  /**
   * Authenticate user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} User data and auth tokens
   * @throws {Object} Error response from server
   */
  login: async (credentials) => {
    try {
      localStorage.removeItem('authToken');
      
      const response = await axios.post('/auth/login', credentials);
      
      if (!response.data?.token) {
        throw new Error('Invalid login response from server');
      }
      
      localStorage.setItem('authToken', response.data.token);
      
      return response.data;
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        status: error.status,
        isRateLimit: error.isRateLimit,
        timestamp: new Date().toISOString()
      });
      let userMessage = error.message;
      if (error.isRateLimit) {
        userMessage = 'Too many login attempts. Please wait a few minutes and try again.';
      } else if (error.status === 401) {
        userMessage = 'Invalid email or password';
      }
      throw error.response?.data || {
        message: userMessage || 'Login failed. Please try again.',
        status: error.status,
        isRateLimit: error.isRateLimit
      };
    }
  },

  /**
   * Terminate user session
   * @returns {Promise<Object>} Logout confirmation
   * @throws {Object} Error response from server
   */
  logout: async () => {
    try {
      const response = await axios.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout failed:', {
        endpoint: '/auth/logout',
        error: error.response?.data || error.message
      });
      throw error.response?.data || {
        message: 'Logout failed. Please try again.',
        status: error.response?.status
      };
    }
  },

  /**
   * Initiate password reset
   * @param {string} email - User's registered email
   * @returns {Promise<Object>} Reset confirmation
   * @throws {Object} Error response from server
   */
  forgotPassword: async (email) => {
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Password reset request failed:', {
        endpoint: '/auth/forgot-password',
        error: error.response?.data || error.message,
        email
      });
      throw error.response?.data || {
        message: 'Password reset failed. Please try again.',
        status: error.response?.status
      };
    }
  },

  /**
   * Complete password reset
   * @param {Object} data - Reset data
   * @param {string} data.token - Password reset token
   * @param {string} data.newPassword - New password
   * @returns {Promise<Object>} Reset result
   * @throws {Object} Error response from server
   */
  resetPassword: async (data) => {
    try {
      const response = await axios.post('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      console.error('Password reset failed:', {
        endpoint: '/auth/reset-password',
        error: error.response?.data || error.message
      });
      throw error.response?.data || {
        message: 'Password update failed. Please try again.',
        status: error.response?.status
      };
    }
  }
};

export default authAPI;