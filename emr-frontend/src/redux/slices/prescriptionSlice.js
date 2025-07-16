import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Fetch all prescriptions
export const fetchPrescriptions = createAsyncThunk(
  'prescription/fetchAll',
  async () => {
    const response = await api.get('/prescriptions');
    return response.data;
  }
);

// Fetch prescriptions for a specific patient
export const fetchPatientPrescriptions = createAsyncThunk(
  'prescription/fetchPatientPrescriptions',
  async (patientId) => {
    const response = await api.get(`/prescriptions/patient/${patientId}`); // Corrected patientId
    return response.data;
  }
);

// Add a new prescription
export const addPrescription = createAsyncThunk(
  'prescription/add',
  async (prescriptionData) => {
    const response = await api.post('/prescriptions', prescriptionData);
    return response.data;
  }
);

// Set the current prescription
export const setCurrentPrescription = createAsyncThunk(
  'prescription/setCurrent',
  async (prescriptionId) => {
    const response = await api.get(`/prescriptions/${prescriptionId}`);
    return response.data;
  }
);

export const fetchDoctorPrescriptions = createAsyncThunk(
  'prescription/fetchDoctorPrescriptions',
  async (doctorId) => {
    const response = await api.get(`/prescriptions/doctor/${doctorId}`);
    return response.data;
  }
);

// Initial state of the slice
const initialState = {
  prescriptions: [],
  currentPrescription: null,
  loading: false,
  error: null
};

// Prescription slice
const prescriptionSlice = createSlice({
  name: 'prescription',
  initialState,
  reducers: {}, // No reducers added here, extraReducers is used for side effects
  extraReducers: (builder) => {
    builder
      // Handling fetchPrescriptions async thunk
      .addCase(fetchPrescriptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload?.data?.prescriptions || [];
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchDoctorPrescriptions.pending, (state) => {
  state.loading = true;
})
.addCase(fetchDoctorPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload?.data?.prescriptions || [];
      })
.addCase(fetchDoctorPrescriptions.rejected, (state, action) => {
  state.loading = false;
  state.error = action.error.message;
})
      
      // Handling fetchPatientPrescriptions async thunk
      .addCase(fetchPatientPrescriptions.pending, (state) => {
        state.loading = true;
      })
    .addCase(fetchPatientPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload?.data?.prescriptions || [];
      })
      .addCase(fetchPatientPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Handling addPrescription async thunk
     .addCase(addPrescription.fulfilled, (state, action) => {
        state.prescriptions = [action.payload?.data?.prescription, ...state.prescriptions];
      })

      
      // Handling setCurrentPrescription async thunk
      .addCase(setCurrentPrescription.fulfilled, (state, action) => {
        state.currentPrescription = action.payload?.data?.prescription;
      });
  }
});

export default prescriptionSlice.reducer;
