import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications');
      return response.data.notifications;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      return notificationId;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const sendNotification = createAsyncThunk(
  'notifications/sendNotification',
  async (notificationData, { rejectWithValue }) => {
    try {
      const endpoint = notificationData.isBroadcast 
        ? '/api/notifications/broadcast' 
        : '/api/notifications';
        
      const response = await api.post(endpoint, notificationData);
      return response.data.notification || response.data.notifications?.[0];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    unread: [],
    read: [],
    loading: false,
    error: null
  },
  reducers: {
    pushNotification: (state, action) => {
      state.unread.unshift(action.payload);
    },
    addNotification: (state, action) => {
      if (!state.unread.some(n => n._id === action.payload._id)) {
        state.unread.unshift(action.payload);
      }
    },
  clearNotifications: (state) => {
    state.unread = [];
    state.read = [];
  }
  },
   addSocketNotification: (state, action) => {
      if (!state.unread.some(n => n._id === action.payload._id)) {
        state.unread.unshift(action.payload);
      }
    },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.unread = action.payload.filter(n => n.status === 'unread');
        state.read = action.payload.filter(n => n.status === 'read');
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.unread.findIndex(n => n._id === action.payload);
        if (index !== -1) {
          const [notification] = state.unread.splice(index, 1);
          notification.status = 'read';
          state.read.unshift(notification);
        }
      })
      .addCase(sendNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
     .addCase(sendNotification.fulfilled, (state, action) => {
  if (action.payload) {
    state.unread.unshift(action.payload);
  }
})
.addCase(sendNotification.rejected, (state, action) => {
  console.error('Notification failed:', action.payload);
})
  }
});

export const { pushNotification, addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
