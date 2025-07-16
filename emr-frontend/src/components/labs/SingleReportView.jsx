import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLabReport } from '../../redux/slices/labReportSlice';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import api from '../../api/axios'

const SingleReportView = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentReport, loading, error } = useSelector((state) => state.labReport);

useEffect(() => {
  console.log('Fetching report with ID:', id);
  dispatch(fetchLabReport(id))
    .then((result) => {
      if (result.payload) {
        console.log('Received report data:', result.payload);
      } else {
        console.error('No payload in response');
      }
    })
    .catch((error) => {
      console.error('Error fetching report:', error);
    });
}, [dispatch, id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!currentReport) {
    return (
      <Alert severity="warning" sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
        No report found with ID: {id}
      </Alert>
    );
  }

const handleDownload = async () => {
  try {
    const response = await api.get(`/lab-reports/${id}/pdf`, {
      responseType: 'blob' // Important for binary data
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `lab-report-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error('Download failed:', err);
    alert('Failed to download PDF. Please check your authentication.');
  }
};

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Lab Report</Typography>
        <Button
  variant="contained"
  startIcon={<DownloadIcon />}
  onClick={handleDownload}
>
  Download PDF
</Button>


      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Patient Information</Typography>
        <Typography>
          {currentReport.patient?.firstName} {currentReport.patient?.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Phone: {currentReport.patient?.phone}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Test Results</Typography>
        {currentReport.tests?.map((test, index) => (
          <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
            <Typography variant="subtitle1">{test.name}</Typography>
            <Typography>Result: {test.result}</Typography>
            {test.unit && <Typography>Unit: {test.unit}</Typography>}
            {test.normalRange && <Typography>Normal Range: {test.normalRange}</Typography>}
            <Chip
              label={test.abnormalFlag}
              color={
                test.abnormalFlag === 'normal' ? 'success' : 
                test.abnormalFlag === 'critical' ? 'error' : 'warning'
              }
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        ))}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Additional Information</Typography>
        {currentReport.findings && (
          <>
            <Typography variant="subtitle2">Findings:</Typography>
            <Typography paragraph>{currentReport.findings}</Typography>
          </>
        )}
        {currentReport.notes && (
          <>
            <Typography variant="subtitle2">Notes:</Typography>
            <Typography paragraph>{currentReport.notes}</Typography>
          </>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Report Details</Typography>
        <Typography>Status: 
          <Chip 
            label={currentReport.status} 
            color={
              currentReport.status === 'verified' ? 'success' :
              currentReport.status === 'completed' ? 'primary' : 'default'
            }
            size="small"
            sx={{ ml: 1 }}
          />
        </Typography>
        <Typography>Performed by: {currentReport.performedBy?.firstName} {currentReport.performedBy?.lastName}</Typography>
        {currentReport.verifiedBy && (
          <Typography>Verified by: {currentReport.verifiedBy?.firstName} {currentReport.verifiedBy?.lastName}</Typography>
        )}
        <Typography>Report Date: {new Date(currentReport.createdAt).toLocaleString()}</Typography>
      </Paper>
    </Box>
  );
};

export default SingleReportView;