import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip } from '@mui/material';
import { format } from 'date-fns';

const statusColors = {
  active: 'primary',
  completed: 'success',
  cancelled: 'error'
};

const PrescriptionList = ({ prescriptions }) => {
  // Ensure prescriptions is an array before mapping over it
  const prescriptionArray = Array.isArray(prescriptions) ? prescriptions : [];

  return (
    <Paper>
      <List>
        {prescriptionArray.map((prescription) => (
          <ListItem key={prescription._id}>
            <ListItemText
  primary={
    <Box display="flex" justifyContent="space-between">
      <Typography>
        {prescription?.patient?.firstName} {prescription?.patient?.lastName}
      </Typography>
      <Chip 
        label={prescription.status} 
        color={statusColors[prescription.status] || 'default'} 
        size="small"
      />
    </Box>
  }
 secondary={
  <>
    <Typography component="span" variant="body2" display="block">
      Prescribed by: Dr. {prescription?.doctor?.lastName}
      {prescription?.createdAt && !isNaN(new Date(prescription.createdAt)) ? (
        <> on {format(new Date(prescription.createdAt), 'MMM dd, yyyy')}</>
      ) : (
        ' on Unknown Date'
      )}
    </Typography>
    <Typography component="span" variant="body2" display="block">
      Medications: {prescription?.medications?.length ? 
        prescription.medications.map(m => `${m.name} (${m.dosage})`).join(', ') : 
        'None'}
    </Typography>
    <Typography component="span" variant="body2" display="block">
      Diagnosis: {prescription?.diagnosis || 'Not specified'}
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

export default PrescriptionList;
