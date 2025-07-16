import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert, Paper } from '@mui/material';
import { Description } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { generateMedicalReport } from '../../redux/slices/medicalReportSlice';

const MedicalReportGenerator = () => {
  const { patientId } = useParams();
  const dispatch = useDispatch();
  const { generating, error } = useSelector((state) => state.medicalReport);

  const handleGenerate = () => {
    dispatch(generateMedicalReport(patientId));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <Description sx={{ mr: 1 }} /> Generate Medical Report
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Report Options</Typography>
        <Typography paragraph>
          This will generate a comprehensive medical report including:
        </Typography>
        <ul>
          <li>Patient demographics</li>
          <li>Medical history</li>
          <li>Vital signs</li>
          <li>Appointments</li>
          <li>Prescriptions</li>
          <li>Lab results</li>
        </ul>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          size="large"
          onClick={handleGenerate}
          disabled={generating}
          startIcon={generating ? <CircularProgress size={20} /> : null}
        >
          {generating ? 'Generating Report...' : 'Generate Full Report'}
        </Button>
      </Paper>
    </Box>
  );
};

export default MedicalReportGenerator;