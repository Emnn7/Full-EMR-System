import { useState, useCallback } from 'react';
import axios from '../config/axios';

export default function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const request = useCallback(async (config) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios(config);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data || { message: 'An error occurred' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, data, loading, error };
}