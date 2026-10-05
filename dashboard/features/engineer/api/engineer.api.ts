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
} from "../types/engineer.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const token =
      localStorage.getItem("valentia_auth_token") ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("valentia_auth_token="))
        ?.split("=")[1];
    if (token) {
      return { Authorization: `Bearer ${decodeURIComponent(token)}` };
    }
  } catch {
    // LocalStorage or cookie unavailable
  }
  return {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMessage = `HTTP error ${res.status}: ${res.statusText}`;
    try {
      const data = await res.json();
      if (data?.message) {
        errMessage = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;
      }
    } catch {
      // Body not JSON
    }
    const err = new Error(errMessage) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/**
 * 1. Fetch Projects assigned to the authenticated Engineer
 * Backend: GET /api/projects
 */
export async function getAssignedProjects(): Promise<ProjectListItem[]> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
  };

  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  return handleResponse<ProjectListItem[]>(res);
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
  };

  const res = await fetch(`${API_BASE_URL}/projects/${id}/review`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  return handleResponse<ProjectReviewContext>(res);
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
  };

  const res = await fetch(`${API_BASE_URL}/projects/${id}/review/start`, {
    method: "POST",
    headers,
    body: JSON.stringify(note ? { note } : {}),
  });

  return handleResponse<ProjectReviewTransition>(res);
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
  };

  const res = await fetch(
    `${API_BASE_URL}/projects/${id}/review/ready-for-consultation`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(note ? { note } : {}),
    }
  );

  return handleResponse<ProjectReviewTransition>(res);
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
  };

  const res = await fetch(`${API_BASE_URL}/projects/${id}/activity`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  return handleResponse<ProjectActivity[]>(res);
}

// =========================================================================
// SPRINT 2: CONSULTATION & MOM ADAPTERS (READY FOR API HOOKUP)
// =========================================================================

const LOCAL_CONSULTATIONS_KEY = "valentia_consultations_cache";
const LOCAL_MOM_KEY = "valentia_mom_records_cache";

/**
 * Default Seed Consultations for Sprint 2 Engineer Workspace
 */
const SEED_CONSULTATIONS: ConsultationAppointment[] = [
  {
    id: "consult-01",
    projectId: 1,
    projectTitle: "Palm Hills Villa 420 - Luxury Fitout",
    clientName: "Tarek Mansour",
    clientPhone: "+20 100 123 4567",
    clientEmail: "tarek.mansour@example.com",
    // Today at 2:00 PM UTC = 4:00 PM Cairo (UTC+2)
    scheduledAt: new Date(Date.now() + 3600000 * 2).toISOString(),
    durationMinutes: 45,
    status: "CONFIRMED",
    meetingLink: "https://meet.google.com/val-palm-420",
    notes: "Review open layout partition removal and preliminary lighting concept.",
  },
  {
    id: "consult-02",
    projectId: 2,
    projectTitle: "Swan Lake Penthouse B4",
    clientName: "Laila El-Kady",
    clientPhone: "+20 101 987 6543",
    clientEmail: "laila.kady@example.com",
    // Tomorrow at 11:00 AM UTC = 1:00 PM Cairo
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    durationMinutes: 45,
    status: "REQUESTED",
    notes: "Initial consultation request awaiting time slot confirmation.",
  },
];

export async function getConsultations(): Promise<ConsultationAppointment[]> {
  if (typeof window === "undefined") return SEED_CONSULTATIONS;
  try {
    const raw = localStorage.getItem(LOCAL_CONSULTATIONS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_CONSULTATIONS_KEY, JSON.stringify(SEED_CONSULTATIONS));
      return SEED_CONSULTATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_CONSULTATIONS;
  }
}

export async function getMomForProject(
  projectId: number
): Promise<MomRecord | null> {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_MOM_KEY);
    if (!raw) return null;
    const records: MomRecord[] = JSON.parse(raw);
    return records.find((m) => m.projectId === projectId) || null;
  } catch {
    return null;
  }
}

export async function saveMomRecord(
  data: Omit<MomRecord, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<MomRecord> {
  const existingRecords: MomRecord[] = (() => {
    try {
      const raw = localStorage.getItem(LOCAL_MOM_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  const now = new Date().toISOString();
  let saved: MomRecord;

  if (data.id) {
    saved = {
      ...data,
      id: data.id,
      createdAt: now,
      updatedAt: now,
    };
    const idx = existingRecords.findIndex((r) => r.id === data.id);
    if (idx >= 0) {
      saved.createdAt = existingRecords[idx].createdAt;
      existingRecords[idx] = saved;
    } else {
      existingRecords.push(saved);
    }
  } else {
    saved = {
      ...data,
      id: `mom-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    existingRecords.push(saved);
  }

  localStorage.setItem(LOCAL_MOM_KEY, JSON.stringify(existingRecords));
  return saved;
}
