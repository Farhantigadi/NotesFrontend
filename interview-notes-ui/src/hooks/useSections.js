import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectionsApi } from '../api/sections';

const SECTIONS_QUERY_KEY = 'sections';

export const useSections = () => {
  return useQuery({
    queryKey: [SECTIONS_QUERY_KEY],
    queryFn: () => sectionsApi.getAllSections(),
  });
};

export const useSection = (id) => {
  return useQuery({
    queryKey: [SECTIONS_QUERY_KEY, id],
    queryFn: () => sectionsApi.getSectionById(id),
    enabled: !!id,
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => sectionsApi.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SECTIONS_QUERY_KEY] });
    },
  });
};

export const useUpdateSection = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => sectionsApi.updateSection(id, data),
    onSuccess: (updatedSection) => {
      queryClient.setQueryData([SECTIONS_QUERY_KEY, id], updatedSection);
      queryClient.invalidateQueries({ queryKey: [SECTIONS_QUERY_KEY] });
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => sectionsApi.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SECTIONS_QUERY_KEY] });
    },
  });
};
