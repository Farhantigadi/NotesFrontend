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
    mutationFn: (data) => {
      console.log('[SECTION] Starting create mutation');
      return sectionsApi.createSection(data);
    },
    onSuccess: (response) => {
      console.log('[SECTION] API Success:', response);
      console.log('[SECTION] Invalidating sections query');
      queryClient.invalidateQueries({ queryKey: [SECTIONS_QUERY_KEY] });
      console.log('[SECTION] Refetching sections');
    },
    onError: (error) => {
      console.error('[SECTION] API Error:', error);
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => sectionsApi.updateSection(id, data),
    onSuccess: (updatedSection, { id }) => {
      queryClient.setQueryData([SECTIONS_QUERY_KEY, id], updatedSection);
      queryClient.invalidateQueries({ queryKey: [SECTIONS_QUERY_KEY] });
    },
  });
};

export const useReorderSections = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates) => sectionsApi.reorderSections(updates),
    onSuccess: () => {
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
