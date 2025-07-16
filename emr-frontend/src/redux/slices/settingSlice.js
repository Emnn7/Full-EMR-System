import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Async Thunks for Settings
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await api.put('/settings', settings);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchSettingsSection = createAsyncThunk(
  'settings/fetchSection',
  async (section, { rejectWithValue }) => {
    try {
      const response = await api.get(`/settings/${section}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async Thunks for Lab Tests
export const fetchLabTests = createAsyncThunk(
  'settings/fetchLabTests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/lab-tests');
      return response.data.tests || []; // safely return array
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


export const createLabTest = createAsyncThunk(
  'settings/createLabTest',
  async (testData, { rejectWithValue }) => {
    console.log('createLabTest thunk called', testData);

    try {
      const response = await api.post('/lab-tests', testData);
      return response.data;
    } catch (error) {
      console.error('Error creating lab test:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateLabTest = createAsyncThunk(
  'settings/updateLabTest',
  async ({ id, testData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/lab-tests/${id}`, testData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteLabTest = createAsyncThunk(
  'settings/deleteLabTest',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/lab-tests/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updatePricing = createAsyncThunk(
  'settings/updatePricing',
  async (pricing, { rejectWithValue }) => {
    try {
      const response = await api.put('/settings/pricing', { procedurePricing: pricing });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateReportTemplates = createAsyncThunk(
  'settings/updateTemplates',
  async (templates, { rejectWithValue }) => {
    try {
      const response = await api.put('/settings/templates', { reportTemplates: templates });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial State
const initialState = {
  settings: null,
  labTests: [],
  loading: false,
  error: null,
  success: false,
  appointmentSlotDuration: 30,
  billingRates: {
    consultation: 100,
    bloodTest: 50
  }
};

// Slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    resetSettingsState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Settings reducers
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load settings';
      })
      
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.success = true;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update settings';
      })
      
      .addCase(fetchSettingsSection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettingsSection.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = { ...state.settings, ...action.payload };
      })
      .addCase(fetchSettingsSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load settings section';
      })

      // Lab Tests reducers
      .addCase(fetchLabTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabTests.fulfilled, (state, action) => {
        state.loading = false;
        state.labTests = action.payload;
      })
      .addCase(fetchLabTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load lab tests';
      })
      
      .addCase(createLabTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLabTest.fulfilled, (state, action) => {
        state.loading = false;
        state.labTests.push(action.payload);
        state.success = true;
      })
      .addCase(createLabTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create lab test';
      })
      
      .addCase(updateLabTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLabTest.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.labTests.findIndex(test => test._id === action.payload._id);
        if (index !== -1) {
          state.labTests[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateLabTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update lab test';
      })
      
      .addCase(deleteLabTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLabTest.fulfilled, (state, action) => {
        state.loading = false;
        state.labTests = state.labTests.filter(test => test._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteLabTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete lab test';
      })
      .addCase(updatePricing.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.success = true;
      })
      .addCase(updateReportTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.success = true;
      });
  }
});

// Export actions and reducer
export const { resetSettingsState } = settingsSlice.actions;
export default settingsSlice.reducer;