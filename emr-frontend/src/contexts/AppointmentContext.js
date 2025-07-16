import { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const { appointments, currentAppointment, loading, error } = useSelector((state) => state.appointment);

  return (
    <AppointmentContext.Provider value={{ appointments, currentAppointment, loading, error }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointment = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointment must be used within an AppointmentProvider');
  }
  return context;
};