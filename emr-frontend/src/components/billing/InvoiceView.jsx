import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
  Chip,
  Grid
} from '@mui/material';
import { Print, Download } from '@mui/icons-material';

const InvoiceView = ({ invoice }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5">INVOICE</Typography>
          <Typography variant="subtitle1">#{invoice.invoiceNumber}</Typography>
        </Box>
        <Box>
          <Typography variant="body2">
            <strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}
          </Typography>
          <Typography variant="body2">
            <strong>Status:</strong> 
            <Chip
              label={invoice.status}
              color={invoice.status === 'Paid' ? 'success' : 'error'}
              size="small"
              sx={{ ml: 1 }}
            />
          </Typography>
        </Box>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" gutterBottom>
            Billed To:
          </Typography>
          <Typography>{invoice.patientName}</Typography>
          <Typography>{invoice.patientAddress}</Typography>
          <Typography>Phone: {invoice.patientPhone}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" gutterBottom>
            Clinic Information:
          </Typography>
          <Typography>City Medical Clinic</Typography>
          <Typography>123 Medical Drive, City, State 12345</Typography>
          <Typography>Phone: (123) 456-7890</Typography>
        </Grid>
      </Grid>
      
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Service</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoice.services.map((service, index) => (
              <TableRow key={index}>
                <TableCell>{service.name}</TableCell>
                <TableCell align="right">${service.price.toFixed(2)}</TableCell>
                <TableCell align="right">{service.quantity}</TableCell>
                <TableCell align="right">${(service.price * service.quantity).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} align="right">
                <strong>Total:</strong>
              </TableCell>
              <TableCell align="right">
                <strong>${invoice.totalAmount.toFixed(2)}</strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      {invoice.notes && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Notes:
          </Typography>
          <Typography>{invoice.notes}</Typography>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="contained" startIcon={<Print />}>
          Print
        </Button>
        <Button variant="outlined" startIcon={<Download />}>
          Download PDF
        </Button>
      </Box>
    </Paper>
  );
};

export default InvoiceView;