import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import labTestCatalogAPI from '../../api/labTestCatalogAPI';

// Async thunks

export const fetchLabTestCatalog = createAsyncThunk(
  'labTestCatalog/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await labTestCatalogAPI.getAll();
      return res.data.tests; // Adjust based on backend response structure
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Fetch failed');
    }
  }
);

export const addLabTestToCatalog = createAsyncThunk(
  'labTestCatalog/add',
  async (test, { rejectWithValue }) => {
    try {
      const res = await labTestCatalogAPI.add(test);
      return res.data.test;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Add failed');
    }
  }
);

export const updateLabTest = createAsyncThunk(
  'labTestCatalog/update',
  async (test, { rejectWithValue }) => {
    try {
      const res = await labTestCatalogAPI.update(test._id, test);
      return res.data.test;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Update failed');
    }
  }
);

export const deleteLabTest = createAsyncThunk(
  'labTestCatalog/delete',
  async (id, { rejectWithValue }) => {
    try {
      await labTestCatalogAPI.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Delete failed');
    }
  }
);
const labTestCatalogSlice = createSlice({
  name: 'labTestCatalog',
  initialState: {
    tests: [],
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    resetCatalogState: (state) => {
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch catalog
      .addCase(fetchLabTestCatalog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabTestCatalog.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload; // Data is already correctly extracted
      })
      .addCase(fetchLabTestCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch lab test catalog';
      })
      
      // Add test
      .addCase(addLabTestToCatalog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addLabTestToCatalog.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.tests.unshift(action.payload); // Add the new test to the beginning
        }
        state.success = true;
      })
      .addCase(addLabTestToCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add lab test';
      })
         .addCase(deleteLabTest.fulfilled, (state, action) => {
        state.tests = state.tests.filter(test => test._id !== action.payload);
      })
      .addCase(updateLabTest.fulfilled, (state, action) => {
        const index = state.tests.findIndex(test => test._id === action.payload._id);
        if (index !== -1) {
          state.tests[index] = action.payload;
        }
      });
  }
});

export const { resetCatalogState } = labTestCatalogSlice.actions;
export default labTestCatalogSlice.reducer;