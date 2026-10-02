/**
 * Valentia Operational Dashboard Types
 * Aligned with Prisma Schema & BRD Roles:
 * - CUSTOMER
 * - ENGINEER
 * - PROJECT_MANAGER
 * - COMPANY_OWNER
 * - ADMINISTRATOR
 */

export type Role =
  | "CUSTOMER"
  | "ENGINEER"
  | "PROJECT_MANAGER"
  | "COMPANY_OWNER"
  | "ADMINISTRATOR";

/**
 * ProjectStatus strictly matches Prisma backend enum:
 * enum ProjectStatus { DRAFT, SUBMITTED }
 * Assignment is derived from leadEngineerId / assignment != null.
 */
export type ProjectStatus = "DRAFT" | "SUBMITTED";

export type ScheduleHealth = "ON_SCHEDULE" | "AT_RISK" | "DELAYED";

export type SpaceType =
  | "LIVING_ROOM"
  | "KITCHEN"
  | "MASTER_BEDROOM"
  | "BEDROOM"
  | "BATHROOM"
  | "BALCONY"
  | "TERRACE"
  | "DINING";

export type DataSourceType =
  | "CUSTOMER_ENTERED"
  | "CAD_EXTRACTED"
  | "AI_INFERRED"
  | "ENGINEER_VERIFIED";

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  mustChangePassword: boolean;
  avatarUrl?: string;
  activeProjectsCount?: number;
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  engineerId: number;
  engineerName: string;
  role: "LEAD_ARCHITECT" | "SITE_SUPERVISOR" | "MEP_ENGINEER";
  assignedAt: string;
}

export interface ProjectSpaceSummary {
  id: string;
  name: string;
  type: string;
  quantity: number;
  styleName?: string;
  notes?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  phase: string;
  dueDate: string;
  completedDate?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
  progressPercent: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: Role;
  action: string;
  targetEntity: string;
  details: string;
}

export interface ProjectOverview {
  id: string;
  code: string;
  title: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  customerLocation?: {
    country: string;
    city: string;
    timezone?: string;
  };
  representative?: {
    representationType: "client_in_person" | "valentia_direct" | "authorized_representative";
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
  typology: "VILLA" | "PENTHOUSE" | "DUPLEX" | "TOWNHOUSE" | "APARTMENT" | string;
  areaM2: number;
  location: string;
  compound: string;
  budgetEgp: number;
  status: ProjectStatus;
  health: ScheduleHealth;
  leadEngineerId?: number | null;
  leadEngineerName?: string | null;
  completionPercent: number;
  spaces?: ProjectSpaceSummary[];
  scopeType?: string;
  targetTimeline?: string;
  notes?: string;
  nextMilestone: string;
  nextMilestoneDate: string;
  createdAt: string;
}
