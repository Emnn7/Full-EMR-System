import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Edit, Delete, Add } from '@mui/icons-material';
import api from '../../api/axios';
import { ROLES } from '../../config/roles';

import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRoles,
  fetchPermissions,
  updateUserRole,
  updateUserPermissions,
} from '../../redux/slices/rolePermissionSlice';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    department: '',
    specialization: '',
    licenseNumber: '',
    labName: '',
    shift: '',
    deskNumber: ''
  });
  const [emailConflict, setEmailConflict] = useState(false);
  
  const [roles] = useState(Object.values(ROLES).filter(role => role !== ROLES.PATIENT));
  const dispatch = useDispatch();
  const { roles: reduxRoles, permissions, loading: permLoading } = useSelector((state) => state.rolePermission);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const requests = roles.map(role => api.get(`/admin/users/${role}`));
      const responses = await Promise.all(requests);
      const allUsers = responses.flatMap((response, index) =>
        response.data.data.users.map(user => ({
          ...user,
          role: roles[index],
          roleSpecificId: user._id,
        }))
      );
      setUsers(allUsers);
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch users';
      setError(message);
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    dispatch(fetchRoles());
    dispatch(fetchPermissions());
  }, [dispatch]);

 const validateField = (name, value) => {
  const errors = { ...validationErrors };
  
  switch (name) {
    case 'email':
      if (!value) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.email = 'Please enter a valid email address';
      } else {
        errors.email = '';
      }
      break;
      
    case 'phone':
      if (!value) {
        errors.phone = 'Phone number is required';
      } else if (!/^[0-9+]+$/.test(value)) {
        errors.phone = 'Please enter a valid phone number';
      } else {
        errors.phone = '';
      }
      break;
        
      case 'password':
        if (!currentUser?.roleSpecificId && !value) {
          errors.password = 'Password is required';
        } else if (value && value.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        } else {
          errors.password = '';
        }
        break;
        
      case 'passwordConfirm':
        if (!currentUser?.roleSpecificId && !value) {
          errors.passwordConfirm = 'Please confirm your password';
} else if (value !== currentUser?.password) {
          errors.passwordConfirm = 'Passwords do not match';
        } else {
          errors.passwordConfirm = '';
        }
        break;
        
      case 'department':
        if (currentUser?.role === 'doctor' && !value) {
          errors.department = 'Department is required';
        } else {
          errors.department = '';
        }
        break;
        
      case 'specialization':
        if (currentUser?.role === 'doctor' && !value) {
          errors.specialization = 'Specialization is required';
        } else {
          errors.specialization = '';
        }
        break;
        
      case 'licenseNumber':
        if ((currentUser?.role === 'doctor' || currentUser?.role === 'labAssistant') && !value) {
          errors.licenseNumber = 'License number is required';
        } else {
          errors.licenseNumber = '';
        }
        break;
        
      case 'labName':
        if (currentUser?.role === 'labAssistant' && !value) {
          errors.labName = 'Lab name is required';
        } else {
          errors.labName = '';
        }
        break;
        
      case 'shift':
        if (currentUser?.role === 'labAssistant' && !value) {
          errors.shift = 'Shift is required';
        } else {
          errors.shift = '';
        }
        break;
        
      case 'deskNumber':
        if (currentUser?.role === 'receptionist' && !value) {
          errors.deskNumber = 'Desk number is required';
        } else {
          errors.deskNumber = '';
        }
        break;
        
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  const validateRoleSpecificFields = () => {
    if (currentUser?.role === 'doctor') {
      validateField('department', currentUser.department);
      validateField('specialization', currentUser.specialization);
      validateField('licenseNumber', currentUser.licenseNumber);
    } else if (currentUser?.role === 'labAssistant') {
      validateField('labName', currentUser.labName);
      validateField('shift', currentUser.shift);
      validateField('licenseNumber', currentUser.licenseNumber);
    } else if (currentUser?.role === 'receptionist') {
      validateField('deskNumber', currentUser.deskNumber);
    }
  };

  const handleOpenDialog = (user = null) => {
    setCurrentUser(
      user || {
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        phone: '',
        password: '',
        passwordConfirm: '',
        department: '',
        specialization: '',
        licenseNumber: '',
        labName: '',
        shift: '',
        deskNumber: ''
      }
    );
    
    if (user && user.permissions) {
      setSelectedPermissions(user.permissions);
    } else {
      setSelectedPermissions([]);
    }
    
    // Reset validation errors
    setValidationErrors({
      email: '',
      password: '',
      passwordConfirm: '',
      phone: '',
      department: '',
      specialization: '',
      licenseNumber: '',
      labName: '',
      shift: '',
      deskNumber: ''
    });
    setEmailConflict(false);
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUser(null);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate all fields
  validateField('email', currentUser.email);
  validateField('phone', currentUser.phone);
    if (!currentUser?.roleSpecificId) {
      validateField('password', currentUser.password);
      validateField('passwordConfirm', currentUser.passwordConfirm);
    }
    validateRoleSpecificFields();
    
    // Check if there are any validation errors
    const hasErrors = Object.values(validationErrors).some(error => error !== '');
    if (hasErrors) {
      setSnackbar({
        open: true,
        message: 'Please fix the errors in the form before submitting',
        severity: 'error',
      });
      return;
    }
    
    try {
      setLoading(true);
      if (currentUser.roleSpecificId) {
        await api.
patch(
          `/admin/users/${currentUser.role}/${currentUser.roleSpecificId}`,
          {
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
            phone: currentUser.phone,
          }
        );
        setSnackbar({
          open: true,
          message: 'User updated successfully!',
          severity: 'success',
        });
      } else {
        const userPayload = {
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          phone: currentUser.phone,
          role: currentUser.role,
          password: currentUser.password,
          passwordConfirm: currentUser.passwordConfirm,
        };

        if (currentUser.role === 'doctor') {
          userPayload.department = currentUser.department;
          userPayload.specialization = currentUser.specialization;
          userPayload.licenseNumber = currentUser.licenseNumber;
        }

        if (currentUser.role === 'labAssistant') {
          userPayload.labName = currentUser.labName;
          userPayload.shift = currentUser.shift;
          userPayload.licenseNumber = currentUser.licenseNumber;
        }

        if (currentUser.role === 'receptionist') {
          userPayload.deskNumber = currentUser.deskNumber;
        }

        await api.post('/admin/users', userPayload);
        setSnackbar({
          open: true,
          message: `New ${currentUser.role} account created successfully!`,
          severity: 'success',
        });
      }

      if (currentUser?.roleSpecificId) {
        const originalUser = users.find(u => u.roleSpecificId === currentUser.roleSpecificId);
        const userId = originalUser?._id;
      
        if (userId) {
          if (currentUser.role !== originalUser.role) {
            await dispatch(updateUserRole({ userId, roleId: currentUser.role }));
          }
      
          if (JSON.stringify(selectedPermissions) !== JSON.stringify(originalUser.permissions || [])) {
            await dispatch(updateUserPermissions({
              userId,
              permissions: selectedPermissions
            }));
          }
        }
      }

      fetchUsers();
      handleCloseDialog();
    } catch (err) {
    let message = err.response?.data?.message || 'Operation failed';
    
    // Handle specific error cases
    if (message.toLowerCase().includes('email') && message.toLowerCase().includes('already')) {
      setValidationErrors(prev => ({ ...prev, email: 'This email is already in use' }));
      setEmailConflict(true);
    } else if (message.toLowerCase().includes('phone') && message.toLowerCase().includes('already')) {
      setValidationErrors(prev => ({ ...prev, phone: 'This phone number is already in use' }));
    }

      
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/admin/users/${userToDelete.role}/${userToDelete.roleSpecificId}`);
      setSnackbar({
        open: true,
        message: `${userToDelete.firstName} ${userToDelete.lastName}'s account has been deleted.`,
        severity: 'success',
      });
      fetchUsers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete user',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId]
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Add User
        </Button>
      </Box>

      {loading && users.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : users.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          No users found.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={`${user.role}-${user.roleSpecificId}`}>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpenDialog(user)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(user)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {currentUser?.roleSpecificId ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              margin="dense"
              label="First Name"
              fullWidth
              variant="outlined"
              value={currentUser?.firstName || ''}
              onChange={(e) => setCurrentUser({ ...currentUser, firstName: e.target.value })}
              required
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Last Name"
              fullWidth
              variant="outlined"
              value={currentUser?.lastName || ''}
              onChange={(e) => setCurrentUser({ ...currentUser, lastName: e.target.value })}
              required
              disabled={loading}
              sx={{ mb: 2 }}
            />
        <TextField
  margin="dense"
  label="Email"
  type="email"
  fullWidth
  variant="outlined"
  value={currentUser?.email || ''}
  onChange={(e) => {
    setCurrentUser({ ...currentUser, email: e.target.value });
    validateField('email', e.target.value);
    setEmailConflict(false);
  }}
  required
  disabled={loading || !!currentUser?.roleSpecificId}
  error={!!validationErrors.email || emailConflict}
  helperText={
    emailConflict 
      ? 'This email is already in use. Please use a different email.' 
      : validationErrors.email
  }
  sx={{ mb: 2 }}
/>

<TextField
  margin="dense"
  label="Phone"
  fullWidth
  variant="outlined"
  value={currentUser?.phone || ''}
  onChange={(e) => {
    setCurrentUser({ ...currentUser, phone: e.target.value });
    validateField('phone', e.target.value);
  }}
  required
  disabled={loading}
  error={!!validationErrors.phone}
  helperText={validationErrors.phone}
  sx={{ mb: 2 }}
/>
            <TextField
              margin="dense"
              label="Role"
              select
              fullWidth
              variant="outlined"
              value={currentUser?.role || ''}
              onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
              required
              disabled={loading || !!currentUser?.roleSpecificId}
              sx={{ mb: 2 }}
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>

            {/* Doctor-specific fields */}
            {(!currentUser?.roleSpecificId || currentUser?.role === 'doctor') && currentUser?.role === 'doctor' && (
              <>
                <TextField
                  margin="dense"
                  label="Department"
                  fullWidth
                  variant="outlined"
                  value={currentUser?.department || ''}
                  onChange={(e) => {
                    setCurrentUser({ ...currentUser, department: e.target.value });
                    validateField('department', e.target.value);
                  }}
                  required
                  disabled={loading}
                  error={!!validationErrors.department}
                  helperText={validationErrors.department}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="Specialization"
                  fullWidth
                  variant="outlined"
                  value={currentUser?.specialization || ''}
                  onChange={(e) => {
                    setCurrentUser({ ...currentUser, specialization: e.target.value });
                    validateField('specialization', e.target.value);
                  }}
                  required
                  disabled={loading}
                  error={!!validationErrors.specialization}
                  helperText={validationErrors.specialization}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="License Number"
                  fullWidth
                  variant="outlined"
                  value={currentUser?.licenseNumber || ''}
                  onChange={(e) => {
                    setCurrentUser({ ...currentUser, licenseNumber: e.target.value });
                    validateField('licenseNumber', e.target.value);
                  }}
                  required
                  disabled={loading}
                  error={!!validationErrors.licenseNumber}
                  helperText={validationErrors.licenseNumber}
                  sx={{ mb: 2 }}
                />
              </>
            )}

            {/* Lab Assistant fields */}
            {(!currentUser?.roleSpecificId || currentUser?.role === 'labAssistant') && currentUser?.role === 'labAssistant' && (
              <>
                <TextField
                  margin="dense"
                  label="Lab Name"
                  fullWidth
                  variant="outlined"
                  value={currentUser?.labName || ''}
                  onChange={(e) => {
                    setCurrentUser({ ...currentUser, labName: e.target.value });
                    validateField('labName', e.target.value);
                  }}
                  required
                  disabled={loading}
                  error={!!validationErrors.labName}
                  helperText={validationErrors.labName}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
label="Shift"
                  fullWidth
                  variant="outlined"
                  value={currentUser?.shift || ''}
                  onChange={(e) => {
                    setCurrentUser({ ...currentUser, shift: e.target.value });
                    validateField('shift', e.target.value);
                  }}
                  required
                  disabled={loading}
                  error={!!validationErrors.shift}
                  helperText={validationErrors.shift}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="License Number"
                  fullWidth
                  variant="outlined"
                  value={currentUser?.licenseNumber || ''}
                  onChange={(e) => {
                    setCurrentUser({ ...currentUser, licenseNumber: e.target.value });
                    validateField('licenseNumber', e.target.value);
                  }}
                  required
                  disabled={loading}
                  error={!!validationErrors.licenseNumber}
                  helperText={validationErrors.licenseNumber}
                  sx={{ mb: 2 }}
                />
              </>
            )}

            {/* Receptionist fields */}
            {(!currentUser?.roleSpecificId || currentUser?.role === 'receptionist') && currentUser?.role === 'receptionist' && (
              <TextField
                margin="dense"
                label="Desk Number"
                fullWidth
                variant="outlined"
                value={currentUser?.deskNumber || ''}
                onChange={(e) => {
                  setCurrentUser({ ...currentUser, deskNumber: e.target.value });
                  validateField('deskNumber', e.target.value);
                }}
                required
                disabled={loading}
                error={!!validationErrors.deskNumber}
                helperText={validationErrors.deskNumber}
                sx={{ mb: 2 }}
              />
            )}

            {!currentUser?.roleSpecificId && (
              <>
                <TextField
                  margin="dense"
                  label="Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={currentUser?.password || ''}
                  onChange={(e) => {
                    setCurrentUser({ ...currentUser, password: e.target.value });
                    validateField('password', e.target.value);
                    // Also validate password confirmation if it exists
                    if (currentUser?.passwordConfirm) {
                      validateField('passwordConfirm', currentUser.passwordConfirm);
                    }
                  }}
                  required
                  disabled={loading}
                  error={!!validationErrors.password}
                  helperText={validationErrors.password}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={currentUser?.passwordConfirm || ''}
                  onChange={(e) => {
                    setCurrentUser({ ...currentUser, passwordConfirm: e.target.value });
                    validateField('passwordConfirm', e.target.value);
                  }}
                  required
                  disabled={loading}
                  error={!!validationErrors.passwordConfirm}
                  helperText={validationErrors.passwordConfirm}
                  sx={{ mb: 2 }}
                />
              </>
            )}

            {currentUser?.role && (
              <>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Permissions
                </Typography>
                {error && <Alert severity="error">{error}</Alert>}
<Box sx={{ maxHeight: 300, overflow: 'auto', mt: 1 }}>
                  {Object.entries(
                    permissions.reduce((acc, perm) => {
                      if (!acc[perm.category]) acc[perm.category] = [];
                      acc[perm.category].push(perm);
                      return acc;
                    }, {})
                  ).map(([category, perms]) => (
                    <Accordion key={category} defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{category.toUpperCase()}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <FormGroup>
                          {perms.map((perm) => (
                            <FormControlLabel
                              key={perm.id}
                              control={
                                <Checkbox
                                  checked={selectedPermissions.includes(perm.id)}
                                  onChange={() => handlePermissionChange(perm.id)}
                                  disabled={permLoading}
                                />
                              }
                              label={perm.name}
                            />
                          ))}
                        </FormGroup>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : currentUser?.roleSpecificId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {userToDelete?.firstName} {userToDelete?.lastName}'s account?
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
