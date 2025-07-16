import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLabOrders } from '../../redux/slices/adminSlice';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  TextField,
  Box,
} from '@mui/material';

const LabOrdersTable = () => {
  const dispatch = useDispatch();
  const { labOrders, loading, error } = useSelector((state) => state.admin);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchLabOrders());
  }, [dispatch]);

  // Filtering logic
  const filteredLabOrders = labOrders?.filter((order) => {
    const cardNumber = order.patient?.patientCardNumber?.toLowerCase() || '';
    const fullName = `${order.patient?.firstName || ''} ${order.patient?.lastName || ''}`.toLowerCase();
    const phone = order.patient?.phone?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();

    return (
      cardNumber.includes(query) ||
      fullName.includes(query) ||
      phone.includes(query)
    );
  });

  if (loading) return <CircularProgress />;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <Box mb={2}>
        <TextField
          label="Search by name, card number, or phone"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      {(!filteredLabOrders || filteredLabOrders.length === 0) ? (
        <Typography>No lab orders match your search.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Hospital Card Number</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Tests</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Requested By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLabOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    {order.patient?.patientCardNumber || 'Unassigned'}
                  </TableCell>
                  <TableCell>
                    {order.patient
                      ? `${order.patient.firstName} ${order.patient.lastName}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {order.patient?.phone || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {order.tests?.map((test) => test.name).join(', ') || 'N/A'}
                  </TableCell>
                  <TableCell>{order.status || 'pending'}</TableCell>
                  <TableCell>
                    {order.doctor
                      ? `${order.doctor.firstName} ${order.doctor.lastName}`
                      : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default LabOrdersTable;
