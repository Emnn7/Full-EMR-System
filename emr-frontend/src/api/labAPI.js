import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL + '/lab';

const createLabOrder = async (orderData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(`${API_URL}/orders`, orderData, config);
  return response.data;
};

const getLabOrders = async (patientId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/orders?patientId=${patientId}`, config);
  return response.data;
};

const createLabReport = async (reportData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(`${API_URL}/reports`, reportData, config);
  return response.data;
};

const getLabReports = async (patientId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/reports?patientId=${patientId}`, config);
  return response.data;
};

const recordVitalSigns = async (patientId, vitalSigns, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(`${API_URL}/vitals/${patientId}`, vitalSigns, config);
  return response.data;
};

const getVitalSigns = async (patientId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/vitals/${patientId}`, config);
  return response.data;
};

const labAPI = {
  createLabOrder,
  getLabOrders,
  createLabReport,
  getLabReports,
  recordVitalSigns,
  getVitalSigns,
};

export default labAPI;