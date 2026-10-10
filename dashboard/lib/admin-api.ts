import { getAccessToken } from "./auth-storage"
import { Role } from "./types"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface AdminProject {
  id: number
  title: string
  status:
    "DRAFT" | "SUBMITTED" | "UNDER_ENGINEER_REVIEW" | "ENGINEER_READY" | string
  clientId: number
  client?: {
    id: number
    username: string
    email?: string
  }
  property?: {
    id: number
    propertyType: string
    areaSqm: string | number
    city: string
    compound?: string
  }
  spaces?: Array<{
    id: number
    type: string
    customName?: string
  }>
  budget?: {
    budgetType: string
    minAmount?: number
    maxAmount?: number
    exactAmount?: number
    currency: string
  }
  timeline?: {
    deadlineType: string
    targetDate?: string
    durationDescription?: string
  }
  assignment?: {
    id: number
    engineerId: number
    engineer?: {
      id: number
      username: string
      email?: string
    }
    createdAt?: string
  } | null
  documents?: Array<{
    id: number
    filename: string
    category: string
    url: string
  }>
  createdAt: string
  updatedAt: string
}

export interface EligibleEngineer {
  id: number
  username: string
  email?: string
}

export interface CreateStaffPayload {
  firstName: string
  lastName: string
  birthYear: number
  role: "ENGINEER" | "PROJECT_MANAGER" | "COMPANY_OWNER"
}

export interface ProvisionStaffResponse {
  id: number
  username: string
  temporaryLogin: string
  temporaryPassword: string
  role: Role
  emailVerified: boolean
  mustChangePassword: boolean
  temporaryCredentialsExpiresAt: string
  createdAt?: string
}

export interface ProjectActivity {
  id: number
  projectId: number
  actorId: number
  actorRole: string
  action: string
  fromStatus: string
  toStatus: string
  note?: string
  createdAt: string
}

function getAuthHeaders() {
  const token = getAccessToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export interface StaffAccount {
  id: number
  username: string
  email: string | null
  role: Role
  emailVerified: boolean
  mustChangePassword: boolean
  temporaryCredentialsExpiresAt: string | null
  createdAt: string
}

async function request<T>(
  path: string,
  method = "GET",
  body?: unknown
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: getAuthHeaders(),
    cache: "no-store",
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message = data?.message
    throw new Error(
      Array.isArray(message)
        ? message.join(", ")
        : message || `Request failed (${response.status})`
    )
  }
  return data as T
}

export const adminApi = {
  async getProjects(): Promise<AdminProject[]> {
    return (await request<AdminProject[]>("/projects")).map((project) => ({
      ...project,
      id: Number(project.id),
      status: project.status.toUpperCase(),
    }))
  },
  getEligibleEngineers: () =>
    request<EligibleEngineer[]>("/projects/engineers"),
  getStaffUsers: () => request<StaffAccount[]>("/users"),
  assignEngineer: (projectId: number, engineerId: number) =>
    request<{ id: number; projectId: number; engineerId: number }>(
      `/projects/${projectId}/assign-engineer`,
      "POST",
      { engineerId }
    ),
  provisionStaffUser: (payload: CreateStaffPayload) =>
    request<ProvisionStaffResponse>("/users", "POST", payload),
  revokeTemporaryCredentials: (userId: number) =>
    request<ProvisionStaffResponse>(
      `/users/${userId}/revoke-temporary-credentials`,
      "POST"
    ),
  getProjectActivity: (projectId: number) =>
    request<ProjectActivity[]>(`/projects/${projectId}/activity`),
}
