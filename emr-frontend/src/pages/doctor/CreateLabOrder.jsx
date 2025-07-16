import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { createLabOrder } from '../../redux/slices/labOrderSlice';
import { fetchLabTestCatalog } from '../../redux/slices/labTestCatalogSlice';
import { fetchPatientById } from '../../redux/slices/patientSlice';

const CreateLabOrder = () => {
  const { patientId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { tests: catalogTests, loading: catalogLoading } = useSelector((state) => state.labTestCatalog);
  const { currentPatient, loading: patientLoading } = useSelector((state) => state.patient);
  const [selectedTests, setSelectedTests] = useState([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!patientId || !/^[0-9a-fA-F]{24}$/.test(patientId)) {
      setError('Invalid patient information');
      navigate('/doctor/patients');
      return;
    }

    dispatch(fetchLabTestCatalog());
    dispatch(fetchPatientById(patientId));
  }, [dispatch, patientId, navigate]);

  const handleTestToggle = (test) => {
    setSelectedTests(prev => {
      const exists = prev.find((t) => t._id === test._id);
      if (exists) {
        return prev.filter((t) => t._id !== test._id);
      } else {
        return [...prev, test];
      }
    });
  };

  const groupTestsByCategory = (tests) => {
    const groups = {};
    tests.forEach((test) => {
      const category = test.category || 'Uncategorized';
      if (!groups[category]) groups[category] = [];
      groups[category].push(test);
    });
    return Object.entries(groups).map(([category, tests]) => ({ category, tests }));
  };

  const calculateTotal = () => {
    return selectedTests.reduce((sum, test) => sum + (test.price || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!patientId || !/^[0-9a-fA-F]{24}$/.test(patientId)) {
      setError('Invalid patient ID');
      return;
    }

    if (selectedTests.length === 0) {
      setError('Please select at least one test');
      return;
    }

    try {
      const orderData = {
        patient: patientId,
        tests: selectedTests.map((test) => ({
          testId: test._id,
          name: test.name,
          code: test.code,
          price: test.price,
          quantity: 1
        })),
        notes,
        orderedBy: user._id,
        status: 'pending-payment',
        totalAmount: calculateTotal()
      };


 const response = await dispatch(createLabOrder(orderData)).unwrap();
    
 



    setSuccess(true);
    setTimeout(() => {
      navigate(`/doctors/patients/${patientId}`);
    }, 2000);
  } catch (error) {
    console.error('Error creating lab order:', error);
    setError(error.message || 'Failed to create lab order. Please try again.');
  }
};

  const testGroups = groupTestsByCategory(catalogTests || []);

  if (patientLoading || catalogLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        New Lab Order for {currentPatient?.firstName} {currentPatient?.lastName}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Lab order created successfully! Redirecting...
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Available Tests
            </Typography>
            
            {testGroups.length === 0 ? (
              <Alert severity="info">No lab tests available. Please contact admin.</Alert>
            ) : (
              testGroups.map((group) => (
                <Accordion key={group.category} defaultExpanded sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {group.category} ({group.tests.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {group.tests.map((test) => (
                        <Grid item xs={12} sm={6} key={test._id}>
                          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectedTests.some(t => t._id === test._id)}
                                  onChange={() => handleTestToggle(test)}
                                  color="primary"
                                />
                              }
                              label={
                                <Box sx={{ ml: 1 }}>
                                  <Typography>{test.name} ({test.code})</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    ${test.price} • {test.duration || 'N/A'} mins
                                  </Typography>
                                </Box>
                              }
                            />
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>

              {selectedTests.length > 0 ? (
                <>
                  <List dense sx={{ mb: 2 }}>
                    {selectedTests.map((test) => (
                      <ListItem key={test._id} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={test.name}
                          secondary={test.code}
                        />
                        <Typography>${test.price}</Typography>
                      </ListItem>
                    ))}
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="subtitle1">Total:</Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                      ${calculateTotal()}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No tests selected
                </Typography>
              )}

              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={4}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={selectedTests.length === 0}
              >
                Create Lab Order
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CreateLabOrder;