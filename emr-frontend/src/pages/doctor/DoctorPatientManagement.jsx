import React, { useState, useEffect } from 'react';
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
  TextField,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Search, Visibility } from '@mui/icons-material';
import { fetchPatients } from '../../redux/slices/patientSlice';
import { useNavigate } from 'react-router-dom';

const PatientManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { patients, loading } = useSelector((state) => state.patient);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchPatients({ doctorId: user._id }))
        .unwrap()
        .then(response => {
          console.log("API Response Structure:", {
            data: response.data,
            meta: response.meta,
            firstPatient: response.data?.[0]
          });
        })
        .catch(err => console.error("Fetch error:", err));
    }
  }, [dispatch, user]);

  const getFullName = (patient) =>
    `${patient.firstName || ''} ${patient.lastName || ''}`.trim();

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

  const filteredPatients = (patients || []).filter((patient) => {
    const fullName = getFullName(patient).toLowerCase();
    const phone = (patient.phone || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || phone.includes(search);
  });

  const handleViewPatient = (patientId) => {
    navigate(`/doctors/patients/${patientId}`);
  };

  const formatLastVisit = (dateString) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Format Error';
    }
  };

  if (loading) return <Typography>Loading patients...</Typography>;

  console.log('Current Redux State:', {
    patients,
    filteredPatients,
    firstFilteredPatient: filteredPatients[0]
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Patient Management
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search patients by name or phone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Last Visit</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => {
                console.log(`Patient ${patient._id} lastVisit:`, {
                  raw: patient.lastVisit,
                  type: typeof patient.lastVisit,
                  formatted: formatLastVisit(patient.lastVisit)
                });
                
                return (
                  <TableRow key={patient._id}>
                    <TableCell>{getFullName(patient) || '-'}</TableCell>
                    <TableCell>{patient.phone || '-'}</TableCell>
                    <TableCell>{calculateAge(patient.dateOfBirth)}</TableCell>
                    <TableCell>
                      {formatLastVisit(patient.lastVisit)}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewPatient(patient._id)}>
                        <Visibility color="primary" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PatientManagement;