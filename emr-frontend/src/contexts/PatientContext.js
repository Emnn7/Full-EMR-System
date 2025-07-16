import { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';

const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const { patients, currentPatient, loading, error } = useSelector((state) => state.patient);

  return (
    <PatientContext.Provider value={{ patients, currentPatient, loading, error }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};