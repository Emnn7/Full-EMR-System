import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import labTestAPI from '../../api/labTestAPI';

export const fetchLabTests = createAsyncThunk('labTests/fetchAll', labTestAPI.getAllLabTests);
export const addLabTest = createAsyncThunk('labTests/add', labTestAPI.addLabTest);

const labTestSlice = createSlice({
  name: 'labTests',
  initialState: {
    tests: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLabTests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLabTests.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload;
      })
      .addCase(fetchLabTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addLabTest.fulfilled, (state, action) => {
        state.tests.push(action.payload);
      });
  },
});

export default labTestSlice.reducer;
