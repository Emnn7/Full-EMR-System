import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { CalendarToday, Person, AccessTime } from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';

const AppointmentCard = ({ appointments = [], loading, emptyMessage }) => {
  if (loading) return <CircularProgress />;
  if (!appointments.length) return <div>{emptyMessage}</div>;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
      case 'no-show':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div>
      {appointments.map(appointment => (
        <Card key={appointment._id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">
                {appointment.patient?.firstName} {appointment.patient?.lastName}
              </Typography>
              <Chip 
                label={appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)} 
                color={getStatusColor(appointment.status)} 
                size="small" 
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarToday fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {new Date(appointment.date).toLocaleDateString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTime fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {appointment.time}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Person fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Reason:</strong> {appointment.reason}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AppointmentCard;