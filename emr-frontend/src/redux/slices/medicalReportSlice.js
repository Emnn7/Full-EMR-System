import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchAllMedicalReports = createAsyncThunk(
  'medicalReports/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('medical-reports/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      // Axios already parses JSON, so just return the data
      return response.data.data.reports; // Adjusted to match your backend response structure
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
export const getMedicalReport = createAsyncThunk(
  'medicalReports/getOne',
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await api.get(`medical-reports/${reportId}`);
      return response.data.data.report;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const generateMedicalReport = createAsyncThunk(
  'medicalReports/generate',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await api.post(
        'medical-reports/generate',
        { patientId },
        { responseType: 'blob' }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `medical_report_${patientId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return patientId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


const medicalReportSlice = createSlice({
  name: 'medicalReports',
  initialState: {
  reports: [],
  currentReport: null,
  loading: false,
  generating: false,
  error: null
}
,
  reducers: {
    clearReports: (state) => {
      state.reports = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMedicalReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMedicalReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchAllMedicalReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMedicalReport.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(getMedicalReport.fulfilled, (state, action) => {
  state.loading = false;
  state.currentReport = action.payload;
})
.addCase(getMedicalReport.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})
.addCase(generateMedicalReport.pending, (state) => {
  state.generating = true;
  state.error = null;
})
.addCase(generateMedicalReport.fulfilled, (state) => {
  state.generating = false;
})
.addCase(generateMedicalReport.rejected, (state, action) => {
  state.generating = false;
  state.error = action.payload;
});
  }
});

export const { clearReports } = medicalReportSlice.actions;
export default medicalReportSlice.reducer;