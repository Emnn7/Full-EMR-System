import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Existing thunks
export const fetchLabOrders = createAsyncThunk(
  'labOrders/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/lab-orders', {
        params: {
          status: 'pending',
          limit: 5,
          ...params
        }
      });
      
      // Handle both possible response structures
      const labOrders = response.data.data?.labOrders || response.data.labOrders || [];
      return labOrders;
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);



export const fetchLabOrder = createAsyncThunk(
  'labOrder/fetchOne',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/lab-orders/${orderId}`);
      // Ensure this matches your API response structure
      return response.data.data?.labOrder || response.data.labOrder || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchLabReports = createAsyncThunk(
  'labOrders/fetchReports',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/lab-reports', {
        params: {
          ...params
        }
      });
      return response.data.data?.labReports || response.data.labReports || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


export const updateLabOrderStatus = createAsyncThunk(
  'labOrder/updateStatus',
  async ({ id, status, paymentMethod }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/lab-orders/${id}/status`, {
        status,
        paymentMethod // ✅ include it in the request body
      });
      return response.data.data?.order;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


// In labOrderSlice.js
export const createLabOrder = createAsyncThunk(
  'labOrder/createLabOrder',
  async (orderData, { rejectWithValue }) => {  // Receive orderData directly
    try {
      const response = await api.post('/lab-orders', orderData);
      return response.data;
    } catch (err) {
      console.error('Error creating lab order:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchDoctorLabOrders = createAsyncThunk(
  'labOrder/fetchDoctorLabOrders',
  async (doctorId) => {
    const response = await api.get(`/my-lab-orders/doctor/${doctorId}`);
    return response.data;
  }
);

export const createLabReport = createAsyncThunk(
  'labReport/create',
  async (reportData, { rejectWithValue }) => {
    try {
      const response = await api.post('/lab-reports', reportData);
      return response.data.data?.labReport || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchPendingLabOrders = createAsyncThunk(
  'labOrders/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/lab-orders/pending-payment');
      return response.data.data?.labOrders || response.data.labOrders || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateLabOrderPaymentStatus = createAsyncThunk(
  'labOrder/updatePaymentStatus',
  async ({ id, status, paymentMethod }, { rejectWithValue }) => {  // Add paymentMethod parameter
    try {
      console.log('Sending payment update:', { id, status, paymentMethod });
      const response = await api.patch(`/lab-orders/${id}/payment-status`, { 
        status,
        paymentMethod  // Explicitly include paymentMethod in the request body
      });
      return response.data.data?.order;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchPendingPaymentOrders = createAsyncThunk(
  'labOrders/fetchPendingPayment',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/lab-orders/pending-payment');
      return response.data.data?.labOrders || response.data.labOrders || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchPaidOrders = createAsyncThunk(
  'labOrders/fetchPaid',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/lab-orders/paid');
      return response.data.data?.labOrders || response.data.labOrders || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  labOrders: [],
  pendingLabOrders: [],
  currentOrder: null,  // Add this to store the single fetched order
  labReports: [],
  paidOrders: [],
  pendingPaymentOrders: [],
  loading: false,
  error: null
};

const labOrderSlice = createSlice({
  name: 'labOrder',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Lab Orders
      .addCase(fetchLabOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
     // In your Redux slice
.addCase(fetchLabOrders.fulfilled, (state, action) => {
  console.log('Fetched lab orders:', action.payload);
  state.loading = false;
  state.labOrders = action.payload;
})
      .addCase(fetchLabOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchLabOrder.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(fetchLabOrder.fulfilled, (state, action) => {
  state.loading = false;
  state.currentOrder = action.payload.data?.labOrder || action.payload.labOrder || action.payload;
})
.addCase(fetchLabOrder.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})
      
      // Fetch Lab Reports
      .addCase(fetchLabReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchLabReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Order Status
      .addCase(updateLabOrderStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateLabOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload;
        state.labOrders = state.labOrders.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        );
      })
      .addCase(updateLabOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Lab Order
      .addCase(createLabOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createLabOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.labOrders.push(action.payload);
      })
      .addCase(createLabOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Doctor Lab Orders
      .addCase(fetchDoctorLabOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDoctorLabOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.labOrders = action.payload;
      })
      .addCase(fetchDoctorLabOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPendingLabOrders.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(fetchPendingLabOrders.fulfilled, (state, action) => {
  state.loading = false;
  state.pendingLabOrders = action.payload;
})
.addCase(fetchPendingLabOrders.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})
.addCase(updateLabOrderPaymentStatus.fulfilled, (state, action) => {
  state.loading = false;
  state.pendingLabOrders = state.pendingLabOrders.filter(
    order => order._id !== action.payload._id
  );
})
.addCase(fetchPendingPaymentOrders.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(fetchPendingPaymentOrders.fulfilled, (state, action) => {
  state.loading = false;
  // Handle all possible response structures
  state.pendingPaymentOrders = action.payload?.data?.labOrders || 
                              action.payload?.labOrders || 
                              action.payload || 
                              [];
})

.addCase(fetchPendingPaymentOrders.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})

.addCase(fetchPaidOrders.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(fetchPaidOrders.fulfilled, (state, action) => {
  state.loading = false;
  // Handle all possible response structures
  state.paidOrders = action.payload?.data?.labOrders || 
                    action.payload?.labOrders || 
                    action.payload || 
                    [];
})
.addCase(fetchPaidOrders.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})
  }
});

export default labOrderSlice.reducer;