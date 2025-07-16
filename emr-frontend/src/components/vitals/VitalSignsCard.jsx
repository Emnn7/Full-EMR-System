import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { format } from 'date-fns';

const VitalSignsCard = ({ vitalSigns }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {format(new Date(vitalSigns.createdAt), 'MMM dd, yyyy hh:mm a')}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={4} md={3}>
          <Typography variant="body2">Temperature</Typography>
          <Typography variant="body1">
            {vitalSigns.temperature?.value} {vitalSigns.temperature?.unit}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <Typography variant="body2">Heart Rate</Typography>
          <Typography variant="body1">
            {vitalSigns.heartRate?.value} {vitalSigns.heartRate?.unit}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <Typography variant="body2">Blood Pressure</Typography>
          <Typography variant="body1">
            {vitalSigns.bloodPressure?.systolic}/{vitalSigns.bloodPressure?.diastolic} {vitalSigns.bloodPressure?.unit}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <Typography variant="body2">Respiratory Rate</Typography>
          <Typography variant="body1">
            {vitalSigns.respiratoryRate?.value} {vitalSigns.respiratoryRate?.unit}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <Typography variant="body2">Oxygen Saturation</Typography>
          <Typography variant="body1">
            {vitalSigns.oxygenSaturation?.value} {vitalSigns.oxygenSaturation?.unit}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <Typography variant="body2">Height</Typography>
          <Typography variant="body1">
            {vitalSigns.height?.value} {vitalSigns.height?.unit}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <Typography variant="body2">Weight</Typography>
          <Typography variant="body1">
            {vitalSigns.weight?.value} {vitalSigns.weight?.unit}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <Typography variant="body2">BMI</Typography>
          <Typography variant="body1">
            {vitalSigns.bmi?.value} ({vitalSigns.bmi?.classification})
          </Typography>
        </Grid>
      </Grid>
      {vitalSigns.notes && (
        <Box mt={2}>
          <Typography variant="body2">Notes:</Typography>
          <Typography variant="body1">{vitalSigns.notes}</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default VitalSignsCard;