import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, TextField, Button, Grid, Paper, MenuItem } from '@mui/material';
import { createLabReport } from '../../redux/slices/labReportSlice';

const EnterLabReport = () => {
  const { orderId, testIndex } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { labOrders } = useSelector((state) => state.labOrder);
  
  const order = labOrders.find(o => o._id === orderId);
  const test = order?.tests[testIndex];
  
  const [formData, setFormData] = useState({
    result: '',
    unit: '',
    normalRange: '',
    abnormalFlag: 'normal',
    notes: ''
  });

  if (!order || !test) {
    return <Typography>Lab order or test not found</Typography>;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const labReportData = {
      labOrder: orderId,
      patient: order.patient._id,
      testName: test.name,
      testCode: test.code,
      ...formData,
      performedBy: user._id
    };

    dispatch(createLabReport(labReportData))
      .then(() => {
        navigate(`/lab/orders`);
      });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Enter Lab Results: {test.name} ({test.code})
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Patient: {order.patient.firstName} {order.patient.lastName}
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Result"
              name="result"
              value={formData.result}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Normal Range"
              name="normalRange"
              value={formData.normalRange}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Abnormal Flag"
              name="abnormalFlag"
              value={formData.abnormalFlag}
              onChange={handleChange}
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Save Lab Report
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default EnterLabReport;