import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/lab-tests/catalog',
});

// Add token to headers if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken'); // or sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const labTestCatalogAPI = {
  getAll: async () => {
    const res = await API.get('/');
    return res.data;
  },
  add: async (test) => {
    const res = await API.post('/', test);
    return res.data;
  },
  update: async (id, updatedTest) => {
    const res = await API.put(`/${id}`, updatedTest);
    return res.data;
  },
  delete: async (id) => {
    const res = await API.delete(`/${id}`);
    return res.data;
  }
};

export default labTestCatalogAPI;
