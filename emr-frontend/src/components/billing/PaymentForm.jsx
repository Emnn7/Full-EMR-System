import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';

const PaymentForm = ({ invoice, onSubmit }) => {
  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .required('Amount is required')
      .min(1, 'Amount must be at least $1')
      .max(invoice.balanceDue, `Amount cannot exceed $${invoice.balanceDue}`),
    paymentMethod: Yup.string().required('Payment method is required'),
    paymentDate: Yup.date().required('Payment date is required'),
    notes: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      amount: invoice.balanceDue,
      paymentMethod: 'Cash',
      paymentDate: new Date(),
      notes: '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Process Payment
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1">
          Invoice #: {invoice.invoiceNumber}
        </Typography>
        <Typography variant="body1">
          Patient: {invoice.patientName}
        </Typography>
        <Typography variant="body1">
          Total Amount: ${invoice.totalAmount.toFixed(2)}
        </Typography>
        <Typography variant="body1">
          Amount Paid: ${invoice.amountPaid.toFixed(2)}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          Balance Due: ${invoice.balanceDue.toFixed(2)}
        </Typography>
      </Box>
      
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={formik.values.amount}
              onChange={formik.handleChange}
              error={formik.touched.amount && Boolean(formik.errors.amount)}
              helperText={formik.touched.amount && formik.errors.amount}
              inputProps={{ min: 1, max: invoice.balanceDue, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                name="paymentMethod"
                value={formik.values.paymentMethod}
                onChange={formik.handleChange}
                label="Payment Method"
                error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Credit Card">Credit Card</MenuItem>
                <MenuItem value="Debit Card">Debit Card</MenuItem>
                <MenuItem value="Insurance">Insurance</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Payment Date"
              name="paymentDate"
              type="date"
              value={formik.values.paymentDate}
              onChange={formik.handleChange}
              error={formik.touched.paymentDate && Boolean(formik.errors.paymentDate)}
              helperText={formik.touched.paymentDate && formik.errors.paymentDate}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formik.values.notes}
              onChange={formik.handleChange}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Record Payment
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default PaymentForm;