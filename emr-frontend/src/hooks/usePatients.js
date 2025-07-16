import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPatients, fetchPatientById } from '../redux/slices/patientSlice';


const usePatients = () => {
  const dispatch = useDispatch();
  const { patients, currentPatient, loading, error } = useSelector((state) => state.patient);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  const getPatient = (id) => {
    dispatch(fetchPatientById(id));
  };

  const searchPatients = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.fullName.toLowerCase().includes(searchTerm) ||
      patient.phoneNumber.includes(searchTerm)
  );

  return {
    patients: filteredPatients,
    currentPatient,
    loading,
    error,
    getPatient,
    searchPatients,
  };
};

export default usePatients;