export type PropertyType =
  | "villa"
  | "apartment"
  | "duplex"
  | "penthouse"
  | "commercial"
  | "other";

export type ProjectStatus =
  | "draft"
  | "concept_selected"
  | "drawing_uploaded"
  | "under_engineer_review"
  | "meeting_scheduled"
  | "site_visit_scheduled"
  | "site_visit_paid"
  | "design_in_progress"
  | "design_delivered"
  | "boq_confirmed"
  | "execution"
  | "completed";

export interface SpaceItem {
  id: string;
  name: string;
  included: boolean;
  count: number;
}

export interface Project {
  id: string;
  title: string;
  propertyType: PropertyType;
  areaSqm: number;
  city: string;
  compound?: string;
  status: ProjectStatus;
  spaces: SpaceItem[];
  notes?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  title: string;
  propertyType: PropertyType;
  areaSqm: number;
  city: string;
  compound?: string;
  spaces: SpaceItem[];
  notes?: string;
}

export type UpdateProjectDto = Partial<CreateProjectDto>;
