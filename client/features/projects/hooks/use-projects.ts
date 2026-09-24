import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../api/projects.api";
import type { CreateProjectDto, UpdateProjectDto } from "../types";

export const PROJECT_KEYS = {
  all: ["projects"] as const,
  lists: () => [...PROJECT_KEYS.all, "list"] as const,
  detail: (id: string) => [...PROJECT_KEYS.all, "detail", id] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: PROJECT_KEYS.lists(),
    queryFn: () => projectsApi.getProjects(),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: PROJECT_KEYS.detail(id),
    queryFn: () => projectsApi.getProjectById(id),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateProjectDto) => projectsApi.createProject(dto),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
      queryClient.setQueryData(PROJECT_KEYS.detail(newProject.id), newProject);
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateProjectDto) => projectsApi.updateProject(id, dto),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
      queryClient.setQueryData(PROJECT_KEYS.detail(id), updated);
    },
  });
}

export function useSubmitProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => projectsApi.submitProject(id),
    onSuccess: (submitted) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
      queryClient.setQueryData(PROJECT_KEYS.detail(id), submitted);
    },
  });
}
