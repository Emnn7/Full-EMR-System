import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Helper function to normalize procedure code data
const normalizeProcedureCode = (code) => ({
  ...code,
  price: typeof code.price === 'string' ? parseFloat(code.price) : code.price,
  // Ensure all required fields exist
  code: code.code || '',
  description: code.description || '',
  category: code.category || 'consultation',
  isActive: code.isActive !== undefined ? code.isActive : true
});

// Async Thunks
export const fetchProcedureCodes = createAsyncThunk(
  'procedureCodes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/procedure-codes');
      console.log('API Response:', res.data);
      return res.data.data.procedureCodes.map(normalizeProcedureCode);
    } catch (err) {
      console.error('Full fetch error:', {
        message: err.message,
        response: err.response,
        config: err.config
      });
      return rejectWithValue(err.response?.data || 'Failed to fetch procedure codes');
    }
  }
);

export const addProcedureCode = createAsyncThunk(
  'procedureCodes/add',
  async (codeData, { rejectWithValue }) => {
    try {
      const res = await api.post('/procedure-codes', codeData);
      return normalizeProcedureCode(res.data.data.procedureCode);
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to add procedure code');
    }
  }
);

export const updateProcedureCode = createAsyncThunk(
  'procedureCodes/update',
  async (codeData, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/procedure-codes/${codeData._id}`, codeData);
      return normalizeProcedureCode(res.data.data.procedureCode);
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update procedure code');
    }
  }
);

export const deleteProcedureCode = createAsyncThunk(
  'procedureCodes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/procedure-codes/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to delete procedure code');
    }
  }
);

// Slice

const procedureCodeSlice = createSlice({
  name: 'procedureCodes',
  initialState: {
    codes: [],
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    resetProcedureCodeState: (state) => {
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchProcedureCodes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProcedureCodes.fulfilled, (state, action) => {
  state.codes = action.payload.map(code => ({
    ...code,
    price: Number(code.price) // Ensure price is number
  }));
  state.loading = false;
})
      .addCase(fetchProcedureCodes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Fetch failed';
      })

      // Add
      .addCase(addProcedureCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProcedureCode.fulfilled, (state, action) => {
        state.loading = false;
        state.codes.unshift(action.payload);
        state.success = true;
      })
      .addCase(addProcedureCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Add failed';
      })

      // Update
      .addCase(updateProcedureCode.fulfilled, (state, action) => {
        const index = state.codes.findIndex(code => code._id === action.payload._id);
        if (index !== -1) {
          state.codes[index] = action.payload;
        }
      })

      // Delete
      .addCase(deleteProcedureCode.fulfilled, (state, action) => {
        state.codes = state.codes.filter(code => code._id !== action.payload);
      });
  }
});

export const { resetProcedureCodeState } = procedureCodeSlice.actions;
export default procedureCodeSlice.reducer;
