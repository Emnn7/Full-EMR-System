import axios from 'axios';
import { API_URL } from '../config';

export const fetchLabOrders = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/lab-orders`, { params: filters });
  return response.data;
};

export const fetchPatientLabOrders = async (patientId) => {
  const response = await axios.get(`${API_URL}/lab-orders/patient/${patientId}`);
  return response.data;
};

export const createLabOrder = async (labOrderData) => {
  const response = await axios.post(`${API_URL}/lab-orders`, labOrderData);
  return response.data;
};

export const updateLabOrder = async (id, labOrderData) => {
  const response = await axios.patch(`${API_URL}/lab-orders/${id}`, labOrderData);
  return response.data;
};

export const updateLabTestStatus = async (orderId, testIndex, status) => {
  const response = await axios.patch(`${API_URL}/lab-orders/${orderId}/tests/${testIndex}`, { status });
  return response.data;
};

export const deleteLabOrder = async (id) => {
  const response = await axios.delete(`${API_URL}/lab-orders/${id}`);
  return response.data;
};