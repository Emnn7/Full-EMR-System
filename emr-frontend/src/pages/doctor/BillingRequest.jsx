import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Box,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { createBilling } from '../../redux/slices/billingSlice';
import { fetchPatientById } from '../../redux/slices/patientSlice';
import { pushNotification } from '../../redux/slices/notificationSlice';
import { NOTIFICATION_TYPES, NOTIFICATION_ENTITIES } from '../../config/constants';

const BillingRequest = () => {
  const { patientId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { currentPatient, loading: patientLoading } = useSelector((state) => state.patient);
  const [formData, setFormData] = useState({
    items: [{
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }],
    notes: '',
    status: 'pending'
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (patientId) {
      dispatch(fetchPatientById(patientId));
    }
  }, [dispatch, patientId]);

  const serviceOptions = [
    { description: 'Consultation', unitPrice: 100 },
    { description: 'Follow-up Visit', unitPrice: 75 },
    { description: 'Basic Metabolic Panel', unitPrice: 50 },
    { description: 'Complete Blood Count', unitPrice: 60 },
    { description: 'Urinalysis', unitPrice: 40 },
    { description: 'Prescription', unitPrice: 0 }
  ];

  const handleServiceChange = (index, value) => {
    const selectedService = serviceOptions.find(s => s.description === value);
    const items = [...formData.items];
    
    if (selectedService) {
      items[index] = {
        ...items[index],
        description: selectedService.description,
        unitPrice: selectedService.unitPrice,
        total: selectedService.unitPrice * items[index].quantity
      };
    } else {
      items[index] = {
        ...items[index],
        description: value,
        total: items[index].unitPrice * items[index].quantity
      };
    }

    setFormData({ ...formData, items });
    setValidationErrors({});
  };

  const handleQuantityChange = (index, value) => {
    const quantity = parseInt(value) || 0;
    const items = [...formData.items];
    items[index] = {
      ...items[index],
      quantity,
      total: items[index].unitPrice * quantity
    };
    setFormData({ ...formData, items });
  };

  const handlePriceChange = (index, value) => {
    const unitPrice = parseFloat(value) || 0;
    const items = [...formData.items];
    items[index] = {
      ...items[index],
      unitPrice,
      total: unitPrice * items[index].quantity
    };
    setFormData({ ...formData, items });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0
        }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    const items = [...formData.items];
    items.splice(index, 1);
    setFormData({ ...formData, items });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    formData.items.forEach((item, index) => {
      if (!item.description) {
        errors[`item-${index}-description`] = 'Description is required';
        isValid = false;
      }
      if (item.quantity <= 0) {
        errors[`item-${index}-quantity`] = 'Quantity must be greater than 0';
        isValid = false;
      }
      if (item.unitPrice < 0) {
        errors[`item-${index}-price`] = 'Price cannot be negative';
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    const subtotal = calculateTotal();
    
    dispatch(createBilling({
      patient: patientId,
      createdBy: user._id,
      createdByModel: user.role === 'doctor' ? 'Doctor' : 'Admin',
      items: formData.items,
      subtotal,
      total: subtotal,
      notes: formData.notes,
      status: formData.status
    }))
    .unwrap()
    .then((billing) => {
      // Notification for receptionists
      dispatch(pushNotification({
        recipient: 'all-receptionists',
        recipientModel: 'Receptionist',
        sender: user._id,
        senderModel: 'Doctor',
        type: NOTIFICATION_TYPES.PAYMENT_REQUIRED,
        message: `Payment required for ${formData.items.length} items (${currentPatient?.firstName} ${currentPatient?.lastName})`,
        relatedEntity: NOTIFICATION_ENTITIES.BILLING,
        relatedEntityId: billing._id,
        createdAt: new Date().toISOString()
      }));

      setSuccess(true);
      setTimeout(() => {
        navigate(`/doctor/patient/${patientId}`);
      }, 1500);
    })
    .catch((error) => {
      console.error('Error creating billing:', error);
      setError(error.message || 'Failed to create billing request');
    });
  };

  if (patientLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        New Billing Request for {currentPatient?.firstName} {currentPatient?.lastName}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Billing request created successfully! Redirecting...
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Billing Items
            </Typography>
            
            {formData.items.map((item, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth>
                    <InputLabel>Service/Item</InputLabel>
                    <Select
                      value={item.description}
                      onChange={(e) => handleServiceChange(index, e.target.value)}
                      label="Service/Item"
                      error={!!validationErrors[`item-${index}-description`]}
                    >
                      {serviceOptions.map((service) => (
                        <MenuItem key={service.description} value={service.description}>
                          {service.description} (${service.unitPrice})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {validationErrors[`item-${index}-description`] && (
                    <Typography color="error" variant="caption">
                      {validationErrors[`item-${index}-description`]}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    error={!!validationErrors[`item-${index}-quantity`]}
                    helperText={validationErrors[`item-${index}-quantity`]}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Unit Price"
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    error={!!validationErrors[`item-${index}-price`]}
                    helperText={validationErrors[`item-${index}-price`]}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Total"
                    value={`$${item.total.toFixed(2)}`}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    onClick={() => handleRemoveItem(index)}
                    color="error"
                    disabled={formData.items.length <= 1}
                  >
                    <RemoveIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              sx={{ mb: 3 }}
            >
              Add Item
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Typography variant="h6">
                Total: ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Submit Billing Request
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default BillingRequest;