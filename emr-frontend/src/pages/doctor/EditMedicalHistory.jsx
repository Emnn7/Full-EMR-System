import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Typography, Paper, CircularProgress
} from '@mui/material';
import { updateMedicalHistory, fetchMedicalHistoryById } from '../../redux/slices/medicalHistorySlice';
import MedicalHistoryForm from '../../components/medical/MedicalHistoryForm';

const EditMedicalHistory = () => {
  const { id, historyId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentHistory, loading } = useSelector(state => state.medicalHistory);

  useEffect(() => {
    dispatch(fetchMedicalHistoryById(historyId));
  }, [historyId, dispatch]);

  const handleSubmit = (formData) => {
    dispatch(updateMedicalHistory({
      patientId: id,
      historyId,
      historyData: formData
    }))
    .unwrap()
    .then(() => {
      navigate(`/doctors/patients/${id}`, {
        state: { success: 'Medical history updated successfully!' }
      });
    })
    .catch(error => {
      console.error("Update Error:", error);
      alert(`Failed to update: ${error.message || "Check console for details"}`);
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentHistory) {
    return <Typography>Medical history not found</Typography>;
  }

  // Ensure all required fields are properly initialized
  const initialFormData = {
    symptoms: currentHistory.symptoms || '',
    diagnosis: currentHistory.diagnosis || '',
    notes: currentHistory.notes || '',
    familyHistory: currentHistory.familyHistory || '',
    followUpDate: currentHistory.followUpDate ? new Date(currentHistory.followUpDate).toISOString().split('T')[0] : '',
    pastIllnesses: currentHistory.pastIllnesses || '',
    surgicalHistory: currentHistory.surgicalHistory || '',
    allergies: currentHistory.allergies || [],
    currentMedications: currentHistory.currentMedications || [],
    lifestyle: currentHistory.lifestyle || {
      smoking: false,
      alcohol: false,
      exerciseFrequency: '',
      diet: ''
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Update Medical History
      </Typography>
      <MedicalHistoryForm 
        initialData={initialFormData}
        onSubmit={handleSubmit}
        submitButtonText="Update Medical History"
      />
    </Paper>
  );
};

export default EditMedicalHistory;