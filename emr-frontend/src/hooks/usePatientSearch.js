import { useState, useEffect } from 'react';
import patientAPI from '../api/patientAPI';

export const usePatientSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

const searchPatients = async (term) => {
  try {
    setIsLoading(true);
    setError(null);
    
    if (term) {
      const response = await patientAPI.searchPatients(term);
      // Ensure we have proper patient objects with IDs
      const patientsWithIds = response.data.patients.map(patient => ({
        ...patient,
        id: patient._id || patient.id // Handle both _id and id cases
      }));
      setPatients(patientsWithIds);
    } else {
      setPatients([]);
    }
    } catch (err) {
      setError(err.message || 'Failed to fetch patients');
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce effect for search
  useEffect(() => {
    const timerId = setTimeout(() => {
      searchPatients(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    patients,
    isLoading,
    error,
    searchPatients,
  };
};