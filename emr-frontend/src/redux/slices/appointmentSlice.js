import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

const initialState = {
  appointments: [],
  currentAppointment: null,
  loading: false,
  error: null,
};

export const fetchTodayAppointments = createAsyncThunk(
  'appointments/fetchTodayAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/appointments/today'); // Use real endpoint
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


// Fetch all appointments
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/appointments');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch appointments for a specific patient
export const fetchPatientAppointments = createAsyncThunk(
  'appointments/fetchByPatient',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/appointments/patient/${patientId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchAppointmentById',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/appointments/${appointmentId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/appointments', appointmentData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchDoctorAppointments = createAsyncThunk(
  'appointments/fetchDoctorAppointments',
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/appointments/doctor/${doctorId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    fetchAppointmentsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAppointmentsSuccess: (state, action) => {
      state.appointments = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchAppointmentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentAppointment: (state, action) => {
      state.currentAppointment = action.payload;
    },
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
    addAppointment: (state, action) => {
      state.appointments.push(action.payload);
    },
    updateAppointment: (state, action) => {
      const index = state.appointments.findIndex(a => a._id === action.payload._id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    deleteAppointment: (state, action) => {
      state.appointments = state.appointments.filter(a => a._id !== action.payload);
    },
  },

extraReducers: (builder) => {
  builder
    .addCase(fetchAppointments.pending, (state) => {
      state.loading = true;
    })
.addCase(fetchAppointments.fulfilled, (state, action) => {
  state.loading = false;
  state.appointments = action.payload.data?.appointments || 
                      action.payload.appointments || 
                      action.payload;
  state.error = null;
})
    .addCase(fetchAppointments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase(fetchTodayAppointments.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchTodayAppointments.fulfilled, (state, action) => {
      state.loading = false;
      state.todayAppointments = action.payload.data; // Adjust based on actual API response
      state.error = null;
    })
    .addCase(fetchTodayAppointments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase(fetchAppointmentById.pending, (state) => {
      state.loading = true;
    })
   .addCase(fetchAppointmentById.fulfilled, (state, action) => {
  state.loading = false;
  state.currentAppointment = action.payload.data?.appointment || action.payload.appointment;
  state.error = null;
})

    .addCase(fetchAppointmentById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase(createAppointment.pending, (state) => {
      state.loading = true;
    })
    .addCase(createAppointment.fulfilled, (state, action) => {
      state.loading = false;
      state.appointments.push(action.payload); // Adjust as needed
      state.error = null;
    })
    .addCase(createAppointment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase(fetchDoctorAppointments.fulfilled, (state, action) => {
  state.loading = false;
  state.appointments = action.payload.data?.appointments || 
                      action.payload.appointments || 
                      action.payload;
  state.error = null;
})
    
}
});

export const {
  fetchAppointmentsStart,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  setCurrentAppointment,
  clearCurrentAppointment,
  addAppointment,
  updateAppointment,
  deleteAppointment,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;






















