import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, Container, Paper, Typography, Grid,
  List, ListItem, ListItemText, Divider, CircularProgress, Chip
} from '@mui/material';
import {ArrowBack as BackIcon } from '@mui/icons-material';
import { fetchAppointmentById } from '../../redux/slices/appointmentSlice';
import { format } from 'date-fns';

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentAppointment: appointment, loading } = useSelector((state) => state.appointment);

  useEffect(() => {
    dispatch(fetchAppointmentById(id));
  }, [dispatch, id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!appointment) {
    return <Typography>Appointment not found</Typography>;
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'pending': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/appointments')}
          sx={{ mb: 2 }}
        >
          Back to Appointments
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">
            Appointment Details
          </Typography>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Appointment Information</Typography>
            <List>
            <ListItem>
  <ListItemText 
    primary="Date" 
    secondary={
      appointment.date && !isNaN(new Date(appointment.date))
        ? format(new Date(appointment.date), 'MMMM dd, yyyy')
        : 'Invalid date'
    }
  />
</ListItem>

              <Divider component="li" />
              <ListItem>
                <ListItemText primary="Time" secondary={appointment.time} />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText 
                  primary="Status" 
                  secondary={
                    <Chip 
                      label={appointment.status} 
                      color={getStatusColor(appointment.status)} 
                    />
                  } 
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Participants</Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Patient" 
                  secondary={`${appointment.patient?.firstName} ${appointment.patient?.lastName}`} 
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText 
                  primary="Doctor" 
                  secondary={`Dr. ${appointment.doctor?.firstName} ${appointment.doctor?.lastName}`} 
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Notes</Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              {appointment.notes || 'No notes available'}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AppointmentDetail;