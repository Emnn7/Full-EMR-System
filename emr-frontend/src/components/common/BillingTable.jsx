import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Box,
  TextField,
  InputAdornment,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const BillingTable = ({ bills, loading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading bills: {error}
      </Alert>
    );
  }

  if (!bills || bills.length === 0) {
    return (
      <Alert severity="info">
        No billing records found
      </Alert>
    );
  }

  const getPaymentTypeLabel = (paymentType) => {
    const types = {
      'registration': 'Registration',
      'procedure': 'Procedure',
      'lab-test': 'Lab Test',
      'other': 'Other'
    };
    return types[paymentType] || paymentType;
  };

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

  const filteredBills = bills.filter((bill) => {
    if (!searchTerm) return true;

    const query = searchTerm.toLowerCase();
    const name = `${bill.patient?.firstName || ''} ${bill.patient?.lastName || ''}`.toLowerCase();
    const cardNumber = bill.patient?.patientCardNumber?.toLowerCase() || '';
    const paymentType = getPaymentTypeLabel(bill.paymentType).toLowerCase();

    return (
      name.includes(query) ||
      cardNumber.includes(query) ||
      paymentType.includes(query)
    );
  });

  return (
    <Box>
      <Box mb={3}>
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

      {filteredBills.length === 0 ? (
        <Alert severity="info">No bills match your search criteria</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Hospital Card Number</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Payment Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBills.map((bill) => (
                <TableRow key={bill._id}>
                  <TableCell>{bill.patient?.patientCardNumber || 'N/A'}</TableCell>
                  <TableCell>
                    {bill.patient
                      ? `${bill.patient.firstName} ${bill.patient.lastName}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {getPaymentTypeLabel(bill.paymentType)}
                  </TableCell>
                  <TableCell>${(bill.total ?? 0).toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(bill.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default BillingTable;
