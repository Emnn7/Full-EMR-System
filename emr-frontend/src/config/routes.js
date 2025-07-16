export const ROUTES = {
    // Auth
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
  
    // Admin
    ADMIN_DASHBOARD: '/admin',
    USER_MANAGEMENT: '/admin/users',
    SYSTEM_SETTINGS: '/admin/settings',
  
    // Receptionist
    RECEPTIONIST_DASHBOARD: '/receptionist',
    PATIENT_REGISTRATION: '/receptionist/register',
    APPOINTMENT_MANAGEMENT: '/receptionist/appointments',
  
    // Doctor
    DOCTOR_DASHBOARD: '/doctor',
    PATIENT_MANAGEMENT: '/doctor/patients',
    PRESCRIPTIONS: '/doctor/prescriptions',
    LAB_RESULTS: '/doctor/lab-results',
  
    // Lab
    LAB_DASHBOARD: '/lab',
    VITAL_SIGNS: '/lab/vital-signs',
    LAB_TESTS: '/lab/tests',
  
    // Shared
    PATIENT_PROFILE: '/patient/:id',
    MEDICAL_REPORT: '/report/:id',
    SETTINGS: '/settings',
  };