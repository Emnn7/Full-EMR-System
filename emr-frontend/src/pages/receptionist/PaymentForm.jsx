import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, Paper, Grid, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Divider, Alert, Select, MenuItem, InputLabel, 
  FormControl, CircularProgress
} from '@mui/material';
import { 
  createPayment, 
  clearPaymentError,
  fetchBillingById,
  createBillingFromProcedure
} from '../../redux/slices/paymentSlice';
import { fetchPatientProcedure } from '../../redux/slices/patientProcedureSlice';
import api from '../../api/axios'

const PaymentForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get parameters from URL
  const queryParams = new URLSearchParams(location.search);
  const procedureId = queryParams.get('procedureId');
  const paymentType = queryParams.get('type') || 'procedure'; // 'registration', 'procedure', 'lab-test'
  
  // Redux state
  const { 
    billing, 
    loading: billingLoading, 
    error: paymentError 
  } = useSelector((state) => state.payment);
  const { 
    currentProcedure, 
    loading: procedureLoading 
  } = useSelector((state) => state.patientProcedure);
  
  // Form state
  const [formData, setFormData] = useState({
    paymentMethod: 'cash',
    amountReceived: 0,
    notes: '',
    discount: 0,
    taxAmount: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState({
    paymentTypes: [],
    paymentMethods: []
  });

  // Fetch initial data based on payment type
  useEffect(() => {
    if (paymentType === 'procedure' && procedureId) {
      dispatch(fetchPatientProcedure(procedureId));
    } else if (paymentType === 'billing' && id) {
      dispatch(fetchBillingById(id));
    }
  }, [id, procedureId, paymentType, dispatch]);

  // Fetch payment options
  useEffect(() => {
    const fetchPaymentOptions = async () => {
      try {
        const response = await api.get('/payments/types');
        setPaymentOptions(response.data.data);
      } catch (error) {
        console.error('Failed to fetch payment options:', error);
      }
    };

    if (!id) {
      fetchPaymentOptions();
    }
  }, [id]);

  // Set initial amount when data loads
  useEffect(() => {
    if (currentProcedure || billing) {
      const total = calculateTotal();
      setFormData(prev => ({
        ...prev,
        amountReceived: total
      }));
    } else if (paymentType === 'registration') {
      // Use default registration fee from payment options if available
      const regFee = paymentOptions.paymentTypes.find(
        type => type.type === 'registration'
      )?.defaultAmount || 50;
      
      setFormData(prev => ({
        ...prev,
        amountReceived: regFee
      }));
    }
  }, [currentProcedure, billing, paymentType, paymentOptions]);

  const calculateTotal = () => {
    if (currentProcedure) {
      return currentProcedure.procedures.reduce(
        (sum, p) => sum + (p.procedure.price * p.quantity), 
        0
      );
    }
    if (billing) {
      return billing.total || 0;
    }
    // For registration payments, use the amount from formData
    if (paymentType === 'registration') {
      return formData.amountReceived;
    }
    return 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amountReceived' || name === 'discount' || name === 'taxAmount' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let billingId = billing?._id;
      
      // For procedure payments without existing billing, create one first
      if (paymentType === 'procedure' && !billingId && currentProcedure) {
        const billingResponse = await dispatch(createBillingFromProcedure(currentProcedure._id)).unwrap();
        billingId = billingResponse.data.billing._id;
      }

      // Prepare payment data based on payment type
      const paymentData = {
        paymentType,
        paymentMethod: formData.paymentMethod,
        amountReceived: formData.amountReceived,
        notes: formData.notes,
        discount: formData.discount,
        taxAmount: formData.taxAmount,
        status: formData.amountReceived >= calculateTotal() ? 'completed' : 'partially-paid',
        services: [],
        totalAmount: calculateTotal()
      };

      // Set related fields based on payment type
      if (paymentType === 'procedure') {
        paymentData.patient = currentProcedure?.patient?._id;
        paymentData.billing = billingId;
        paymentData.relatedEntity = currentProcedure?._id;
        paymentData.relatedEntityModel = 'PatientProcedure';
        paymentData.services = currentProcedure?.procedures?.map(p => ({
          code: p.procedure.code,
          description: p.procedure.description,
          amount: p.procedure.price * p.quantity
        }));
      } 
      else if (paymentType === 'billing') {
        paymentData.patient = billing?.patient?._id;
        paymentData.billing = billingId;
        paymentData.services = billing?.services;
      }
      else if (paymentType === 'registration') {
        paymentData.patient = id;
        paymentData.paymentType = 'registration';
        paymentData.relatedEntity = id;
        paymentData.relatedEntityModel = 'Patient';
        paymentData.services = [{
          code: 'REG',
          description: 'Registration Fee',
          amount: calculateTotal()
        }];
      }

      await dispatch(createPayment(paymentData)).unwrap();
      navigate('/receptionist/payments');
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if ((procedureLoading || billingLoading) && paymentType !== 'registration') {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if we have data to display (except for registration payments)
  const hasData = paymentType === 'registration' || currentProcedure || billing;
  if (!hasData) {
    return (
      <Box p={4}>
        <Typography variant="h6" color="error">
          No payment information found
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/receptionist')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box component={Paper} p={4}>
      <Typography variant="h5" gutterBottom>
        {paymentType === 'registration' ? 'Patient Registration Payment' : 
         paymentType === 'lab-test' ? 'Lab Test Payment' : 'Procedure Payment'}
      </Typography>
      
      {paymentError && (
        <Alert severity="error" onClose={() => dispatch(clearPaymentError())} sx={{ mb: 3 }}>
          {paymentError}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Patient Details
          </Typography>
          <Typography>
            Patient: {(currentProcedure?.patient || billing?.patient)?.firstName} {(currentProcedure?.patient || billing?.patient)?.lastName}
          </Typography>
          {currentProcedure?.doctor && (
            <Typography>
              Doctor: {currentProcedure.doctor.firstName} {currentProcedure.doctor.lastName}
            </Typography>
          )}
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            {paymentType === 'registration' ? 'Registration Fee' : 
             currentProcedure ? 'Procedures' : 'Services'}
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  {paymentType !== 'registration' && <TableCell>Qty</TableCell>}
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentType === 'registration' ? (
                  <TableRow>
                    <TableCell>REG</TableCell>
                    <TableCell>Registration Fee</TableCell>
                    <TableCell>${calculateTotal().toFixed(2)}</TableCell>
                  </TableRow>
                ) : currentProcedure ? (
                  currentProcedure.procedures.map((p, index) => (
                    <TableRow key={index}>
                      <TableCell>{p.procedure.code}</TableCell>
                      <TableCell>{p.procedure.description}</TableCell>
                      <TableCell>{p.quantity}</TableCell>
                      <TableCell>${(p.procedure.price * p.quantity).toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  billing?.services?.map((service, index) => (
                    <TableRow key={index}>
                      <TableCell>{service.code}</TableCell>
                      <TableCell>{service.description}</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>${service.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Discount"
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  inputProps={{
                    step: "0.01",
                    min: "0"
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Tax Amount"
                  type="number"
                  name="taxAmount"
                  value={formData.taxAmount}
                  onChange={handleChange}
                  inputProps={{
                    step: "0.01",
                    min: "0"
                  }}
                />
              </Grid>
            </Grid>
          </Box>
          
          <Box mt={2} textAlign="right">
            <Typography variant="subtitle1">
              Subtotal: ${calculateTotal().toFixed(2)}
            </Typography>
            <Typography variant="subtitle1">
              Discount: ${formData.discount.toFixed(2)}
            </Typography>
            <Typography variant="subtitle1">
              Tax: ${formData.taxAmount.toFixed(2)}
            </Typography>
            <Typography variant="subtitle1">
              Total Amount: <strong>${(calculateTotal() - formData.discount + formData.taxAmount).toFixed(2)}</strong>
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Payment Information
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                name="paymentMethod"
                value={formData.paymentMethod}
                label="Payment Method"
                onChange={handleChange}
                required
              >
                {paymentOptions.paymentMethods?.map(method => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount Received"
              type="number"
              name="amountReceived"
              value={formData.amountReceived}
              onChange={handleChange}
              required
              inputProps={{
                step: "0.01",
                min: "0"
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
           <TextField
  fullWidth
  label="Payment Details (Last 4 digits, check #, etc.)"
  name="paymentDetails"
  value={formData.paymentDetails}
  onChange={handleChange}
/>
          </Grid>
      
        </Grid>
        
        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/receptionist')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <Button 
            variant="contained" 
            type="submit"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Processing...' : 'Process Payment'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentForm;