import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

const RegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cardNumber, patientId, patient } = location.state || {}; // Added patient to destructuring

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <CheckCircle color="success" sx={{ fontSize: 80 }} />
      <Typography variant="h3" gutterBottom>
        Registration Successful!
      </Typography>
      
      <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Your Patient Card Number:
        </Typography>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
          {cardNumber || (patient && patient.patientCardNumber) || 'Not assigned'}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Please keep this number safe as you'll need it for future visits.
        </Typography>
      </Paper>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button 
          variant="contained"
          onClick={() => window.print()}
        >
          Print Details
        </Button>

         <Button 
                  variant="outlined"
                  onClick={() => navigate('/receptionist/dashboard')}
                >
                  Return to Dashboard
                </Button>
      </Box>
    </Box>
  );
};

export default RegistrationSuccess;