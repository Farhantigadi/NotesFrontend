import axiosInstance from './axios';

export const authApi = {
  login: async ({ username, password }) => {
    // Bypass the response interceptor unwrapping — we need the raw token
    const response = await axiosInstance.post('/api/auth/login', { username, password });
    // After interceptor, response is already response.data.data = { token, username }
    return response;
  },
};
