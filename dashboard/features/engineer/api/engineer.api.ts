import { getAccessToken } from "@/lib/auth-storage"
/**
 * Engineer API Service & Adapters
 * Connects to live NestJS backend endpoints merged in master (PR #20).
 * Marked endpoints for Consultation & MOM are typed and ready for backend hookup.
 */

import {
  ProjectListItem,
  ProjectReviewContext,
  ProjectReviewTransition,
  ProjectActivity,
  ConsultationAppointment,
  MomRecord,
} from "../types/engineer.types"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api"

function getAuthHeader(): Record<string, string> {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMessage = `HTTP error ${res.status}: ${res.statusText}`
    try {
      const data = await res.json()
      if (data?.message) {
        errMessage = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message
      }
    } catch {
      // Body not JSON
    }
    const err = new Error(errMessage) as Error & { status?: number }
    err.status = res.status
    throw err
  }
  return res.json()
}

/**
 * 1. Fetch Projects assigned to the authenticated Engineer
 * Backend: GET /api/projects
 */
export async function getAssignedProjects(): Promise<ProjectListItem[]> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
  }

  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: "GET",
    headers,
    cache: "no-store",
  })

  const data = await handleResponse<ProjectListItem[]>(res)
  return data.map((project) => ({
    ...project,
    id: Number(project.id),
    status: project.status.toUpperCase() as ProjectListItem["status"],
  }))
}

/**
 * 2. Fetch specific Project Review Context
 * Backend: GET /api/projects/:id/review
 */
export async function getProjectReviewContext(
  id: number
): Promise<ProjectReviewContext> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
  }

  const res = await fetch(`${API_BASE_URL}/projects/${id}/review`, {
    method: "GET",
    headers,
    cache: "no-store",
  })

  return handleResponse<ProjectReviewContext>(res)
}

/**
 * 3. Start Review (Transition SUBMITTED -> UNDER_ENGINEER_REVIEW)
 * Backend: POST /api/projects/:id/review/start
 */
export async function startReview(
  id: number,
  note?: string
): Promise<ProjectReviewTransition> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
  }

  const res = await fetch(`${API_BASE_URL}/projects/${id}/review/start`, {
    method: "POST",
    headers,
    body: JSON.stringify(note ? { note } : {}),
  })

  return handleResponse<ProjectReviewTransition>(res)
}

/**
 * 4. Mark Ready for Consultation (Transition UNDER_ENGINEER_REVIEW -> ENGINEER_READY)
 * Backend: POST /api/projects/:id/review/ready-for-consultation
 */
export async function markReadyForConsultation(
  id: number,
  note?: string
): Promise<ProjectReviewTransition> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
  }

  const res = await fetch(
    `${API_BASE_URL}/projects/${id}/review/ready-for-consultation`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(note ? { note } : {}),
    }
  )

  return handleResponse<ProjectReviewTransition>(res)
}

/**
 * 5. Fetch Project Review Activity Log
 * Backend: GET /api/projects/:id/activity
 */
export async function getProjectActivity(
  id: number
): Promise<ProjectActivity[]> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
  }

  const res = await fetch(`${API_BASE_URL}/projects/${id}/activity`, {
    method: "GET",
    headers,
    cache: "no-store",
  })

  return handleResponse<ProjectActivity[]>(res)
}

// =========================================================================
// SPRINT 2: CONSULTATION & MOM ADAPTERS (READY FOR API HOOKUP)
// =========================================================================

// No consultation/MOM database endpoints exist in this checkout.
export async function getConsultations(): Promise<ConsultationAppointment[]> {
  return []
}
export async function getMomForProject(
  _projectId: number
): Promise<MomRecord | null> {
  void _projectId
  return null
}
export async function saveMomRecord(
  _data: Omit<MomRecord, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<MomRecord> {
  void _data
  throw new Error(
    "Meeting minutes are unavailable until the server supports them."
  )
}
