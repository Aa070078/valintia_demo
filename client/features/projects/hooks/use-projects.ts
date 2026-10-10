import { useAuth } from "@/features/auth/context/auth-context"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { projectsApi } from "../api/projects.api"
import type { CreateProjectDto, UpdateProjectDto } from "../types"

export const PROJECT_KEYS = {
  all: ["projects"] as const,
  lists: () => [...PROJECT_KEYS.all, "list"] as const,
  detail: (id: string) => [...PROJECT_KEYS.all, "detail", id] as const,
}

export function useProjects() {
  const { user, isAuthenticated } = useAuth()
  return useQuery({
    queryKey: [...PROJECT_KEYS.lists(), user?.id],
    enabled: isAuthenticated,
    queryFn: () => projectsApi.getProjects(),
  })
}

export function useProject(id: string) {
  const { user, isAuthenticated } = useAuth()
  return useQuery({
    queryKey: [...PROJECT_KEYS.detail(id), user?.id],
    queryFn: () => projectsApi.getProjectById(id),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useCreateProject() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateProjectDto) => projectsApi.createProject(dto),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() })
      queryClient.setQueryData(
        [...PROJECT_KEYS.detail(newProject.id), user?.id],
        newProject
      )
    },
  })
}

export function useUpdateProject(id: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: UpdateProjectDto) => projectsApi.updateProject(id, dto),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() })
      queryClient.setQueryData([...PROJECT_KEYS.detail(id), user?.id], updated)
    },
  })
}

export function useSubmitProject(id: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => projectsApi.submitProject(id),
    onSuccess: (submitted) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() })
      queryClient.setQueryData(
        [...PROJECT_KEYS.detail(id), user?.id],
        submitted
      )
    },
  })
}
