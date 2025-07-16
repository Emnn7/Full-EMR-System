import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authAPI from '../../api/authAPI';
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

// In authSlice.js, add this async thunk:
export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('authToken');
      if (!token) {
        return rejectWithValue('No token found'); // ✅ Send plain string instead of Error
      }

      const response = await authAPI.verifyToken(token);
      return response;
    } catch (err) {
      localStorage.removeItem('authToken');
      return rejectWithValue(err?.response?.data?.message || err.message || 'Token verification failed');
    }
  }
);




export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response; // Return the complete response
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);



const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('authToken');
    },
    clearError: (state) => {
      state.error = null;
    },
  },

    extraReducers: (builder) => {
      builder
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || JSON.parse(localStorage.getItem('user'));
        state.token = action.payload.token || localStorage.getItem('authToken');
        console.log('Token verified - user:', state.user); // Debug
      })
      .addCase(verifyToken.rejected, (state, action) => {
        console.error('Token verification failed:', action.payload);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
        .addCase(login.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(login.fulfilled, (state, action) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.user = action.payload.user;
          localStorage.setItem('authToken', action.payload.token);
          localStorage.setItem('user', JSON.stringify(action.payload.user)); 
        })
        .addCase(login.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || 'Login failed';
        });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;