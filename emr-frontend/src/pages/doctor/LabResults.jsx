import React, { useEffect } from 'react';
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
  Chip,
  Button,
} from '@mui/material';
import { Download, Visibility } from '@mui/icons-material';
import { fetchLabReports } from '../../redux/slices/labReportSlice';
import { fetchPatients } from '../../redux/slices/patientSlice';

const LabResults = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { labReports } = useSelector((state) => state.labReport);
  const { patients } = useSelector((state) => state.patient);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchLabReports({ doctorId: user._id }));
      dispatch(fetchPatients({ doctorId: user._id }));
    }
  }, [dispatch, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Lab Results
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Test Name</TableCell>
              <TableCell>Result</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {labReports.map((report) => (
              <TableRow key={report._id}>
                <TableCell>
                  {patients.find((p) => p._id === report.patientId)?.fullName || 'N/A'}
                </TableCell>
                <TableCell>{report.testName}</TableCell>
                <TableCell>{report.result}</TableCell>
                <TableCell>
                  <Chip
                    label={report.status}
                    color={getStatusColor(report.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(report.dateTested).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Visibility />}
                    sx={{ mr: 1 }}
                  >
                    View
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Download />}
                  >
                    Download
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

export default LabResults;