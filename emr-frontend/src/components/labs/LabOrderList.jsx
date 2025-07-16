import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Button,
  Chip,
  Box,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Payment as PaymentIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  HourglassEmpty as PendingPaymentIcon
} from '@mui/icons-material';

const LabOrderList = ({ 
  labOrders = [], 
  showPatient = true, 
  showActions = true,
  actionType = 'default' // 'default', 'receptionist', or 'lab'
}) => {
  const navigate = useNavigate();

  if (!labOrders || labOrders.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No lab orders found
        </Typography>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'paid':
        return 'info';
      case 'pending-payment':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'primary';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return null;
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      case 'paid':
        return <PaymentIcon fontSize="small" color="success" />;
      case 'pending-payment':
        return <PendingPaymentIcon fontSize="small" />;
      default:
        return null;
    }
  };

 const getStatusLabel = (status) => {
  if (!status) return 'Status Unknown';
  switch (status.toLowerCase()) {
    case 'pending-payment':
      return 'Payment Pending';
    case 'paid':
      return 'Paid - Ready for Processing';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

  const handleProcessPayment = (orderId) => {
    navigate(`/receptionist/lab-orders/${orderId}/payment`);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/lab/orders/${orderId}`);
  };

  const calculateTotalAmount = (tests = []) => {
    return tests.reduce((sum, test) => sum + (test.price || 0), 0).toFixed(2);
  };
  // In LabOrderList.jsx, add more debugging:
console.log('Received labOrders:', labOrders);

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {showPatient && <TableCell>Patient</TableCell>}
            <TableCell>Order ID</TableCell>
            <TableCell>Order Date</TableCell>
            <TableCell>Tests</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            {showActions && <TableCell align="center">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {labOrders.map((order) => {
            const status = order.status || 'N/A';
            const patientName = order.patient 
              ? `${order.patient.firstName || ''} ${order.patient.lastName || ''}`.trim()
              : 'N/A';
            const orderDate = order.createdAt 
              ? new Date(order.createdAt).toLocaleDateString() 
              : 'N/A';
            const tests = order.tests || [];
            const totalAmount = calculateTotalAmount(tests);

            return (
              <TableRow 
                key={order._id || Math.random().toString(36).substring(2, 9)}
                hover
                onClick={() => handleViewOrder(order._id)}
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                {showPatient && (
                  <TableCell>
                    {patientName}
                    {order.patient?.patientId && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        ID: {order.patient.patientId}
                      </Typography>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {order._id ? order._id.substring(0, 8).toUpperCase() : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>{orderDate}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {tests.length > 0 ? (
                      tests.map((test, index) => (
                        <Tooltip key={index} title={`$${test.price || 0}`} arrow>
                          <Chip 
                            label={test.name || 'Unnamed Test'}
                            size="small"
                            variant="outlined"
                          />
                        </Tooltip>
                      ))
                    ) : (
                      'N/A'
                    )}
                  </Box>
                </TableCell>
                <TableCell>${totalAmount}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(status)}
                    color={getStatusColor(status)}
                    icon={getStatusIcon(status)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
{showActions && (
  <TableCell align="right">
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      {/* Lab Assistant Actions */}
      {actionType === 'lab' && order.status === 'paid' && (
        <Button
          variant="contained"
          size="small"
          startIcon={<EditIcon />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/lab/reports/create/${order._id}`);
          }}
        >
          Enter Results
        </Button>
      )}

      {/* Receptionist Actions */}
      {actionType === 'receptionist' && order.status === 'pending-payment' && (
        <Button
          variant="contained"
          size="small"
          startIcon={<PaymentIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleProcessPayment(order._id);
          }}
        >
          Process Payment
        </Button>
      )}

      {/* View Report */}
      {order.status === 'completed' && order.report && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/lab/reports/${order.report._id}`);
          }}
        >
          View Report
        </Button>
      )}
    </Box>
  </TableCell>
)}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LabOrderList;