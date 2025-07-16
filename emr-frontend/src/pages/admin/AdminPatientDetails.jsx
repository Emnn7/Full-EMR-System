import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Paper,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  LocalHospital as LocalHospitalIcon,
  Assignment as AssignmentIcon,
  Medication as MedicationIcon,
  Science as ScienceIcon,
  Fingerprint as FingerprintIcon,
} from '@mui/icons-material';

import {
  fetchPatientById,
  fetchPatientVitalSigns,
  fetchPatientMedicalHistory,
  fetchPatientPrescriptions,
  fetchPatientLabOrders,
} from '../../redux/slices/patientSlice';

import VitalSignsList from '../../components/vitals/VitalSignsList';
import MedicalHistoryList from '../../components/medical/MedicalHistoryList';
import PrescriptionList from '../../components/prescriptions/PrescriptionList';
import LabOrderList from '../../components/labs/LabOrderList';
import Button from '@mui/material/Button';
import { generateMedicalReport } from '../../redux/slices/medicalReportSlice';


const AdminPatientDetails = () => {
  const { patientId } = useParams();
  const dispatch = useDispatch();

  const { 
    currentPatient, 
    vitalSigns, 
    medicalHistory, 
    prescriptions, 
    labOrders,
    loading, 
    error 
  } = useSelector((state) => state.patient);
useEffect(() => {
  console.log('Medical history in component:', medicalHistory);
}, [medicalHistory]);
  useEffect(() => {
    if (patientId && patientId !== 'undefined') {
      dispatch(fetchPatientById(patientId));
      dispatch(fetchPatientVitalSigns(patientId));
      dispatch(fetchPatientMedicalHistory(patientId));
      dispatch(fetchPatientLabOrders(patientId));
      dispatch(fetchPatientPrescriptions(patientId));
    } else {
      console.warn('Invalid patientId:', patientId);
    }
  }, [dispatch, patientId]);

  if (!patientId) {
    return <Alert severity="error">Patient ID is missing from URL</Alert>;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentPatient) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Patient not found</Alert>
      </Box>
    );
  }
  const handleGenerateReport = () => {
  dispatch(generateMedicalReport(patientId));
};
  console.log('Current patient:', currentPatient);
  console.log('Vital signs:', vitalSigns);
  console.log('Medical history:', medicalHistory);
  console.log('Prescriptions:', prescriptions);
  console.log('Lab orders:', labOrders);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Patient Administration View
      </Typography>

      {/* Basic Information Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 1 }} /> Basic Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
          <Typography variant="body1"><strong>Patient ID:</strong> {currentPatient._id}</Typography>
<Typography variant="body1"><strong>Full Name:</strong> {`${currentPatient.firstName} ${currentPatient.lastName}`}</Typography>
<Typography variant="body1"><strong>Date of Birth:</strong> {new Date(currentPatient.dateOfBirth).toLocaleDateString()}</Typography>
            <Typography variant="body1"><strong>Gender:</strong> {currentPatient.gender}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1"><strong>Phone:</strong> {currentPatient.phone}</Typography>
            <Typography variant="body1"><strong>Address:</strong> {currentPatient.address}</Typography>
            <Typography variant="body1">
              <strong>Emergency Contact:</strong> {
                currentPatient.emergencyContact 
                  ? `${currentPatient.emergencyContact.name} (${currentPatient.emergencyContact.relationship}) - ${currentPatient.emergencyContact.phone}`
                  : 'N/A'
              }
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Medical Sections */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalHospitalIcon sx={{ mr: 1 }} /> Vital Signs
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <VitalSignsList 
              vitalSigns={Array.isArray(vitalSigns) ? vitalSigns : []}
              loading={loading}
              adminView={true}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ mr: 1 }} /> Medical History
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <MedicalHistoryList 
  medicalHistory={medicalHistory}
  loading={loading}
  adminView={true}
/>
          </Paper>
        </Grid>
      </Grid>

      {/* Prescriptions and Lab Orders */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <MedicationIcon sx={{ mr: 1 }} /> Prescriptions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <PrescriptionList 
              prescriptions={Array.isArray(prescriptions) ? prescriptions : []}
              loading={loading}
              adminView={true}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ScienceIcon sx={{ mr: 1 }} /> Lab Orders
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <LabOrderList 
              labOrders={Array.isArray(labOrders) ? labOrders : []}
              loading={loading}
              adminView={true}
            />
          </Paper>
        </Grid>
        <Box sx={{ mb: 3 }}>
  <Button 
    variant="contained" 
    color="primary"
    onClick={handleGenerateReport}
    startIcon={<AssignmentIcon />}
  >
    Generate Full Medical Report
  </Button>
</Box>
      </Grid>
    </Box>
  );
};

export default AdminPatientDetails;
