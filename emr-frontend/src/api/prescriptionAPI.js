import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL + '/prescriptions';

const createPrescription = async (prescriptionData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(API_URL, prescriptionData, config);
  return response.data;
};

const getPrescription = async (prescriptionId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/${prescriptionId}`, config);
  return response.data;
};

const updatePrescription = async (prescriptionId, prescriptionData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`${API_URL}/${prescriptionId}`, prescriptionData, config);
  return response.data;
};

const deletePrescription = async (prescriptionId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(`${API_URL}/${prescriptionId}`, config);
  return response.data;
};

const getPatientPrescriptions = async (patientId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/patient/${patientId}`, config);
  return response.data;
};

const prescriptionAPI = {
  createPrescription,
  getPrescription,
  updatePrescription,
  deletePrescription,
  getPatientPrescriptions,
};

export default prescriptionAPI;