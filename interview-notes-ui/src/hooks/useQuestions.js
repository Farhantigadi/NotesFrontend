import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsApi } from '../api/questions';

const QUESTIONS_QUERY_KEY = 'questions';

export const useQuestions = () => {
  return useQuery({
    queryKey: [QUESTIONS_QUERY_KEY],
    queryFn: () => questionsApi.getAllQuestions(),
  });
};

export const useQuestion = (id) => {
  return useQuery({
    queryKey: [QUESTIONS_QUERY_KEY, id],
    queryFn: () => questionsApi.getQuestionById(id),
    enabled: !!id,
  });
};

export const useQuestionsBySubSection = (subSectionId) => {
  return useQuery({
    queryKey: [QUESTIONS_QUERY_KEY, 'subsection', subSectionId],
    queryFn: () => questionsApi.getQuestionsBySubSection(subSectionId),
    enabled: !!subSectionId,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => questionsApi.createQuestion(data),
    onSuccess: (data) => {
      console.log('[QUESTION] Mutation Success — created question:', data);
      console.log('[QUESTION] Saved Fields → title:', data?.title, '| answer:', data?.answer, '| codeSnippet:', data?.codeSnippet, '| explanation:', data?.explanation);
      queryClient.invalidateQueries({ queryKey: [QUESTIONS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('[QUESTION] Mutation Error:', error);
    },
  });
};

export const useReorderQuestions = (subSectionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates) => questionsApi.reorderQuestions(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUESTIONS_QUERY_KEY, 'subsection', subSectionId] });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => questionsApi.updateQuestion(id, data),
    onSuccess: (updatedQuestion, { id }) => {
      queryClient.setQueryData([QUESTIONS_QUERY_KEY, id], updatedQuestion);
      queryClient.invalidateQueries({ queryKey: [QUESTIONS_QUERY_KEY] });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => questionsApi.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUESTIONS_QUERY_KEY] });
    },
  });
};
