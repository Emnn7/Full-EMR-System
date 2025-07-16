import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
export const fetchBillings = createAsyncThunk(
  'billing/fetchBillings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/billings');
      console.log('Full API response:', res.data);
      
      // Correct extraction path - using data.billings instead of data.bills
      const billsData = res.data.data?.billings; // Changed from .bills to .billings
      
      if (!Array.isArray(billsData)) {
        console.error('Invalid bills data structure:', {
          received: res.data,
          extractionPath: 'data.billings',
          extractedValue: billsData
        });
        throw new Error('Bills data is not in expected array format');
      }
      
      console.log('Successfully extracted bills:', billsData);
      return billsData;
    } catch (err) {
      console.error('API Error:', {
        error: err,
        response: err.response?.data
      });
      return rejectWithValue(err.message || 'Failed to fetch bills');
    }
  }
);

export const fetchBills = createAsyncThunk(
  'bills/fetchAll',
  async (patientId) => {
    const response = await api.get(`/patients/${patientId}/bills`);
    return response.data;
  }
);

export const fetchPatientBillings = createAsyncThunk(
  'billing/fetchByPatientId',
  async (patientId, { getState, rejectWithValue }) => {
    try {
     
      const response = await api.get(
        `/billings/patient/${patientId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Server Error');
    }
  }
);

  

export const createBill = createAsyncThunk(
  'bills/create',
  async ({ patientId, billData }) => {
    const response = await api.post(`/patients/${patientId}/bills`, billData);
    return response.data;
  }
);

export const createBilling = createAsyncThunk(
  'billing/createBilling',
  async (billingData, { rejectWithValue }) => {
    try {
      const res = await api.post('/billings', billingData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchUnpaidBills = createAsyncThunk(
  'billing/fetchUnpaid',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/billing/unpaid');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateBillStatus = createAsyncThunk(
  'billing/updateStatus',
  async ({ id, status }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.patch(`/billing/${id}/status`, { status });
      dispatch(fetchUnpaidBills()); // Refresh the list after update
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const billingSlice = createSlice({
  name: 'billing',
  initialState: {
    data: [],
    unpaidBills: [],
    loading: false,
    error: null
  },
  reducers: {
    clearBillingError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBillings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        console.log('Redux state updated with bills:', action.payload);
      })
      .addCase(fetchBillings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Billing fetch failed:', action.payload);
      })
      .addCase(createBilling.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBilling.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(createBilling.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
         .addCase(fetchUnpaidBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnpaidBills.fulfilled, (state, action) => {
        state.loading = false;
        state.unpaidBills = action.payload.data.bills;
      })
      .addCase(fetchUnpaidBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch unpaid bills';
      })
      .addCase(updateBillStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBillStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateBillStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update bill status';
      });
  }
});
export default billingSlice.reducer;