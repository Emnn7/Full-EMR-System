// /src/redux/slices/adminSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchSystemStats = createAsyncThunk('admin/fetchSystemStats', async () => {
  const res = await fetch('/api/systemstats'); // Replace with real endpoint
  return res.json();
});


// Async thunks for fetching data (mockup, modify according to your API)
export const fetchAuditLogs = createAsyncThunk(
  'admin/fetchAuditLogs',
  async ({ limit = 10 } = {}, thunkAPI) => {
    const token = localStorage.getItem('authToken'); // or sessionStorage, or Redux state

    const response = await fetch(`http://localhost:5000/api/admin/auditLogs?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch audit logs');
    }

    const data = await response.json();
    return data.data.auditLogs;
  }
);

export const fetchLabOrders = createAsyncThunk(
  'admin/fetchLabOrders',
  async ({ status = 'pending', limit = 5 } = {}, thunkAPI) => {
    const token = localStorage.getItem('authToken'); // or sessionStorage, or Redux state

    const response = await fetch(`http://localhost:5000/api/lab-orders?status=${status}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch lab orders');
    }

    const data = await response.json();
    return data.data.labOrders;
  }
);


const initialState = {
  auditLogs: [],
  labOrders: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.auditLogs = action.payload;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchLabOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLabOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.labOrders = action.payload;
      })
      .addCase(fetchLabOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default adminSlice.reducer;
