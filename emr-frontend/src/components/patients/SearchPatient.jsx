import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, TextField, Button, List, ListItem, ListItemText, Paper } from '@mui/material';
import { searchPatients } from '../../redux/slices/patientSlice';

const SearchPatient = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      dispatch(searchPatients(searchTerm))
        .then((action) => {
          if (action.payload) {
            setSearchResults(action.payload);
          }
        });
    }
  };

  return (
    <Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          label="Search by Phone Number or Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {searchResults.length > 0 && (
        <Paper>
          <List>
            {searchResults.map((patient) => (
              <ListItem key={patient._id} button component="a" href={`/patients/${patient._id}`}>
                <ListItemText
                  primary={`${patient.firstName} ${patient.lastName}`}
                  secondary={`Phone: ${patient.phone} | DOB: ${new Date(patient.dateOfBirth).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default SearchPatient;