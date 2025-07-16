import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import { 
  Add, 
  Check, 
  Close, 
  FilterList, 
  Search, 
  HourglassEmpty,
  AssignmentTurnedIn,
  Warning
} from '@mui/icons-material';
import { fetchLabOrders, updateLabOrderStatus } from '../../redux/slices/labOrderSlice';
import { fetchPatients } from '../../redux/slices/patientSlice';
import labAPI from '../../api/labAPI';
import AbnormalResultsAlert from '../../components/labs/AbnormalResultsAlert';

const LabTests = () => {
  const dispatch = useDispatch();
  const { labOrders } = useSelector((state) => state.labOrder);
  const { patients } = useSelector((state) => state.patient);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [results, setResults] = useState({});
  const [abnormalFlags, setAbnormalFlags] = useState({});
  const [filters, setFilters] = useState({
    status: 'pending',
    testType: '',
    patient: '',
    dateRange: [null, null]
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchLabOrders());
    dispatch(fetchPatients());
  }, [dispatch]);

  const handleOpenDialog = (order) => {
    setCurrentOrder(order);
    const initialResults = {};
    const initialFlags = {};
    order.tests.forEach((test) => {
      initialResults[test] = '';
      initialFlags[test] = 'normal';
    });
    setResults(initialResults);
    setAbnormalFlags(initialFlags);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentOrder(null);
    setResults({});
    setAbnormalFlags({});
  };

  const handleResultChange = (test, value) => {
    setResults({
      ...results,
      [test]: value,
    });
  };

  const handleFlagChange = (test, value) => {
    setAbnormalFlags({
      ...abnormalFlags,
      [test]: value,
    });
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await dispatch(updateLabOrderStatus({ orderId, status }));
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleSubmitResults = async () => {
    try {
      const reportData = {
        patientId: currentOrder.patientId,
        tests: Object.keys(results).map((test) => ({
          testName: test,
          result: results[test],
          abnormalFlag: abnormalFlags[test]
        })),
        status: 'Completed',
        performedBy: currentOrder._id
      };
      
      await labAPI.createLabReport(reportData);
      await dispatch(updateLabOrderStatus({ 
        orderId: currentOrder._id, 
        status: 'Completed' 
      }));
      
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to submit lab results:', err);
    }
  };

  // Filter orders based on selected filters
  const filteredOrders = labOrders.filter((order) => {
    // Status filter
    if (filters.status && order.status !== filters.status) return false;
    
    // Test type filter
    if (filters.testType && !order.tests.includes(filters.testType)) return false;
    
    // Patient filter
    if (filters.patient && order.patientId !== filters.patient) return false;
    
    // Date range filter
    if (filters.dateRange[0] || filters.dateRange[1]) {
      const orderDate = new Date(order.createdAt);
      if (filters.dateRange[0] && orderDate < new Date(filters.dateRange[0])) return false;
      if (filters.dateRange[1] && orderDate > new Date(filters.dateRange[1])) return false;
    }
    
    // Search term filter
    if (searchTerm) {
      const patient = patients.find((p) => p._id === order.patientId);
      const patientName = patient ? patient.fullName.toLowerCase() : '';
      if (!patientName.includes(searchTerm.toLowerCase())) return false;
    }
    
    return true;
  });

  // Get unique test types for filter dropdown
  const testTypes = [...new Set(labOrders.flatMap(order => order.tests))];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Lab Test Management
      </Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search color="action" />,
            }}
            sx={{ minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="">All Statuses</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Test Type</InputLabel>
            <Select
              value={filters.testType}
              onChange={(e) => setFilters({...filters, testType: e.target.value})}
              label="Test Type"
            >
              <MenuItem value="">All Tests</MenuItem>
              {testTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Patient</InputLabel>
            <Select
              value={filters.patient}
              onChange={(e) => setFilters({...filters, patient: e.target.value})}
              label="Patient"
            >
              <MenuItem value="">All Patients</MenuItem>
              {patients.map((patient) => (
                <MenuItem key={patient._id} value={patient._id}>
                  {patient.fullName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Tests</TableCell>
              <TableCell>Ordered By</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => {
              const patient = patients.find((p) => p._id === order.patientId);
              return (
                <TableRow key={order._id}>
                  <TableCell>{order._id.substring(0, 8)}</TableCell>
                  <TableCell>
                    {patient?.fullName || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {order.tests.join(', ')}
                  </TableCell>
                  <TableCell>
                    {order.doctorName}
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {order.status === 'pending' && (
                      <Chip
                        icon={<HourglassEmpty />}
                        label="Pending"
                        color="warning"
                        size="small"
                      />
                    )}
                    {order.status === 'in-progress' && (
                      <Chip
                        icon={<FilterList />}
                        label="In Progress"
                        color="info"
                        size="small"
                      />
                    )}
                    {order.status === 'completed' && (
                      <Chip
                        icon={<AssignmentTurnedIn />}
                        label="Completed"
                        color="success"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {order.status !== 'completed' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {order.status === 'pending' && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleStatusChange(order._id, 'in-progress')}
                          >
                            Start Test
                          </Button>
                        )}
                        {order.status === 'in-progress' && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog(order)}
                          >
                            Enter Results
                          </Button>
                        )}
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <LabResultsDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitResults}
        order={currentOrder}
        results={results}
        abnormalFlags={abnormalFlags}
        onResultChange={handleResultChange}
        onFlagChange={handleFlagChange}
      />
    </Box>
  );
};

const LabResultsDialog = ({
  open,
  onClose,
  onSubmit,
  order,
  results,
  abnormalFlags,
  onResultChange,
  onFlagChange,
}) => {
  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Enter Lab Results for Order #{order._id.substring(0, 8)}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Patient: {order.patientName}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Ordered By: {order.doctorName}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Ordered On: {new Date(order.createdAt).toLocaleString()}
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Results
            </Typography>
            {order.tests.map((test) => (
              <Box key={test} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {test}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Result"
                    value={results[test] || ''}
                    onChange={(e) => onResultChange(test, e.target.value)}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Flag</InputLabel>
                    <Select
                      value={abnormalFlags[test] || 'normal'}
                      onChange={(e) => onFlagChange(test, e.target.value)}
                      label="Flag"
                    >
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="critical">Critical</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<Close />}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          startIcon={<Check />}
          disabled={Object.values(results).some(val => !val)}
        >
          Submit Results
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LabTests;