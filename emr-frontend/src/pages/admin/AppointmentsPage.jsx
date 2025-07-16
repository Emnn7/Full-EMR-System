import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Container, Grid, Paper, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Chip, IconButton, Tooltip, TextField, InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { fetchAppointments } from '../../redux/slices/appointmentSlice';
import { format } from 'date-fns';

const AppointmentsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appointments = [], loading } = useSelector((state) => state.appointment) || {};
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'pending': return 'warning';
      default: return 'primary';
    }
  };

const filteredAppointments = appointments.filter((appointment) => {
  if (!searchTerm) return true;

  const searchLower = searchTerm.toLowerCase();
  const patientName = appointment.patient 
    ? `${appointment.patient.firstName} ${appointment.patient.lastName}`.toLowerCase()
    : '';
  const doctorName = appointment.doctor 
    ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`.toLowerCase()
    : '';
  const dateString = appointment.date && !isNaN(new Date(appointment.date))
    ? format(new Date(appointment.date), 'MMM dd, yyyy').toLowerCase()
    : '';
  const cardNumber = appointment.patient?.patientCardNumber?.toLowerCase() || '';
  const time = appointment.time?.toLowerCase() || '';
  const status = appointment.status?.toLowerCase() || '';

  return (
    patientName.includes(searchLower) ||
    doctorName.includes(searchLower) ||
    cardNumber.includes(searchLower) ||
    dateString.includes(searchLower) ||
    time.includes(searchLower) ||
    status.includes(searchLower)
  );
});


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography component="h1" variant="h5">
                Appointment Management
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </Box>

            <TextField
              fullWidth
              placeholder="Search appointments by card number, patient, doctor, date, time or status..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Hospital Card Number</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Doctor</TableCell>
                      <TableCell>Date & Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          {searchTerm ? 'No matching appointments found' : 'No appointments available'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <TableRow key={appointment._id}>
                          <TableCell>
  {appointment.patient?.patientCardNumber || 'N/A'}
</TableCell>
                          <TableCell>
                            {appointment.patient
                              ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {appointment.doctor
                              ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {appointment.date && !isNaN(new Date(appointment.date))
                              ? `${format(new Date(appointment.date), 'MMM dd, yyyy')} at ${appointment.time || 'N/A'}`
                              : 'Invalid date'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={appointment.status}
                              color={getStatusColor(appointment.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton onClick={() => navigate(`/appointments/${appointment._id}`)}>
                                <CalendarIcon color="primary" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AppointmentsPage;