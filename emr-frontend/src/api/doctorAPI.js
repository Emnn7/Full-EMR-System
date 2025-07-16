import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL + '/doctors';

const getAllDoctors = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL, config);
  return response.data;
};

const getDoctor = async (doctorId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/${doctorId}`, config);
  return response.data;
};

const getDoctorPatients = async (doctorId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/${doctorId}/patients`, config);
  return response.data;
};

const doctorAPI = {
  getAllDoctors,
  getDoctor,
  getDoctorPatients,
};

export default doctorAPI;