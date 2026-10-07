/**
 * Engineer Workspace Types
 * Aligned with merged Prisma schema, Sprint 2 Review contracts, and Product Guidelines
 */

export type ProjectStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_ENGINEER_REVIEW"
  | "ENGINEER_READY";

export type ProjectActivityAction =
  | "REVIEW_STARTED"
  | "CONSULTATION_READY";

export type ProjectReviewAction =
  | "START_REVIEW"
  | "MARK_READY_FOR_CONSULTATION";

export interface ReviewIdentity {
  id: number;
  username: string;
  name?: string;
  email?: string;
}

export interface ReviewProperty {
  id: number;
  projectId: number;
  propertyType: string;
  areaSqm: string;
  city: string;
  compound: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewSpace {
  id: number;
  projectId: number;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewAssignment {
  id: number;
  projectId: number;
  engineerId: number;
  createdAt: string;
  engineer?: ReviewIdentity;
}

export interface ProjectActivity {
  id: number;
  projectId: number;
  actorId: number;
  actorRole: string;
  action: ProjectActivityAction;
  fromStatus: ProjectStatus;
  toStatus: ProjectStatus;
  note: string | null;
  createdAt: string;
}

export interface ProjectReviewContext {
  id: number;
  title: string;
  status: ProjectStatus;
  notes: string | null;
  clientId: number;
  client: ReviewIdentity;
  property: ReviewProperty | null;
  spaces: ReviewSpace[];
  assignment: ReviewAssignment;
  activities: ProjectActivity[];
  allowedActions: ProjectReviewAction[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectReviewTransition {
  projectId: number;
  status: ProjectStatus;
  activity: ProjectActivity;
  allowedActions: ProjectReviewAction[];
}

export interface ProjectListItem {
  id: number;
  title: string;
  status: ProjectStatus;
  notes: string | null;
  clientId: number;
  property?: ReviewProperty | null;
  spaces?: ReviewSpace[];
  assignment?: ReviewAssignment | null;
  createdAt: string;
  updatedAt: string;
}

// Sprint 2 Consultation Model
export type ConsultationStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export interface ConsultationAppointment {
  id: string;
  projectId: number;
  projectTitle: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  scheduledAt: string; // ISO 8601 UTC string
  durationMinutes: number;
  status: ConsultationStatus;
  meetingLink?: string;
  notes?: string;
}

// Minutes of Meeting (MOM) Model
export type MomItemType =
  | "DECISION"
  | "ACTION_ITEM"
  | "TECHNICAL_NOTE"
  | "SCOPE_CLARIFICATION";

export interface MomStructuredItem {
  id: string;
  type: MomItemType;
  body: string; // min 3 chars
  owner?: string;
  dueDate?: string;
}

export type MomStatus =
  | "DRAFT"
  | "PUBLISHED_TO_CUSTOMER"
  | "CONFIRMED_BY_CUSTOMER"
  | "CHANGES_REQUESTED";

export interface MomRecord {
  id: string;
  projectId: number;
  appointmentId?: string;
  summary: string; // min 20 chars
  discussionPoints?: string;
  items: MomStructuredItem[]; // 0 items valid
  status: MomStatus;
  recordedByEngineerId: number;
  recordedByEngineerName: string;
  publishedAt?: string;
  customerConfirmedAt?: string;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Engineer Workspace Tab Navigation
export type ProjectWorkspaceTab =
  | "overview"
  | "brief_review"
  | "files_drawings"
  | "consultation"
  | "mom"
  | "activity";

// Engineer Workspace Filter States
export type EngineerWorkQueueFilter =
  | "ALL"
  | "UNDER_REVIEW"
  | "CONSULTATION_READY"
  | "MEETING_SCHEDULED"
  | "MOM_PENDING"
  | "WAITING_CUSTOMER";
