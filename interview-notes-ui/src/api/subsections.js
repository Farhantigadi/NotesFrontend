import axiosInstance from './axios';

export const subSectionsApi = {
  getAllSubSections: async () => {
    return axiosInstance.get('/api/subsections');
  },
  getSubSectionById: async (id) => {
    return axiosInstance.get(`/api/subsections/${id}`);
  },
  getSubSectionsBySection: async (sectionId) => {
    return axiosInstance.get(`/api/subsections/section/${sectionId}`);
  },
  createSubSection: async (data) => {
    return axiosInstance.post('/api/subsections', data);
  },
  updateSubSection: async (id, data) => {
    return axiosInstance.put(`/api/subsections/${id}`, data);
  },
  reorderSubSections: async (updates) => {
    return Promise.all(updates.map(({ id, title, mainSectionId, displayOrder }) =>
      axiosInstance.put(`/api/subsections/${id}`, { title, mainSectionId, displayOrder })
    ));
  },
};
