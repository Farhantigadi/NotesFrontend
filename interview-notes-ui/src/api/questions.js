import axiosInstance from './axios';

export const questionsApi = {
  getAllQuestions: async () => {
    return axiosInstance.get('/api/questions');
  },
  getQuestionById: async (id) => {
    return axiosInstance.get(`/api/questions/${id}`);
  },
  getQuestionsBySubSection: async (subSectionId) => {
    return axiosInstance.get(`/api/questions/subsection/${subSectionId}`);
  },
  createQuestion: async (data) => {
    return axiosInstance.post('/api/questions', data);
  },
  updateQuestion: async (id, data) => {
    return axiosInstance.put(`/api/questions/${id}`, data);
  },
  deleteQuestion: async (id) => {
    return axiosInstance.delete(`/api/questions/${id}`);
  },
};
