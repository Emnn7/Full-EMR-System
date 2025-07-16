import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip } from '@mui/material';
import { format, parseISO } from 'date-fns';

const statusColors = {
  scheduled: 'primary',
  completed: 'success',
  cancelled: 'error',
  'no-show': 'warning'
};

const AppointmentList = ({ appointments }) => {
  return (
    <Paper>
      <List>
        {appointments.map((appointment) => (
          <ListItem key={appointment._id}>
            <ListItemText
              primary={
                <Box display="flex" justifyContent="space-between">
                  <Typography>
                    {appointment.patient.firstName} {appointment.patient.lastName}
                  </Typography>
                  <Chip 
                    label={appointment.status} 
                    color={statusColors[appointment.status] || 'default'} 
                    size="small"
                  />
                </Box>
              }
              secondary={
                <>
                  <Typography component="span" variant="body2" display="block">
                    {format(parseISO(appointment.date), 'MMM dd, yyyy')} at {appointment.time}
                  </Typography>
                  <Typography component="span" variant="body2" display="block">
                    Reason: {appointment.reason}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default AppointmentList;