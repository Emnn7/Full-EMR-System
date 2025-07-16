import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

const BillingForm = ({ initialValues, onSubmit, services }) => {
  const validationSchema = Yup.object().shape({
    patientId: Yup.string().required('Patient is required'),
    services: Yup.array()
      .min(1, 'At least one service must be added')
      .required('Services are required'),
    paymentStatus: Yup.string().required('Payment status is required'),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      patientId: '',
      services: [],
      paymentStatus: 'Unpaid',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const handleAddService = (service) => {
    formik.setFieldValue('services', [
      ...formik.values.services,
      { ...service, quantity: 1 }
    ]);
  };

  const handleRemoveService = (index) => {
    const newServices = [...formik.values.services];
    newServices.splice(index, 1);
    formik.setFieldValue('services', newServices);
  };

  const handleQuantityChange = (index, quantity) => {
    const newServices = [...formik.values.services];
    newServices[index].quantity = quantity;
    formik.setFieldValue('services', newServices);
  };

  const totalAmount = formik.values.services.reduce(
    (sum, service) => sum + service.price * service.quantity,
    0
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Billing Information
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Patient</InputLabel>
              <Select
                name="patientId"
                value={formik.values.patientId}
                onChange={formik.handleChange}
                label="Patient"
                error={formik.touched.patientId && Boolean(formik.errors.patientId)}
              >
                <MenuItem value="patient1">John Doe</MenuItem>
                <MenuItem value="patient2">Jane Smith</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Payment Status</InputLabel>
              <Select
                name="paymentStatus"
                value={formik.values.paymentStatus}
                onChange={formik.handleChange}
                label="Payment Status"
                error={formik.touched.paymentStatus && Boolean(formik.errors.paymentStatus)}
              >
                <MenuItem value="Unpaid">Unpaid</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Partial">Partial Payment</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Available Services
            </Typography>
            <Grid container spacing={1}>
              {services.map((service) => (
                <Grid item key={service.id}>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => handleAddService(service)}
                  >
                    {service.name} (${service.price})
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Selected Services
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formik.values.services.map((service, index) => (
                    <TableRow key={index}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>${service.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={service.quantity}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                          inputProps={{ min: 1 }}
                          size="small"
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell>${(service.price * service.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleRemoveService(index)}>
                          <Delete color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {formik.touched.services && formik.errors.services && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {formik.errors.services}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" align="right">
              Total Amount: ${totalAmount.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              {initialValues ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default BillingForm;