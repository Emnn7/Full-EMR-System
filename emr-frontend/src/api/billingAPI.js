import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL + '/billing';

const createBilling = async (billingData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(API_URL, billingData, config);
  return response.data;
};

const getBilling = async (billingId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/${billingId}`, config);
  return response.data;
};

const updateBilling = async (billingId, billingData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`${API_URL}/${billingId}`, billingData, config);
  return response.data;
};

const getPatientBillings = async (patientId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/patient/${patientId}`, config);
  return response.data;
};

const billingAPI = {
  createBilling,
  getBilling,
  updateBilling,
  getPatientBillings,
};

export default billingAPI;