import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

const PatientInfo = ({ patient }) => {
  if (!patient) return null;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Patient Information</Typography>
      <List>
        <ListItem>
          <ListItemText primary="Name" secondary={`${patient.firstName} ${patient.lastName}`} />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemText primary="Date of Birth" secondary={new Date(patient.dob).toLocaleDateString()} />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemText primary="Gender" secondary={patient.gender} />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemText primary="Blood Type" secondary={patient.bloodType || 'N/A'} />
        </ListItem>
      </List>
    </Box>
  );
};

export default PatientInfo;