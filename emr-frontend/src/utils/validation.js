import * as yup from 'yup';

export const patientValidationSchema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  phoneNumber: yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  email: yup.string().email('Invalid email'),
  dateOfBirth: yup.date().required('Date of birth is required'),
  gender: yup.string().required('Gender is required'),
  address: yup.string(),
  emergencyContactName: yup.string(),
  emergencyContactPhone: yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  hasInsurance: yup.boolean(),
  insuranceDetails: yup.string().when('hasInsurance', {
    is: true,
    then: yup.string().required('Insurance details are required'),
  }),
});

export const appointmentValidationSchema = yup.object().shape({
  patientId: yup.string().required('Patient is required'),
  doctorId: yup.string().required('Doctor is required'),
  appointmentDate: yup.date().required('Appointment date is required'),
  reason: yup.string().required('Reason is required'),
  status: yup.string().required('Status is required'),
});

export const prescriptionValidationSchema = yup.object().shape({
  medicationName: yup.string().required('Medication name is required'),
  dosage: yup.string().required('Dosage is required'),
  frequency: yup.string().required('Frequency is required'),
  duration: yup.string().required('Duration is required'),
  instructions: yup.string(),
});