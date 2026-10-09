import { apiClient } from "@/lib/api/client"
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  SpaceEntity,
} from "../types"

export const projectsApi = {
  async getProjects(): Promise<Project[]> {
    return (await apiClient.get<Project[]>("/projects")).data
  },
  async getProjectById(id: string): Promise<Project> {
    return (await apiClient.get<Project>(`/projects/${id}`)).data
  },
  async createProject(dto: CreateProjectDto): Promise<Project> {
    const sanitizedSpaces = (dto.spaces || []).map(
      (s: SpaceEntity & { type?: string }) => {
        let type = (s.spaceType || s.type || s.id || "living").toLowerCase()
        if (
          type === "living_room" ||
          type === "living-room" ||
          type.includes("living")
        )
          type = "living"
        else if (type.includes("master")) type = "master_bedroom"
        else if (type.includes("bedroom") || type.includes("kids"))
          type = "bedroom"
        else if (type.includes("bath")) type = "bathroom"
        else if (type.includes("kitchen")) type = "kitchen"
        else if (type.includes("dining")) type = "dining"
        else if (type.includes("terrace") || type.includes("balcony"))
          type = "terrace"
        else if (type.includes("office") || type.includes("study"))
          type = "office"
        else if (type.includes("dress")) type = "dressing"
        else if (
          ![
            "living",
            "dining",
            "kitchen",
            "master_bedroom",
            "bedroom",
            "bathroom",
            "terrace",
            "office",
            "dressing",
            "custom",
          ].includes(type)
        ) {
          type = "custom"
        }

        return {
          type,
          customName:
            s.customName ||
            s.name ||
            (s.type ? s.type.replace(/_/g, " ") : "Room"),
        }
      }
    )

    const effectiveStylePreference = dto.stylePreference || {
      mode: "engineer_decides",
    }

    const payload = {
      ...dto,
      stylePreference: effectiveStylePreference,
      spaces: sanitizedSpaces,
    }

    return (await apiClient.post<Project>("/projects", payload)).data
  },
  async updateProject(id: string, dto: UpdateProjectDto): Promise<Project> {
    return (await apiClient.patch<Project>(`/projects/${id}`, dto)).data
  },
  async submitProject(id: string): Promise<Project> {
    return (await apiClient.post<Project>(`/projects/${id}/submit`)).data
  },
}
