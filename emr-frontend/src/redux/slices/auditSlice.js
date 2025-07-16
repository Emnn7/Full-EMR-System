import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios'; 

export const fetchAuditLogs = createAsyncThunk(
  'audit/fetchAuditLogs',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('/admin/auditLogs');
      return response.data.data.logs; // Correct path
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


const initialState = {
  auditLogs: [],
  loading: false,
  error: null,
};

const auditSlice = createSlice({
  name: 'auditLogs',
  initialState,
  reducers: {
    clearAuditLogs: (state) => {
      state.auditLogs = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.auditLogs = action.payload || [];
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch audit logs';
      });
  },
});

export const { clearAuditLogs } = auditSlice.actions;

export default auditSlice.reducer;
