import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { addPatient } from '../../redux/slices/patientSlice';
import patientAPI from '../../api/patientAPI';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { pushNotification } from '../../redux/slices/notificationSlice';
import { NOTIFICATION_TYPES, NOTIFICATION_ENTITIES } from '../../config/constants';

const PatientRegistration = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    country: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    hasInsurance: false,
    insuranceProvider: '',
    insurancePolicyNumber: '',
    bloodType: 'Unknown',
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const validatePhone = (phone) => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  };

  const validateDateOfBirth = (dob) => {
    if (!dob) return false;
    const dobDate = new Date(dob);
    const today = new Date();
    return !isNaN(dobDate.getTime()) && dobDate < today;
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required to register the patient';
    } else if (formData.fullName.trim().split(' ').length < 2) {
      newErrors.fullName = 'Please enter both first and last names';
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required for patient communication';
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be at least 10 digits long';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required for medical records';
    } else if (!validateDateOfBirth(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Date of birth must be a valid past date';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender information is required for medical purposes';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required for patient records';
    }

    const emergencyFieldsFilled = 
      formData.emergencyContactName || 
      formData.emergencyContactPhone || 
      formData.emergencyContactRelationship;
      
    if (emergencyFieldsFilled) {
      if (!formData.emergencyContactName.trim()) {
        newErrors.emergencyContactName = 'Emergency contact name is required when providing emergency information';
      }
      if (!formData.emergencyContactPhone) {
        newErrors.emergencyContactPhone = 'Emergency contact phone is required when providing emergency information';
      } else if (!validatePhone(formData.emergencyContactPhone)) {
        newErrors.emergencyContactPhone = 'Emergency phone must be at least 10 digits';
      }
      if (!formData.emergencyContactRelationship.trim()) {
        newErrors.emergencyContactRelationship = 'Please specify relationship to patient';
      }
    }
    
    if (formData.hasInsurance) {
      if (!formData.insuranceProvider.trim()) {
        newErrors.insuranceProvider = 'Insurance provider name is required when insurance is selected';
      }
      if (!formData.insurancePolicyNumber.trim()) {
        newErrors.insurancePolicyNumber = 'Policy number is required when insurance is selected';
      } else if (!/^[a-zA-Z0-9\-]+$/.test(formData.insurancePolicyNumber)) {
        newErrors.insurancePolicyNumber = 'Policy number can only contain letters, numbers and hyphens';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError('Please correct the highlighted errors to complete registration');
      
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        element.focus();
      }
      return;
    }

    try {
      const patientData = {
        firstName: formData.fullName.split(' ')[0],
        lastName: formData.fullName.split(' ').slice(1).join(' '),
        phone: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        emergencyContact: (formData.emergencyContactName || formData.emergencyContactPhone || formData.emergencyContactRelationship) ? {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship
        } : undefined,
        insurance: formData.hasInsurance ? {
          provider: formData.insuranceProvider,
          policyNumber: formData.insurancePolicyNumber
        } : undefined,
        bloodType: formData.bloodType,
        paymentStatus: 'pending',
      };

      const response = await patientAPI.createPatient(patientData);
      
      if (response.data?.patient?._id) {
        dispatch(pushNotification({
          recipient: 'all-receptionists',
          recipientModel: 'Receptionist',
          sender: user._id,
          senderModel: 'Receptionist',
          type: NOTIFICATION_TYPES.PATIENT_CHECKIN,
          message: `New patient registered: ${formData.fullName}`,
          relatedEntity: NOTIFICATION_ENTITIES.PATIENT,
          relatedEntityId: response.data.patient._id,
          createdAt: new Date().toISOString()
        }));

        navigate(`/registration/payment/${response.data.patient._id}`, {
          state: { patient: response.data.patient }
        });
      } else {
        throw new Error('Patient created but no ID returned');
      }
    } catch (err) {
      if (err.response?.data?.message?.includes('phone number already exists')) {
        setErrors(prev => ({
          ...prev,
          phoneNumber: 'This phone number is already registered to another patient. Please verify or use a different number.'
        }));
        setSubmitError('Registration failed: Phone number already in use');
        
        const phoneInput = document.querySelector('[name="phoneNumber"]');
        if (phoneInput) {
          phoneInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          phoneInput.focus();
        }
      } 
      else if (err.response?.data?.errors) {
        const apiErrors = {};
        err.response.data.errors.forEach(error => {
          const fieldMap = {
            'phone': 'phoneNumber',
            'emergencyContact.phone': 'emergencyContactPhone',
            'insurance.provider': 'insuranceProvider',
            'insurance.policyNumber': 'insurancePolicyNumber'
          };
          
          const fieldName = fieldMap[error.path] || error.path;
          apiErrors[fieldName] = error.message;
        });
        setErrors(apiErrors);
        setSubmitError('Server validation failed. Please correct the highlighted errors.');
      } 
      else {
        setSubmitError('Registration failed. One possible issue is that the phone number you entered is already in use. Please check your information and try again. If the problem persists, contact support.');
      }
    }
  };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phoneNumber: value });
    if (errors.phoneNumber) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phoneNumber;
        return newErrors;
      });
    }
  };

  const handleEmergencyPhoneChange = (value) => {
    setFormData({ ...formData, emergencyContactPhone: value });
    if (errors.emergencyContactPhone) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.emergencyContactPhone;
        return newErrors;
      });
    }
  };


  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Patient Registration
      </Typography>
      <Paper sx={{ p: 3 }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}
        {registrationSuccess && (
  <Alert severity="success" sx={{ mb: 3 }}>
    {registrationSuccess.message}
    <br />
    <strong>Card Number: {registrationSuccess.cardNumber}</strong>
  </Alert>
)}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
             <TextField
  fullWidth
  label="Full Name"
  name="fullName"
  value={formData.fullName}
  onChange={handleChange}
  error={!!errors.fullName}
   helperText={errors.fullName || "Format: Firstname Lastname (both required)"}
  InputLabelProps={{
    required: true
  }}
/>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.phoneNumber}>
                <PhoneInput
                  country={'us'}
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  inputProps={{
                    name: 'phoneNumber',
                    required: true,
                  }}
                  containerStyle={{ width: '100%' }}
                  inputStyle={{ 
                    width: '100%', 
                    height: '56px',
                    borderColor: errors.phoneNumber ? '#f44336' : undefined
                  }}
                />
                {errors.phoneNumber && (
                  <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {errors.phoneNumber}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.dateOfBirth}
                onChange={handleChange}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                required
                inputProps={{
                  max: new Date().toISOString().split('T')[0] // Prevent future dates
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.gender}>
  <InputLabel required>Gender</InputLabel>
  <Select
    name="gender"
    value={formData.gender}
    onChange={handleChange}
    label="Gender *"
  >
    <MenuItem value="">Select Gender</MenuItem>
    <MenuItem value="male">Male</MenuItem>
    <MenuItem value="female">Female</MenuItem>
    <MenuItem value="other">Other</MenuItem>
  </Select>
  {errors.gender && (
    <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
      {errors.gender}
    </Typography>
  )}
</FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
  <FormControl fullWidth>
    <InputLabel>Blood Type</InputLabel>
    <Select
      name="bloodType"
      value={formData.bloodType}
      onChange={handleChange}
      label="Blood Type"
    >
      <MenuItem value="A+">A+</MenuItem>
      <MenuItem value="A-">A-</MenuItem>
      <MenuItem value="B+">B+</MenuItem>
      <MenuItem value="B-">B-</MenuItem>
      <MenuItem value="AB+">AB+</MenuItem>
      <MenuItem value="AB-">AB-</MenuItem>
      <MenuItem value="O+">O+</MenuItem>
      <MenuItem value="O-">O-</MenuItem>
      <MenuItem value="Unknown">Unknown</MenuItem>
    </Select>
  </FormControl>
</Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={!!errors.city}
                helperText={errors.city}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
              
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                error={!!errors.country}
                helperText={errors.country}
                required
              />
            </Grid>
            
            {/* Emergency Contact */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Emergency Contact
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact Name"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                error={!!errors.emergencyContactName}
                helperText={errors.emergencyContactName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.emergencyContactPhone}>
                <PhoneInput
                  country={'us'}
                  value={formData.emergencyContactPhone}
                  onChange={handleEmergencyPhoneChange}
                  inputProps={{
                    name: 'emergencyContactPhone',
                  }}
                  containerStyle={{ width: '100%' }}
                  inputStyle={{ 
                    width: '100%', 
                    height: '56px',
                    borderColor: errors.emergencyContactPhone ? '#f44336' : undefined
                  }}
                />
                {errors.emergencyContactPhone && (
                  <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {errors.emergencyContactPhone}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Relationship"
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleChange}
                error={!!errors.emergencyContactRelationship}
                helperText={errors.emergencyContactRelationship}
              />
            </Grid>
            
            {/* Insurance */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Insurance Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.hasInsurance}
                    onChange={handleChange}
                    name="hasInsurance"
                  />
                }
                label="Has Insurance"
              />
            </Grid>
            
            {formData.hasInsurance && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Insurance Provider"
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleChange}
                    error={!!errors.insuranceProvider}
                    helperText={errors.insuranceProvider}
                    required={formData.hasInsurance}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Policy Number"
                    name="insurancePolicyNumber"
                    value={formData.insurancePolicyNumber}
                    onChange={handleChange}
                    error={!!errors.insurancePolicyNumber}
                    helperText={errors.insurancePolicyNumber}
                    required={formData.hasInsurance}
                  />
                </Grid>
              </>
            )}
            
            {/* Form Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate('/receptionist/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                >
                  Save Patient
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default PatientRegistration;






