import axios from 'axios';
import { API_URL } from '../config';

export const fetchLabReports = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/lab-reports`, { params: filters });
  return response.data;
};

export const fetchPatientLabReports = async (patientId) => {
  const response = await axios.get(`${API_URL}/lab-reports/patient/${patientId}`);
  return response.data;
};

export const fetchLabOrderReports = async (orderId) => {
  const response = await axios.get(`${API_URL}/lab-reports/order/${orderId}`);
  return response.data;
};

export const createLabReport = async (labReportData) => {
  const response = await axios.post(`${API_URL}/lab-reports`, labReportData);
  return response.data;
};

export const updateLabReport = async (id, labReportData) => {
  const response = await axios.patch(`${API_URL}/lab-reports/${id}`, labReportData);
  return response.data;
};

export const verifyLabReport = async (id, doctorId) => {
  const response = await axios.patch(`${API_URL}/lab-reports/${id}/verify`, { doctorId });
  return response.data;
};

export const deleteLabReport = async (id) => {
  const response = await axios.delete(`${API_URL}/lab-reports/${id}`);
  return response.data;
};