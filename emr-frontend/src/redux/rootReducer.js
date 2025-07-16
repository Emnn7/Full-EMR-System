import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import patientReducer from './slices/patientSlice';
import appointmentReducer from './slices/appointmentSlice';
import prescriptionReducer from './slices/prescriptionSlice';
import labOrderReducer from './slices/labOrderSlice';
import labReportReducer from './slices/labReportSlice';
import medicalHistoryReducer from './slices/medicalHistorySlice';
import billingReducer from './slices/billingSlice';
import doctorReducer from './slices/doctorSlice';
import adminReducer from './slices/adminSlice';
import auditReducer from './slices/auditSlice';
import medicalReportReducer from './slices/medicalReportSlice';
import reportReducer from './slices/reportSlice';
import settingReducer from './slices/settingSlice';
import patientAssignmentReducer from './slices/patientAssignmentSlice';
import rolePermissionReducer from './slices/rolePermissionSlice';
import consultationReducer from './slices/consultationSlice';
import paymentReducer from './slices/paymentSlice';
import notificationReducer from './slices/notificationSlice';
import vitalSignsReducer from './slices/vitalSignsSlice';
import labTestReducer from './slices/labTestSlice';
import labTestCatalogReducer from './slices/labTestCatalogSlice';
import procedureCodeReducer from './slices/procedureCodeSlice';
import patientProcedureReducer from './slices/patientProcedureSlice';
import diagnosticReducer from './slices/diagnosticSlice';
import labPaymentReducer from './slices/labPaymentSlice';


const rootReducer = combineReducers({
  auth: authReducer,
  patient: patientReducer,
  appointment: appointmentReducer,
  prescription: prescriptionReducer,
  labOrder: labOrderReducer,
  labReport: labReportReducer,
  medicalHistory: medicalHistoryReducer,
  doctor: doctorReducer,
  billing: billingReducer,
  admin: adminReducer,
  auditLogs: auditReducer,
  medicalReport: medicalReportReducer,
  report: reportReducer,
  settings: settingReducer,
  patientAssignment: patientAssignmentReducer,
  rolePermission: rolePermissionReducer,
  consultation: consultationReducer,
  payment: paymentReducer,
  notification: notificationReducer,
  vitalSigns: vitalSignsReducer,
  labTest: labTestReducer,
  labTestCatalog: labTestCatalogReducer,
  procedureCode: procedureCodeReducer,
  patientProcedure: patientProcedureReducer,
   diagnostic: diagnosticReducer,
   labPayment: labPaymentReducer


});

export default rootReducer;