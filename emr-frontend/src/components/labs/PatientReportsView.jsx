import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatientLabReports } from '../../redux/slices/labReportSlice';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';

const PatientReportsView = () => {
  const { patientId } = useParams();
  const dispatch = useDispatch();
  const { reports, loading, error } = useSelector((state) => state.labReport);

  useEffect(() => {
    dispatch(fetchPatientLabReports(patientId));
  }, [dispatch, patientId]);

  console.log('Patient ID:', patientId);
  console.log('Reports:', reports);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!reports || reports.length === 0) {
    return (
      <Alert severity="info" sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
        No reports found for this patient
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {`Reports for ${reports[0].patient?.firstName ?? ''} ${reports[0].patient?.lastName ?? ''}`}
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Report ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Tests</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report._id}>
                <TableCell>{report._id.substring(0, 8)}</TableCell>
                <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {report.tests?.map((test, index) => (
                    <Chip
                      key={index}
                      label={test.name}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  <Chip
                    label={report.status}
                    color={
                      report.status === 'verified'
                        ? 'success'
                        : report.status === 'completed'
                        ? 'primary'
                        : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    href={`/lab/reports/${report._id}`}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PatientReportsView;
