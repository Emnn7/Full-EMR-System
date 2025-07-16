import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { fetchPatients } from '../../redux/slices/patientSlice';
import { fetchDoctors } from '../../redux/slices/doctorSlice';
import { createAppointment } from '../../redux/slices/appointmentSlice';
import moment from 'moment';

const AppointmentScheduler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patients } = useSelector((state) => state.patient);
  const { doctors } = useSelector((state) => state.doctor);
  
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: new Date(),
    reason: '',
    status: 'Scheduled'
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(patient =>
        patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phoneNumber.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients([]);
    }
  }, [searchTerm, patients]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePatientSelect = (patient) => {
    setFormData({ ...formData, patientId: patient._id });
    setSearchTerm(patient.fullName);
    setFilteredPatients([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, appointmentDate: date });
    // Here you would fetch available slots from the API
    // For now, we'll mock some slots
    if (formData.doctorId) {
      const slots = [];
      for (let hour = 9; hour < 17; hour++) {
        slots.push(`${hour}:00`);
        slots.push(`${hour}:30`);
      }
      setAvailableSlots(slots);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    const [hours, minutes] = slot.split(':');
    const date = new Date(formData.appointmentDate);
    date.setHours(hours, minutes);
    setFormData({ ...formData, appointmentDate: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createAppointment(formData));
      navigate('/receptionist');
    } catch (err) {
      console.error('Failed to create appointment:', err);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Schedule Appointment</Typography>
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Find Patient
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Patient Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Patient"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by name or phone number"
              />
              {filteredPatients.length > 0 && (
                <Paper sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                  {filteredPatients.map((patient) => (
                    <Box
                      key={patient._id}
                      onClick={() => handlePatientSelect(patient)}
                      sx={{
                        p: 1,
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      {patient.fullName} - {patient.phoneNumber}
                    </Box>
                  ))}
                </Paper>
              )}
            </Grid>

            {formData.patientId && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Appointment Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Doctor</InputLabel>
                    <Select
  name="doctorId"
  value={formData.doctorId || ''} // Ensure controlled value
  onChange={handleChange}
  label="Doctor"
  required
>
  {doctors.map((doctor) => (
    <MenuItem key={doctor._id} value={doctor._id}>
      {`${doctor.firstName} ${doctor.lastName}`} ({doctor.specialization})
    </MenuItem>
  ))}
</Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Appointment Date"
                    value={formData.appointmentDate}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth required />
                    )}
                  />
                </Grid>

                {formData.doctorId && availableSlots.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Available Time Slots
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {availableSlots.map((slot) => (
                        <Chip
                          key={slot}
                          label={slot}
                          onClick={() => handleSlotSelect(slot)}
                          color={selectedSlot === slot ? 'primary' : 'default'}
                          variant={selectedSlot === slot ? 'filled' : 'outlined'}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason for Appointment"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      label="Status"
                      required
                    >
                      <MenuItem value="Scheduled">Scheduled</MenuItem>
                      <MenuItem value="Confirmed">Confirmed</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<AddIcon />}
                    >
                      Schedule Appointment
                    </Button>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </form>
      </Paper>

      {/* Patient Search Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Find Patient</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Search Patients"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by name or phone number"
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <Paper
                  key={patient._id}
                  onClick={() => {
                    handlePatientSelect(patient);
                    setOpenDialog(false);
                  }}
                  sx={{
                    p: 2,
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <Typography variant="subtitle1">{patient.fullName}</Typography>
                  <Typography variant="body2">Phone: {patient.phoneNumber}</Typography>
                  <Typography variant="body2">
                    DOB: {moment(patient.dateOfBirth).format('MMM D, YYYY')}
                  </Typography>
                </Paper>
              ))
            ) : (
              <Typography sx={{ p: 2, textAlign: 'center' }}>
                {searchTerm ? 'No patients found' : 'Search for a patient'}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
       </LocalizationProvider>
  );
};



export default AppointmentScheduler;