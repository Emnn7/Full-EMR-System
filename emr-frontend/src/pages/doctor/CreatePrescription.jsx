import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, TextField, Button, Grid, Paper, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { addPrescription } from '../../redux/slices/prescriptionSlice';

const CreatePrescription = () => {
  const { patientId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    diagnosis: '',
    notes: '',
    medications: [{
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 1
    }]
  });
useEffect(() => {
  if (!patientId) {
    console.error('Missing patientId in URL');
    navigate('/doctor'); // or your fallback route
    return;
  }
}, [patientId, navigate]);
  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const medications = [...formData.medications];
    medications[index] = { ...medications[index], [name]: value };
    setFormData({ ...formData, medications });
  };

  const handleAddMedication = () => {
    setFormData({
      ...formData,
      medications: [
        ...formData.medications,
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
          quantity: 1
        }
      ]
    });
  };

  const handleRemoveMedication = (index) => {
    const medications = [...formData.medications];
    medications.splice(index, 1);
    setFormData({ ...formData, medications });
  };

const handleSubmit = (e) => {
  e.preventDefault();
  dispatch(addPrescription({
    patient: patientId,
    doctor: user._id,
    ...formData
  })).then(() => {
    // Change this navigation to match your patient profile route
    navigate(`/doctors/patients/:patientId`);  // Or whatever your patient profile route is
  });
};

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        New Prescription
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            />
          </Grid>
          
          {formData.medications.map((med, index) => (
            <React.Fragment key={index}>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Medication {index + 1}</Typography>
                {index > 0 && (
                  <IconButton onClick={() => handleRemoveMedication(index)}>
                    <RemoveIcon />
                  </IconButton>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={med.name}
                  onChange={(e) => handleChange(e, index)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Dosage"
                  name="dosage"
                  value={med.dosage}
                  onChange={(e) => handleChange(e, index)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Frequency"
                  name="frequency"
                  value={med.frequency}
                  onChange={(e) => handleChange(e, index)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration"
                  name="duration"
                  value={med.duration}
                  onChange={(e) => handleChange(e, index)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Instructions"
                  name="instructions"
                  value={med.instructions}
                  onChange={(e) => handleChange(e, index)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={med.quantity}
                  onChange={(e) => handleChange(e, index)}
                  required
                />
              </Grid>
            </React.Fragment>
          ))}

          <Grid item xs={12}>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddMedication}
              variant="outlined"
            >
              Add Medication
            </Button>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Save Prescription
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CreatePrescription;