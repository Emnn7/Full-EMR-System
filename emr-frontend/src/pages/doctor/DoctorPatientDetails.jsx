import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  fetchPatientById,
  fetchPatientVitalSigns,
  fetchPatientMedicalHistory,
  fetchPatientPrescriptions,
  fetchPatientLabOrders
} from '../../redux/slices/patientSlice';
  
import PatientInfo from '../../components/patients/PatientInfo';
import VitalSignsList from '../../components/vitals/VitalSignsList';
import MedicalHistoryList from '../../components/medical/MedicalHistoryList';
import PrescriptionList from '../../components/prescriptions/PrescriptionList';
import LabOrderList from '../../components/labs/LabOrderList';

const DoctorPatientDetails = () => {
  const { patientId } = useParams();
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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

  return (
    <Box>
      <PatientInfo patient={currentPatient} />
      
      <Paper sx={{ mt: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          sx={{
            '& .MuiTab-root': { minWidth: 'auto' }
          }}
        >
          <Tab label="Vital Signs" />
          <Tab label="Medical History" />
          <Tab label="Prescriptions" />
          <Tab label="Lab Orders" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 2 }}>
        {tabValue === 0 && (
          <VitalSignsList 
            vitalSigns={Array.isArray(vitalSigns) ? vitalSigns : []}
            loading={loading}
          />
        )}
        {tabValue === 1 && (
          <MedicalHistoryList 
            medicalHistory={medicalHistory || {}}
            loading={loading}
          />
        )}
        {tabValue === 2 && (
          <PrescriptionList 
            prescriptions={Array.isArray(prescriptions) ? prescriptions : []}
            loading={loading}
          />
        )}
        {tabValue === 3 && (
          <LabOrderList 
            labOrders={Array.isArray(labOrders) ? labOrders : []}
            loading={loading}
          />
        )}
      </Box>
    </Box>
  );
};

export default DoctorPatientDetails;