import React, { useState } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Button,
  Alert,
  Paper, CircularProgress
} from '@mui/material';

const PaymentMethods = ({ onSubmit, loading, amount }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }
    setError(null);
    onSubmit(paymentMethod);
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend">Payment Method</FormLabel>
        <RadioGroup
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <FormControlLabel
            value="card"
            control={<Radio />}
            label="Credit/Debit Card"
          />
          <FormControlLabel
            value="mobile-money"
            control={<Radio />}
            label="Mobile Money"
          />
          <FormControlLabel
            value="bank-transfer"
            control={<Radio />}
            label="Bank Transfer"
          />
          <FormControlLabel
            value="cash"
            control={<Radio />}
            label="Cash (In-person)"
          />
        </RadioGroup>
      </FormControl>

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Amount Due:</Typography>
        <Typography variant="h6">${amount}</Typography>
      </Box>

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        sx={{ mt: 3 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Complete Payment'}
      </Button>
    </Paper>
  );
};

export default PaymentMethods;