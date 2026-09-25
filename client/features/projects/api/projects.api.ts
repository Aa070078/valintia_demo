import { apiClient } from "@/lib/api/client";
import type { Project, CreateProjectDto, UpdateProjectDto } from "../types";

const STORAGE_KEY = "valentia_projects_cache";

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    proposedTitle: "Palm Hills Modern Villa",
    title: "Palm Hills Modern Villa",
    status: "draft",
    property: {
      propertyType: "villa",
      compound: "Palm Hills Golf Views",
      governorate: "Giza",
      city: "6th of October",
      areaSqm: 480,
      floors: 3,
      condition: "semi_finished",
      accessibilityNotes: "Elevator shaft ready, main road access available.",
    },
    spaces: [
      {
        id: "space-living",
        spaceType: "living",
        customName: "Grand Double-Height Living Lounge",
        quantity: 1,
        included: true,
        stylePreference: {
          styleId: "modern",
          styleName: "Warm Minimalist",
          referenceImages: [
            "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
          ],
          notes: "Double-height travertine wall cladding with integrated ambient cove lighting.",
        },
      },
      {
        id: "space-dining",
        spaceType: "dining",
        customName: "Formal Dining Room",
        quantity: 1,
        included: true,
        stylePreference: {
          styleId: "scandinavian",
          styleName: "Scandinavian Luxury",
          referenceImages: [
            "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
          ],
        },
      },
      {
        id: "space-kitchen",
        spaceType: "kitchen",
        customName: "Show & Preparation Kitchens",
        quantity: 1,
        included: true,
      },
      {
        id: "space-master",
        spaceType: "master_bedroom",
        customName: "Master Penthouse Suite",
        quantity: 1,
        included: true,
        stylePreference: {
          styleId: "neo_classic",
          styleName: "Neo Classic",
          referenceImages: [
            "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80",
          ],
        },
      },
      {
        id: "space-terrace",
        spaceType: "terrace",
        customName: "Sunset Pool Deck & Loggia",
        quantity: 2,
        included: true,
      },
    ],
    customerLocation: {
      country: "United Arab Emirates",
      city: "Dubai",
      timezone: "Asia/Dubai (UTC+4)",
    },
    representative: {
      hasRepresentative: true,
      name: "Ahmed Mansour",
      phone: "+20 100 234 5678",
      email: "ahmed.mansour@gmail.com",
      relationship: "Brother",
      authorizationScope: "Site access, sample approvals, and key handover",
      valentiaManagedDirectly: false,
    },
    scope: {
      scopeType: "full_fitout",
      notes: "Turnkey architectural fit-out, MEP modification, and bespoke Italian joinery.",
    },
    budget: {
      budgetType: "range",
      minAmount: 5000000,
      maxAmount: 7000000,
      currency: "EGP",
    },
    timeline: {
      deadlineType: "duration",
      durationDescription: "Within 6 months",
    },
    documents: [
      {
        id: "doc-1",
        name: "Architectural_Floorplans_RevC.pdf",
        category: "architectural",
        url: "#",
        sizeBytes: 4200000,
        uploadedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ],
    coverImage:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    notes: "Warm minimalist design with natural travertine, solid oak accents, and panoramic views.",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),

    // Legacy fallbacks
    propertyType: "villa",
    areaSqm: 480,
    city: "6th of October",
    compound: "Palm Hills Golf Views",
  },
  {
    id: "proj-2",
    proposedTitle: "New Giza Duplex Residence",
    title: "New Giza Duplex Residence",
    status: "submitted",
    property: {
      propertyType: "duplex",
      compound: "New Giza",
      governorate: "Giza",
      city: "Sheikh Zayed",
      areaSqm: 280,
      floors: 2,
      condition: "red_brick",
      accessibilityNotes: "Elevator to 4th floor, private staircase to 5th.",
    },
    spaces: [
      {
        id: "space-living",
        spaceType: "living",
        customName: "Reception & Living Room",
        quantity: 1,
        included: true,
        stylePreference: {
          styleId: "modern",
          styleName: "Modern Minimalist",
          referenceImages: [],
        },
      },
      {
        id: "space-kitchen",
        spaceType: "kitchen",
        customName: "Open Kitchen Island",
        quantity: 1,
        included: true,
      },
      {
        id: "space-master",
        spaceType: "master_bedroom",
        customName: "Master Bedroom",
        quantity: 1,
        included: true,
      },
    ],
    customerLocation: {
      country: "United Kingdom",
      city: "London",
      timezone: "Europe/London (UTC+1)",
    },
    representative: {
      hasRepresentative: false,
      valentiaManagedDirectly: true,
    },
    scope: {
      scopeType: "interior_design",
      notes: "Interior design package with 3D renders and detailed BOQ preparation.",
    },
    budget: {
      budgetType: "exact",
      exactAmount: 3200000,
      currency: "EGP",
    },
    timeline: {
      deadlineType: "duration",
      durationDescription: "Within 3 months",
    },
    documents: [],
    coverImage:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    notes: "Double-height living room fit-out with acoustic wooden wall cladding.",
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),

    // Legacy fallbacks
    propertyType: "duplex",
    areaSqm: 280,
    city: "Sheikh Zayed",
    compound: "New Giza",
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
    const parsed: Project[] = JSON.parse(stored);
    // Ensure property and spaces entities are populated
    return parsed.map((p) => ({
      ...p,
      property: p.property || {
        propertyType: p.propertyType || "villa",
        compound: p.compound,
        city: p.city || "Cairo",
        areaSqm: p.areaSqm || 300,
      },
      spaces: p.spaces || [],
    }));
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
    // Generate safe title
    const computedTitle =
      dto.title ||
      `${dto.property.compound || dto.property.city} ${dto.property.propertyType.toUpperCase()}`;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      proposedTitle: computedTitle,
      title: computedTitle,
      status: "draft",
      property: dto.property,
      spaces: dto.spaces,
      customerLocation: dto.customerLocation,
      representative: dto.representative,
      scope: dto.scope,
      budget: dto.budget,
      timeline: dto.timeline,
      documents: dto.documents || [],
      notes: dto.notes,
      coverImage:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Legacy flat properties
      propertyType: dto.property.propertyType,
      areaSqm: dto.property.areaSqm,
      city: dto.property.city,
      compound: dto.property.compound,
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

      const current = projects[index];
      const updatedProject: Project = {
        ...current,
        ...dto,
        property: dto.property ? { ...current.property, ...dto.property } : current.property,
        spaces: dto.spaces || current.spaces,
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

      projects[index].status = "submitted";
      projects[index].updatedAt = new Date().toISOString();
      saveLocalProjects(projects);
      return projects[index];
    }
  },
};
