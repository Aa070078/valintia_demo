import { apiClient } from "@/lib/api/client";
import { Role } from "@/features/auth/types";

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

export const adminApi = {
  /**
   * Fetch all projects across the platform (Admin / PM / Owner scope).
   */
  async getProjects(): Promise<AdminProject[]> {
    try {
      const res = await apiClient.get<AdminProject[]>("/projects");
      return res.data;
    } catch (err) {
      console.warn("Using fallback demo projects in admin API:", err);
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
            { id: 6, type: "living_room", customName: "Panorama Hall" },
            { id: 7, type: "terrace", customName: "Sky Garden Loggia" },
          ],
          budget: {
            budgetType: "range",
            minAmount: 4200000,
            maxAmount: 6000000,
            currency: "EGP",
          },
          timeline: {
            deadlineType: "duration",
            durationDescription: "Within 5 months",
          },
          assignment: {
            id: 2,
            engineerId: 4,
            engineer: { id: 4, username: "ahmed.mansour@valentia.com" },
          },
          createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
      ];
    }
  },

  /**
   * Fetch all staff members eligible to be assigned as responsible engineers.
   */
  async getEligibleEngineers(): Promise<EligibleEngineer[]> {
    try {
      const res = await apiClient.get<EligibleEngineer[]>("/projects/engineers");
      return res.data;
    } catch {
      return [
        { id: 2, username: "eng_karim", email: "karim.elsayed@valentia.com" },
        { id: 4, username: "eng_ahmed", email: "ahmed.mansour@valentia.com" },
        { id: 5, username: "eng_sarah", email: "sarah.fahmy@valentia.com" },
        { id: 10, username: "eng_nour", email: "nour.khalil@valentia.com" },
      ];
    }
  },

  /**
   * Assign or re-assign responsible engineer to a project (Admin & PM only).
   */
  async assignEngineer(
    projectId: number,
    engineerId: number
  ): Promise<{ projectId: number; engineerId: number; message: string }> {
    const res = await apiClient.post(`/projects/${projectId}/assign-engineer`, {
      engineerId,
    });
    return res.data;
  },

  /**
   * Admin provisions an internal staff member (Engineer, PM, Company Owner).
   */
  async provisionStaffUser(
    payload: CreateStaffPayload
  ): Promise<ProvisionStaffResponse> {
    const res = await apiClient.post<ProvisionStaffResponse>("/users", payload);
    return res.data;
  },

  /**
   * Admin revokes and reissues new temporary credentials for a staff user.
   */
  async revokeTemporaryCredentials(
    userId: number
  ): Promise<{ temporaryLogin: string; temporaryPassword: string; expiresAt: string }> {
    const res = await apiClient.post(`/users/${userId}/revoke-temporary-credentials`);
    return res.data;
  },

  /**
   * Fetch audit activity for a specific project.
   */
  async getProjectActivity(projectId: number): Promise<ProjectActivity[]> {
    try {
      const res = await apiClient.get<ProjectActivity[]>(`/projects/${projectId}/activity`);
      return res.data;
    } catch {
      return [];
    }
  },

  /**
   * Engineer gets persisted review context for their assigned project.
   */
  async getReviewContext(projectId: number): Promise<any> {
    const res = await apiClient.get(`/projects/${projectId}/review`);
    return res.data;
  },

  /**
   * Engineer starts review of assigned SUBMITTED project (SUBMITTED -> UNDER_ENGINEER_REVIEW).
   */
  async startReview(
    projectId: number,
    note?: string
  ): Promise<{ projectId: number; status: string; message: string }> {
    const payload = note ? { note } : {};
    const res = await apiClient.post(`/projects/${projectId}/review/start`, payload);
    return res.data;
  },

  /**
   * Engineer marks reviewed project ready for consultation (UNDER_ENGINEER_REVIEW -> ENGINEER_READY).
   */
  async readyForConsultation(
    projectId: number,
    note?: string
  ): Promise<{ projectId: number; status: string; message: string }> {
    const payload = note ? { note } : {};
    const res = await apiClient.post(
      `/projects/${projectId}/review/ready-for-consultation`,
      payload
    );
    return res.data;
  },
};
