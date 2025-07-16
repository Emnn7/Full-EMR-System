import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Typography, Paper, Button, 
  CircularProgress, Alert, Divider,
  List, ListItem, ListItemText,
  Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Select, FormControl, InputLabel, TextField, Grid
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { 
  createLabOrderBilling,
  resetPaymentState
} from '../../redux/slices/labPaymentSlice';
import { 
  fetchPendingPaymentOrders,
  updateLabOrderPaymentStatus
} from '../../redux/slices/labOrderSlice';

const LabPayment = () => {
  const { id: labOrderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openConfirm, setOpenConfirm] = useState(false);

  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'cash',
    paymentType: 'lab-test',
    notes: ''
  });

  const {
    billing,
    paymentStatus,
    loading,
    error,
    paymentProcessing,
    paymentSuccess
  } = useSelector((state) => state.labPayment);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        await dispatch(createLabOrderBilling(labOrderId));
      } catch (error) {
        console.error('Error fetching billing:', error);
      }
    };

    fetchBilling();
  }, [dispatch, labOrderId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentSubmit = async () => {
  try {
    setOpenConfirm(false);

    const resultAction = await dispatch(updateLabOrderPaymentStatus({
      id: labOrderId,
      status: 'paid', // Ensure consistent status
      paymentMethod: paymentData.paymentMethod,
      paymentType: paymentData.paymentType,
      notes: paymentData.notes,
      amount: billing.total // Include the amount
    }));

    if (updateLabOrderPaymentStatus.fulfilled.match(resultAction)) {
      // Refresh data
      await dispatch(createLabOrderBilling(labOrderId)); // Refresh billing
      dispatch(fetchPendingPaymentOrders());
      navigate(`/receptionist/lab-orders/${labOrderId}/payment-success`);
    }
    // ... error handling remains the same
  } catch (error) {
    console.error('Payment error:', error);
    alert('An unexpected error occurred during payment processing');
  }
};

  if (paymentSuccess) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Payment Successful
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Lab order is now ready for processing.
          </Typography>
          <Button 
            variant="contained"
            onClick={() => {
              dispatch(fetchPendingPaymentOrders());
              navigate('/receptionist/dashboard');
            }}
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!billing) return <Alert severity="error">No billing information found</Alert>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Process Lab Order Payment
        </Typography>
        
        <List>
          {billing.items?.map((item, index) => (
            <ListItem key={index}>
              <ListItemText 
                primary={item.description} 
                secondary={`${item.quantity} × $${item.unitPrice}`}
              />
              <Typography>${item.total.toFixed(2)}</Typography>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Total Amount:</Typography>
          <Typography variant="h6">${billing.total.toFixed(2)}</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                name="paymentMethod"
                value={paymentData.paymentMethod}
                label="Payment Method"
                onChange={handleChange}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="bank-transfer">Bank Transfer</MenuItem>
                <MenuItem value="mobile-money">Mobile Money</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Payment Type</InputLabel>
              <Select
                name="paymentType"
                value={paymentData.paymentType}
                label="Payment Type"
                onChange={handleChange}
              >
                <MenuItem value="lab-test">Lab Test</MenuItem>
                <MenuItem value="procedure">Procedure</MenuItem>
                <MenuItem value="registration">Registration</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={paymentData.notes}
              onChange={handleChange}
              multiline
              rows={2}
              sx={{ mb: 3 }}
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          onClick={() => setOpenConfirm(true)}
          fullWidth
          size="large"
          startIcon={<PaymentIcon />}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Process Payment'}
        </Button>

        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirm Payment</DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>
              Payment Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography>Total Amount: ${billing.total.toFixed(2)}</Typography>
              <Typography>Payment Method: {paymentData.paymentMethod}</Typography>
              <Typography>Payment Type: {paymentData.paymentType}</Typography>
            </Box>

            <Typography color="text.secondary">
              Are you sure you want to process this payment?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
            <Button 
              onClick={handlePaymentSubmit}
              variant="contained"
              disabled={loading}
              startIcon={<ReceiptIcon />}
            >
              Confirm Payment
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default LabPayment;
