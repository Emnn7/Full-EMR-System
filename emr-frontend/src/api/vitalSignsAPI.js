// src/api/vitalSignsAPI.js
import axios from 'axios';
import { API_URL } from '../config';

export const fetchVitalSigns = async (params = {}) => {
  const response = await axios.get(`${API_URL}/vital-signs`, { params });
  return response.data;
};

export const recordVitalSigns = async (patientId, vitalData) => {
  const response = await axios.post(`${API_URL}/patients/${patientId}/vital-signs`, vitalData);
  return response.data;
};

export const fetchPatientVitalSigns = async (patientId) => {
  const response = await axios.get(`${API_URL}/patients/${patientId}/vital-signs`);
  return response.data;
};