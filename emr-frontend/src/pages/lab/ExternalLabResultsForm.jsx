import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { createLabReport } from '../../redux/slices/labReportSlice';

const ExternalLabResultsForm = () => {
  const { patientId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    testName: '',
    result: '',
    unit: '',
    normalRange: '',
    datePerformed: new Date().toISOString().split('T')[0],
    labName: '',
    files: [],
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e) => {
    setFormData({
      ...formData,
      files: [...formData.files, ...Array.from(e.target.files)]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const reportData = {
      patient: patientId,
      ...formData,
      isExternal: true,
      status: 'completed'
    };

    dispatch(createLabReport(reportData))
      .then(() => {
        navigate(`/lab/dashboard`);
      });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Enter External Lab Results
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Test Name"
              name="testName"
              value={formData.testName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Lab Name"
              name="labName"
              value={formData.labName}
              onChange={handleChange}
              required
            />
          </Grid>
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
              fullWidth
              label="Date Performed"
              name="datePerformed"
              type="date"
              value={formData.datePerformed}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
              >
                Upload Results
                <input
                  type="file"
                  hidden
                  onChange={handleFileUpload}
                  multiple
                />
              </Button>
              <Typography variant="body2">
                {formData.files.length > 0 
                  ? `${formData.files.length} file(s) selected` 
                  : 'No files selected'}
              </Typography>
            </Box>
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
              Save External Results
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ExternalLabResultsForm;