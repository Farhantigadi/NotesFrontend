import axiosInstance from './axios';

export const sectionsApi = {
  getAllSections: async () => {
    return axiosInstance.get('/api/sections');
  },
  getSectionById: async (id) => {
    return axiosInstance.get(`/api/sections/${id}`);
  },
  createSection: async (data) => {
    return axiosInstance.post('/api/sections', data);
  },
  updateSection: async (id, data) => {
    return axiosInstance.put(`/api/sections/${id}`, data);
  },
  deleteSection: async (id) => {
    return axiosInstance.delete(`/api/sections/${id}`);
  },
};
