import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchPatientDiagnostics = createAsyncThunk(
  'diagnostics/fetchByPatient',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/diagnostics/patient/${patientId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const uploadDiagnosticReport = createAsyncThunk(
  'diagnostics/upload',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/diagnostics', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      return rejectWithValue({
        message: error.message || 'Failed to upload diagnostic',
        ...(error.response && { 
          status: error.response.status,
          data: error.response.data 
        })
      });
    }
  }
);

export const deleteDiagnosticReport = createAsyncThunk(
  'diagnostics/delete',
  async (diagnosticId, { rejectWithValue }) => {
    try {
      await api.delete(`/diagnostics/${diagnosticId}`);
      return diagnosticId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const diagnosticSlice = createSlice({
  name: 'diagnostics',
  initialState: {
    diagnostics: [],
    loading: false,
    error: null,
    uploadLoading: false,
    uploadError: null
  },
  reducers: {
    clearDiagnostics: (state) => {
      state.diagnostics = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientDiagnostics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientDiagnostics.fulfilled, (state, action) => {
        state.loading = false;
        state.diagnostics = action.payload;
      })
      .addCase(fetchPatientDiagnostics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch diagnostics';
        state.uploadLoading = false;
      state.uploadError = action.payload?.message || 
                         action.error?.message || 
                         'Failed to upload diagnostic';
      })
      .addCase(uploadDiagnosticReport.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
      })
      .addCase(uploadDiagnosticReport.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.diagnostics.unshift(action.payload);
      })
      .addCase(uploadDiagnosticReport.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload?.message || 'Failed to upload diagnostic';
      })
      .addCase(deleteDiagnosticReport.fulfilled, (state, action) => {
        state.diagnostics = state.diagnostics.filter(
          d => d._id !== action.payload
        );
      });
  }
});

export const { clearDiagnostics } = diagnosticSlice.actions;
export default diagnosticSlice.reducer;