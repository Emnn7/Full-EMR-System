import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchRoles = createAsyncThunk(
  'rolePermission/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/roles');
      return response.data.data.roles;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

export const fetchPermissions = createAsyncThunk(
  'rolePermission/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('admin/permissions');
      return response.data.data.permissions;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'rolePermission/updateRole',
  async ({ userId, roleId }, { rejectWithValue }) => {
    try {
      await api.put(`/${userId}/role`, { role: roleId });
      return { userId, roleId };
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);


export const updateUserPermissions = createAsyncThunk(
  'rolePermission/updatePermissions',
  async ({ role, userId, permissions }, { rejectWithValue }) => {
    try {
      await api.patch(`/admin/users/${role}/${userId}/permissions`, { permissions });
      return { role, userId, permissions };
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

const rolePermissionSlice = createSlice({
  name: 'rolePermission',
  initialState: {
    roles: [],
    permissions: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ✅ Add all .addCase() calls first
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.roles = action.payload;
        state.loading = false;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.permissions = action.payload;
        state.loading = false;
      })
  
      // ✅ Then add .addMatcher() calls
      .addMatcher(
        action => action.type.startsWith('rolePermission/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
        }
      )
      .addMatcher(
        action => action.type.startsWith('rolePermission/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.error = action.payload;
          state.loading = false;
        }
      );
  }
  
});

export default rolePermissionSlice.reducer;