import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper,
  Button,
  useTheme,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert, TableBody, TableCell, TableRow, TableContainer, TableHead, Table
} from '@mui/material';
import {
  People as PeopleIcon,
  Science as ScienceIcon,
  LocalHospital as HospitalIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  Today as TodayIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import StatCard from '../../components/common/StatCard';
import { fetchLabOrders, fetchLabReports, fetchPaidOrders, fetchPendingPaymentOrders } from '../../redux/slices/labOrderSlice';
import { fetchVitalSigns } from '../../redux/slices/vitalSignsSlice';
import AbnormalResultsAlert from '../../components/labs/AbnormalResultsAlert';
import LabOrderList from '../../components/labs/LabOrderList';
import NotificationBell from '../../components/NotificationBell';

const LabDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  // Redux state selectors
  const {
    labOrders,
    paidOrders,
    pendingPaymentOrders,
    loading: labOrdersLoading,
    error: labOrdersError
  } = useSelector((state) => state.labOrder);

  const { 
    reports, 
    loading: reportsLoading 
  } = useSelector((state) => state.labReport);

  const { 
    vitalSigns = [], 
    loading: vitalsLoading 
  } = useSelector((state) => state.vitalSigns);

  // Local state
  const [searchOrdersTerm, setSearchOrdersTerm] = useState('');
  const [searchPaidOrdersTerm, setSearchPaidOrdersTerm] = useState('');
  const [searchVitalsTerm, setSearchVitalsTerm] = useState('');

  const loading = labOrdersLoading || reportsLoading || vitalsLoading;

  // Calculate statistics
  const inProgressOrders = labOrders?.filter((order) => order.status === 'In Progress') || [];
  const completedToday = Array.isArray(reports)
    ? reports.filter(report => 
        new Date(report.createdAt).toDateString() === new Date().toDateString()
      ).length
    : 0;
  const abnormalResults = Array.isArray(reports)
    ? reports.filter(report => report.abnormalFlag && report.abnormalFlag !== 'normal')
    : [];
  const vitalsRecordedToday = Array.isArray(vitalSigns)
    ? vitalSigns.filter(vital => 
        new Date(vital.createdAt).toDateString() === new Date().toDateString()
      ).length
    : 0;

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchLabReports({ status: 'completed', limit: 5 }));
    dispatch(fetchVitalSigns());
    dispatch(fetchPendingPaymentOrders());
    dispatch(fetchPaidOrders());
  }, [dispatch]);

  // Set up auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchPendingPaymentOrders());
      dispatch(fetchPaidOrders());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Filter functions
  const filteredPendingPaymentOrders = pendingPaymentOrders.filter(order => {
    if (!searchOrdersTerm) return true;
    const searchLower = searchOrdersTerm.toLowerCase();
    return (
      (order.patient?.firstName?.toLowerCase().includes(searchLower)) ||
      (order.patient?.lastName?.toLowerCase().includes(searchLower)) ||
      (order.patient?.phone?.includes(searchOrdersTerm)) ||
      (order._id?.toLowerCase().includes(searchLower))
    );
  });

  const filteredPaidOrders = paidOrders.filter(order => {
    if (!searchPaidOrdersTerm) return true;
    const searchLower = searchPaidOrdersTerm.toLowerCase();
    return (
      (order.patient?.firstName?.toLowerCase().includes(searchLower)) ||
      (order.patient?.lastName?.toLowerCase().includes(searchLower)) ||
      (order.patient?.phone?.includes(searchPaidOrdersTerm)) ||
      (order._id?.toLowerCase().includes(searchLower))
    );
  });

  // Filter vitals based on search term
  const filteredVitalSigns = vitalSigns.filter(vital => {
    if (!searchVitalsTerm) return true;
    const searchLower = searchVitalsTerm.toLowerCase();
    return (
      (vital.patient?.firstName?.toLowerCase().includes(searchLower)) ||
      (vital.patient?.lastName?.toLowerCase().includes(searchLower)) ||
      (vital.patient?.phone?.includes(searchVitalsTerm))
    );
  });

  // Helper to format missing values
  const formatVitalValue = (value, unit = '') => {
    if (value === undefined || value === null || value === '') {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>Not recorded</span>;
    }
    return `${value} ${unit}`.trim();
  };

  // Chart data
  const weeklyTestData = [
    { name: 'Mon', tests: 12, abnormal: 2 },
    { name: 'Tue', tests: 19, abnormal: 3 },
    { name: 'Wed', tests: 15, abnormal: 1 },
    { name: 'Thu', tests: 8, abnormal: 0 },
    { name: 'Fri', tests: 11, abnormal: 2 },
    { name: 'Sat', tests: 3, abnormal: 0 }
  ];

  const vitalTrendsData = [
    { name: 'Jan', temp: 36.5, hr: 72, bp: '120/80' },
    { name: 'Feb', temp: 36.6, hr: 75, bp: '118/78' },
    { name: 'Mar', temp: 36.7, hr: 70, bp: '122/82' },
    { name: 'Apr', temp: 36.4, hr: 68, bp: '119/79' },
    { name: 'May', temp: 36.8, hr: 74, bp: '121/80' },
  ];

  console.log('Paid Orders from Redux:', paidOrders);
  console.log('Pending Payment Orders from Redux:', pendingPaymentOrders);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h4">Lab Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <NotificationBell />
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/lab/vital-signs/new')} 
          >
            New Recording
          </Button>
            <Button
    variant="outlined"
    component={Link}
    to="/labassistant/orders"
    startIcon={<AssignmentIcon />}
  >
    View All Lab Orders
  </Button>
        </Box>
      </Box>

      <AbnormalResultsAlert results={abnormalResults.slice(0, 3)} />

      <Grid container spacing={3}>
        {/* Stat Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={PeopleIcon}
            title="Patients Today"
            value={pendingPaymentOrders.length + paidOrders.length}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={ScienceIcon}
            title="Tests Today"
            value={pendingPaymentOrders.reduce((acc, order) => acc + order.tests.length, 0) + 
                  paidOrders.reduce((acc, order) => acc + order.tests.length, 0)}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={HospitalIcon}
            title="Pending Payment"
            value={pendingPaymentOrders.length}
            loading={loading}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={AssignmentIcon}
            title="Ready for Processing"
            value={paidOrders.length}
            loading={loading}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={AssignmentIcon}
            title="Completed Today"
            value={completedToday}
            loading={loading}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={WarningIcon}
            title="Abnormal Results"
            value={abnormalResults.length}
            loading={loading}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={TodayIcon}
            title="Vitals Recorded"
            value={vitalsRecordedToday}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={ScienceIcon}
            title="In Progress"
            value={inProgressOrders.length}
            loading={loading}
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Weekly Test Volume
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyTestData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="tests" 
                  fill={theme.palette.primary.main} 
                  name="Total Tests"
                />
                <Bar 
                  dataKey="abnormal" 
                  fill={theme.palette.error.main} 
                  name="Abnormal Results"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Vital Signs Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vitalTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temp"
                  stroke={theme.palette.primary.main}
                  name="Temperature (°C)"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="hr"
                  stroke={theme.palette.secondary.main}
                  name="Heart Rate (bpm)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

   {/* Paid Orders Ready for Processing */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            <Typography variant="h6" gutterBottom>
              Ready for Processing ({paidOrders.length})
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => dispatch(fetchPaidOrders())}
            >
              Refresh
            </Button>
          </Box>
          
          {labOrdersLoading ? (
            <CircularProgress />
          ) : paidOrders.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No paid orders ready for processing
            </Typography>
          ) : (
            <LabOrderList 
              labOrders={paidOrders}
              showPatient={true}
              actionType="lab"
            />
          )}
        </Paper>
      </Grid>
  
      {/* Pending Payment Orders */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Pending Payment Orders ({pendingPaymentOrders.length})
          </Typography>
          
          {labOrdersLoading ? (
            <CircularProgress />
          ) : pendingPaymentOrders.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No pending payment orders
            </Typography>
          ) : (
            <LabOrderList 
              labOrders={pendingPaymentOrders}
              showPatient={true}
            />
          )}
        </Paper>
      </Grid>

      {/* Recent Vital Signs Section */}
      <Grid item xs={12} md={6} sx={{ mt: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Vital Signs
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => navigate('/labassistant/vital-signs')}
            >
              View All
            </Button>
          </Box>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search by patient name or phone"
            value={searchVitalsTerm}
            onChange={(e) => setSearchVitalsTerm(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {filteredVitalSigns.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Temp (°C)</TableCell>
                    <TableCell>BP</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredVitalSigns.slice(0, 5).map((vital) => (
                    <TableRow key={vital._id}>
                      <TableCell>
                        {vital.patient?.firstName} {vital.patient?.lastName}
                      </TableCell>
                      <TableCell>
                        {vital.temperature && typeof vital.temperature === 'object'
                          ? formatVitalValue(vital.temperature.value, vital.temperature.unit)
                          : <span style={{ color: '#999', fontStyle: 'italic' }}>Not recorded</span>}
                      </TableCell>
                      <TableCell>
                        {vital.bloodPressure?.systolic && vital.bloodPressure?.diastolic
                          ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic}`
                          : <span style={{ color: '#999', fontStyle: 'italic' }}>Not recorded</span>}
                      </TableCell>
                      <TableCell>
                        {new Date(vital.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No recent vital signs recorded
            </Typography>
          )}
        </Paper>
      </Grid>
    </Box>
  );
};

export default LabDashboard;