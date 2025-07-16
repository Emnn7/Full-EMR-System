import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { fetchVitalSigns } from '../../redux/slices/vitalSignsSlice';

// Helper to format missing values
const formatVitalValue = (value, unit = '') => {
  if (value === undefined || value === null || value === '') {
    return <span style={{ color: '#999', fontStyle: 'italic' }}>Not recorded</span>;
  }
  return `${value} ${unit}`.trim();
};

const AllVitalSigns = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vitalSigns = [], loading } = useSelector((state) => state.vitalSigns);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchVitalSigns());
  }, [dispatch]);

  const filteredVitals = vitalSigns.filter(vital => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (vital.patient?.firstName?.toLowerCase().includes(searchLower)) ||
      (vital.patient?.lastName?.toLowerCase().includes(searchLower)) ||
      (vital.patient?.phone?.includes(searchTerm))
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        All Vital Signs
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search vitals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={() => navigate('/lab/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                  <TableCell>Patient</TableCell>
    <TableCell>Temp (°C)</TableCell>
    <TableCell>BP</TableCell>
    <TableCell>Heart Rate</TableCell>
    <TableCell>Respiratory Rate</TableCell>
    <TableCell>O<sub>2</sub> Saturation</TableCell>
    <TableCell>Height (cm)</TableCell>
    <TableCell>Weight (kg)</TableCell>
    <TableCell>Blood Sugar (mg/dL)</TableCell>
    <TableCell>Fasting</TableCell>
    <TableCell>Notes</TableCell>
    <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
<TableBody>
  {filteredVitals.map((vital) => (
    <TableRow key={vital._id}>
      <TableCell>
        {vital.patient?.firstName} {vital.patient?.lastName}
      </TableCell>

      <TableCell>
        {vital.temperature?.value ? `${vital.temperature.value} ${vital.temperature.unit || '°C'}` : 'Not recorded'}
      </TableCell>

      <TableCell>
        {vital.bloodPressure?.systolic && vital.bloodPressure?.diastolic
          ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic} mmHg`
          : 'Not recorded'}
      </TableCell>

      <TableCell>
        {vital.heartRate?.value ? `${vital.heartRate.value} ${vital.heartRate.unit || 'bpm'}` : 'Not recorded'}
      </TableCell>

      <TableCell>
        {vital.respiratoryRate?.value ? `${vital.respiratoryRate.value} ${vital.respiratoryRate.unit || 'breaths/min'}` : 'Not recorded'}
      </TableCell>

      <TableCell>
        {vital.oxygenSaturation?.value ? `${vital.oxygenSaturation.value} ${vital.oxygenSaturation.unit || '%'}` : 'Not recorded'}
      </TableCell>

      <TableCell>
        {vital.height?.value ? `${vital.height.value} ${vital.height.unit || 'cm'}` : 'Not recorded'}
      </TableCell>

      <TableCell>
        {vital.weight?.value ? `${vital.weight.value} ${vital.weight.unit || 'kg'}` : 'Not recorded'}
      </TableCell>

      <TableCell>
        {vital.bloodSugar?.value ? `${vital.bloodSugar.value} ${vital.bloodSugar.unit || 'mg/dL'}` : 'Not recorded'}
      </TableCell>

      <TableCell>
        {vital.bloodSugar?.fasting !== undefined
          ? (vital.bloodSugar.fasting ? 'Yes' : 'No')
          : 'Not recorded'}
      </TableCell>

      <TableCell>
        {vital.notes || 'Not recorded'}
      </TableCell>

      <TableCell>
        {vital.createdAt
          ? new Date(vital.createdAt).toLocaleString()
          : 'Not recorded'}
      </TableCell>
    </TableRow>
  ))}
</TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AllVitalSigns;
