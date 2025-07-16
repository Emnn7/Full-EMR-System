import instance from './axios'; // Your shared axios instance

const API_URL = '/appointments';

const createAppointment = async (appointmentData) => {
  try {
    const response = await instance.post(API_URL, appointmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAppointment = async (appointmentId) => {
  try {
    const response = await instance.get(`${API_URL}/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateAppointment = async (appointmentId, appointmentData) => {
  try {
    const response = await instance.put(`${API_URL}/${appointmentId}`, appointmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const cancelAppointment = async (appointmentId) => {
  try {
    const response = await instance.delete(`${API_URL}/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllAppointments = async (params = {}) => {
  try {
    const response = await instance.get(API_URL, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};
const deleteAppointment = async (id) => {
  // Remove the response.data check since 204 responses have no content
  const response = await instance.delete(`/appointments/${id}`);
  return response; // Return the whole response object
};

const appointmentAPI = {
  createAppointment,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  getAllAppointments,
  deleteAppointment,
};

export default appointmentAPI;
