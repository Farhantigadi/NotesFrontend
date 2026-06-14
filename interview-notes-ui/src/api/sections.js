import axiosInstance from './axios';

export const sectionsApi = {
  getAllSections: async () => {
    return axiosInstance.get('/api/sections');
  },
  getSectionById: async (id) => {
    return axiosInstance.get(`/api/sections/${id}`);
  },
  createSection: async (data) => {
    console.log('[SECTION] Calling POST /api/sections');
    console.log('[SECTION] Payload:', data);
    const response = axiosInstance.post('/api/sections', data);
    return response;
  },
  updateSection: async (id, data) => {
    return axiosInstance.put(`/api/sections/${id}`, data);
  },
  deleteSection: async (id) => {
    return axiosInstance.delete(`/api/sections/${id}`);
  },
};
