import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, Container, Paper, Typography, Grid,
  TextField, MenuItem, CircularProgress, FormControl, InputLabel, Select
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { 
  fetchAppointmentById, 
  createAppointment, 
  updateAppointment 
} from '../../redux/slices/appointmentSlice';
import { fetchPatients } from '../../redux/slices/patientSlice';
import { fetchDoctors } from '../../redux/slices/doctorSlice';
import * as yup from 'yup';
import { useFormik } from 'formik';

const validationSchema = yup.object({
  patientId: yup.string().required('Patient is required'),
  doctorId: yup.string().required('Doctor is required'),
  date: yup.date().required('Date is required'),
  time: yup.string().required('Time is required'),
  status: yup.string().required('Status is required'),
  notes: yup.string(),
});

const AppointmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentAppointment: appointment, loading, saving } = useSelector((state) => state.appointment);
  const { patients } = useSelector((state) => state.patient);
  const { doctors } = useSelector((state) => state.doctor);
  const isEdit = Boolean(id);

  const [timeSlots] = useState([
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ]);

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchAppointmentById(id));
    }
    dispatch(fetchPatients());
    dispatch(fetchDoctors());
  }, [dispatch, id, isEdit]);

  const formik = useFormik({
    initialValues: {
      patientId: '',
      doctorId: '',
      date: '',
      time: '',
      status: 'pending',
      notes: ''
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (isEdit) {
        dispatch(updateAppointment({ id, ...values }))
          .then(() => navigate(`/appointments/${id}`));
      } else {
        dispatch(createAppointment(values))
          .then(() => navigate('/appointments'));
      }
    },
  });

  useEffect(() => {
    if (isEdit && appointment) {
      formik.setValues({
        patientId: appointment.patient?._id,
        doctorId: appointment.doctor?._id,
        date: appointment.date?.split('T')[0],
        time: appointment.time,
        status: appointment.status,
        notes: appointment.notes || ''
      });
    }
  }, [appointment, isEdit]);

  if ((isEdit && loading) || patients.length === 0 || doctors.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(isEdit ? `/appointments/${id}` : '/appointments')}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">
          {isEdit ? 'Edit Appointment' : 'Add New Appointment'}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="patient-label">Patient</InputLabel>
                <Select
                  labelId="patient-label"
                  id="patientId"
                  name="patientId"
                  label="Patient"
                  value={formik.values.patientId}
                  onChange={formik.handleChange}
                  error={formik.touched.patientId && Boolean(formik.errors.patientId)}
                >
                  {patients.map((patient) => (
                    <MenuItem key={patient._id} value={patient._id}>
                      {`${patient.firstName} ${patient.lastName}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="doctor-label">Doctor</InputLabel>
                <Select
                  labelId="doctor-label"
                  id="doctorId"
                  name="doctorId"
                  label="Doctor"
                  value={formik.values.doctorId}
                  onChange={formik.handleChange}
                  error={formik.touched.doctorId && Boolean(formik.errors.doctorId)}
                >
                  {doctors.map((doctor) => (
                     <MenuItem key={doctor.id} value={doctor.id}>
                                          {doctor.name}
                                        </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="date"
                name="date"
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formik.values.date}
                onChange={formik.handleChange}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="time-label">Time</InputLabel>
                <Select
                  labelId="time-label"
                  id="time"
                  name="time"
                  label="Time"
                  value={formik.values.time}
                  onChange={formik.handleChange}
                  error={formik.touched.time && Boolean(formik.errors.time)}
                >
                  {timeSlots.map((slot) => (
                    <MenuItem key={slot} value={slot}>{slot}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  label="Status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Notes"
                multiline
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={saving}
                sx={{ mt: 2 }}
              >
                {saving ? <CircularProgress size={24} /> : 'Save Appointment'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AppointmentForm;