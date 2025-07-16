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
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  AssignmentInd as AssignmentIcon,
  PersonRemove as UnassignIcon,
  Search as SearchIcon,
  PersonAdd as AssignIcon
} from '@mui/icons-material';
import {
  fetchUnassignedPatients,
  fetchPatientsByDoctor,
  assignDoctorToPatient,
  unassignDoctorFromPatient,
  fetchAllAssignedPatients,
} from '../../redux/slices/patientAssignmentSlice';
import { fetchDoctors } from '../../redux/slices/doctorSlice';

const PatientDoctorAssignment = () => {
  const dispatch = useDispatch();
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [unassignDialog, setUnassignDialog] = useState({ open: false, patientId: null });
  const [viewMode, setViewMode] = useState('unassigned'); // 'unassigned' or 'all'

  // Redux state
  const {
    unassignedPatients,
    assignedPatients,
    allAssignedPatients,
    loading,
    error,
  } = useSelector((state) => state.patientAssignment);
  
  const { doctors, loading: doctorsLoading } = useSelector((state) => state.doctor);

  // Load data on mount
  useEffect(() => {
    console.log('Doctors data:', doctors); 
    dispatch(fetchUnassignedPatients());
    dispatch(fetchDoctors());
    dispatch(fetchAllAssignedPatients());
  }, [dispatch]);

  // Handle doctor selection
  const handleDoctorSelect = (doctorId) => {
    setSelectedDoctor(doctorId);
    if (doctorId) {
      dispatch(fetchPatientsByDoctor(doctorId));
    }
  };

  // Handle assignment
 const handleAssign = (patientId) => {
  if (!selectedDoctor) return;
  dispatch(assignDoctorToPatient({ patientId, doctorId: selectedDoctor }))
    .unwrap()
    .then(() => {
      setSnackbar({ 
        open: true, 
        message: 'Patient assigned successfully!', 
        severity: 'success' 
      });
      dispatch(fetchUnassignedPatients());
      if (selectedDoctor) {
        dispatch(fetchPatientsByDoctor(selectedDoctor));
      }
    })
    .catch((err) => {
      setSnackbar({ 
        open: true, 
        message: typeof err === 'string' ? err : 'Failed to assign patient',
        severity: 'error' 
      });
    });
};


  // Handle unassignment
  const handleUnassign = (patientId) => {
    dispatch(unassignDoctorFromPatient(patientId))
      .unwrap()
      .then(() => {
        setSnackbar({ open: true, message: 'Patient unassigned successfully!', severity: 'success' });
        dispatch(fetchUnassignedPatients());
        if (selectedDoctor) {
          dispatch(fetchPatientsByDoctor(selectedDoctor));
        }
        dispatch(fetchAllAssignedPatients());
        setUnassignDialog({ open: false, patientId: null });
      })
      .catch((err) => {
        setSnackbar({ open: true, message: err || 'Failed to unassign patient', severity: 'error' });
      });
  };

  // Filter patients based on search term
// In your component, modify the filter operations to handle undefined cases:

const filteredUnassignedPatients = unassignedPatients?.filter(patient =>
  `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
  patient.phone.includes(searchTerm)
) || [];

const filteredAssignedPatients = (selectedDoctor && assignedPatients[selectedDoctor] 
  ? assignedPatients[selectedDoctor].filter(patient =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
    )
  : []) || [];

const filteredAllAssignedPatients = allAssignedPatients?.filter(assignment => {
  const patientMatch = `${assignment.patient.firstName} ${assignment.patient.lastName}`
    .toLowerCase()
    .includes(searchTerm.toLowerCase());
  const doctorMatch = `${assignment.doctor.firstName} ${assignment.doctor.lastName}`
    .toLowerCase()
    .includes(searchTerm.toLowerCase());
  const phoneMatch = assignment.patient.phone.includes(searchTerm);
  
  return patientMatch || doctorMatch || phoneMatch;
}) || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        <AssignmentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Patient-Doctor Assignment Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Doctor Selection and Search */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Select Doctor</InputLabel>
              <Select
                value={selectedDoctor}
                onChange={(e) => handleDoctorSelect(e.target.value)}
                label="Select Doctor"
                disabled={doctorsLoading}
              >
                {doctors.map((doctor) => (
                                    <MenuItem key={doctor.id} value={doctor.id}>
                                      {doctor.name}
                                    </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Search patients"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
              sx={{ flexGrow: 1 }}
            />

            <Button
              variant={viewMode === 'unassigned' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('unassigned')}
            >
              Unassigned
            </Button>
            <Button
              variant={viewMode === 'all' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('all')}
            >
              View All Assignments
            </Button>
          </Paper>
        </Grid>

        {/* Unassigned Patients */}
        {viewMode === 'unassigned' && (
          <>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Unassigned Patients ({filteredUnassignedPatients.length})
                </Typography>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Patient</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredUnassignedPatients.map((patient) => (
                          <TableRow key={patient._id} hover>
                            <TableCell>
                              {patient.firstName} {patient.lastName}
                            </TableCell>
                            <TableCell>{patient.phone}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                startIcon={<AssignIcon />}
                                onClick={() => handleAssign(patient._id)}
                                disabled={!selectedDoctor}
                                color="primary"
                              >
                                Assign
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>

            {/* Assigned Patients */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {
  selectedDoctor ? 
    `Dr. ${doctors.find(d => d.id === selectedDoctor)?.name || 'Unknown'}'s Patients` : 
    'Assigned Patients'
}
                
                </Typography>
                {selectedDoctor ? (
                  loading ? (
                    <CircularProgress />
                  ) : filteredAssignedPatients.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Patient</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredAssignedPatients.map((patient) => (
                            <TableRow key={patient._id} hover>
                              <TableCell>
                                {patient.firstName} {patient.lastName}
                              </TableCell>
                              <TableCell>{patient.phone}</TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  startIcon={<UnassignIcon />}
                                  onClick={() => setUnassignDialog({ open: true, patientId: patient._id })}
                                  color="error"
                                >
                                  Unassign
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography>No patients assigned yet</Typography>
                  )
                ) : (
                  <Typography>Select a doctor to view their patients</Typography>
                )}
              </Paper>
            </Grid>
          </>
        )}

        {/* All Assignments View */}
        {viewMode === 'all' && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                All Patient-Doctor Assignments ({filteredAllAssignedPatients.length})
              </Typography>
              {loading ? (
                <CircularProgress />
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Patient</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Assigned Doctor</TableCell>
                        <TableCell>Specialization</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                 <TableBody>
  {filteredAllAssignedPatients.map((assignment) => (
    <TableRow key={`${assignment.patient._id}-${assignment.doctor._id}`} hover>
      <TableCell>
        {assignment.patient.firstName} {assignment.patient.lastName}
      </TableCell>
      <TableCell>{assignment.patient.phone}</TableCell>
      <TableCell>
        Dr. {assignment.doctor.firstName} {assignment.doctor.lastName}
      </TableCell>
      <TableCell>{assignment.doctor.specialization}</TableCell>
      <TableCell>
        <Box display="flex" gap={1}>
          <Chip 
            label={assignment.assignmentType === 'primary' ? 'Primary' : 'Appointment'} 
            color={assignment.assignmentType === 'primary' ? 'primary' : 'default'}
            size="small"
          />
          {assignment.assignmentType === 'primary' && (
            <Button
              size="small"
              startIcon={<UnassignIcon />}
              onClick={() => setUnassignDialog({ 
                open: true, 
                patientId: assignment.patient._id 
              })}
              color="error"
            >
              Unassign
            </Button>
          )}
        </Box>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Unassign Confirmation Dialog */}
      <Dialog
        open={unassignDialog.open}
        onClose={() => setUnassignDialog({ open: false, patientId: null })}
      >
        <DialogTitle>Confirm Unassignment</DialogTitle>
        <DialogContent>
          Are you sure you want to unassign this patient from their doctor?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnassignDialog({ open: false, patientId: null })}>Cancel</Button>
          <Button onClick={() => handleUnassign(unassignDialog.patientId)} color="error">
            Unassign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientDoctorAssignment;