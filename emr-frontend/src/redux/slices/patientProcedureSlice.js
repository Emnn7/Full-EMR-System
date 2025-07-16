import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const createPatientProcedure = createAsyncThunk(
  'patientProcedure/create',
  async ({ patientId, procedures, notes }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const availableProcedures = state.procedureCode.codes || []; // Changed from labTestCatalog.tests

      console.log('Available procedures:', availableProcedures);
      console.log('Submitted procedures:', procedures);

      // Validate procedure IDs exist in catalog
      const invalidProcedures = procedures.filter(
        proc => !availableProcedures.some(ap => ap._id.toString() === proc.procedure.toString())
      );

      if (invalidProcedures.length > 0) {
        throw new Error(`Procedures not found in catalog: ${
          invalidProcedures.map(p => p.procedure).join(', ')
        }`);
      }

      const response = await api.post('/patient-procedures', {
        patient: patientId,
        procedures,
        notes: notes || '',
        doctor: state.auth.user._id
      });

      return response.data;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.message || err.message || 'Procedure creation failed',
        details: err.response?.data
      });
    }
  }
);

export const fetchPendingProcedures = createAsyncThunk(
  'patientProcedure/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/patient-procedures?status=pending');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch pending procedures' });
    }
  }
);

export const updateProcedureStatus = createAsyncThunk(
  'patientProcedure/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/patient-procedures/${id}/status`, { status });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to update procedure status' });
    }
  }
);

export const fetchPatientProcedure = createAsyncThunk(
  'patientProcedure/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patient-procedures/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch procedure' });
    }
  }
);

export const fetchProcedureById = createAsyncThunk(
  'procedure/fetchById',
  async (procedureId, { rejectWithValue }) => {
    try {
      console.log('Fetching procedure with ID:', procedureId); // Debug log
      const response = await api.get(`/patient-procedures/${procedureId}`);
      console.log('Procedure response:', response.data); // Debug log
      return response.data.data?.procedure || response.data;
    } catch (err) {
      console.error('Error fetching procedure:', err); // Debug log
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateProcedurePaymentStatus = createAsyncThunk(
  'procedure/updatePaymentStatus',
  async ({ id, status, paymentMethod, paymentType, transactionId, notes }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/patient-procedures/${id}/payment-status`, {
        status,
        paymentMethod,
        paymentType, // Add this
        transactionId, // Optional but good to include
        notes // Optional but good to include
      });
      return response.data;
    } catch (err) {
      console.error('Payment status update error:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data || {
        message: err.message || 'Failed to update payment status'
      });
    }
  }
);

const patientProcedureSlice = createSlice({
  name: 'patientProcedure',
  initialState: {
    pendingProcedures: [],
    currentProcedure: null, 
  loading: false,
  error: null,
  success: false,
  paymentSuccess: false 
  },
  reducers: {
    resetProcedureState: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPatientProcedure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatientProcedure.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createPatientProcedure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create procedure';
      })
      .addCase(fetchPendingProcedures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingProcedures.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingProcedures = action.payload.data?.patientProcedures || [];
      })
      .addCase(fetchPendingProcedures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch procedures';
      })
      .addCase(updateProcedureStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProcedureStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.pendingProcedures = state.pendingProcedures.filter(
          proc => proc._id !== action.payload.data?.patientProcedure?._id
        );
      })
      .addCase(updateProcedureStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update status';
      })
      .addCase(fetchPatientProcedure.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(fetchPatientProcedure.fulfilled, (state, action) => {
  state.loading = false;
  state.currentProcedure = action.payload.data?.patientProcedure;
})
.addCase(fetchPatientProcedure.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload?.message || 'Failed to fetch procedure';
})
.addCase(fetchProcedureById.pending, (state) => {
  state.loading = true;
  state.error = null;
  state.currentProcedure = null; // Reset current procedure
})
.addCase(fetchProcedureById.fulfilled, (state, action) => {
  state.loading = false;
  state.currentProcedure = action.payload.data?.procedure || action.payload;
})
.addCase(fetchProcedureById.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload?.message || 'Failed to fetch procedure';
});
  }
});

export const { resetProcedureState } = patientProcedureSlice.actions;
export default patientProcedureSlice.reducer;