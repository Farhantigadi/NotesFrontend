import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subSectionsApi } from '../api/subsections';

const SUBSECTIONS_QUERY_KEY = 'subsections';

export const useSubSections = () => {
  return useQuery({
    queryKey: [SUBSECTIONS_QUERY_KEY],
    queryFn: () => subSectionsApi.getAllSubSections(),
  });
};

export const useSubSection = (id) => {
  return useQuery({
    queryKey: [SUBSECTIONS_QUERY_KEY, id],
    queryFn: () => subSectionsApi.getSubSectionById(id),
    enabled: !!id,
  });
};

export const useSubSectionsBySection = (sectionId) => {
  return useQuery({
    queryKey: [SUBSECTIONS_QUERY_KEY, 'section', sectionId],
    queryFn: () => subSectionsApi.getSubSectionsBySection(sectionId),
    enabled: !!sectionId,
  });
};

export const useCreateSubSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => subSectionsApi.createSubSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSECTIONS_QUERY_KEY] });
    },
  });
};

export const useUpdateSubSection = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => subSectionsApi.updateSubSection(id, data),
    onSuccess: (updatedSubSection) => {
      queryClient.setQueryData([SUBSECTIONS_QUERY_KEY, id], updatedSubSection);
      queryClient.invalidateQueries({ queryKey: [SUBSECTIONS_QUERY_KEY] });
    },
  });
};

export const useReorderSubSections = (sectionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates) => subSectionsApi.reorderSubSections(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSECTIONS_QUERY_KEY, 'section', sectionId] });
    },
  });
};

export const useDeleteSubSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => subSectionsApi.deleteSubSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSECTIONS_QUERY_KEY] });
    },
  });
};
