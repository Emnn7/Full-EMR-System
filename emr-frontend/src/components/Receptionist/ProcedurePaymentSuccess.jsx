import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProcedurePaymentSuccess = () => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Payment Successful
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          The procedure payment has been processed successfully.
        </Typography>
        <Button 
          variant="contained"
          onClick={() => navigate('/receptionist/dashboard')}
        >
          Return to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default ProcedurePaymentSuccess;