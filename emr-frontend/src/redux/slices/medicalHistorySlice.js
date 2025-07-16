// src/redux/slices/medicalHistorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Async action to create medical history
export const createMedicalHistory = createAsyncThunk(
  'medicalHistory/createMedicalHistory',
  async ({ patientId, doctorId, historyData }, { rejectWithValue }) => {
    try {
      const payload = {
        patient: patientId,
        doctor: doctorId,
        ...historyData,
        allergies: historyData.allergies || [],
        currentMedications: historyData.currentMedications || [],
      };

      const response = await api.post('/medicalHistory', payload);
      return response.data;
    } catch (err) {
      console.error('Error creating medical history:', err.response?.data || err.message);
      return rejectWithValue({
        message: err.response?.data?.message || 'Failed to create medical history',
        details: err.response?.data?.errors || null,
        status: err.response?.status || 500
      });
    }
  }
);

// Async action to update medical history
// In medicalHistorySlice.js
export const updateMedicalHistory = createAsyncThunk(
  'medicalHistory/updateMedicalHistory',
  async ({ patientId, historyId, historyData }, { rejectWithValue }) => {
    try {
      const payload = {
        ...historyData,
        patient: patientId,
        allergies: historyData.allergies || [],
        currentMedications: historyData.currentMedications || [],
      };

      const response = await api.put(`/medicalHistory/${historyId}`, payload);
      return response.data;
    } catch (err) {
      console.error('Error updating medical history:', err.response?.data || err.message);
      return rejectWithValue({
        message: err.response?.data?.message || 'Failed to update medical history',
        details: err.response?.data?.errors || null,
        status: err.response?.status || 500
      });
    }
  }
);

// Async action to fetch medical history by ID
export const fetchMedicalHistoryById = createAsyncThunk(
  'medicalHistory/fetchMedicalHistoryById',
  async (historyId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/medicalHistory/${historyId}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching medical history:', err.response?.data || err.message);
      return rejectWithValue({
        message: err.response?.data?.message || 'Failed to fetch medical history',
        details: err.response?.data?.errors || null,
        status: err.response?.status || 500
      });
    }
  }
);

// Async action to fetch medical history by patient
export const fetchPatientMedicalHistory = createAsyncThunk(
  'medicalHistory/fetchPatientMedicalHistory',
  async (params, { rejectWithValue }) => {
    try {
      let url;
      if (typeof params === 'string') {
        url = `/medicalHistory/patient/${params}`;
      } else {
        url = params.doctorId 
          ? `/medicalHistory/doctor/${params.doctorId}`
          : `/medicalHistory/patient/${params.patientId}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  data: [],
  currentHistory: null, // For storing single history record
  loading: false,
  error: null,
  createStatus: 'idle',
  updateStatus: 'idle',
};

const medicalHistorySlice = createSlice({
  name: 'medicalHistory',
  initialState,
  reducers: {
    resetMedicalHistoryState: (state) => {
      state.loading = false;
      state.error = null;
      state.createStatus = 'idle';
      state.updateStatus = 'idle';
      state.currentHistory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Medical History Cases
      .addCase(createMedicalHistory.pending, (state) => {
        state.loading = true;
        state.createStatus = 'loading';
        state.error = null;
      })
      .addCase(createMedicalHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.createStatus = 'succeeded';
        state.data = action.payload.data;
      })
      .addCase(createMedicalHistory.rejected, (state, action) => {
        state.loading = false;
        state.createStatus = 'failed';
        state.error = action.payload;
      })
      
      // Update Medical History Cases
      .addCase(updateMedicalHistory.pending, (state) => {
        state.loading = true;
        state.updateStatus = 'loading';
        state.error = null;
      })
      .addCase(updateMedicalHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.updateStatus = 'succeeded';
        // Update the specific history in data array if it exists
        if (state.data && Array.isArray(state.data)) {
          state.data = state.data.map(item => 
            item._id === action.payload._id ? action.payload : item
          );
        }
        state.currentHistory = action.payload;
      })
      .addCase(updateMedicalHistory.rejected, (state, action) => {
        state.loading = false;
        state.updateStatus = 'failed';
        state.error = action.payload;
      })
      
      // Fetch Medical History by ID Cases
      .addCase(fetchMedicalHistoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentHistory = null;
      })
      .addCase(fetchMedicalHistoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentHistory = action.payload;
      })
      .addCase(fetchMedicalHistoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Patient Medical History Cases
      .addCase(fetchPatientMedicalHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientMedicalHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.data = Array.isArray(action.payload) 
          ? action.payload 
          : action.payload.data || action.payload.medicalHistory || [];
      })
      .addCase(fetchPatientMedicalHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetMedicalHistoryState } = medicalHistorySlice.actions;
export default medicalHistorySlice.reducer;