import axiosInstance from './axios';

export const questionsApi = {
  getAllQuestions: async () => {
    return axiosInstance.get('/api/questions');
  },
  getQuestionById: async (id) => {
    console.log('[QUESTION FETCH] Requesting: GET /api/questions/' + id);
    const response = await axiosInstance.get(`/api/questions/${id}`);
    console.log('[QUESTION FETCH] Response (after interceptor):', response);
    console.log('[QUESTION FETCH] Fields → title:', response?.title, '| answer:', response?.answer, '| codeSnippet:', response?.codeSnippet, '| explanation:', response?.explanation);
    return response;
  },
  getQuestionsBySubSection: async (subSectionId) => {
    console.log('[QUESTION FETCH] Requesting: GET /api/questions/subsection/' + subSectionId);
    const response = await axiosInstance.get(`/api/questions/subsection/${subSectionId}`);
    console.log('[QUESTION FETCH] SubSection list response (after interceptor):', response);
    return response;
  },
  createQuestion: async (data) => {
    console.log('[QUESTION API] POST /api/questions');
    console.log('[QUESTION API] Request Body:', data);
    const response = await axiosInstance.post('/api/questions', data);
    console.log('[QUESTION API] Response Data (after interceptor):', response);
    return response;
  },
  updateQuestion: async (id, data) => {
    return axiosInstance.put(`/api/questions/${id}`, data);
  },
  reorderQuestions: async (updates) => {
    // updates = [{ id, title, subSectionId, displayOrder }, ...]
    return Promise.all(updates.map(({ id, title, subSectionId, displayOrder }) =>
      axiosInstance.put(`/api/questions/${id}`, { title, subSectionId, displayOrder })
    ));
  },
  deleteQuestion: async (id) => {
    return axiosInstance.delete(`/api/questions/${id}`);
  },
};
