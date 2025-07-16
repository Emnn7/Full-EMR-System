import React, { useState, useEffect } from 'react';
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
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Search, 
  FilterList, 
  Download, 
  Print, 
  Visibility,
  Close,
  Check,
  Add
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  fetchLabReports, 
  verifyLabReport,
  generateLabReportPDF,
  createLabReport
} from '../../redux/slices/labReportSlice';
import { fetchLabOrders } from '../../redux/slices/labOrderSlice';
import { VerifyDialog } from '../../components/labs/VerifyDialog';
import { PDFViewerDialog } from '../../components/labs/PDFViewerDialog';

const LabReports = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {loading, error } = useSelector((state) => state.labReport);
  const { labOrder } = useSelector((state) => state.labOrder);
  const { labReports } = useSelector((state) => state.labReport);
  const reports = labReports || [];

  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('orderId');
  const reportId = location.pathname.split('/').pop();

  const [filters, setFilters] = useState({
    status: '',
    dateRange: [null, null],
    testType: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newReportMode, setNewReportMode] = useState(false);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchLabOrders(orderId));
      dispatch(fetchLabReports({ orderId }));
      setNewReportMode(true);
    } else if (reportId && reportId !== 'reports') {
      dispatch(fetchLabReports({ reportId }));
    } else {
      dispatch(fetchLabReports());
    }
  }, [dispatch, orderId, reportId]);

  const handleVerifyClick = (report) => {
    setSelectedReport(report);
    setVerifyOpen(true);
  };

  const handleViewPDF = (report) => {
    setSelectedReport(report);
    setPdfOpen(true);
  };

  const handleVerifySubmit = (notes) => {
    dispatch(verifyLabReport({ 
      id: selectedReport._id, 
      notes 
    }));
    setVerifyOpen(false);
  };

  const handleCreateReport = () => {
    if (labOrder) {
      const initialReport = {
        order: orderId,
        patient: labOrder.patient._id,
        tests: labOrder.tests.map(test => ({
          testId: test._id,
          name: test.name,
          result: '',
          unit: test.unit || '',
          normalRange: test.normalRange || '',
          abnormalFlag: 'normal'
        })),
        findings: '',
        notes: '',
        status: 'pending'
      };
      
      dispatch(createLabReport(initialReport))
        .then((action) => {
          if (action.payload) {
            navigate(`/lab/reports/${action.payload._id}`);
          }
        });
    }
  };

  const filteredReports = reports.filter(report => {
    // Filter logic here
    const matchesSearch = report.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || report.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {newReportMode ? `Lab Report for Order #${orderId?.substring(0, 8)}` : 'Lab Reports'}
        </Typography>
        
        {newReportMode && reports.length === 0 && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateReport}
          >
            Create Report
          </Button>
        )}
      </Box>
      
      {/* Filter Bar */}
      {!newReportMode && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>
      )}

      {/* Reports Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Report ID</TableCell>
              {!newReportMode && <TableCell>Patient</TableCell>}
              <TableCell>Test Name</TableCell>
              <TableCell>Result</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <TableRow key={report._id}>
                  <TableCell>{report._id.substring(0, 8)}</TableCell>
                  {!newReportMode && (
                    <TableCell>
                      {report.patient?.firstName} {report.patient?.lastName}
                    </TableCell>
                  )}
                  <TableCell>{report.testName}</TableCell>
                  <TableCell>
                    {report.result} {report.unit}
                    {report.abnormalFlag !== 'normal' && (
                      <Chip 
                        label={report.abnormalFlag} 
                        color="error" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={report.status} 
                      color={
                        report.status === 'verified' ? 'success' : 
                        report.status === 'completed' ? 'warning' : 'default'
                      } 
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewPDF(report)}>
                      <Visibility />
                    </IconButton>
                    {report.status === 'completed' && (
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => handleVerifyClick(report)}
                        startIcon={<Check />}
                        sx={{ ml: 1 }}
                      >
                        Verify
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={newReportMode ? 6 : 7} align="center">
                  {newReportMode ? 'No report created yet for this order' : 'No reports found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogs */}
      <VerifyDialog
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        onVerify={handleVerifySubmit}
        report={selectedReport}
      />

      <PDFViewerDialog
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        reportId={selectedReport?._id}
      />
    </Box>
  );
};

export default LabReports;