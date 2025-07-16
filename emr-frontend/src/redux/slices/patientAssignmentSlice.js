import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api  from '../../api/axios';

// Async Thunks
export const fetchUnassignedPatients = createAsyncThunk(
  'patientAssignment/fetchUnassigned',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/patients/unassigned');
      return response.data.data.patients;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

export const fetchPatientsByDoctor = createAsyncThunk(
  'patientAssignment/fetchByDoctor',
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patients/by-doctor/${doctorId}`);
      return { doctorId, patients: response.data.data.patients };
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);
export const assignDoctorToPatient = createAsyncThunk(
  'patientAssignment/assignDoctor',
  async ({ patientId, doctorId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/patients/assign-doctor', { patientId, doctorId });
      return response.data.data; // Return the updated patient data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


export const unassignDoctorFromPatient = createAsyncThunk(
  'patientAssignment/unassign',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/patients/${patientId}/doctor`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchAllAssignedPatients = createAsyncThunk(
  'patientAssignment/fetchAllAssigned',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/patients/assignments');
      return response.data.data.assignments;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Slice
const patientAssignmentSlice = createSlice({
  name: 'patientAssignment',
  initialState: {
    unassignedPatients: [],
    assignedPatients: {}, // { doctorId: [patients] }
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Unassigned
      .addCase(fetchUnassignedPatients.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUnassignedPatients.fulfilled, (state, action) => {
        state.unassignedPatients = action.payload;
        state.loading = false;
      })
      .addCase(fetchUnassignedPatients.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      
      // Fetch by Doctor
      .addCase(fetchPatientsByDoctor.fulfilled, (state, action) => {
        const { doctorId, patients } = action.payload;
        state.assignedPatients[doctorId] = patients;
      })
      
      // Assign Doctor
   .addCase(assignDoctorToPatient.fulfilled, (state, action) => {
  const { patient } = action.payload;
  // Remove from unassigned
  state.unassignedPatients = state.unassignedPatients.filter(
    p => p._id !== patient._id
  );
  // Add to assigned if doctor already has patients
  if (state.assignedPatients[patient.primaryDoctor]) {
    state.assignedPatients[patient.primaryDoctor].push(patient);
  }
})
      .addCase(unassignDoctorFromPatient.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(unassignDoctorFromPatient.fulfilled, (state) => {
  state.loading = false;
})
.addCase(unassignDoctorFromPatient.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})
.addCase(fetchAllAssignedPatients.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(fetchAllAssignedPatients.fulfilled, (state, action) => {
  state.loading = false;
  state.allAssignedPatients = action.payload;
})
.addCase(fetchAllAssignedPatients.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})
  },
});

export default patientAssignmentSlice.reducer;