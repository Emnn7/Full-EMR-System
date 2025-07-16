import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Grid, Typography, Paper, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Alert, CircularProgress, TextField
} from '@mui/material';
import { 
  People as PeopleIcon, 
  CalendarToday as CalendarIcon, 
  Add as AddIcon, 
  AttachMoney as MoneyIcon, 
  Receipt as ReceiptIcon,
  LocalHospital as ProcedureIcon
} from '@mui/icons-material';
import StatCard from '../../components/common/StatCard';
import { 
  fetchPatients, 
  fetchRecentPatients 
} from '../../redux/slices/patientSlice';

import { 
  fetchAppointments, 
  fetchTodayAppointments 
} from '../../redux/slices/appointmentSlice';
import { 
  fetchUnpaidBills, 
  fetchRecentPayments, 
  fetchPaymentStats 
} from '../../redux/slices/paymentSlice';
import { 
  fetchPendingProcedures,
  updateProcedureStatus
} from '../../redux/slices/patientProcedureSlice';
import { fetchPendingPaymentOrders, updateLabOrderPaymentStatus } from '../../redux/slices/labOrderSlice';
import LabOrderList from '../../components/labs/LabOrderList';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {  updateBillStatus } from '../../redux/slices/billingSlice';

const ReceptionistDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  // Redux selectors
  const { 
    patients, 
    loading: patientsLoading, 
    recentPatients,
    duplicateWarning 
  } = useSelector((state) => state.patient);
  
  const { 
    appointments, 
    loading: appointmentsLoading, 
    todayAppointments 
  } = useSelector((state) => state.appointment);

  const {
    unpaidBills,
    recentPayments,
    paymentStats,
    loading: paymentsLoading
  } = useSelector((state) => state.payment);

const { pendingPaymentOrders, loading: labOrdersLoading } = useSelector((state) => state.labOrder);


  const { 
    pendingProcedures = [], 
    loading: proceduresLoading,
    error: proceduresError
  } = useSelector((state) => state.patientProcedure);

  
  // Fetch all data on component mount
  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchRecentPatients());
    dispatch(fetchAppointments());
    dispatch(fetchTodayAppointments());
    dispatch(fetchUnpaidBills());
    dispatch(fetchRecentPayments());
    dispatch(fetchPaymentStats());
    dispatch(fetchPendingProcedures());
    
   dispatch(fetchPendingPaymentOrders());
  }, [dispatch]);

  useEffect(() => {
  const interval = setInterval(() => {
    dispatch(fetchPendingPaymentOrders());
  }, 30000); // Refresh every 30 seconds

  return () => clearInterval(interval);
}, [dispatch]);


  // Add search handler
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter patients based on search term
  const filteredPatients = patients?.filter(patient => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.firstName?.toLowerCase().includes(searchLower) ||
      patient.lastName?.toLowerCase().includes(searchLower) ||
      patient.phone?.includes(searchTerm)
    );
  });

const handleProcessPayment = (procedureId) => {
  navigate(`/receptionist/procedures/${procedureId}/payment`);
};

const handleProcessLabPayment = (orderId) => {
  navigate(`/receptionist/lab-orders/${orderId}/payment`);
};

  // Stat cards configuration
  const statCards = [
    { icon: PeopleIcon, title: "Total Patients", value: patients?.length || 0, loading: patientsLoading },
    { icon: CalendarIcon, title: "Today's Appointments", value: todayAppointments?.length || 0, loading: appointmentsLoading },
    { 
      icon: ReceiptIcon, 
      title: "Today's Payments", 
      value: paymentStats?.todayCount || 0, 
      subtitle: `$${(paymentStats?.todayTotal || 0).toFixed(2)}`, 
      loading: paymentsLoading 
    },
    { icon: ProcedureIcon, title: "Pending Procedures", value: pendingProcedures?.length || 0, loading: proceduresLoading }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Receptionist Dashboard
      </Typography>
      
      {duplicateWarning && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Patient with this phone number already exists. Please check before registering.
        </Alert>
      )}
      
      {/* Stat Cards */}
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard
              icon={card.icon}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              loading={card.loading}
            />
          </Grid>
        ))}
      </Grid>
      
      {/* Quick Actions and Unpaid Bills */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/receptionist/register')}
                  sx={{ mb: 2 }}
                >
                  Register Patient
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/receptionist/appointments')}
                  sx={{ mb: 2 }}
                >
                  Schedule Appointment
                </Button>
                <Button
                  variant="contained"
                  startIcon={<MoneyIcon />}
                  onClick={() => navigate('/receptionist/payments')}
                >
                  View Recent Payments
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
        

      </Grid>

      {/* Pending Procedures Table */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Pending Procedures
        </Typography>
        {proceduresError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {proceduresError}
          </Alert>
        )}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Procedures</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {proceduresLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : pendingProcedures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No pending procedures
                  </TableCell>
                </TableRow>
              ) : (
                pendingProcedures.map((proc) => (
                  <TableRow key={proc._id}>
                    <TableCell>
                      {proc.patient?.firstName} {proc.patient?.lastName}
                    </TableCell>
                    <TableCell>
                      {proc.doctor?.firstName} {proc.doctor?.lastName}
                    </TableCell>
                    <TableCell>
                      {proc.procedures?.map(p => (
                        <div key={p._id}>
                          {p.procedure?.code} - {p.procedure?.description} (x{p.quantity})
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      ${proc.procedures?.reduce(
                        (sum, p) => sum + (p.procedure?.price * p.quantity || 0), 
                        0
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {moment(proc.createdAt).format('MMM D, YYYY')}
                    </TableCell>
                    <TableCell>
                     <Button
  size="small"
  variant="contained"
  onClick={() => handleProcessPayment(proc._id)}
  disabled={proceduresLoading}
>
  Process Payment
</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

  <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Pending Payment Lab Orders ({pendingPaymentOrders?.length || 0})
        </Typography>
        
        {labOrdersLoading ? (
          <CircularProgress />
        ) : pendingPaymentOrders.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No pending payment lab orders
          </Typography>
        ) : (
          <LabOrderList 
            labOrders={pendingPaymentOrders}
            showPatient={true}
            actionType="receptionist"
          />
        )}
      </Paper>

{/* Recent Patients and Appointments */}
<Grid container spacing={3} sx={{ mt: 2 }}>
  <Grid item xs={12} md={6}>
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Patients
        </Typography>
     <Button 
  variant="outlined" 
  size="small"
  onClick={() => navigate('/receptionist/patients')}
>
  View All Patients
</Button>
      </Box>
      
      {/* Add search field */}
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder="Search by name or phone..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
      />
      
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Hospital Card Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Date Registered</TableCell>
              <TableCell>Time Arrived</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients?.length > 0 ? (
              filteredPatients.slice(0, 5).map((patient) => ( // Show only top 5 results
                <TableRow 
                  key={patient._id} 
                  
                  
                >
                 <TableCell>
                                       {patient.patientCardNumber || 'N/A'}
                                     </TableCell>
                  <TableCell>{`${patient.firstName} ${patient.lastName}`}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>
                    {moment(patient.createdAt).format('MMM D, YYYY')}
                  </TableCell>
                  <TableCell>
                      {moment(patient.createdAt).format('h:mm A')}
                    </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  {patientsLoading ? <CircularProgress size={24} /> : 'No patients found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Appointments
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todayAppointments?.length > 0 ? (
                    todayAppointments.map((appt) => (
                      <TableRow key={appt._id}>
                        <TableCell>
                          {appt.patient ? `${appt.patient.firstName} ${appt.patient.lastName}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {appt.doctor ? `${appt.doctor.firstName} ${appt.doctor.lastName}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {moment(appt.appointmentDate).format('h:mm A')}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={appt.status} 
                            color={
                              appt.status === 'Completed' ? 'success' : 
                              appt.status === 'Cancelled' ? 'error' : 'primary'
                            } 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        {appointmentsLoading ? <CircularProgress size={24} /> : 'No appointments today'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReceptionistDashboard;