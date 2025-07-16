import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography, TextField, Button, Grid, Paper, Alert, IconButton, Box
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { createConsultation, getConsultationsByPatient } from '../../redux/slices/consultationSlice';

const ConsultationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [error, setError] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const patientId = queryParams.get('patientId');

  const [formData, setFormData] = useState({
    notes: '',
    diagnosis: '',
    symptoms: [''] // Start with one symptom field
  });

  useEffect(() => {
    if (!patientId) {
      setError('Patient ID is missing from URL');
    }
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSymptomChange = (index, value) => {
    const updatedSymptoms = [...formData.symptoms];
    updatedSymptoms[index] = value;
    setFormData((prev) => ({ ...prev, symptoms: updatedSymptoms }));
  };

  const addSymptomField = () => {
    setFormData((prev) => ({
      ...prev,
      symptoms: [...prev.symptoms, '']
    }));
  };

  const removeSymptomField = (index) => {
    const updatedSymptoms = formData.symptoms.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, symptoms: updatedSymptoms }));
  };

const handleSubmit = (e) => {
  e.preventDefault();
  setError(null);

  if (!patientId) {
    setError('Patient ID is missing');
    return;
  }

  const consultationData = {
    patient: patientId,
    doctor: user._id,
    notes: formData.notes,
    diagnosis: formData.diagnosis,
    symptoms: formData.symptoms.filter(s => s.trim() !== '')
  };

  dispatch(createConsultation(consultationData))
    .unwrap()
    .then(() => {
      // ✅ Refresh consultations for the patient
      dispatch(getConsultationsByPatient(patientId));

      // ✅ Navigate after refresh (or keep user on form and show a success message)
     navigate(`/doctors/patients/${patientId}`);
    })
    .catch((err) => {
      setError(err.message || 'Failed to create consultation');
      console.error('Full error:', err);
    });
};

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        New Consultation for Patient {patientId || 'Unknown'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Patient ID"
              value={patientId || 'Not available'}
              InputProps={{ readOnly: true }}
              variant="filled"
            />
          </Grid>
<Grid item xs={12}>
  <Box sx={{ width: '100%' }}>
    <TextField
      fullWidth
      label="Notes"
      name="notes"
      value={formData.notes}
      onChange={handleChange}
      multiline
      minRows={10}   // More height
      maxRows={20}   // Optional cap
      variant="outlined"
      placeholder="Enter detailed medical notes here..."
      InputProps={{
        sx: {
          alignItems: 'flex-start',
        },
      }}
      sx={{
        width: '100%',
        fontSize: '1rem',
        '& .MuiInputBase-root': {
          height: 'auto',
        },
        '& textarea': {
          fontSize: '1rem',
        },
      }}
    />
  </Box>
</Grid>



          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1">Symptoms</Typography>
            {formData.symptoms.map((symptom, index) => (
              <Grid container spacing={1} key={index} alignItems="center" sx={{ mb: 1 }}>
                <Grid item xs>
                  <TextField
                    fullWidth
                    label={`Symptom ${index + 1}`}
                    value={symptom}
                    onChange={(e) => handleSymptomChange(index, e.target.value)}
                  />
                </Grid>
                <Grid item>
                  {formData.symptoms.length > 1 && (
                    <IconButton onClick={() => removeSymptomField(index)} color="error">
                      <Remove />
                    </IconButton>
                  )}
                  {index === formData.symptoms.length - 1 && (
                    <IconButton onClick={addSymptomField} color="primary">
                      <Add />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            ))}
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!patientId}
            >
              Save Consultation
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ConsultationForm;
