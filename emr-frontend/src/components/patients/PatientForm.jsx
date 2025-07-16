import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, Container, Paper, Typography, Grid,
  TextField, MenuItem, CircularProgress
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { 
  fetchPatientById, 
  createPatient, 
  updatePatient 
} from '../../redux/slices/patientSlice';
import * as yup from 'yup';
import { useFormik } from 'formik';

const validationSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  dob: yup.date().required('Date of birth is required'),
  gender: yup.string().required('Gender is required'),
  bloodType: yup.string(),
  allergies: yup.array().of(yup.string()),
  address: yup.string().required('Address is required'),
  country: yup.string().required('Country is required'),
  city: yup.string().required('City is required'),
  emergencyContact: yup.object({
    name: yup.string().required('Emergency contact name is required'),
    phone: yup.string().required('Emergency contact phone is required')
  })
});


const PatientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentPatient: patient, loading, saving } = useSelector((state) => state.patient);
  const isEdit = Boolean(id);

  const formik = useFormik({
   initialValues: {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  bloodType: '',
  allergies: [],
  address: '',
  country: '',
  city: '',
  emergencyContact: {
    name: '',
    phone: ''
  }
},

    validationSchema: validationSchema,
    onSubmit: (values) => {
       console.log("Submitting form with values:", values);
      if (isEdit) {
        dispatch(updatePatient({ id, ...values }))
          .then(() => navigate(`/patients/${id}`));
      } else {
        dispatch(createPatient(values))
          .then(() => navigate('/patients'));
      }
    },
  });

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchPatientById(id));
    }
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && patient) {
      formik.setValues({
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        dob: patient.dob?.split('T')[0], // Format date for input
        gender: patient.gender,
        bloodType: patient.bloodType,
        allergies: patient.allergies || [],
        address: patient.address
      });
    }
  }, [patient, isEdit]);

  if (isEdit && loading) {
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
          onClick={() => navigate(isEdit ? `/patients/${id}` : '/patients')}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">
          {isEdit ? 'Edit Patient' : 'Add New Patient'}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
  fullWidth
  id="dateOfBirth"
  name="dateOfBirth"
  label="Date of Birth"
  type="date"
  InputLabelProps={{ shrink: true }}
  value={formik.values.dateOfBirth}
  onChange={formik.handleChange}
  error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
  helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
/>

            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                id="gender"
                name="gender"
                label="Gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                error={formik.touched.gender && Boolean(formik.errors.gender)}
                helperText={formik.touched.gender && formik.errors.gender}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                id="bloodType"
                name="bloodType"
                label="Blood Type"
                value={formik.values.bloodType}
                onChange={formik.handleChange}
              >
                <MenuItem value="">Not Specified</MenuItem>
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="B-">B-</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="allergies"
                name="allergies"
                label="Allergies (comma separated)"
                value={formik.values.allergies.join(', ')}
                onChange={(e) => {
                  const allergies = e.target.value.split(',').map(item => item.trim());
                  formik.setFieldValue('allergies', allergies);
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="address"
                name="address"
                label="Address"
                multiline
                rows={3}
                value={formik.values.address}
                onChange={formik.handleChange}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
              />
            </Grid>
            <Grid item xs={12} md={6}>
  <TextField
    fullWidth
    id="country"
    name="country"
    label="Country"
    value={formik.values.country}
    onChange={formik.handleChange}
    error={formik.touched.country && Boolean(formik.errors.country)}
    helperText={formik.touched.country && formik.errors.country}
  />
</Grid>

<Grid item xs={12} md={6}>
  <TextField
    fullWidth
    id="city"
    name="city"
    label="City"
    value={formik.values.city}
    onChange={formik.handleChange}
    error={formik.touched.city && Boolean(formik.errors.city)}
    helperText={formik.touched.city && formik.errors.city}
  />
</Grid>

<Grid item xs={12} md={6}>
  <TextField
    fullWidth
    id="emergencyContact.name"
    name="emergencyContact.name"
    label="Emergency Contact Name"
    value={formik.values.emergencyContact.name}
    onChange={formik.handleChange}
    error={
      formik.touched.emergencyContact?.name &&
      Boolean(formik.errors.emergencyContact?.name)
    }
    helperText={
      formik.touched.emergencyContact?.name &&
      formik.errors.emergencyContact?.name
    }
  />
</Grid>

<Grid item xs={12} md={6}>
  <TextField
    fullWidth
    id="emergencyContact.phone"
    name="emergencyContact.phone"
    label="Emergency Contact Phone"
    value={formik.values.emergencyContact.phone}
    onChange={formik.handleChange}
    error={
      formik.touched.emergencyContact?.phone &&
      Boolean(formik.errors.emergencyContact?.phone)
    }
    helperText={
      formik.touched.emergencyContact?.phone &&
      formik.errors.emergencyContact?.phone
    }
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
                {saving ? <CircularProgress size={24} /> : 'Save Patient'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default PatientForm;