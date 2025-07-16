import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Grid, Typography, Paper, Tabs, Tab, Button } from '@mui/material';
import {
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as HospitalIcon,
  Science as ScienceIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import StatCard from '../../components/common/StatCard';
import { fetchPatients } from '../../redux/slices/patientSlice';
import { fetchDoctorAppointments } from '../../redux/slices/appointmentSlice'; // Changed this import
import { fetchDoctorPrescriptions } from '../../redux/slices/prescriptionSlice';
import { fetchPatientMedicalHistory } from '../../redux/slices/medicalHistorySlice';
import { fetchLabOrders } from '../../redux/slices/labOrderSlice';
import PatientList from '../../components/patients/PatientList';
import AppointmentList from '../../components/appointment/AppointmentList';
import PrescriptionList from '../../components/prescriptions/PrescriptionList';
import MedicalHistoryList from '../../components/medical/MedicalHistoryList';
import LabOrderList from '../../components/labs/LabOrderList';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { patients, loading: patientsLoading } = useSelector((state) => state.patient);
  const { appointments, loading: appointmentsLoading } = useSelector((state) => state.appointment);
  const { prescriptions = [], loading: prescriptionsLoading } = useSelector((state) => state.prescription);
  const { data: medicalHistory = [], loading: medicalHistoryLoading } = useSelector((state) => state.medicalHistory);
  const { labOrders, loading: labOrdersLoading } = useSelector((state) => state.labOrder);
  
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchPatients());
      dispatch(fetchDoctorAppointments(user._id)); // Changed to fetch doctor-specific appointments
      dispatch(fetchDoctorPrescriptions(user._id));
      dispatch(fetchPatientMedicalHistory());
      dispatch(fetchLabOrders({ doctorId: user._id }));
    }
  }, [dispatch, user?._id]);

  // Enhanced logging for debugging
  console.log('Current user:', user);
  console.log('All appointments:', appointments);
  console.log('Appointments state:', useSelector(state => state.appointment));
  console.log('Prescription:', prescriptions)


const todayAppointments = Array.isArray(appointments)
  ? appointments.filter(appt => {
      const appointmentDate = new Date(appt.date);
      const today = new Date();
      
      return (
        appointmentDate.getFullYear() === today.getFullYear() &&
        appointmentDate.getMonth() === today.getMonth() &&
        appointmentDate.getDate() === today.getDate() &&
        (appt.doctor._id === user?._id || appt.doctor === user?._id)
      );
    })
  : [];

const pendingLabOrders = Array.isArray(labOrders)
  ? labOrders.filter(order => {
      const status = order.status?.toLowerCase().trim();
      const isPending = ['pending', 'requested', 'processing'].includes(status);
      const isDoctorOrder = order.doctor?._id === user?._id || order.doctor === user?._id;
      return isPending && isDoctorOrder;
    })
  : [];

// Add better logging to debug
console.log('Detailed lab orders:', labOrders.map(order => ({
  id: order._id,
  status: order.status,
  doctor: order.doctor?._id || order.doctor,
  matchesUser: (order.doctor?._id === user?._id || order.doctor === user?._id)
})));

  const recentPatients = Array.isArray(patients) ? patients.slice(0, 5) : [];

const upcomingAppointments = Array.isArray(appointments)
  ? appointments
      .filter(appt => {
        const appointmentDate = new Date(appt.date);
        const now = new Date();
        
        return (
          appointmentDate > now &&
          (appt.doctor._id === user?._id || appt.doctor === user?._id)
        );
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5)
  : [];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
   const handleViewPatient = (patientId) => {
    navigate(`/doctors/patients/${patientId}`);
  };

  console.log('Filtered today appointments:', todayAppointments);
console.log('Filtered upcoming appointments:', upcomingAppointments);
console.log('Current date:', new Date());

console.log('Lab orders response:', labOrders);
console.log('Pending lab orders:', pendingLabOrders);
console.log('Prescriptions data structure:', prescriptions);
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Doctor Dashboard
      </Typography>
      
      {/* Quick Stats Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={PeopleIcon}
            title="My Patients"
            value={patients?.length || 0}
            loading={patientsLoading}
            link="/patients"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={CalendarIcon}
            title="Today's Appointments"
            value={todayAppointments.length}
            loading={appointmentsLoading}
            link="/appointments"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
  icon={HospitalIcon}
  title="Active Prescriptions"
  value={prescriptionsLoading ? '...' : prescriptions?.length || 0}
  loading={prescriptionsLoading}
  link="/prescriptions"
/>
        </Grid>
   
      </Grid>

       {/* Quick Actions Section */}
       <Grid container spacing={2} sx={{ mt: 2, mb: 3 }}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<HistoryIcon />}
            onClick={() => navigate('/doctor/patients')}
          >
            View Patients
          </Button>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<CalendarIcon />}
            onClick={() => navigate('/doctor/appointments')}
          >
            View Appointments
          </Button>
        </Grid>
      </Grid>


      {/* Main Content Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable">
          <Tab label="Overview" icon={<PeopleIcon />} />
          <Tab label="Appointments" icon={<CalendarIcon />} />
          <Tab label="Patients" icon={<PeopleIcon />} />
          <Tab label="Prescriptions" icon={<HospitalIcon />} />
          <Tab label="Medical History" icon={<HistoryIcon />} />
          <Tab label="Lab Orders" icon={<ScienceIcon />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Upcoming Appointments
                </Typography>
                <AppointmentList appointments={upcomingAppointments} showPatient />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Patients
                </Typography>
                <PatientList
  patients={recentPatients}
  onPatientClick={(patient) => handleViewPatient(patient._id)}
/>

              </Paper>
            </Grid>
          
          </Grid>
        )}
        
        {tabValue === 1 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              All Appointments
            </Typography>
            <AppointmentList appointments={appointments} showPatient />
          </Paper>
        )}
        
        {tabValue === 2 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              All Patients
            </Typography>
            <PatientList
  patients={patients}
  onPatientClick={(patient) => handleViewPatient(patient._id)}
/>
          </Paper>
        )}
        
        {tabValue === 3 && (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>
      All Prescriptions
    </Typography>
    {prescriptionsLoading ? (
      <CircularProgress />
    ) : prescriptions?.length === 0 ? (
      <Typography>No prescriptions found</Typography>
    ) : (
      <PrescriptionList prescriptions={prescriptions} />
    )}
  </Paper>
)}
        {tabValue === 4 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              All Medical History 
            </Typography>
            <MedicalHistoryList medicalHistory={medicalHistory} />
          </Paper>
        )}
        
        {tabValue === 5 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Lab Orders
            </Typography>
            <LabOrderList labOrders={labOrders} showPatient />
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default DoctorDashboard;




















