import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createLabReport } from '../../redux/slices/labReportSlice';
import { fetchLabOrder } from '../../redux/slices/labOrderSlice';

const CreateLabReportForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user } = useSelector((state) => state.auth);
  
  const { currentOrder: labOrder, loading: orderLoading, error: orderError } = useSelector((state) => state.labOrder);
  const { loading, error } = useSelector((state) => state.labReport);

  const [formData, setFormData] = useState({
    findings: '',
    notes: '',
    tests: []
  });

  useEffect(() => {
    if (orderId) {
      console.log('Fetching order with ID:', orderId);
      dispatch(fetchLabOrder(orderId))
        .unwrap()
        .then((order) => {
          console.log('Fetched order:', order);
          if (order && order.tests) {
            const initialTests = order.tests.map(test => ({
              testId: test._id,
              name: test.name,
              result: '',
              unit: test.unit || '',
              normalRange: test.normalRange || '',
              abnormalFlag: 'normal'
            }));
            
            setFormData(prev => ({
              ...prev,
              tests: initialTests
            }));
          }
        })
        .catch((error) => {
          console.error('Failed to fetch lab order:', error);
        });
    }
  }, [dispatch, orderId]);

  const handleTestChange = (index, field, value) => {
    const updatedTests = [...formData.tests];
    updatedTests[index][field] = value;
    setFormData({ ...formData, tests: updatedTests });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!labOrder) {
      console.error('No lab order available');
      return;
    }

    const reportData = {
      labOrder: orderId,
      patient: labOrder.patient._id,
      tests: formData.tests.map(test => ({
        testId: test.testId,
        name: test.name,
        code: test.code || 'N/A',
        result: test.result,
        unit: test.unit,
        normalRange: test.normalRange,
        abnormalFlag: test.abnormalFlag
      })),
      findings: formData.findings,
      notes: formData.notes,
      status: 'completed',
      performedBy: user._id
    };

    try {
      const response = await dispatch(createLabReport(reportData)).unwrap();
      const reportId = response._id || response.data?._id;

      // Check for abnormal results
      const hasAbnormalResults = formData.tests.some(test => 
        test.abnormalFlag !== 'normal'
      );

      navigate(`/lab/reports/${reportId}`);
    } catch (error) {
      console.error('Failed to create report:', error);
    }
  };
  if (orderLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (orderError) {
    return (
      <Alert severity="error" sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
        Error loading lab order: {orderError}
      </Alert>
    );
  }

  if (!labOrder) {
    return (
      <Alert severity="error" sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
        No lab order found with ID: {orderId}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create Lab Report for Order #{orderId?.substring(0, 8)}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Patient Information</Typography>
        <Typography>
          {labOrder.patient?.firstName} {labOrder.patient?.lastName}
        </Typography>
        <Typography>Order Date: {new Date(labOrder.createdAt).toLocaleDateString()}</Typography>
      </Paper>

      <form onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Test Results</Typography>
          
          {formData.tests.map((test, index) => (
            <Box key={test.testId} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {test.name}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Result"
                    value={test.result}
                    onChange={(e) => handleTestChange(index, 'result', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Unit"
                    value={test.unit}
                    onChange={(e) => handleTestChange(index, 'unit', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Flag</InputLabel>
                    <Select
                      value={test.abnormalFlag}
                      label="Flag"
                      onChange={(e) => handleTestChange(index, 'abnormalFlag', e.target.value)}
                    >
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="critical">Critical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              {test.normalRange && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Normal Range: {test.normalRange}
                </Typography>
              )}
            </Box>
          ))}
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Additional Information</Typography>
          
          <TextField
            fullWidth
            label="Findings"
            multiline
            rows={4}
            value={formData.findings}
            onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
            sx={{ mb: 3 }}
          />
          
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </Paper>

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
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Report'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </form>
    </Box>
  );
};

export default CreateLabReportForm;




