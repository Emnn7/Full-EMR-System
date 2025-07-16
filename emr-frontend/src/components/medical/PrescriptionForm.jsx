import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

const medicationOptions = [
  'Amoxicillin',
  'Ibuprofen',
  'Paracetamol',
  'Lisinopril',
  'Metformin',
  'Atorvastatin',
  'Levothyroxine',
  'Albuterol',
  'Omeprazole',
  'Losartan'
];

const frequencyOptions = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
  'At bedtime'
];

const durationOptions = [
  '1 day',
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '14 days',
  '21 days',
  '30 days',
  '60 days',
  '90 days',
  'Ongoing'
];

const PrescriptionForm = ({ initialValues, onSubmit, patient, doctor }) => {
  const validationSchema = Yup.object().shape({
    medicationName: Yup.string().required('Medication is required'),
    dosage: Yup.string().required('Dosage is required'),
    frequency: Yup.string().required('Frequency is required'),
    duration: Yup.string().required('Duration is required'),
    instructions: Yup.string(),
    datePrescribed: Yup.date().required('Date is required'),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      datePrescribed: new Date(),
      patientId: patient?._id || '',
      doctorId: doctor?._id || '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {initialValues ? 'Edit Prescription' : 'New Prescription'}
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              <strong>Patient:</strong> {patient?.fullName || 'Not selected'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              <strong>Prescribing Doctor:</strong> Dr. {doctor?.name || 'Not selected'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              freeSolo
              options={medicationOptions}
              value={formik.values.medicationName}
              onChange={(event, newValue) => {
                formik.setFieldValue('medicationName', newValue);
              }}
              onBlur={formik.handleBlur}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Medication Name"
                  name="medicationName"
                  error={formik.touched.medicationName && Boolean(formik.errors.medicationName)}
                  helperText={formik.touched.medicationName && formik.errors.medicationName}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Dosage"
              name="dosage"
              value={formik.values.dosage}
              onChange={formik.handleChange}
              error={formik.touched.dosage && Boolean(formik.errors.dosage)}
              helperText={formik.touched.dosage && formik.errors.dosage}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                name="frequency"
                value={formik.values.frequency}
                onChange={formik.handleChange}
                label="Frequency"
                error={formik.touched.frequency && Boolean(formik.errors.frequency)}
              >
                {frequencyOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Duration</InputLabel>
              <Select
                name="duration"
                value={formik.values.duration}
                onChange={formik.handleChange}
                label="Duration"
                error={formik.touched.duration && Boolean(formik.errors.duration)}
              >
                {durationOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Date Prescribed"
              value={formik.values.datePrescribed}
              onChange={(date) => formik.setFieldValue('datePrescribed', date)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  error={formik.touched.datePrescribed && Boolean(formik.errors.datePrescribed)}
                  helperText={formik.touched.datePrescribed && formik.errors.datePrescribed}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Instructions"
              name="instructions"
              value={formik.values.instructions}
              onChange={formik.handleChange}
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              {initialValues ? 'Update Prescription' : 'Create Prescription'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default PrescriptionForm;