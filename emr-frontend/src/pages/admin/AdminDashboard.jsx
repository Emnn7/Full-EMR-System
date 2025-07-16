import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Grid, Typography, Paper, Tabs, Tab, CircularProgress, Button,
  InputLabel, MenuItem, FormControl, Select, Snackbar, Alert
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as HospitalIcon,
  AttachMoney as MoneyIcon,
  Science as LabIcon,
  Receipt as BillingIcon,
  Description as ReportIcon,
  History as AuditIcon
} from '@mui/icons-material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import StatCard from '../../components/common/StatCard';
import { fetchPatients, fetchRecentPatients } from '../../redux/slices/patientSlice';
import { fetchAppointments, fetchTodayAppointments } from '../../redux/slices/appointmentSlice';
import { fetchSystemStats } from '../../redux/slices/adminSlice';
import { fetchDoctors } from '../../redux/slices/doctorSlice';
import { fetchLabOrders } from '../../redux/slices/labOrderSlice';
import { fetchAuditLogs } from '../../redux/slices/auditSlice';
import { fetchBillings } from '../../redux/slices/billingSlice';
import { fetchAllMedicalReports } from '../../redux/slices/medicalReportSlice';
import { generateReport as generateReportAction } from '../../redux/slices/reportSlice';
import RecentPatientsCard from '../../components/patients/PatientCard';
import AppointmentsCard from '../../components/appointment/AppointmentCard';
import AuditLogTable from '../../components/common/AuditLogTable';
import LabOrdersTable from '../../components/common/LabOrdersTable';
import BillingTable from '../../components/common/BillingTable';
import MedicalReportsTable from '../../components/common/MedicalReportTable';
import { useNavigate } from 'react-router-dom';
import UserManagement from '../../pages/admin/UserManagement';
import SystemSettings from '../../pages/admin/SystemSettings';
import { Settings as SettingsIcon, Assessment as AssessmentIcon } from '@mui/icons-material';
import ReportCard from '../../components/admin/ReportCard';
import ReportPreview from '../../components/admin/ReportPreview';
import DateRangePicker from '../../components/admin/DateRangePicker';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PatientDoctorAssignment from '../../components/admin/PatientDoctorAssignment';
import ProcedureCodeManager from '../../components/admin/ProcedureCodeManager'

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();
  const [reportDateRange, setReportDateRange] = React.useState([null, null]);
  const [reportFormat, setReportFormat] = React.useState('pdf');
  const [currentReport, setCurrentReport] = React.useState(null);
  const [generatingReport, setGeneratingReport] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  // Redux state selectors
  const { 
    stats = {}, 
    loading: statsLoading 
  } = useSelector((state) => state.admin) || {};
  
  const { 
    patients = [], 
    recentPatients = [], 
    loading: patientsLoading 
  } = useSelector((state) => state.patient) || {};
  
  const { 
    appointments = [], 
    todayAppointments = [], 
    loading: appointmentsLoading 
  } = useSelector((state) => state.appointment) || {};
  
  const { 
    doctors = [], 
    loading: doctorsLoading 
  } = useSelector((state) => state.doctor) || {};
  
  const { 
    labOrders = [], 
    loading: labOrdersLoading 
  } = useSelector((state) => state.labOrder) || {};
  
  const { 
    auditLogs, 
    loading: auditLogsLoading,
    error: auditLogsError 
  } = useSelector((state) => state.auditLogs || {});

  const billingState = useSelector((state) => state.billing) || {};
  const { 
    data: billings = [], 
    loading: billingsLoading = false,
    error: billingsError = null 
  } = billingState;

  const {
    reports: medicalReports = [],
    loading: medicalReportsLoading,
    error: medicalReportsError
  } = useSelector((state) => state.medicalReport || {});


console.log('Lab Orders:', labOrders);
console.log('patients:', patients);
console.log('doctors:', doctors);
console.log('Medical Reports:', medicalReports);

  const handleGenerateReport = async (reportType) => {
    try {
      setGeneratingReport(true);
      setError(null);
      
      if (!reportDateRange[0] || !reportDateRange[1]) {
        throw new Error('Please select a date range');
      }
  
      const result = await dispatch(
        generateReportAction({
          type: reportType,
          startDate: reportDateRange[0].toISOString(),
          endDate: reportDateRange[1].toISOString()
        })
      ).unwrap();
      
      setCurrentReport({
        title: `${reportType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Report`,
        type: "table",
        data: result.data
      });
    } catch (error) {
      console.error('Report generation failed:', error);
      setError(error.message || 'Failed to generate report');
      setSnackbarOpen(true);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleExport = () => {
    if (!currentReport) return;
    
    try {
      switch(reportFormat) {
        case 'csv':
          exportToCSV();
          break;
        case 'pdf':
          // Implement PDF export
          console.log('PDF export would be implemented here');
          break;
        case 'excel':
          // Implement Excel export
          console.log('Excel export would be implemented here');
          break;
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      setError(error.message);
      setSnackbarOpen(true);
    }
  };

  const exportToCSV = () => {
    const { data } = currentReport;
    const headers = data.columns.join(',');
    const rows = data.rows.map(row => 
      data.columns.map(col => `"${row[col]}"`).join(',')
    ).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentReport.title.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          dispatch(fetchSystemStats()),
          dispatch(fetchPatients()),
          dispatch(fetchRecentPatients({ limit: 5 })),
          dispatch(fetchAppointments()),
          dispatch(fetchTodayAppointments()),
          dispatch(fetchDoctors()),
          dispatch(fetchLabOrders({ status: 'pending', limit: 5 })),
          dispatch(fetchAuditLogs({ limit: 10 })),
          dispatch(fetchBillings({ status: 'pending' })),
          dispatch(fetchAllMedicalReports())
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Calculate derived stats
  const totalPatients = stats.totalPatients || patients.length;
  const activeDoctors = stats.activeDoctors || doctors.length;
  const pendingPayments = stats.pendingPayments || 
    billings.reduce((sum, billing) => {
      const amount = billing.status === 'pending' ? Number(billing.total) || 0 : 0;
      return sum + amount;
    }, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Admin Dashboard
      </Typography>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Summary Stats Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={PeopleIcon}
            title="Total Patients"
            value={totalPatients}
            loading={statsLoading || patientsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={CalendarIcon}
            title="Today's Appointments"
            value={todayAppointments.length}
            loading={appointmentsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={HospitalIcon}
            title="Active Doctors"
            value={activeDoctors}
            loading={statsLoading || doctorsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={MoneyIcon}
            title="Pending Payments"
            value={`$${pendingPayments.toFixed(2)}`}
            loading={statsLoading || billingsLoading}
          />
        </Grid>
      </Grid>

      {/* Recent Activity Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Patients
            </Typography>
            <RecentPatientsCard 
              patients={recentPatients}
              loading={patientsLoading}
              emptyMessage="No recent patients found"
            />
            <Button 
              variant="outlined" 
              fullWidth 
              sx={{ mt: 2 }}
              onClick={() => navigate('/patients')}
            >
              View All Patients
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Today's Appointments
            </Typography>
            <AppointmentsCard 
              appointments={todayAppointments}
              loading={appointmentsLoading}
              emptyMessage="No appointments today"
            />
            <Button 
              variant="outlined" 
              fullWidth 
              sx={{ mt: 2 }}
              onClick={() => navigate('/appointments')}
            >
              View All Appointments
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs for Detailed Views */}
      <Paper sx={{ mt: 3, p: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="dashboard tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Audit Logs" icon={<AuditIcon />} />
          <Tab label="Pending Lab Orders" icon={<LabIcon />} />
          <Tab label="Financial Overview" icon={<BillingIcon />} />
          <Tab label="Medical Reports" icon={<ReportIcon />} />
          <Tab label="User Management" icon={<PeopleIcon />} />
          <Tab label="System Settings" icon={<SettingsIcon />} />
          <Tab label="Reports" icon={<AssessmentIcon />} />
            <Tab label="Procedure Codes" icon={<ListAltIcon />} />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {tabValue === 0 && (
            <>
              {auditLogsLoading && <CircularProgress />}
              {!auditLogsLoading && auditLogsError && (
                <Alert severity="error">{auditLogsError}</Alert>
              )}
              {!auditLogsLoading && (!auditLogs || auditLogs.length === 0) && (
                <Typography>No audit logs found</Typography>
              )}
              {!auditLogsLoading && auditLogs?.length > 0 && (
                <AuditLogTable 
                  logs={auditLogs} 
                  loading={auditLogsLoading}
                  emptyMessage="No audit logs found"
                />
              )}
            </>
          )}

          {tabValue === 1 && (
            <>
              {labOrdersLoading && <CircularProgress />}
              {!labOrdersLoading && (!labOrders || labOrders.length === 0) && (
                <Typography>No pending lab orders</Typography>
              )}
              {!labOrdersLoading && labOrders && labOrders.length > 0 && (
                <LabOrdersTable
                  orders={labOrders}
                  loading={labOrdersLoading}
                  emptyMessage="No pending lab orders"
                />
              )}
            </>
          )}

          {tabValue === 2 && (
            <BillingTable 
              bills={billings || []} 
              loading={billingsLoading !== false} 
              error={billingsError}
            />
          )}

          {tabValue === 3 && (
            <>
              {medicalReportsLoading && <CircularProgress />}
              {medicalReportsError && (
                <Alert severity="error">{medicalReportsError}</Alert>
              )}
              {!medicalReportsLoading && (!medicalReports || medicalReports.length === 0) ? (
                <Typography>No medical reports available</Typography>
              ) : (
                <MedicalReportsTable
                  reports={medicalReports}
                  loading={medicalReportsLoading}
                  emptyMessage="No medical reports available"
                />
              )}
            </>
          )}

          {tabValue === 4 && <UserManagement />}
          {tabValue === 5 && <SystemSettings />}

          {tabValue === 6 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                System Reports
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={4}>
                  <ReportCard 
                    title="Patient Demographics"
                    description="Age, gender, and location distribution"
                    icon={<PeopleIcon fontSize="large" />}
                    onGenerate={() => handleGenerateReport('patientDemographics')}
                    loading={generatingReport}
                  />
                </Grid>
                
                <Grid item xs={12} md={6} lg={4}>
                  <ReportCard 
                    title="Appointment Analysis"
                    description="Trends by specialty, doctor, and time"
                    icon={<CalendarIcon fontSize="large" />}
                    onGenerate={() => handleGenerateReport('appointmentAnalysis')}
                    loading={generatingReport}
                  />
                </Grid>
                
                <Grid item xs={12} md={6} lg={4}>
                  <ReportCard 
                    title="Financial Summary"
                    description="Revenue, outstanding payments, and trends"
                    icon={<MoneyIcon fontSize="large" />}
                    onGenerate={() => handleGenerateReport('financialSummary')}
                    loading={generatingReport}
                  />
                </Grid>
              </Grid>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Report Parameters
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <DateRangePicker 
                        label="Select Date Range"
                        value={reportDateRange}
                        onChange={setReportDateRange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Report Format</InputLabel>
                        <Select
                          value={reportFormat}
                          label="Report Format"
                          onChange={(e) => setReportFormat(e.target.value)}
                        >
                          <MenuItem value="pdf">PDF</MenuItem>
                          <MenuItem value="csv">CSV</MenuItem>
                          <MenuItem value="excel">Excel</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </LocalizationProvider>
              
              {generatingReport && (
                <Box display="flex" justifyContent="center" sx={{ p: 4 }}>
                  <CircularProgress size={60} />
                </Box>
              )}
              
              {currentReport && !generatingReport && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    {currentReport.title}
                  </Typography>
                  <ReportPreview 
                    data={currentReport.data} 
                    type={currentReport.type}
                  />
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={handleExport}
                  >
                    Export as {reportFormat.toUpperCase()}
                  </Button>
                </Box>
              )}
            </Box>
          )}
     
          {tabValue === 7 && <ProcedureCodeManager />}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;