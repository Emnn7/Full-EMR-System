import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Box,
  Grid,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Chip,
  Stack
} from '@mui/material';
import { updatePatient } from '../../redux/slices/patientSlice';

const DoctorEditPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { patients } = useSelector((state) => state.patient);
  
  const [formData, setFormData] = useState({
    allergies: '',
    currentMedications: '',
    medicalHistory: '',
    bloodType: '',
    immunizations: '',
    clinicalNotes: '',
    active: true
  });

  useEffect(() => {
    const patient = patients.find(p => p._id === id);
    if (patient) {
      setFormData({
        allergies: patient.allergies || '',
        currentMedications: patient.currentMedications || '',
        medicalHistory: patient.medicalHistory || '',
        bloodType: patient.bloodType || '',
        immunizations: patient.immunizations || '',
        clinicalNotes: patient.clinicalNotes || '',
        active: patient.active !== undefined ? patient.active : true
      });
    }
  }, [id, patients]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updatePatient({ id, patientData: formData })).unwrap();
      navigate('/patients');
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Edit Medical Record
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Medical Information Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Medical Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Blood Type</InputLabel>
              <Select
                value={formData.bloodType}
                label="Blood Type"
                onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
              >
                <MenuItem value="">Unknown</MenuItem>
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="B-">B-</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({...formData, allergies: e.target.value})}
              fullWidth
              multiline
              rows={2}
              helperText="List all known allergies"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Current Medications"
              value={formData.currentMedications}
              onChange={(e) => setFormData({...formData, currentMedications: e.target.value})}
              fullWidth
              multiline
              rows={3}
              helperText="Include dosages and frequencies"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Medical History"
              value={formData.medicalHistory}
              onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
              fullWidth
              multiline
              rows={4}
              helperText="Chronic conditions, past surgeries, etc."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Immunizations"
              value={formData.immunizations}
              onChange={(e) => setFormData({...formData, immunizations: e.target.value})}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Clinical Notes"
              value={formData.clinicalNotes}
              onChange={(e) => setFormData({...formData, clinicalNotes: e.target.value})}
              fullWidth
              multiline
              rows={4}
              helperText="Current observations and treatment plans"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Patient Status</InputLabel>
              <Select
                value={formData.active}
                label="Patient Status"
                onChange={(e) => setFormData({...formData, active: e.target.value})}
              >
                <MenuItem value={true}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip label="Active" color="success" size="small" />
                    <span>Active in practice</span>
                  </Stack>
                </MenuItem>
                <MenuItem value={false}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip label="Inactive" color="default" size="small" />
                    <span>No longer under care</span>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)}
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            sx={{ minWidth: 150 }}
          >
            Save Medical Record
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default DoctorEditPatient;