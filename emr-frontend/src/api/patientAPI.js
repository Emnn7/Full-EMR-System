import instance from './axios';

const API_URL = '/patients';

const createPatient = async (patientData) => {
  try {
    const response = await instance.post(API_URL, patientData);
    return response.data.patient || response.data; // Ensure we get the patient object
  } catch (error) {
    throw error;
  }
};

const getPatientByPhone = async (phone) => {
  try {
    const response = await instance.get(`${API_URL}/search`, {
      params: { phone }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updatePatient = async (patientId, patientData) => {
  try {
    const response = await instance.patch(`${API_URL}/${patientId}`, patientData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllPatients = async (params = {}) => {
  try {
    const response = await instance.get(API_URL, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};
const getPatientForVitals = async (patientId) => {
  const response = await instance.get(`/patients/${patientId}/for-vitals`);
  return response.data.data;
};



const getPatient = async (patientId) => {
  try {
    const response = await instance.get(`${API_URL}/${patientId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const searchPatients = async (searchTerm) => {
  try {
    const response = await instance.get(`${API_URL}/search`, {
      params: { searchTerm } // Changed from 'phone' to 'searchTerm'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const patientAPI = {
  createPatient,
  getPatientByPhone,
  updatePatient,
  getAllPatients,
  getPatient,
  searchPatients,
  getPatientForVitals,
};

export default patientAPI;