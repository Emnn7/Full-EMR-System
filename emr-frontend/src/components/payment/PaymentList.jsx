// src/components/payment/PaymentList.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  AttachMoney as MoneyIcon,
  Search as SearchIcon,
  LocalHospital as ProcedureIcon,
  Science as LabIcon,
  HowToReg as RegistrationIcon
} from '@mui/icons-material';
import { 
  fetchRecentPayments
} from '../../redux/slices/paymentSlice';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const getPaymentTypeLabel = (paymentType) => {
  const types = {
    'registration': 'Registration',
    'procedure': 'Procedure',
    'lab-test': 'Lab Test',
    'other': 'Other'
  };
  return types[paymentType] || paymentType;
};

const getPaymentTypeIcon = (paymentType) => {
  switch(paymentType) {
    case 'procedure':
      return <ProcedureIcon fontSize="small" />;
    case 'lab-test':
      return <LabIcon fontSize="small" />;
    case 'registration':
      return <RegistrationIcon fontSize="small" />;
    default:
      return <MoneyIcon fontSize="small" />;
  }
};

const PaymentList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { recentPayments, loading, paymentStats } = useSelector((state) => state.payment);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchRecentPayments());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Initial load
  useEffect(() => {
    dispatch(fetchRecentPayments());
  }, [dispatch]);

  // Search filter
  const filterPayments = (payments) => {
    if (!searchTerm) return payments;
    const query = searchTerm.toLowerCase();

    return payments.filter(payment => {
      const name = `${payment.patient?.firstName || ''} ${payment.patient?.lastName || ''}`.toLowerCase();
      const cardNumber = payment.patient?.patientCardNumber?.toLowerCase() || '';
      const paymentType = getPaymentTypeLabel(payment.paymentType).toLowerCase();

      return (
        name.includes(query) ||
        cardNumber.includes(query) ||
        paymentType.includes(query)
      );
    });
  };

  const filteredRecentPayments = filterPayments(recentPayments || []);

  const getStatusLabel = (status) => {
  const statusMap = {
    'pending': 'Pending',
    'paid': 'Paid',
    'completed': 'Paid', // Map 'completed' to 'Paid' for consistency
    'partially-paid': 'Partially Paid',
    'cancelled': 'Cancelled',
    'failed': 'Failed',
    'refunded': 'Refunded'
  };
  return statusMap[status] || status;
};
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Payment Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={6}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Recent Payments</Typography>
            <Typography variant="h4">
              {paymentStats?.todayCount || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Today's Revenue</Typography>
            <Typography variant="h4">
              ${(paymentStats?.todayTotal || 0).toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by patient name, card number, or payment type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Recent Payments Table */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Payments ({filteredRecentPayments.length})
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : filteredRecentPayments.length === 0 ? (
          <Alert severity="info">No recent payments found</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                   <TableCell>Payment Method</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecentPayments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>
                      {payment.patient?.firstName} {payment.patient?.lastName}
                      {payment.patient?.patientCardNumber && (
                        <Typography variant="caption" display="block">
                          #{payment.patient.patientCardNumber}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getPaymentTypeIcon(payment.paymentType)}
                        <Box ml={1}>{getPaymentTypeLabel(payment.paymentType)}</Box>
                      </Box>
                    </TableCell>
                    <TableCell>${(payment.amount ?? 0).toFixed(2)}</TableCell>
                     <TableCell>
        {payment.paymentMethod ? payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1) : 'N/A'}
      </TableCell>
                    <TableCell>
                      {moment(payment.createdAt).format('MMM D, YYYY h:mm A')}
                    </TableCell>
          
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default PaymentList;
