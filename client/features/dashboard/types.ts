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

export type ProjectStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "ENGINEER_REVIEW"
  | "CONSULTATION_SCHEDULED"
  | "SITE_VISIT_SCHEDULED"
  | "SITE_VISIT_COMPLETED"
  | "DESIGN_IN_PROGRESS"
  | "DESIGN_DELIVERED"
  | "BOQ_PREPARATION"
  | "QUOTATION_CONFIRMED"
  | "EXECUTION"
  | "FINAL_INSPECTION"
  | "HANDOVER"
  | "COMPLETED";

export type ScheduleHealth = "ON_SCHEDULE" | "AT_RISK" | "DELAYED";

export type SpaceType =
  | "LIVING_ROOM"
  | "KITCHEN"
  | "MASTER_BEDROOM"
  | "BEDROOM"
  | "BATHROOM"
  | "BALCONY";

export type DataSourceType =
  | "CUSTOMER_ENTERED"
  | "CAD_EXTRACTED"
  | "AI_INFERRED"
  | "ENGINEER_VERIFIED";

export type SiteVisitStatus =
  | "ASSIGNED"
  | "ON_THE_WAY"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED";

export interface User {
  id: number | string;
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
  engineerId: number | string;
  engineerName: string;
  role: "LEAD_ARCHITECT" | "SITE_SUPERVISOR" | "MEP_ENGINEER";
  assignedAt: string;
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

export interface SiteVisit {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  clientPhone: string;
  location: string;
  compound: string;
  scheduledDate: string;
  scheduledTime: string;
  assignedEngineerId: number;
  assignedEngineerName: string;
  status: SiteVisitStatus;
  laserScanCompleted?: boolean;
  notes?: string;
}

export interface ChangeOrder {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  title: string;
  description: string;
  requestedAt: string;
  costImpactEgp: number;
  timeImpactDays: number;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
}

export interface EngineeringDimensionItem {
  id: string;
  spaceName: string;
  parameter: string;
  customerEntered: string;
  cadExtracted?: string;
  aiInferred?: string;
  engineerVerified?: string;
  status: DataSourceType;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface CatalogPackage {
  id: string;
  name: string;
  type: "2D_BLUEPRINT" | "3D_PHOTOREALISTIC" | "TURNKEY_FITOUT";
  basePriceEgp: number;
  ratePerMeterEgp?: number;
  turnaroundDays: number;
  includedRevisions: number;
  isActive: boolean;
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
  typology: "VILLA" | "APARTMENT" | "DUPLEX" | "PENTHOUSE" | "COMMERCIAL" | "OTHER";
  areaM2: number;
  location: string;
  compound: string;
  budgetEgp: number;
  status: ProjectStatus;
  health: ScheduleHealth;
  leadEngineerId: number | string;
  leadEngineerName: string;
  completionPercent: number;
  nextMilestone: string;
  nextMilestoneDate: string;
  createdAt: string;
}
