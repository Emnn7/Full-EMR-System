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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Grid
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { fetchPrescriptions, setCurrentPrescription } from '../../redux/slices/prescriptionSlice';
import { fetchPatients } from '../../redux/slices/patientSlice';
import prescriptionAPI from '../../api/prescriptionAPI';

const Prescriptions = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { prescriptions, currentPrescription } = useSelector((state) => state.prescription);
  const { patients } = useSelector((state) => state.patient);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchPrescriptions({ doctorId: user._id }));
      dispatch(fetchPatients({ doctorId: user._id }));
    }
  }, [dispatch, user]);

  const handleOpenDialog = (prescription = null) => {
    dispatch(setCurrentPrescription(prescription));
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    dispatch(setCurrentPrescription(null));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentPrescription) {
        await prescriptionAPI.updatePrescription(
          currentPrescription._id,
          currentPrescription
        );
      } else {
        await prescriptionAPI.createPrescription({
          ...currentPrescription,
          doctorId: user._id,
        });
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to save prescription:', err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Prescriptions</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          New Prescription
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Medication</TableCell>
              <TableCell>Dosage</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prescriptions.map((prescription) => (
              <TableRow key={prescription._id}>
                <TableCell>
                  {patients.find((p) => p._id === prescription.patientId)?.fullName || 'N/A'}
                </TableCell>
                <TableCell>{prescription.medicationName}</TableCell>
                <TableCell>{prescription.dosage}</TableCell>
                <TableCell>{prescription.frequency}</TableCell>
                <TableCell>{prescription.duration}</TableCell>
                <TableCell>
                  {new Date(prescription.datePrescribed).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(prescription)}>
                    <Edit />
                  </IconButton>
                  <IconButton>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <PrescriptionDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        patients={patients}
        currentPrescription={currentPrescription}
        setCurrentPrescription={(data) => dispatch(setCurrentPrescription(data))}
      />
    </Box>
  );
};

const PrescriptionDialog = ({
  open,
  onClose,
  onSubmit,
  patients,
  currentPrescription,
  setCurrentPrescription,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentPrescription({
      ...currentPrescription,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setCurrentPrescription({
      ...currentPrescription,
      datePrescribed: date,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {currentPrescription?._id ? 'Edit Prescription' : 'New Prescription'}
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Patient</InputLabel>
                <Select
                  name="patientId"
                  value={currentPrescription?.patientId || ''}
                  onChange={handleChange}
                  label="Patient"
                  required
                >
                  {patients.map((patient) => (
                    <MenuItem key={patient._id} value={patient._id}>
                      {patient.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Medication Name"
                name="medicationName"
                value={currentPrescription?.medicationName || ''}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Dosage"
                name="dosage"
                value={currentPrescription?.dosage || ''}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Frequency"
                name="frequency"
                value={currentPrescription?.frequency || ''}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Duration"
                name="duration"
                value={currentPrescription?.duration || ''}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date Prescribed"
                value={currentPrescription?.datePrescribed || new Date()}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instructions"
                name="instructions"
                value={currentPrescription?.instructions || ''}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {currentPrescription?._id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default Prescriptions;