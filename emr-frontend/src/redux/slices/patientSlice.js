import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api  from '../../api/axios'; // We'll fix this below
const initialState = {
  patients: [],
  recentPatients: [],   
  currentPatient: null,
  vitalSigns: [],            
  labOrders: [],            
  medicalHistory: [],        
  prescriptions: [],         
  searchResults: [],  
  loading: false,
  error: null,
};

export const fetchPatients = createAsyncThunk(
  'patient/fetchPatients',
  async (params, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const { role, _id: userId } = auth.user;

      if (!userId) throw new Error('User ID not found');

      const response = await api.get('/patients', {
        params: params?.filters || {}
      });

      // Standardize response format
      return {
        data: Array.isArray(response.data.data) ? response.data.data : [],
        meta: { role }
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchRecentPatients = createAsyncThunk(
  'patient/fetchRecentPatients',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await api.get('/patients/recent');
      
      // Standardize response format
      return {
        data: Array.isArray(response.data.data) ? response.data.data : [],
        meta: { role: getState().auth.user?.role }
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchPatientById = createAsyncThunk(
  'patient/fetchPatientById',
  async (patientId, { getState, rejectWithValue }) => {
    try {
      if (!patientId) throw new Error('Patient ID is required');
      const { auth } = getState();
      const isDoctor = auth.user?.role === 'doctor';

      const endpoint = isDoctor
        ? `/doctors/patients/${patientId}`  // Use doctor route
        : `/patients/${patientId}`;        // Use admin route

      const res = await api.get(endpoint);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);



export const createPatient = createAsyncThunk(
  'patients/createPatient',
  async (patientData, { rejectWithValue }) => {
    try {
      const response = await api.post('/patients', patientData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchPatientVitalSigns = createAsyncThunk(
  'patient/fetchPatientVitalSigns',
  async (patientId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const isDoctor = auth.user?.role === 'doctor';

      if (!patientId || patientId === 'undefined') {
        throw new Error('Patient ID is required');
      }

      const endpoint = isDoctor
        ? `/doctors/patients/${patientId}/vital-signs`
        : `/patients/${patientId}/vital-signs`;

      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const res = await api.get(endpoint, config);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);



export const fetchPatientLabOrders = createAsyncThunk(
  'patient/fetchLabOrders',
  async (patientId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const isDoctor = auth.user?.role === 'doctor';

      if (!patientId || patientId === 'undefined') {
        throw new Error('Patient ID is required');
      }

      const endpoint = isDoctor
        ? `/doctors/patients/${patientId}/lab-orders`
        : `/patients/${patientId}/lab-orders`;

      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await api.get(endpoint, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const fetchPatientMedicalHistory = createAsyncThunk(
  'patient/fetchPatientMedicalHistory',
  async (patientId, { getState, rejectWithValue }) => {
    try {
      const endpoint = `/medicalHistory/patient/${patientId}`; // Use consistent endpoint
      
      const res = await api.get(endpoint);
      console.log("📄 Medical history response:", res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


export const fetchPatientPrescriptions = createAsyncThunk(
  'patient/fetchPrescriptions',
  async (patientId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const isDoctor = auth.user?.role === 'doctor';

      if (!patientId || patientId === 'undefined') {
        throw new Error('Patient ID is required');
      }

      const endpoint = isDoctor
        ? `/doctors/patients/${patientId}/prescriptions`
        : `/patients/${patientId}/prescriptions`;

      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await api.get(endpoint, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);




export const searchPatients = createAsyncThunk(
  'patient/searchPatients',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patients/search?query=${searchTerm}`); // Assuming you have an API endpoint for search
      return response.data; // Adjust this based on your response structure
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
export const fetchDoctorPatients = createAsyncThunk(
  'patients/fetchDoctorPatients',
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patients/doctor/${doctorId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// In your API call
export const updatePatient = createAsyncThunk(
  'patient/update',
  async ({ id, patientData }, { getState }) => {
    const { user } = getState().auth;
    
    if (user.role !== 'doctor') {
      throw new Error('Unauthorized');
    }
    
    const response = await api.patch(`/patients/${id}`, patientData);
    return response.data;
  }
);



const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    fetchPatientsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPatientsSuccess: (state, action) => {
      state.patients = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchPatientsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentPatient: (state, action) => {
      state.currentPatient = action.payload;
    },
    clearCurrentPatient: (state) => {
      state.currentPatient = null;
    },
addPatient: (state, action) => {
  state.patients.push({
    ...action.payload,
    patientCardNumber: action.payload.patientCardNumber
  });
},
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
      })

.addCase(fetchPatients.fulfilled, (state, action) => {
  state.loading = false;
  state.error = null;
  
  // Ensure we always have an array
  const patients = Array.isArray(action.payload.data) ? action.payload.data : [];
  
  state.patients = patients.map(patient => ({
    _id: patient._id || '',
    firstName: patient.firstName || '',
    lastName: patient.lastName || '',
    phone: patient.phone || '',
    patientCardNumber: patient.patientCardNumber || `PC-${patient._id?.slice(-6) || '000000'}`,
    dateOfBirth: patient.dateOfBirth || null,
    paymentStatus: patient.paymentStatus || 'unknown',
    lastVisit:patient.lastVisit || 'Never',
    createdAt: patient.createdAt || new Date().toISOString()
  }));
})
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRecentPatients.fulfilled, (state, action) => {
  state.loading = false;
  state.error = null;
  
  const patients = Array.isArray(action.payload.data) ? action.payload.data : [];
  
  state.recentPatients = patients.map(patient => ({
    _id: patient._id || '',
    firstName: patient.firstName || '',
    lastName: patient.lastName || '',
    phone: patient.phone || '',
    gender: patient.gender || '', // Add gender too since it's used in the card
    dateOfBirth: patient.dateOfBirth || null, // Add this line
    patientCardNumber: patient.patientCardNumber || `PC-${patient._id?.slice(-6) || '000000'}`,
    createdAt: patient.createdAt || new Date().toISOString()
  }));
})
      .addCase(fetchPatientById.fulfilled, (state, action) => {
  console.log('Fetched patient data:', action.payload);
  if (action.payload?.data?.patient) {
    state.currentPatient = action.payload.data.patient;
  } else if (action.payload?.data) {
    state.currentPatient = action.payload.data;
  } else if (action.payload) {
    state.currentPatient = action.payload;
  } else {
    console.error('No patient data found in the response!');
  }
  state.loading = false;
})
      .addCase(createPatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
         console.log('Redux received patient:', action.payload);
  state.loading = false;
  const patientData = action.payload?.patient || action.payload;
  if (patientData) {
    state.patients.push({
      ...patientData,
      // Ensure card number is included
      patientCardNumber: patientData.patientCardNumber 
    });
  }
  state.error = null;
})
      .addCase(createPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPatientVitalSigns.pending, (state) => {
        state.loading = true;
      })
     .addCase(fetchPatientVitalSigns.fulfilled, (state, action) => {
  state.loading = false;
  state.vitalSigns = action.payload?.data?.vitalSigns || action.payload?.data || action.payload || [];
})
      .addCase(fetchPatientVitalSigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPatientLabOrders.pending, (state) => {
        state.loading = true;
      })
    .addCase(fetchPatientLabOrders.fulfilled, (state, action) => {
  state.loading = false;
  state.labOrders = action.payload?.data?.labOrders || action.payload?.data || action.payload || [];
})
      .addCase(fetchPatientLabOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPatientMedicalHistory.pending, (state) => {
        state.loading = true;
      })
     .addCase(fetchPatientMedicalHistory.fulfilled, (state, action) => {
  state.loading = false;
  // Handle different response structures
  state.medicalHistory = Array.isArray(action.payload)
    ? action.payload
    : action.payload?.data || action.payload?.medicalHistory || [];
})
      .addCase(fetchPatientMedicalHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPatientPrescriptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatientPrescriptions.fulfilled, (state, action) => {
  state.loading = false;
  state.prescriptions = action.payload?.data?.prescriptions || action.payload?.data || action.payload || [];
})
      .addCase(fetchPatientPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchPatients.fulfilled, (state, action) => {
        state.searchResults = action.payload;
        state.loading = false;
      })
      .addCase(searchPatients.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
      
      
      
  
  }
  
});



export const {
  fetchPatientsStart,
  fetchPatientsSuccess,
  fetchPatientsFailure,
  setCurrentPatient,
  clearCurrentPatient,
  addPatient,
  
} = patientSlice.actions;
export default patientSlice.reducer;