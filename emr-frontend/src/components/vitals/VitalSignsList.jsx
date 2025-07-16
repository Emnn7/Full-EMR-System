import React from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress
} from '@mui/material';

const VitalSignsList = ({ vitalSigns, loading = false }) => {
  // Ensure vitalSigns is always an array
  const safeVitalSigns = Array.isArray(vitalSigns) ? vitalSigns : [];
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (safeVitalSigns.length === 0) {
    return (
      <Box p={2}>
        <Typography variant="body1" color="textSecondary">
          No vital signs recorded
        </Typography>
      </Box>
    );
  }

  // Helper to format missing values
  const formatVitalValue = (value, unit = '') => {
    if (value === undefined || value === null || value === '') {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>Not recorded</span>;
    }
    return `${value} ${unit}`.trim();
  };

  // Helper to format blood pressure
  const formatBloodPressure = (bp) => {
    if (!bp || bp.systolic === undefined || bp.diastolic === undefined) {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>Not recorded</span>;
    }
    return `${bp.systolic}/${bp.diastolic} ${bp.unit || 'mmHg'}`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Vital Signs</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Temperature (°C)</TableCell>
              <TableCell>Blood Pressure</TableCell>
              <TableCell>Heart Rate</TableCell>
              <TableCell>Respiratory Rate</TableCell>
              <TableCell>Oxygen Saturation</TableCell>
              <TableCell>BMI</TableCell>
              <TableCell>Blood Sugar</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeVitalSigns.slice(0, 5).map((vital) => (
              <TableRow key={vital._id}>
                <TableCell>
                  {vital.patient?.firstName} {vital.patient?.lastName}
                </TableCell>
                <TableCell>
                  {formatVitalValue(vital.temperature?.value, vital.temperature?.unit)}
                </TableCell>
                <TableCell>
                  {formatBloodPressure(vital.bloodPressure)}
                </TableCell>
                <TableCell>
                  {formatVitalValue(vital.heartRate?.value, vital.heartRate?.unit)}
                </TableCell>
                <TableCell>
                  {formatVitalValue(vital.respiratoryRate?.value, vital.respiratoryRate?.unit)}
                </TableCell>
                <TableCell>
                  {formatVitalValue(vital.oxygenSaturation?.value, vital.oxygenSaturation?.unit)}
                </TableCell>
                <TableCell>
                  {vital.bmi?.value ? `${vital.bmi.value} (${vital.bmi.classification})` : 'Not recorded'}
                </TableCell>
                <TableCell>
                  {formatVitalValue(vital.bloodSugar?.value, vital.bloodSugar?.unit)}
                  {vital.bloodSugar?.fasting !== undefined && 
                    ` (${vital.bloodSugar.fasting ? 'Fasting' : 'Non-fasting'})`}
                </TableCell>
                <TableCell>
                  {vital.notes || 'None'}
                </TableCell>
                <TableCell>
                  {vital.createdAt ? new Date(vital.createdAt).toLocaleString() : 'Not recorded'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default VitalSignsList;