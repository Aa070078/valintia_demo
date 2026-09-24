import { apiClient } from "@/lib/api/client";
import type { Project, CreateProjectDto, UpdateProjectDto } from "../types";

const STORAGE_KEY = "valentia_projects_cache";

const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    title: "Palm Hills Modern Villa",
    propertyType: "villa",
    areaSqm: 450,
    city: "6th of October",
    compound: "Palm Hills Golf Views",
    status: "draft",
    coverImage:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    spaces: [
      { id: "living", name: "Living Room", included: true, count: 1 },
      { id: "dining", name: "Dining Room", included: true, count: 1 },
      { id: "kitchen", name: "Kitchen", included: true, count: 1 },
      { id: "master_bedroom", name: "Master Bedroom", included: true, count: 1 },
      { id: "bedroom", name: "Bedrooms", included: true, count: 3 },
      { id: "bathrooms", name: "Bathrooms", included: true, count: 4 },
      { id: "terrace", name: "Terrace & Pool Deck", included: true, count: 1 },
    ],
    notes:
      "Warm minimalist design with natural travertine, solid oak accents, and panoramic garden views.",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "proj-2",
    title: "New Giza Duplex Residence",
    propertyType: "duplex",
    areaSqm: 280,
    city: "Sheikh Zayed",
    compound: "New Giza",
    status: "under_engineer_review",
    coverImage:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    spaces: [
      { id: "living", name: "Living Room", included: true, count: 1 },
      { id: "kitchen", name: "Kitchen", included: true, count: 1 },
      { id: "master_bedroom", name: "Master Bedroom", included: true, count: 1 },
      { id: "bathrooms", name: "Bathrooms", included: true, count: 3 },
    ],
    notes: "Double-height living room fit-out with acoustic wooden wall cladding.",
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

function getLocalProjects(): Project[] {
  if (typeof window === "undefined") return INITIAL_PROJECTS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
    return INITIAL_PROJECTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_PROJECTS;
  }
}

function saveLocalProjects(projects: Project[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }
}

export const projectsApi = {
  async getProjects(): Promise<Project[]> {
    try {
      const response = await apiClient.get<Project[]>("/projects");
      return response.data;
    } catch {
      // Fallback for development when backend is not yet populated
      return getLocalProjects();
    }
  },

  async getProjectById(id: string): Promise<Project> {
    try {
      const response = await apiClient.get<Project>(`/projects/${id}`);
      return response.data;
    } catch {
      const projects = getLocalProjects();
      const found = projects.find((p) => p.id === id);
      if (!found) {
        throw new Error("Project not found");
      }
      return found;
    }
  },

  async createProject(dto: CreateProjectDto): Promise<Project> {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      ...dto,
      status: "draft",
      coverImage:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await apiClient.post<Project>("/projects", dto);
      return response.data;
    } catch {
      const projects = getLocalProjects();
      const updated = [newProject, ...projects];
      saveLocalProjects(updated);
      return newProject;
    }
  },

  async updateProject(id: string, dto: UpdateProjectDto): Promise<Project> {
    try {
      const response = await apiClient.patch<Project>(`/projects/${id}`, dto);
      return response.data;
    } catch {
      const projects = getLocalProjects();
      const index = projects.findIndex((p) => p.id === id);
      if (index === -1) throw new Error("Project not found");

      const updatedProject: Project = {
        ...projects[index],
        ...dto,
        updatedAt: new Date().toISOString(),
      };
      projects[index] = updatedProject;
      saveLocalProjects(projects);
      return updatedProject;
    }
  },

  async submitProject(id: string): Promise<Project> {
    try {
      const response = await apiClient.post<Project>(`/projects/${id}/submit`);
      return response.data;
    } catch {
      const projects = getLocalProjects();
      const index = projects.findIndex((p) => p.id === id);
      if (index === -1) throw new Error("Project not found");

      projects[index].status = "under_engineer_review";
      projects[index].updatedAt = new Date().toISOString();
      saveLocalProjects(projects);
      return projects[index];
    }
  },
};
