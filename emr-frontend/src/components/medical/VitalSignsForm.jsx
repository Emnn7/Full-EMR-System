import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, Container, Paper, Typography, Grid, CircularProgress
} from '@mui/material';
import { Edit as EditIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { fetchPatientById } from '../../redux/slices/patientSlice';

// Modular Components
import PatientInfo from './PatientInfo';
import VitalSignsList from '../components/vitals/VitalSignsList';
import MedicalHistoryList from '../../components/medical/MedicalHistoryList';
import LabOrderList from '../../components/labs/LabOrderList';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentPatient: patient, loading } = useSelector((state) => state.patient);

  useEffect(() => {
    dispatch(fetchPatientById(id));
  }, [dispatch, id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!patient) {
    return <Typography>Patient not found</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/patients')}
          sx={{ mb: 2 }}
        >
          Back to Patients
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Patient Details</Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/patients/edit/${id}`)}
          >
            Edit
          </Button>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <PatientInfo patient={patient} />
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Vital Signs</Typography>
        <VitalSignsList vitals={patient.vitals || []} />
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Medical History</Typography>
        <MedicalHistoryList history={patient.medicalHistory || []} />
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Lab Orders</Typography>
        <LabOrderList labOrders={patient.labOrders || []} />
      </Paper>
    </Container>
  );
};

export default PatientDetail;
