/**
 * Valentia Domain Entities & Proposed Contract Definitions
 *
 * Designed to cleanly decouple domain entities (Project, Property, Spaces[])
 * and isolate proposed backend fields until official Swagger DTOs are delivered.
 */

export type PropertyType =
  | "villa"
  | "apartment"
  | "duplex"
  | "penthouse"
  | "commercial"
  | "other";

/**
 * Minimal confirmed project lifecycle concepts: DRAFT, SUBMITTED, INITIAL_REVIEW.
 * Uses open union to allow backend extensions without breaking types.
 */
export type ProposedProjectLifecycleStatus =
  | "draft"
  | "submitted"
  | "initial_review"
  | (string & {});

/**
 * Backward compatibility alias for existing code.
 */
export type ProjectStatus = ProposedProjectLifecycleStatus;

/**
 * Modular statuses for future lifecycle stages.
 * Kept separate from ProjectLifecycleStatus per mentor architecture.
 */
export type ConsultationStatus =
  | "pending"
  | "scheduled"
  | "completed"
  | "mom_confirmed"
  | (string & {});

export type SiteVisitStatus =
  | "unpaid"
  | "scheduled"
  | "assigned"
  | "en_route"
  | "arrived"
  | "in_progress"
  | "completed"
  | (string & {});

export type DesignStatus =
  | "package_selection"
  | "terms_pending"
  | "payment_pending"
  | "in_progress"
  | "revision_requested"
  | "approved"
  | (string & {});

export type BOQStatus =
  | "optional_decision"
  | "payment_pending"
  | "in_preparation"
  | "under_review"
  | "approved"
  | (string & {});

/**
 * Extensible currency string, default prototype currency is "EGP".
 */
export type CurrencyCode = string;

export type PropertyCondition =
  | "red_brick"
  | "semi_finished"
  | "occupied"
  | "under_construction"
  | (string & {});

/**
 * Intermediate selection model used during Step 2 (Style Discovery)
 * before SpaceEntity records are finalized in Step 3 (Spaces).
 * Preserves the mentor-confirmed UX order while maintaining strict data integrity.
 */
export interface PendingStyleSelection {
  targetSpaceKey: string; // e.g. "living", "dining", "master_bedroom", "kitchen", "general"
  styleId: string;
  styleName: string;
  referenceImages: string[];
  notes?: string;
}

export interface SpaceStylePreference {
  styleId: string;
  styleName: string;
  referenceImages: string[];
  notes?: string;
}

/**
 * Domain entity: Space.
 * Designed knowing that later each Space may independently own
 * Design, Revisions, Measurements, and BOQ items.
 */
export interface SpaceEntity {
  id: string;
  spaceType?: string;
  name?: string; // backwards compatibility
  customName?: string;
  quantity?: number;
  count?: number; // backwards compatibility
  included: boolean;
  stylePreference?: SpaceStylePreference;
  notes?: string;
}

/**
 * Backwards compatibility alias for components expecting SpaceItem.
 */
export type SpaceItem = SpaceEntity;

export interface PropertyEntity {
  propertyType: PropertyType;
  compound?: string;
  governorate?: string;
  city: string;
  areaSqm: number;
  floors?: number;
  condition?: PropertyCondition;
  accessibilityNotes?: string;
}

export interface CustomerLocation {
  country: string;
  city: string;
  timezone: string;
}

export interface AuthorizedRepresentative {
  hasRepresentative: boolean;
  name?: string;
  phone?: string;
  email?: string;
  relationship?: string;
  authorizationScope?: string;
  valentiaManagedDirectly: boolean;
}

export interface ProjectScope {
  scopeType: "full_fitout" | "renovation" | "interior_design" | "other" | (string & {});
  customDetails?: string;
  notes?: string;
}

export interface ProjectBudget {
  budgetType: "exact" | "range" | "undecided";
  exactAmount?: number;
  minAmount?: number;
  maxAmount?: number;
  currency: CurrencyCode;
}

export interface TargetCompletion {
  deadlineType: "specific_date" | "duration" | "no_deadline";
  targetDate?: string;
  durationDescription?: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  category: "architectural" | "engineering" | "mep" | "boq" | "other" | (string & {});
  url: string;
  sizeBytes?: number;
  uploadedAt: string;
}

/**
 * Core Project Domain Entity
 */
export interface Project {
  id: string;
  /**
   * Title is marked as proposed; helper accessor isolates it from UI.
   */
  proposedTitle?: string;
  title: string;
  status: ProposedProjectLifecycleStatus;
  customerId?: string;
  property: PropertyEntity;
  spaces: SpaceEntity[];
  customerLocation?: CustomerLocation;
  representative?: AuthorizedRepresentative;
  scope?: ProjectScope;
  budget?: ProjectBudget;
  timeline?: TargetCompletion;
  documents?: ProjectDocument[];
  coverImage?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  // Flattened legacy fallbacks for existing read-only cards
  propertyType?: PropertyType;
  areaSqm?: number;
  city?: string;
  compound?: string;
}

export interface CreateProjectDto {
  title?: string;
  property: PropertyEntity;
  spaces: SpaceEntity[];
  pendingStyles?: PendingStyleSelection[];
  customerLocation?: CustomerLocation;
  representative?: AuthorizedRepresentative;
  scope?: ProjectScope;
  budget?: ProjectBudget;
  timeline?: TargetCompletion;
  documents?: ProjectDocument[];
  notes?: string;

  // Legacy flat fields for adapter conversion
  propertyType?: PropertyType;
  areaSqm?: number;
  city?: string;
  compound?: string;
}

export type UpdateProjectDto = Partial<CreateProjectDto>;

/**
 * Helper to retrieve a safe display title for a project.
 */
export function getProjectDisplayTitle(project: Partial<Project>): string {
  return project.title || project.proposedTitle || "Untitled Commission";
}
