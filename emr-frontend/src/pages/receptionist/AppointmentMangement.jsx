import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { fetchAppointments, setCurrentAppointment } from '../../redux/slices/appointmentSlice';
import { fetchPatients } from '../../redux/slices/patientSlice';
import { fetchDoctors } from '../../redux/slices/doctorSlice';
import appointmentAPI from '../../api/appointmentAPI';

const AppointmentManagement = () => {
  const dispatch = useDispatch();
  const { appointments, loading, error } = useSelector((state) => state.appointment);
  const { patients } = useSelector((state) => state.patient);
  const { doctors } = useSelector((state) => state.doctor);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [searchParams, setSearchParams] = useState({
    date: null,
    status: '',
    doctorId: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [filteredAppointments, setFilteredAppointments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchPatients());
        await dispatch(fetchDoctors());
        await dispatch(fetchAppointments());
      } catch (err) {
        showSnackbar('Failed to load data. Please try again.', 'error');
      }
    };
    loadData();
  }, [dispatch]);

  useEffect(() => {
    setFilteredAppointments(appointments);
  }, [appointments]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (appointment = null) => {
    dispatch(setCurrentAppointment(appointment));
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    dispatch(setCurrentAppointment(null));
  };

  const handleOpenDeleteDialog = (appointment) => {
    setAppointmentToDelete(appointment);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setAppointmentToDelete(null);
  };

const handleDeleteAppointment = async () => {
  try {
    console.log('Attempting to delete appointment:', appointmentToDelete._id);
    const response = await appointmentAPI.deleteAppointment(appointmentToDelete._id);
    
    // Check for successful status (204)
    if (response.status === 204) {
      await dispatch(fetchAppointments());
      showSnackbar('Appointment deleted successfully');
      handleCloseDeleteDialog();
    } else {
      // Handle unexpected successful status codes
      showSnackbar('Appointment deletion completed but with unexpected response', 'warning');
    }
  } catch (err) {
    console.error('Detailed delete error:', {
      message: err.message,
      response: err.response,
      stack: err.stack
    });
    
    // Enhanced error message handling
    let errorMessage = 'Failed to delete appointment. Please try again.';
    if (err.response) {
      if (err.response.status === 403) {
        errorMessage = 'You are not authorized to delete appointments';
      } else if (err.response.status === 404) {
        errorMessage = 'Appointment not found';
      } else if (err.response.data?.message) {
        errorMessage = err.response.data.message;
      }
    }
    
    showSnackbar(errorMessage, 'error');
  }
};
  const handleSearch = () => {
    const { date, status, doctorId } = searchParams;

    const filtered = appointments.filter((appt) => {
      const matchDate = date
        ? new Date(appt.date).toDateString() === date.toDateString()
        : true;
      const matchStatus = status ? appt.status === status.toLowerCase() : true;
      const matchDoctor = doctorId 
        ? appt.doctor?._id === doctorId || appt.doctor === doctorId
        : true;

      return matchDate && matchStatus && matchDoctor;
    });

    setFilteredAppointments(filtered);
    showSnackbar(`Found ${filtered.length} appointments`, 'info');
  };

  const handleResetSearch = () => {
    setSearchParams({
      date: null,
      status: '',
      doctorId: '',
    });
    setFilteredAppointments(appointments);
    showSnackbar('Search filters cleared', 'info');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'no-show': return 'warning';
      default: return 'default';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4">Appointment Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Appointment'}
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Search Appointments
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Date"
                value={searchParams.date}
                onChange={(date) => setSearchParams({ ...searchParams, date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={searchParams.status}
                  onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="no-show">No Show</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Doctor</InputLabel>
                <Select
                  value={searchParams.doctorId || ''}
                  onChange={(e) => setSearchParams({ ...searchParams, doctorId: e.target.value })}
                  label="Doctor"
                >
                  <MenuItem value="">All</MenuItem>
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={loading}
              >
                Search
              </Button>
              <Button
                variant="outlined"
                onClick={handleResetSearch}
                disabled={loading}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment._id}>
                      <TableCell>
                        {appointment.patient 
                          ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                          : 'Unknown Patient'}
                      </TableCell>
                      <TableCell>
                        {appointment.doctor 
                          ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                          : 'Unknown Doctor'}
                      </TableCell>
                      <TableCell>
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.status}
                          color={getStatusColor(appointment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={() => handleOpenDialog(appointment)}
                          disabled={loading}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleOpenDeleteDialog(appointment)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No appointments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <AppointmentDialog
          open={openDialog}
          onClose={handleCloseDialog}
          patients={patients}
          doctors={doctors}
          showSnackbar={showSnackbar}
        />

        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this appointment?
            </Typography>
            {appointmentToDelete && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Details:</Typography>
                <Typography>
                  Patient: {appointmentToDelete.patient?.firstName} {appointmentToDelete.patient?.lastName}
                </Typography>
                <Typography>
                  Date: {new Date(appointmentToDelete.date).toLocaleDateString()} at {appointmentToDelete.time}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button 
              onClick={handleDeleteAppointment} 
              variant="contained" 
              color="error"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

const AppointmentDialog = ({ open, onClose, patients, doctors, showSnackbar }) => {
  const { currentAppointment, loading, error } = useSelector((state) => state.appointment);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: new Date(),
    time: '09:00',
    reason: '',
    status: 'scheduled',
  });
  const [formErrors, setFormErrors] = useState({});

  // Generate time slots (every 30 minutes from 8AM to 6PM)
  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    ['00', '30'].forEach((minute) => {
      if (hour === 18 && minute === '30') return;
      timeSlots.push(`${hour.toString().padStart(2, '0')}:${minute}`);
    });
  }

  useEffect(() => {
    if (currentAppointment) {
      setFormData({
        patientId: currentAppointment.patient?._id || currentAppointment.patient || '',
        doctorId: currentAppointment.doctor?._id || currentAppointment.doctor || '',
        date: currentAppointment.date ? new Date(currentAppointment.date) : new Date(),
        time: currentAppointment.time || '09:00',
        reason: currentAppointment.reason || '',
        status: currentAppointment.status || 'scheduled',
      });
    } else {
      setFormData({
        patientId: '',
        doctorId: '',
        date: new Date(),
        time: '09:00',
        reason: '',
        status: 'scheduled',
      });
    }
    setFormErrors({});
  }, [currentAppointment]);

  const validateForm = () => {
    const errors = {};
    if (!formData.patientId) errors.patientId = 'Patient is required';
    if (!formData.doctorId) errors.doctorId = 'Doctor is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.time) errors.time = 'Time is required';
    if (!formData.reason.trim()) errors.reason = 'Reason is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date: date,
    });
    if (formErrors.date) {
      setFormErrors((prev) => ({ ...prev, date: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const appointmentData = {
        patient: formData.patientId,
        doctor: formData.doctorId,
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        status: formData.status
      };

      if (currentAppointment) {
        await appointmentAPI.updateAppointment(
          currentAppointment._id,
          appointmentData
        );
        showSnackbar('Appointment updated successfully');
      } else {
        await appointmentAPI.createAppointment(appointmentData);
        showSnackbar('Appointment created successfully');
      }
      dispatch(fetchAppointments());
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save appointment';
      showSnackbar(errorMessage, 'error');
      // Set specific field errors if available from backend
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {currentAppointment ? 'Edit Appointment' : 'New Appointment'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
           <FormControl fullWidth error={!!formErrors.patientId}>
  <InputLabel>Patient *</InputLabel>
  <Select
    name="patientId"
    value={formData.patientId || ''}
    onChange={handleChange}
    label="Patient *"
  >
    {patients.map((patient) => (
      <MenuItem key={patient._id} value={patient._id}>
        {`${patient.firstName} ${patient.lastName} (Hospital Card Number: ${patient.patientCardNumber}) - ${patient.phone || 'No phone'}`}
      </MenuItem>
    ))}
  </Select>
</FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.doctorId}>
                <InputLabel>Doctor *</InputLabel>
                <Select
                  name="doctorId"
                  value={formData.doctorId || ''}
                  onChange={handleChange}
                  label="Doctor *"
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      
        {`Dr. ${doctor.name} (${doctor.specialization || 'General'})`}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.doctorId && (
                  <Typography variant="caption" color="error">
                    {formErrors.doctorId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Appointment Date *"
                value={formData.date}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    error={!!formErrors.date}
                    helperText={formErrors.date}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.time}>
                <InputLabel>Time *</InputLabel>
                <Select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  label="Time *"
                >
                  {timeSlots.map((time) => (
                    <MenuItem key={time} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.time && (
                  <Typography variant="caption" color="error">
                    {formErrors.time}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status *</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status *"
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="no-show">No Show</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason *"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                multiline
                rows={3}
                error={!!formErrors.reason}
                helperText={formErrors.reason}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : currentAppointment ? (
              'Update'
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AppointmentManagement;
