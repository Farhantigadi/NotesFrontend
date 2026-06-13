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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUESTIONS_QUERY_KEY] });
    },
  });
};

export const useUpdateQuestion = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => questionsApi.updateQuestion(id, data),
    onSuccess: (updatedQuestion) => {
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
