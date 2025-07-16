import AttachMoney from '@mui/icons-material/AttachMoney';
import Description from '@mui/icons-material/Description';
import ProcedurePricing from './ProcedurePricing';
import ReportTemplates from './ReportTemplates';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Grid,
  Snackbar,
  Alert,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Save,
  Schedule,
  Notifications,
  Receipt,
  Business,
  Phone,
  Email,
  AccessTime,
  CalendarToday,
  Science,
  Edit,
  Delete,
  Add
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchSettings, 
  updateSettings,
  resetSettingsState,
  fetchLabTests,
  createLabTest,
  updateLabTest,
  deleteLabTest
} from '../../redux/slices/settingSlice';
import LabTestCatalog from '../../components/labs/LabTestCatalog';

const SystemSettings = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = React.useState(0);
  const { 
    settings, 
    labTests,
    loading, 
    error, 
    success 
  } = useSelector((state) => state.settings);

  // Lab Test Dialog State
  const [labTestDialogOpen, setLabTestDialogOpen] = useState(false);
  const [currentLabTest, setCurrentLabTest] = useState(null);
  const [labTestForm, setLabTestForm] = useState({
    testName: '',
    result: '',
    unit: '',
    normalRange: '',
    interpretation: '',
    patientId: ''
  });

  // Local state for form fields
  const [formData, setFormData] = React.useState({
    clinicName: '',
    address: '',
    phone: '',
    email: '',
    workingHours: '',
    timezone: 'America/New_York',
    appointmentInterval: 30,
    enableOnlineBooking: true,
    minCancelNotice: 24,
    maxFutureBooking: 90,
    enableSMSNotifications: false,
    enableEmailNotifications: true,
    reminderLeadTime: 48,
    currency: 'USD',
    taxRate: 0.08,
    invoicePrefix: 'INV-',
    appointmentSlotDuration: 30,
    billingRates: {
      consultation: 100,
      bloodTest: 50
    }
  });

  const handleUpdatePricing = (updatedPricing) => {
    setFormData(prev => ({
      ...prev,
      procedurePricing: updatedPricing
    }));
  };
  
  const handleUpdateTemplates = (updatedTemplates) => {
    setFormData(prev => ({
      ...prev,
      reportTemplates: updatedTemplates
    }));
  };

  // Initialize form with Redux data
  useEffect(() => {
    if (settings) {
      setFormData({
        clinicName: settings.clinicName || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        workingHours: settings.workingHours || '',
        timezone: settings.timezone || 'America/New_York',
        appointmentInterval: settings.appointmentInterval || 30,
        enableOnlineBooking: settings.enableOnlineBooking !== false,
        minCancelNotice: settings.minCancelNotice || 24,
        maxFutureBooking: settings.maxFutureBooking || 90,
        enableSMSNotifications: settings.enableSMSNotifications || false,
        enableEmailNotifications: settings.enableEmailNotifications !== false,
        reminderLeadTime: settings.reminderLeadTime || 48,
        currency: settings.currency || 'USD',
        taxRate: settings.taxRate || 0.08,
        invoicePrefix: settings.invoicePrefix || 'INV-',
        appointmentSlotDuration: settings.appointmentSlotDuration || 30,
        billingRates: settings.billingRates || {
          consultation: 100,
          bloodTest: 50
        }
      });
    }
  }, [settings]);

  // Load settings and lab tests on mount
  useEffect(() => {
    dispatch(fetchSettings());
    dispatch(fetchLabTests());
    return () => {
      dispatch(resetSettingsState());
    };
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleTaxRateChange = (e) => {
    const value = parseFloat(e.target.value) / 100;
    setFormData({
      ...formData,
      taxRate: isNaN(value) ? 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(updateSettings(formData));
  };

  const handleCloseSnackbar = () => {
    dispatch(resetSettingsState());
  };

  // Lab Test Handlers
  const handleOpenLabTestDialog = (test = null) => {
    if (test) {
      setCurrentLabTest(test._id);
      setLabTestForm({
        testName: test.testName,
        result: test.result,
        unit: test.unit,
        normalRange: test.normalRange,
        interpretation: test.interpretation,
        patientId: test.patientId
      });
    } else {
      setCurrentLabTest(null);
      setLabTestForm({
        testName: '',
        result: '',
        unit: '',
        normalRange: '',
        interpretation: '',
        patientId: ''
      });
    }
    setLabTestDialogOpen(true);
  };

  const handleCloseLabTestDialog = () => {
    setLabTestDialogOpen(false);
  };

  const handleLabTestFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLabTestForm({
      ...labTestForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleLabTestSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentLabTest) {
        await dispatch(updateLabTest({ 
          id: currentLabTest, 
          testData: labTestForm 
        }));
      } else {
        await dispatch(createLabTest(labTestForm));
      }
      setLabTestDialogOpen(false);
      dispatch(fetchLabTests());
    } catch (error) {
      console.error('Error saving lab test:', error);
    }
  };

  const handleDeleteLabTest = async (id) => {
    if (window.confirm('Are you sure you want to delete this lab test?')) {
      await dispatch(deleteLabTest(id));
      dispatch(fetchLabTests());
    }
  };

  if (loading && !settings) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <Business sx={{ mr: 1 }} /> System Settings
      </Typography>
      
      <Snackbar
        open={!!error || success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || 'Settings saved successfully!'}
        </Alert>
      </Snackbar>

      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="General" icon={<Business fontSize="small" />} />
          <Tab label="Appointments" icon={<Schedule fontSize="small" />} />
          <Tab label="Time Slots" icon={<AccessTime fontSize="small" />} />
          <Tab label="Notifications" icon={<Notifications fontSize="small" />} />
          <Tab label="Lab Tests" icon={<Science fontSize="small" />} />
          <Tab label="Pricing" icon={<AttachMoney fontSize="small" />} />
          <Tab label="Report Templates" icon={<Description fontSize="small" />} />
          <Tab label="Lab Test Catalog" icon={<Science fontSize="small" />} />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Business sx={{ mr: 1 }} /> Clinic Information
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Clinic Name"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={2}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Working Hours"
                  name="workingHours"
                  value={formData.workingHours}
                  onChange={handleChange}
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><AccessTime /></InputAdornment>,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={formData.timezone}
                    onChange={handleChange}
                    name="timezone"
                    label="Timezone"
                  >
                    <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                    <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                    <MenuItem value="UTC">UTC/GMT</MenuItem>
                    <MenuItem value="UTC+2">UTC+2</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
                sx={{ minWidth: 150 }}
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </form>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Schedule sx={{ mr: 1 }} /> Appointment Settings
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Slot Duration (minutes)"
                  name="appointmentSlotDuration"
                  type="number"
                  value={formData.appointmentSlotDuration}
                  onChange={handleChange}
                  margin="normal"
                  InputProps={{
                    inputProps: { min: 5, max: 120, step: 5 }
                  }}
                  required
                />
                <TextField
                  fullWidth
                  label="Appointment Interval (minutes)"
                  name="appointmentInterval"
                  type="number"
                  value={formData.appointmentInterval}
                  onChange={handleChange}
                  margin="normal"
                  InputProps={{
                    inputProps: { min: 10, max: 120, step: 5 },
                    startAdornment: <InputAdornment position="start"><CalendarToday /></InputAdornment>,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Minimum Cancellation Notice (hours)"
                  name="minCancelNotice"
                  type="number"
                  value={formData.minCancelNotice}
                  onChange={handleChange}
                  margin="normal"
                  InputProps={{
                    inputProps: { min: 1, max: 72, step: 1 }
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maximum Future Booking (days)"
                  name="maxFutureBooking"
                  type="number"
                  value={formData.maxFutureBooking}
                  onChange={handleChange}
                  margin="normal"
                  InputProps={{
                    inputProps: { min: 1, max: 365, step: 1 }
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enableOnlineBooking}
                      onChange={handleChange}
                      name="enableOnlineBooking"
                      color="primary"
                    />
                  }
                  label="Enable Online Booking"
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
                sx={{ minWidth: 150 }}
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </form>
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Notifications sx={{ mr: 1 }} /> Notification Settings
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enableSMSNotifications}
                      onChange={handleChange}
                      name="enableSMSNotifications"
                      color="primary"
                    />
                  }
                  label="Enable SMS Notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: -1, ml: 4 }}>
                  Patients will receive SMS reminders for appointments
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enableEmailNotifications}
                      onChange={handleChange}
                      name="enableEmailNotifications"
                      color="primary"
                    />
                  }
                  label="Enable Email Notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: -1, ml: 4 }}>
                  Patients will receive email reminders for appointments
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Appointment Reminder Lead Time (hours)"
                  name="reminderLeadTime"
                  type="number"
                  value={formData.reminderLeadTime}
                  onChange={handleChange}
                  margin="normal"
                  InputProps={{
                    inputProps: { min: 1, max: 168, step: 1 }
                  }}
                  helperText="How many hours before appointment to send reminders"
                  required
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
                sx={{ minWidth: 150 }}
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </form>
        </Paper>
      )}

      {tabValue === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Receipt sx={{ mr: 1 }} /> Billing Settings
          </Typography>
          <Typography variant="h6" gutterBottom>
            Billing Rates
          </Typography>
          {Object.entries(formData?.billingRates || {}).map(([service, price]) => (
            <TextField
              key={service}
              fullWidth
              label={service}
              name={`billingRates.${service}`}
              value={price}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  billingRates: {
                    ...formData.billingRates,
                    [service]: parseFloat(e.target.value) || 0
                  }
                });
              }}
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { min: 0, step: 0.01 }
              }}
            />
          ))}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={formData.currency}
                    onChange={handleChange}
                    name="currency"
                    label="Currency"
                  >
                    <MenuItem value="USD">US Dollar ($)</MenuItem>
                    <MenuItem value="EUR">Euro (€)</MenuItem>
                    <MenuItem value="GBP">British Pound (£)</MenuItem>
                    <MenuItem value="JPY">Japanese Yen (¥)</MenuItem>
                    <MenuItem value="CAD">Canadian Dollar (C$)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tax Rate (%)"
                  name="taxRate"
                  type="number"
                  value={(formData.taxRate * 100).toFixed(2)}
                  onChange={handleTaxRateChange}
                  margin="normal"
                  InputProps={{
                    inputProps: { min: 0, max: 50, step: 0.01 },
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  helperText="Enter as percentage (e.g., 8.25 for 8.25%)"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Invoice Prefix"
                  name="invoicePrefix"
                  value={formData.invoicePrefix}
                  onChange={handleChange}
                  margin="normal"
                  helperText="Prefix for invoice numbers (e.g., INV-2023-)"
                  required
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
                sx={{ minWidth: 150 }}
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </form>
        </Paper>
      )}

      {tabValue === 4 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Science sx={{ mr: 1 }} /> Lab Tests Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenLabTestDialog()}
            >
              Add Lab Test
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Test Name</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Normal Range</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {labTests.map((test) => (
                  <TableRow key={test._id}>
                    <TableCell>{test.testName}</TableCell>
                    <TableCell>{test.result}</TableCell>
                    <TableCell>{test.unit}</TableCell>
                    <TableCell>{test.normalRange}</TableCell>
                    <TableCell>
                      {test.patientId?.firstName} {test.patientId?.lastName}
                    </TableCell>
                    <TableCell>
                      {new Date(test.dateOfTest).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpenLabTestDialog(test)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteLabTest(test._id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 5 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            <AttachMoney sx={{ mr: 1 }} /> Procedure Pricing
          </Typography>
          <ProcedurePricing 
            pricing={formData.procedurePricing || []} 
            onUpdate={handleUpdatePricing}
          />
        </Paper>
      )}

      {tabValue === 6 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            <Description sx={{ mr: 1 }} /> Report Templates
          </Typography>
          <ReportTemplates 
            templates={formData.reportTemplates} 
            onUpdate={handleUpdateTemplates}
          />
        </Paper>
      )}

      {tabValue === 7 && (
        <LabTestCatalog />
      )}

      {/* Lab Test Dialog */}
      <Dialog open={labTestDialogOpen} onClose={handleCloseLabTestDialog}>
        <DialogTitle>
          {currentLabTest ? 'Edit Lab Test' : 'Add New Lab Test'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleLabTestSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Test Name</InputLabel>
                  <Select
                    name="testName"
                    value={labTestForm.testName}
                    onChange={handleLabTestFormChange}
                    label="Test Name"
                  >
                    <MenuItem value="CBC">Complete Blood Count (CBC)</MenuItem>
                    <MenuItem value="Lipid Profile">Lipid Profile</MenuItem>
                    <MenuItem value="Liver Function">Liver Function</MenuItem>
                    <MenuItem value="Thyroid Panel">Thyroid Panel</MenuItem>
                    <MenuItem value="Urinalysis">Urinalysis</MenuItem>
                    <MenuItem value="Blood Glucose">Blood Glucose</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Result"
                  name="result"
                  value={labTestForm.result}
                  onChange={handleLabTestFormChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Unit"
                  name="unit"
                  value={labTestForm.unit}
                  onChange={handleLabTestFormChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Normal Range"
                  name="normalRange"
                  value={labTestForm.normalRange}
                  onChange={handleLabTestFormChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Interpretation"
                  name="interpretation"
                  value={labTestForm.interpretation}
                  onChange={handleLabTestFormChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Patient ID"
                  name="patientId"
                  value={labTestForm.patientId}
                  onChange={handleLabTestFormChange}
                  margin="normal"
                  required
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLabTestDialog}>Cancel</Button>
          <Button 
            onClick={handleLabTestSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemSettings;