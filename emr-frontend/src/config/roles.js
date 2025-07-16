// src/config/roles.js
export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  LAB_ASSISTANT: 'labAssistant',  // Must match backend exactly
  RECEPTIONIST: 'receptionist',
  PATIENT: 'patient'
};

// Optional: Add role hierarchy if needed
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 4,
  [ROLES.DOCTOR]: 3,
  [ROLES.RECEPTIONIST]: 2,
  [ROLES.LAB_ASSISTANT]: 1
};