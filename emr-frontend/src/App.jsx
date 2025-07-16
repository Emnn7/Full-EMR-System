import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, CircularProgress } from '@mui/material';
import axios from './api/axios';
import theme from './config/theme';

// Import actions
import { verifyToken } from './redux/slices/authSlice';

// Auth Pages
import SetupAdmin from './pages/auth/SetupAdmin';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';


// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SystemSettings from './pages/admin/SystemSettings';
import PatientsPage from './pages/admin/PatientsPage';
import AppointmentsPage from './pages/admin/AppointmentsPage';
import AdminPatientDetails from './pages/admin/AdminPatientDetails';

// Receptionist Pages
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import PatientRegistration from './pages/receptionist/PatientRegistration';
import AppointmentManagement from './pages/receptionist/AppointmentMangement';
import AppointmentScheduler from './pages/receptionist/AppointmentScheduler';
import PaymentList from './components/payment/PaymentList';
import AllPatients from './pages/receptionist/AllPatients';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPatientManagement from './pages/doctor/DoctorPatientManagement';
import DoctorAppointmentManagement from './pages/doctor/DoctorAppointmentManagement';
import Prescriptions from './pages/doctor/Prescriptions';
import LabResults from './pages/doctor/LabResults';
import DoctorPatientDetails from './pages/doctor/DoctorPatientDetails';
import CreatePrescription from './pages/doctor/CreatePrescription';
import CreateLabOrder from './pages/doctor/CreateLabOrder';
import BillingRequest from './pages/doctor/BillingRequest';
import ConsultationForm from './pages/doctor/ConsultationForm';
import DoctorEditPatient from './pages/doctor/DoctorEditPatient';
import CreateMedicalHistory from './pages/doctor/CreateMedicalHistory';
import EditMedicalHistory from './pages/doctor/EditMedicalHistory';


// Lab Pages
import LabDashboard from './pages/lab/LabDashboard';
import LabTests from './pages/lab/LabTests';
import VitalSignsForm from './pages/lab/VitalSignsForm';
import LabOrderList from './components/labs/LabOrderList';
import EnterLabOrder from './pages/lab/EnterLabOrder';
import ExternalLabResultsForm from './pages/lab/ExternalLabResultsForm';
import LabReports from './pages/lab/LabReports';
import LabTestCatalog from './components/labs/LabTestCatalog';
import PatientSelection from './components/labs/PatientSelection';
import LabWorkflow from './components/labs/LabWorkFlow'
import CreateLabReportForm from './pages/lab/CreateLabReportForm'
import AllLabOrders from './pages/lab/AllLabOrders';
import AllVitalSigns from './pages/lab/AllVitalSigns';
// Shared Pages
import DoctorPatientProfile from './pages/shared/DoctorPatientProfile';
import PatientMedicalDataView from './pages/shared/PatientMedicalDataView';
import Settings from './pages/shared/Settings';
import Unauthorized from './pages/shared/Unauthorized';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import PatientForm from './components/patients/PatientForm';
import PatientList from './components/patients/PatientList';
import PrescriptionList from './components/prescriptions/PrescriptionList';
import BillingList from './components/billing/BillingList';
import AppointmentList from './components/appointment/AppointmentList';
import AppointmentDetail from './components/appointment/AppointmentDetail';
import AppointmentForm from './components/appointment/AppointmentForm';
import LabOrderCard from './components/labs/LabOrderCard';
import LabReportCard from './components/labs/LabReportCard';
import MedicalHistoryList from './components/medical/MedicalHistoryList';
import AbnormalResultsAlert from './components/labs/AbnormalResultsAlert';
import NotificationBell from './components/NotificationBell';
import { PDFViewerDialog } from './components/labs/PDFViewerDialog';
import { VerifyDialog } from './components/labs/VerifyDialog';
import AppLayout from './layouts/AppLayout';
import MedicalReportGenerator from './components/medical/medicalReportGenerator';
import MedicalReportViewer from './components/medical/medicalReportViewer';
import MedicalReportList from './components/medical/medicalReportList';
import SingleReportView from './components/labs/SingleReportView';
import PatientReportsView from './components/labs/PatientReportsView';
import ReceiptViewer from './components/payment/ReceiptViewer'
import RegistrationPayment from './components/payment/RegistrationPayment'
import RegistrationSuccess from './components/payment/RegistrationSuccess'
import LabPayment from './components/labs/LabPayment';
import LabPaymentSuccess from './components/labs/labPaymentSuccess';
import ProcedurePayment from './components/Receptionist/ProcedurePayment';
import ProcedurePaymentSuccess from './components/Receptionist/ProcedurePaymentSuccess';

import { ROLES } from './config/roles';
import './assets/scss/main.scss';

function App() {
  const [setupAvailable, setSetupAvailable] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const setupResponse = await axios.get('/setup').catch(() => ({ 
          data: { setupAvailable: false } 
        }));
    
        const token = localStorage.getItem('authToken');
        if (token) {
          await dispatch(verifyToken());
        }
    
        setSetupAvailable(setupResponse.data.setupAvailable);
      } catch (error) {
        console.error('Initialization error:', error);
        setSetupAvailable(false);
      } finally {
        setInitialized(true);
      }
    };
    
    initializeApp();
  }, [dispatch]);

  if (!initialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <CircularProgress size={60} />
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout>
        <Routes>
          {setupAvailable ? (
            <>
              <Route path="/setup" element={<SetupAdmin />} />
              <Route path="*" element={<Navigate to="/setup" replace />} />
            </>
          ) : (
            <>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                ``
                <Route path="/admin/settings" element={<SystemSettings />} />
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                 <Route path="patients/:patientId" element={<AdminPatientDetails />} />
                 <Route path="/medical-reports" element={<MedicalReportList />} />
<Route path="/medical-reports/:id" element={<MedicalReportViewer />} />
<Route path="/patients/:id/generate-report" element={<MedicalReportGenerator />} />


              </Route>

              {/* Receptionist Routes */}
              <Route element={<ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]} />}>
                <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
                <Route path="/receptionist/register" element={<PatientRegistration />} />
                <Route path="/receptionist/appointments" element={<AppointmentManagement />} />
                <Route path="/receptionist/schedule" element={<AppointmentScheduler />} />
                <Route path="/receptionist/payments" element={<PaymentList />} />
  <Route path="/receptionist/patients" element={<AllPatients />} />
  <Route path="/payments/receipt/:id" element={<ReceiptViewer />} />
   <Route path="/registration/payment/:patientId" element={<RegistrationPayment />} />
  <Route path="/registration/success" element={<RegistrationSuccess />} />
   <Route path="/receptionist/lab-orders/:id/payment" element={<LabPayment />} />
   <Route path="/receptionist/procedures/:id/payment" element={<ProcedurePayment />} />
   <Route path="/receptionist/procedures/:id/payment-success" element={<ProcedurePaymentSuccess />} />
 <Route path="/receptionist/lab-orders/:id/payment-success" element={<LabPaymentSuccess />} />


              </Route>

              {/* Doctor Routes */}
              <Route element={<ProtectedRoute allowedRoles={[ROLES.DOCTOR]} />}>
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="/doctor/patients" element={<DoctorPatientManagement />} />
                <Route path="/doctor/appointments" element={<DoctorAppointmentManagement />} />
                <Route path="/doctor/prescriptions" element={<Prescriptions />} />
                <Route path="/doctor/lab-results" element={<LabResults />} />
                <Route path="/doctor/patient/:patientId" element={<DoctorPatientDetails />} />
                <Route path="/prescriptions/new/:patientId" element={<CreatePrescription />} />
                <Route path="/lab-orders/new/:patientId" element={<CreateLabOrder />} />
                <Route path="/patients/new-billing" element={<BillingRequest />} />
                <Route path="/consultations/new" element={<ConsultationForm />} />
               
                <Route path="/doctor/patient/edit/:id" element={<DoctorEditPatient />} />
                <Route path="/medical-history/new/:id" element={<CreateMedicalHistory />} />
<Route path="/medical-history/edit/:patientId/:historyId" element={<EditMedicalHistory />} />
              </Route>
              <Route 
    path="/lab/vital-signs" 
    element={
      <ProtectedRoute allowedRoles={[ROLES.LAB_ASSISTANT, ROLES.DOCTOR]}>
        <VitalSignsForm />
      </ProtectedRoute>
          } 
  />
              {/* Lab Assistant Routes */}
              <Route element={<ProtectedRoute allowedRoles={[ROLES.LAB_ASSISTANT]} />}>
                <Route path="/lab/dashboard" element={<LabDashboard />} />
                
                 <Route path="/lab/reports/create/:orderId" element={<CreateLabReportForm />} />
                <Route path="/lab/tests" element={<LabTests />} />
                <Route path="/lab-test-catalog" element={<LabTestCatalog />} />
                 <Route path="/lab/vital-signs" element={<PatientSelection />} />
  <Route path="/lab/vital-signs/new" element={<PatientSelection />} />
  <Route path="/lab/vital-signs/new/:patientId" element={<VitalSignsForm />} />

  <Route path="/lab/reports/create/:orderId" element={<CreateLabReportForm />} />
                <Route path="/lab/orders" element={<LabOrderList />} />
                <Route path="/lab/workflow" element={<LabWorkflow />} />
                <Route path="/lab/orders/enter" element={<EnterLabOrder />} />
                <Route path="/lab/external-results" element={<ExternalLabResultsForm />} />
                <Route path="/lab/reports/verify/:id" element={<VerifyDialog />} />
                <Route path="/lab/reports/pdf/:id" element={<PDFViewerDialog />} />
                <Route path="/labassistant/orders" element={<AllLabOrders />} />
<Route path="/labassistant/vital-signs" element={<AllVitalSigns />} />
 <Route path="/lab/orders" element={<AllLabOrders status="paid" />} />
              </Route>

              {/* Shared Routes */}
              <Route element={
                <ProtectedRoute allowedRoles={[
                  ROLES.ADMIN,
                  ROLES.DOCTOR,
                  ROLES.RECEPTIONIST,
                  ROLES.LAB_ASSISTANT
                ]} />
              }>
                <Route path="/lab/reports/:id" element={<SingleReportView />} />
<Route path="/lab/reports/patient/:patientId" element={<PatientReportsView />} />
                <Route path="/patients/new" element={<PatientForm />} />
                <Route path="/patients/edit/:id" element={<PatientForm />} />
                <Route path="/patients/list" element={<PatientList />} />
                <Route path="/appointments/new" element={<AppointmentForm />} />
                <Route path="/appointments/:id" element={<AppointmentDetail />} />
                <Route path="/appointments/edit/:id" element={<AppointmentForm />} />
                <Route path="/appointments/list" element={<AppointmentList />} />
                <Route path="/labs/order-card" element={<LabOrderCard />} />
                <Route path="/labs/report-card" element={<LabReportCard />} />
                <Route path="/billing/list" element={<BillingList />} />
                <Route path="/prescriptions/list" element={<PrescriptionList />} />
              <Route path="/doctors/patients/:patientId" element={<DoctorPatientProfile />} />
                <Route path="/report/:id" element={<PatientMedicalDataView />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/medical/history" element={<MedicalHistoryList />} />
                 
              </Route>

              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={
                <Navigate to={
                  authState.isAuthenticated ? 
                  `/${authState.user.role.toLowerCase()}/dashboard` : 
                  "/login"
                } replace />
              } />
            </>
          )}
        </Routes>
      </AppLayout>
    </ThemeProvider>
  );
}

export default App;