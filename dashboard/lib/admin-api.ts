import { getAccessToken } from "./auth-storage";
import { Role } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface AdminProject {
  id: number;
  title: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_ENGINEER_REVIEW" | "ENGINEER_READY" | string;
  clientId: number;
  client?: {
    id: number;
    username: string;
    email?: string;
  };
  property?: {
    id: number;
    propertyType: string;
    areaSqm: string | number;
    city: string;
    compound?: string;
  };
  spaces?: Array<{
    id: number;
    type: string;
    customName?: string;
  }>;
  budget?: {
    budgetType: string;
    minAmount?: number;
    maxAmount?: number;
    exactAmount?: number;
    currency: string;
  };
  timeline?: {
    deadlineType: string;
    targetDate?: string;
    durationDescription?: string;
  };
  assignment?: {
    id: number;
    engineerId: number;
    engineer?: {
      id: number;
      username: string;
      email?: string;
    };
    createdAt?: string;
  } | null;
  documents?: Array<{
    id: number;
    filename: string;
    category: string;
    url: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface EligibleEngineer {
  id: number;
  username: string;
  email?: string;
}

export interface CreateStaffPayload {
  firstName: string;
  lastName: string;
  birthYear: number;
  role: "ENGINEER" | "PROJECT_MANAGER" | "COMPANY_OWNER";
}

export interface ProvisionStaffResponse {
  id: number;
  username: string;
  temporaryLogin: string;
  temporaryPassword: string;
  role: Role;
  emailVerified: boolean;
  mustChangePassword: boolean;
  temporaryCredentialsExpiresAt: string;
  createdAt?: string;
}

export interface ProjectActivity {
  id: number;
  projectId: number;
  actorId: number;
  actorRole: string;
  action: string;
  fromStatus: string;
  toStatus: string;
  note?: string;
  createdAt: string;
}

function getAuthHeaders() {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const adminApi = {
  /**
   * Fetch all projects across the platform (Admin / PM / Owner scope).
   */
  async getProjects(): Promise<AdminProject[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/projects`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load projects");
      return await res.json();
    } catch (err) {
      console.warn("Using fallback demo projects:", err);
      return [
        {
          id: 1,
          title: "Palm Hills Golf Views Villa",
          status: "UNDER_ENGINEER_REVIEW",
          clientId: 101,
          client: { id: 101, username: "tarek.mansour@example.com" },
          property: {
            id: 1,
            propertyType: "villa",
            areaSqm: "480",
            city: "6th of October",
            compound: "Palm Hills Golf Views",
          },
          spaces: [
            { id: 1, type: "living_room", customName: "Grand Reception" },
            { id: 2, type: "master_bedroom", customName: "Master Suite" },
            { id: 3, type: "kitchen", customName: "Show Kitchen" },
          ],
          budget: {
            budgetType: "range",
            minAmount: 5000000,
            maxAmount: 7500000,
            currency: "EGP",
          },
          timeline: {
            deadlineType: "duration",
            durationDescription: "Within 6 months",
          },
          assignment: {
            id: 1,
            engineerId: 2,
            engineer: { id: 2, username: "karim.elsayed@valentia.com" },
          },
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        },
        {
          id: 2,
          title: "New Giza Duplex Residence",
          status: "SUBMITTED",
          clientId: 102,
          client: { id: 102, username: "yasmin.kandil@example.com" },
          property: {
            id: 2,
            propertyType: "duplex",
            areaSqm: "340",
            city: "Sheikh Zayed",
            compound: "New Giza",
          },
          spaces: [
            { id: 4, type: "living_room", customName: "Living & Dining" },
            { id: 5, type: "bedroom", customName: "Guest Bedroom" },
          ],
          budget: {
            budgetType: "range",
            minAmount: 3800000,
            maxAmount: 5200000,
            currency: "EGP",
          },
          timeline: {
            deadlineType: "duration",
            durationDescription: "Within 4 months",
          },
          assignment: null,
          createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 3,
          title: "Mivida Luxury Penthouse",
          status: "ENGINEER_READY",
          clientId: 103,
          client: { id: 103, username: "omar.shelby@example.com" },
          property: {
            id: 3,
            propertyType: "penthouse",
            areaSqm: "290",
            city: "New Cairo",
            compound: "Mivida",
          },
          spaces: [
            { id: 6, type: "living_room", customName: "Panoramic Terrace & Living" },
          ],
          budget: {
            budgetType: "range",
            minAmount: 4200000,
            maxAmount: 6000000,
            currency: "EGP",
          },
          timeline: {
            deadlineType: "duration",
            durationDescription: "Ready for consultation",
          },
          assignment: {
            id: 2,
            engineerId: 2,
            engineer: { id: 2, username: "karim.elsayed@valentia.com" },
          },
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  },

  /**
   * Fetch eligible engineers for assignment.
   */
  async getEligibleEngineers(): Promise<EligibleEngineer[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/engineers`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load eligible engineers");
      return await res.json();
    } catch {
      return [
        { id: 2, username: "karim.elsayed@valentia.com" },
        { id: 6, username: "tarek.ramzy@valentia.com" },
        { id: 7, username: "sarah.nour@valentia.com" },
      ];
    }
  },

  /**
   * Assign or reassign responsible engineer to a project.
   */
  async assignEngineer(
    projectId: number,
    engineerId: number
  ): Promise<{ id: number; projectId: number; engineerId: number }> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/assign-engineer`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ engineerId }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to assign engineer to project");
    }
    return data;
  },

  /**
   * Provision a new internal staff user (Engineer, PM, Company Owner).
   */
  async provisionStaffUser(payload: CreateStaffPayload): Promise<ProvisionStaffResponse> {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = Array.isArray(data.message) ? data.message.join(", ") : data.message;
      throw new Error(msg || "Failed to provision internal user");
    }
    return data;
  },

  /**
   * Revoke and reissue temporary credentials for an incomplete staff account.
   */
  async revokeTemporaryCredentials(userId: number): Promise<ProvisionStaffResponse> {
    const res = await fetch(
      `${API_BASE_URL}/users/${userId}/revoke-temporary-credentials`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      const msg = Array.isArray(data.message) ? data.message.join(", ") : data.message;
      throw new Error(msg || "Failed to reissue temporary credentials");
    }
    return data;
  },

  /**
   * Fetch project activity history.
   */
  async getProjectActivity(projectId: number): Promise<ProjectActivity[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/activity`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },
};
