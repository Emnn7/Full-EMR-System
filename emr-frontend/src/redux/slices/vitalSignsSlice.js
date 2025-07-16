import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchVitalSigns = createAsyncThunk(
  'vitalSigns/fetchAll',
  async (_, { rejectWithValue }) => { 
    try {
      const response = await api.get('/patients/vital-signs');
      return response.data.data?.vitalSigns || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


export const recordVitalSigns = createAsyncThunk(
  'vitalSigns/record',
  async ({ patientId, vitalData }, { rejectWithValue }) => {
       console.log('Redux action - payload:', { patientId, vitalData });
    try {
      const response = await api.post(`/patients/${patientId}/vital-signs`, vitalData);
      console.log('API response data:', response.data); 
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) {
        return rejectWithValue('You do not have permission to record vital signs');
      }
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const vitalSignsSlice = createSlice({
  name: 'vitalSigns',
  initialState: {
    vitalSigns: [],  // Changed from 'data' to 'vitalSigns' for consistency
    loading: false,  // Added loading state
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVitalSigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVitalSigns.fulfilled, (state, action) => {
        state.loading = false;
        // Make sure to handle both possible response structures
        state.vitalSigns = action.payload.data?.vitalSigns || 
                          action.payload.data || 
                          action.payload || [];
      })
      .addCase(fetchVitalSigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(recordVitalSigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordVitalSigns.fulfilled, (state, action) => {
        state.loading = false;
        state.vitalSigns.push(action.payload.data || action.payload);
      })
      .addCase(recordVitalSigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default vitalSignsSlice.reducer;