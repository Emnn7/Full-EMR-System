import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  Chip,
  InputAdornment
} from '@mui/material';
import { Search, Visibility, Edit } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments } from '../../redux/slices/appointmentSlice';
import { useNavigate } from 'react-router-dom';

const AppointmentManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { appointments = [], loading } = useSelector((state) => state.appointment);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchAppointments({ doctorId: user._id }));
    }
  }, [dispatch, user]);

  // Filter appointments based on the search term
  const filteredAppointments = appointments.filter((appointment) => {
    const patientName = appointment?.patient 
    ? `${appointment.patient.firstName || ''} ${appointment.patient.lastName || ''}`.toLowerCase()
    : '';
    
  const doctorName = appointment?.doctor 
    ? `${appointment.doctor.firstName || ''} ${appointment.doctor.lastName || ''}`.toLowerCase()
    : '';
    
  const reason = (appointment?.reason || '').toLowerCase();
  const search = searchTerm.toLowerCase();

  return (
    patientName.includes(search) ||
    doctorName.includes(search) ||
    reason.includes(search)
  );
});

  const handleViewAppointment = (appointmentId) => {
    navigate(`/appointments/${appointmentId}`);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Appointment Management
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by patient, doctor, or reason"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
          
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAppointments.map((appt) => (
              <TableRow key={appt._id}>
              <TableCell>
                {formatDate(appt.date)}  {/* Use date field instead of appointmentDate */}
              </TableCell>
              <TableCell>
                {appt.time || '-'}  {/* Use time field directly */}
              </TableCell>
              <TableCell>
                {appt.patient ? `${appt.patient.firstName} ${appt.patient.lastName}` : '-'}
              </TableCell>
              <TableCell>
                {appt.doctor ? `${appt.doctor.firstName} ${appt.doctor.lastName}` : '-'}
              </TableCell>
              <TableCell>{appt.reason || '-'}</TableCell>
              <TableCell>
                <Chip
                  label={appt.status}
                  color={
                    appt.status === 'completed'  // lowercase
                      ? 'success'
                      : appt.status === 'cancelled'  // lowercase
                      ? 'error'
                      : 'primary'
                  }
                  size="small"
                />
              </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AppointmentManagement;
