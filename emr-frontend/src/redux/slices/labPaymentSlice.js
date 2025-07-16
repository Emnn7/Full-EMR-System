import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Async Thunks
// Update labPaymentSlice.js
export const createLabOrderBilling = createAsyncThunk(
  'labPayment/createLabOrderBilling',
  async (labOrderId, { rejectWithValue }) => {
    try {
      // First try to get the lab order with billing
      const response = await api.get(`/lab-orders/${labOrderId}`);
      const labOrder = response.data.data?.labOrder || response.data.labOrder || response.data;

      if (!labOrder) {
        throw new Error('Lab order not found');
      }

      // If billing exists, return it
      if (labOrder.billing) {
        return labOrder.billing;
      }

      // If no billing, create one
      const billingResponse = await api.post(`/lab-orders/${labOrderId}/create-billing`);
      return billingResponse.data.data?.billing || billingResponse.data.billing;

    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update the processLabOrderPayment thunk
export const processLabOrderPayment = createAsyncThunk(
  'labPayment/processLabOrderPayment',
  async ({ labOrderId, paymentData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/lab-payments/lab-orders/${labOrderId}/process-payment`, paymentData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const checkLabOrderPaymentStatus = createAsyncThunk(
  'labPayment/checkLabOrderPaymentStatus',
  async (labOrderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/lab-orders/${labOrderId}/payment-status`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);



// Slice
const labPaymentSlice = createSlice({
  name: 'labPayment',
  initialState: {
    billing: null,
    paymentStatus: null,
    loading: false,
    error: null,
    paymentProcessing: false,
    paymentSuccess: false
  },
  reducers: {
    resetPaymentState: (state) => {
      state.paymentProcessing = false;
      state.paymentSuccess = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Lab Order Billing
 .addCase(createLabOrderBilling.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(createLabOrderBilling.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.billing = action.payload;
      } else {
        state.error = 'No billing data received';
      }
    })
    .addCase(createLabOrderBilling.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to create billing';
    })
      
      // Check Payment Status
      .addCase(checkLabOrderPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkLabOrderPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentStatus = action.payload.data;
      })
      .addCase(checkLabOrderPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      
      // Process Payment
      .addCase(processLabOrderPayment.pending, (state) => {
        state.paymentProcessing = true;
        state.error = null;
        state.paymentSuccess = false;
      })
   .addCase(processLabOrderPayment.fulfilled, (state, action) => {
      state.paymentProcessing = false;
      state.paymentSuccess = true;
      state.payment = action.payload.payment;
    })
      .addCase(processLabOrderPayment.rejected, (state, action) => {
        state.paymentProcessing = false;
        state.error = action.payload?.message || action.error.message;
      });
  }
});

export const { resetPaymentState } = labPaymentSlice.actions;
export default labPaymentSlice.reducer;