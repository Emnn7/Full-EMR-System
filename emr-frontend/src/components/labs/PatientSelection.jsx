import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import { Search as SearchIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { usePatientSearch } from '../../hooks/usePatientSearch';

const PatientSelection = () => {
  const navigate = useNavigate();
  const {
    searchTerm,
    setSearchTerm,
    patients,
    isLoading,
    error
  } = usePatientSearch();

  // Filter patients by search term, including card number
  const filteredPatients = patients?.filter((patient) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.firstName?.toLowerCase().includes(searchLower) ||
      patient.lastName?.toLowerCase().includes(searchLower) ||
      patient.phone?.includes(searchTerm) ||
      patient.patientCardNumber?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Select Patient for Vital Signs Recording
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search patients by name, card number, or phone..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          {filteredPatients?.length > 0 ? (
            filteredPatients.map((patient) => (
              <ListItem
                key={patient._id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => navigate(`/lab/vital-signs/new/${patient._id}`)}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                }
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/lab/vital-signs/new/${patient._id}`)}
              >
                <ListItemText
                  primary={`${patient.firstName} ${patient.lastName}`}
                  secondary={
                    <>
                      <span>Card Number: {patient.patientCardNumber || 'N/A'}</span>
                      <br />
                      <span>Phone: {patient.phone || 'N/A'}</span>
                    </>
                  }
                />
              </ListItem>
            ))
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
              {searchTerm
                ? 'No patients found matching your search'
                : 'No patients available'}
            </Typography>
          )}
        </List>
      )}
    </Paper>
  );
};

export default PatientSelection;
