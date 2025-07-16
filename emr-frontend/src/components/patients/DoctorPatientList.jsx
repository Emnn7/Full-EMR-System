// src/components/patients/DoctorPatientList.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDoctorPatients } from '../../redux/slices/patientSlice';
import PatientList from './PatientList';
import {Typography} from '@mui/material'

const DoctorPatientList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { patients, loading } = useSelector((state) => state.patient);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchDoctorPatients(user._id));
    }
  }, [dispatch, user]);

  const handleSelectPatient = (patientId) => {
    navigate(`/doctor/patients/${patientId}`);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        My Patients
      </Typography>
      <PatientList 
        patients={patients} 
        loading={loading}
        onSelectPatient={handleSelectPatient}
      />
    </div>
  );
};

export default DoctorPatientList;