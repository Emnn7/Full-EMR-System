import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import api from '../../api/axios';

const RegistrationPayment = () => {
    const location = useLocation();
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

const handlePayment = async () => {
  setIsProcessing(true);
  setError('');
  
  try {
    // 1. Update payment status
    await api.patch(`/patients/${patientId}/payment-status`, { status: 'paid' });
    
    // 2. Get the card number from location state (passed from registration)
    const cardNumber = location.state?.patient?.patientCardNumber;

    // 3. Redirect to success page with card number
    navigate('/registration/success', { 
      state: { 
        cardNumber,
        patientId: patientId
      } 
    });
    
  } catch (err) {
    setError(err.response?.data?.message || 'Payment failed. Please try again.');
    setIsProcessing(false);
  }
};

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Complete Registration Payment
      </Typography>
      
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Typography variant="h6" gutterBottom>
          Registration Fee: $100
        </Typography>
        
        <FormControl fullWidth sx={{ mt: 2, mb: 3 }}>
          <InputLabel>Payment Method</InputLabel>
          <Select
            value={paymentMethod}
            label="Payment Method"
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="card">Card</MenuItem>
            <MenuItem value="insurance">Bank Transfer</MenuItem>
            <MenuItem value="mobile-money">Mobile Money</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/receptionist/dashboard')}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePayment}
            disabled={isProcessing}
            startIcon={isProcessing ? <CircularProgress size={20} /> : null}
          >
            {isProcessing ? 'Processing...' : 'Complete Payment'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegistrationPayment;