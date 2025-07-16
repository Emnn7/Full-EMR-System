import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/lab-tests', // adjust if different
});

const labTestAPI = {
  getAllLabTests: async () => {
    const res = await API.get('/');
    return res.data;
  },
  addLabTest: async (test) => {
    const res = await API.post('/', test);
    return res.data;
  },
};

export default labTestAPI;
