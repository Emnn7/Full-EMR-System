import React, { useState } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Snackbar,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import { 
  Download,
  PictureAsPdf,
  Description,
  Error as ErrorIcon,
  CheckCircle
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { fetchAllMedicalReports } from '../../redux/slices/medicalReportSlice';
import api from '../../api/axios';


const MedicalReportsTable = ({ 
  reports = [], 
  loading = false, 
  error = null,
  emptyMessage = "No medical reports available"
}) => {
  const dispatch = useDispatch();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const handleMenuOpen = (event, report) => {
    setAnchorEl(event.currentTarget);
    setSelectedReport(report);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReport(null);
  };

  const handleDownload = async (format) => {
    try {
      const response = await api.get(
        `/medical-reports/${selectedReport._id}/download?format=${format}`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      // Create blob URL for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Create a filename
      const fileName = `report_${selectedReport._id}.${format}`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: 'Report downloaded successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Download error:', err);
      setSnackbar({
        open: true,
        message: 'Failed to download report',
        severity: 'error'
      });
    } finally {
      handleMenuClose();
    }
  };

  const handleRetry = () => {
    dispatch(fetchAllMedicalReports());
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error"
        action={
          <Button 
            color="inherit" 
            size="small"
            onClick={handleRetry}
          >
            Retry
          </Button>
        }
        sx={{ mb: 2 }}
      >
        {error}
      </Alert>
    );
  }

  if (reports.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body1">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} elevation={3}>
        <Table aria-label="medical reports table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
        <TableBody>
  {reports.map((report) => {
    // Safely get patient name or ID
   const patientIdentifier = report.patient 
  ? `${report.patient.firstName || ''} ${report.patient.lastName || ''}`.trim() 
  : 'Unknown Patient';

// For debugging, add this temporarily:
console.log('Current report:', {
  id: report._id,
  patient: report.patient,
  firstName: report.patient?.firstName,
  lastName: report.patient?.lastName
});

    // Safely get report title
    const reportTitle = report.title || 
  (report.patient 
    ? `Report for ${report.patient.firstName || ''} ${report.patient.lastName || ''}`.trim() 
    : `Medical Report ${report._id}`);

    return (
      <TableRow key={report._id} hover>
        <TableCell component="th" scope="row">
          {reportTitle}
        </TableCell>
        <TableCell>
          {patientIdentifier}
        </TableCell>
        <TableCell>
          {new Date(report.createdAt).toLocaleDateString()}
        </TableCell>
        <TableCell>
          Medical Report
        </TableCell>
        <TableCell align="right">
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download />}
            onClick={(e) => handleMenuOpen(e, report)}
          >
            Export
          </Button>
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDownload('pdf')}>
          <ListItemIcon>
            <PictureAsPdf fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">PDF Format</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleDownload('csv')}>
          <ListItemIcon>
            <Description fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">CSV Format</Typography>
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          icon={snackbar.severity === 'error' ? <ErrorIcon /> : <CheckCircle />}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MedicalReportsTable;