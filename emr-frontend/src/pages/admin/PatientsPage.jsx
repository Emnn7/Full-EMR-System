import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { fetchPatients } from '../../redux/slices/patientSlice';

const PatientsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patients = [], loading } = useSelector((state) => state.patient) || {};
  const { user } = useSelector((state) => state.auth) || {};
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchPatients({}));
  }, [dispatch]);

  const handleViewPatient = (patientId) => {
    navigate(`/patients/${patientId}`);
  };

  const filteredPatients = patients.filter((patient) => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const phone = patient.phone?.toLowerCase() || '';
    const cardNumber = patient.patientCardNumber?.toLowerCase() || '';

    return (
      fullName.includes(search) ||
      phone.includes(search) ||
      cardNumber.includes(search)
    );
  });

  // Helper function to calculate age
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'N/A';
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography component="h1" variant="h5">
                Patient Management
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </Box>

            {/* Search Input */}
            <Box mb={2}>
              <TextField
                fullWidth
                placeholder="Search by name, phone, or card number..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {/* Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Hospital Card Number</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Age</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPatients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          {searchTerm
                            ? 'No matching patients found'
                            : 'No patients found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPatients.map((patient) => (
                        <TableRow key={patient._id}>
                          <TableCell>{patient.patientCardNumber || 'N/A'}</TableCell>
                          <TableCell>{`${patient.firstName} ${patient.lastName}`}</TableCell>
                          <TableCell>
                          {calculateAge(patient?.dateOfBirth)} years
                                          </TableCell>
                          <TableCell>{patient.phone || 'N/A'}</TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton onClick={() => handleViewPatient(patient._id)}>
                                <ViewIcon color="primary" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PatientsPage;
