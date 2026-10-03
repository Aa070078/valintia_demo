export const ALLOWED_PROPERTY_TYPES = [
  'villa',
  'apartment',
  'duplex',
  'penthouse',
  'commercial',
  'other',
] as const;

export const ALLOWED_PROPERTY_CONDITIONS = [
  'red_brick',
  'semi_finished',
  'under_construction',
  'occupied',
] as const;

export const ALLOWED_SPACE_TYPES = [
  'living',
  'dining',
  'kitchen',
  'master_bedroom',
  'bedroom',
  'bathroom',
  'terrace',
  'office',
  'dressing',
  'custom',
] as const;

export const ALLOWED_STYLE_PREFERENCE_MODES = [
  'whole_project',
  'per_space',
  'engineer_decides',
] as const;

export const ALLOWED_SCOPE_TYPES = [
  'full_fitout',
  'renovation',
  'interior_design',
  'other',
] as const;

export const ALLOWED_BUDGET_TYPES = [
  'exact',
  'range',
  'undecided',
] as const;

export const ALLOWED_DEADLINE_TYPES = [
  'specific_date',
  'duration',
  'no_deadline',
] as const;

export const ALLOWED_DOCUMENT_CATEGORIES = [
  'architectural',
  'engineering',
  'mep',
  'boq',
  'other',
] as const;