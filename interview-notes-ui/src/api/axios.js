import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('[AXIOS] Raw response for', response.config.method?.toUpperCase(), response.config.url);
    console.log('[AXIOS] response.data:', JSON.stringify(response.data, null, 2));
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      console.log('[AXIOS] Unwrapped → response.data.data:', response.data.data);
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;
