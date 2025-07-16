// src/redux/slices/consultationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const createConsultation = createAsyncThunk(
  'consultations/create',
  async (consultationData, { rejectWithValue }) => {
    try {
      const response = await api.post('/consultations/new', consultationData);
      return response.data;
    } catch (error) {
      // Improved error handling
      return rejectWithValue(error.response?.data || {
        message: error.message,
        status: error.response?.status
      });
    }
  }
);

export const getConsultationsByPatient = createAsyncThunk(
  'consultation/getConsultationsByPatient',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/consultations/by-patient/${patientId}`);
      return { data: response.data.data, patientId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
const initialState = {
  consultationsByPatient: [],
  loading: false,
  error: null,
};

const consultationSlice = createSlice({
  name: 'consultation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createConsultation.pending, (state) => {
        state.loading = true;
      })
     .addCase(createConsultation.fulfilled, (state, action) => {
  state.loading = false;
  const patientId = action.payload.data.patient;
  state.consultationsByPatient = {
    ...state.consultationsByPatient,
    [patientId]: [
      action.payload.data,
      ...(state.consultationsByPatient[patientId] || [])
    ]
  };
})
      .addCase(createConsultation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
     .addCase(getConsultationsByPatient.pending, (state) => {
      state.loading = true;
    })
    .addCase(getConsultationsByPatient.fulfilled, (state, action) => {
  state.loading = false;
  const patientId = action.meta.arg;
  state.consultationsByPatient = {
    ...state.consultationsByPatient,
    [patientId]: action.payload.data
  };
})
      .addCase(getConsultationsByPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default consultationSlice.reducer;