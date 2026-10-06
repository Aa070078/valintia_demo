import {
  PropertyType as PrismaPropertyType,
  PropertyCondition as PrismaPropertyCondition,
  SpaceType as PrismaSpaceType,
  ScopeType as PrismaScopeType,
  BudgetType as PrismaBudgetType,
  DeadlineType as PrismaDeadlineType,
  DocumentCategory as PrismaDocumentCategory,
  ProjectStatus as PrismaProjectStatus,
  StylePreferenceMode as PrismaStylePreferenceMode,
  Project,
  Property,
  Space,
  CustomerLocation,
  ProjectRepresentative,
  ProjectScope,
  ProjectBudget,
  TargetCompletion,
  ProjectDocument,
  ProjectAssignment,
  ProjectStylePreference,
  SpaceStylePreference,
} from '../generated/prisma/client.js';

// ============================================================
// ENUM MAPPINGS
// FRONTEND (lowercase) <-> PRISMA (UPPERCASE)
// ============================================================

export function toPrismaPropertyType(
  val?: string,
): PrismaPropertyType {
  if (!val) return PrismaPropertyType.OTHER;

  const normalized = val.trim().toLowerCase();

  switch (normalized) {
    case 'villa':
      return PrismaPropertyType.VILLA;

    case 'apartment':
      return PrismaPropertyType.APARTMENT;

    case 'duplex':
      return PrismaPropertyType.DUPLEX;

    case 'penthouse':
      return PrismaPropertyType.PENTHOUSE;

    case 'commercial':
      return PrismaPropertyType.COMMERCIAL;

    case 'other':
    default:
      return PrismaPropertyType.OTHER;
  }
}

export function toFrontendPropertyType(
  val: PrismaPropertyType,
): string {
  return val.toLowerCase();
}

// ------------------------------------------------------------

export function toPrismaPropertyCondition(
  val?: string,
): PrismaPropertyCondition | undefined {
  if (!val) return undefined;

  const normalized = val.trim().toLowerCase();

  switch (normalized) {
    case 'red_brick':
      return PrismaPropertyCondition.RED_BRICK;

    case 'semi_finished':
      return PrismaPropertyCondition.SEMI_FINISHED;

    case 'under_construction':
      return PrismaPropertyCondition.UNDER_CONSTRUCTION;

    case 'occupied':
      return PrismaPropertyCondition.OCCUPIED;

    default:
      return undefined;
  }
}

export function toFrontendPropertyCondition(
  val?: PrismaPropertyCondition | null,
): string | undefined {
  if (!val) return undefined;

  return val.toLowerCase();
}

// ------------------------------------------------------------

export function toPrismaSpaceType(
  val?: string,
): PrismaSpaceType {
  if (!val) return PrismaSpaceType.CUSTOM;

  const normalized = val.trim().toLowerCase();

  switch (normalized) {
    case 'living':
    case 'living_room':
      return PrismaSpaceType.LIVING;

    case 'dining':
      return PrismaSpaceType.DINING;

    case 'kitchen':
      return PrismaSpaceType.KITCHEN;

    case 'master_bedroom':
    case 'master':
      return PrismaSpaceType.MASTER_BEDROOM;

    case 'bedroom':
    case 'guest_bedrooms':
    case 'bedrooms':
      return PrismaSpaceType.BEDROOM;

    case 'bathroom':
    case 'bathrooms':
      return PrismaSpaceType.BATHROOM;

    case 'terrace':
    case 'balcony':
      return PrismaSpaceType.TERRACE;

    case 'office':
      return PrismaSpaceType.OFFICE;

    case 'dressing':
      return PrismaSpaceType.DRESSING;

    case 'custom':
      return PrismaSpaceType.CUSTOM;

    default:
      return PrismaSpaceType.CUSTOM;
  }
}

export function toFrontendSpaceType(
  val: PrismaSpaceType,
): string {
  return val.toLowerCase();
}

// ------------------------------------------------------------

export function toPrismaScopeType(
  val?: string,
): PrismaScopeType {
  if (!val) return PrismaScopeType.OTHER;

  const normalized = val.trim().toLowerCase();

  switch (normalized) {
    case 'full_fitout':
      return PrismaScopeType.FULL_FITOUT;

    case 'renovation':
      return PrismaScopeType.RENOVATION;

    case 'interior_design':
      return PrismaScopeType.INTERIOR_DESIGN;

    case 'other':
    default:
      return PrismaScopeType.OTHER;
  }
}

export function toFrontendScopeType(
  val: PrismaScopeType,
): string {
  return val.toLowerCase();
}

// ------------------------------------------------------------

export function toPrismaBudgetType(
  val?: string,
): PrismaBudgetType {
  if (!val) return PrismaBudgetType.UNDECIDED;

  const normalized = val.trim().toLowerCase();

  switch (normalized) {
    case 'exact':
      return PrismaBudgetType.EXACT;

    case 'range':
      return PrismaBudgetType.RANGE;

    case 'undecided':
    default:
      return PrismaBudgetType.UNDECIDED;
  }
}

export function toFrontendBudgetType(
  val: PrismaBudgetType,
): string {
  return val.toLowerCase();
}

// ------------------------------------------------------------

export function toPrismaDeadlineType(
  val?: string,
): PrismaDeadlineType {
  if (!val) return PrismaDeadlineType.NO_DEADLINE;

  const normalized = val.trim().toLowerCase();

  switch (normalized) {
    case 'specific_date':
      return PrismaDeadlineType.SPECIFIC_DATE;

    case 'duration':
      return PrismaDeadlineType.DURATION;

    case 'no_deadline':
    default:
      return PrismaDeadlineType.NO_DEADLINE;
  }
}

export function toFrontendDeadlineType(
  val: PrismaDeadlineType,
): string {
  return val.toLowerCase();
}

// ------------------------------------------------------------

export function toPrismaDocumentCategory(
  val?: string,
): PrismaDocumentCategory {
  if (!val) return PrismaDocumentCategory.OTHER;

  const normalized = val.trim().toLowerCase();

  switch (normalized) {
    case 'architectural':
      return PrismaDocumentCategory.ARCHITECTURAL;

    case 'engineering':
      return PrismaDocumentCategory.ENGINEERING;

    case 'mep':
      return PrismaDocumentCategory.MEP;

    case 'boq':
      return PrismaDocumentCategory.BOQ;

    case 'other':
    default:
      return PrismaDocumentCategory.OTHER;
  }
}

export function toFrontendDocumentCategory(
  val: PrismaDocumentCategory,
): string {
  return val.toLowerCase();
}

// ------------------------------------------------------------

export function toFrontendProjectStatus(
  val: PrismaProjectStatus,
): string {
  return val.toLowerCase();
}

// ------------------------------------------------------------

export function toPrismaStylePreferenceMode(
  val?: string,
): PrismaStylePreferenceMode {
  if (!val) {
    return PrismaStylePreferenceMode.ENGINEER_DECIDES;
  }

  const normalized = val.trim().toLowerCase();

  switch (normalized) {
    case 'whole_project':
      return PrismaStylePreferenceMode.WHOLE_PROJECT;

    case 'per_space':
      return PrismaStylePreferenceMode.PER_SPACE;

    case 'engineer_decides':
      return PrismaStylePreferenceMode.ENGINEER_DECIDES;

    default:
      return PrismaStylePreferenceMode.ENGINEER_DECIDES;
  }
}

export function toFrontendStylePreferenceMode(
  val: PrismaStylePreferenceMode,
): string {
  return val.toLowerCase();
}

// ============================================================
// FULL PRISMA PROJECT TYPE
// ============================================================

export type FullPrismaProject = Project & {
  property?: Property | null;

  spaces?: Array<
    Space & {
      stylePreference?: SpaceStylePreference | null;
    }
  >;

  stylePreference?:
    | (ProjectStylePreference & {
        spacePreferences?: SpaceStylePreference[];
      })
    | null;

  location?: CustomerLocation | null;

  representative?: ProjectRepresentative | null;

  scope?: ProjectScope | null;

  budget?: ProjectBudget | null;

  timeline?: TargetCompletion | null;

  documents?: ProjectDocument[];

  assignments?: Array<
    ProjectAssignment & {
      engineer?: {
        id: number;
        username: string;
      } | null;
    }
  >;
};

// ============================================================
// PROJECT MAPPER
// ============================================================

export function mapProjectToFrontend(
  p: FullPrismaProject,
) {
  // ----------------------------------------------------------
  // PROPERTY
  // ----------------------------------------------------------

  const property = p.property
    ? {
        propertyType: toFrontendPropertyType(
          p.property.propertyType,
        ),

        compound:
          p.property.compound ?? undefined,

        governorate:
          p.property.governorate ?? undefined,

        city: p.property.city,

        areaSqm: Number(p.property.areaSqm),

        floors:
          p.property.floors ?? undefined,

        condition:
          toFrontendPropertyCondition(
            p.property.condition,
          ),

        accessibilityNotes:
          p.property.accessibilityNotes ?? undefined,
      }
    : undefined;

  // ----------------------------------------------------------
  // PROJECT STYLE PREFERENCE
  // ----------------------------------------------------------

  const projectStylePreference =
    p.stylePreference
      ? {
          mode: toFrontendStylePreferenceMode(
            p.stylePreference.mode,
          ),

          styleId:
            p.stylePreference.styleId ??
            undefined,

          styleName:
            p.stylePreference.styleName ??
            undefined,

          notes:
            p.stylePreference.notes ??
            undefined,

          spacePreferences:
            p.stylePreference.spacePreferences?.map(
              (style) => ({
                id: style.id,

                spaceId: style.spaceId,

                styleId: style.styleId,

                styleName:
                  style.styleName ??
                  undefined,

                notes:
                  style.notes ??
                  undefined,
              }),
            ) ?? [],
        }
      : undefined;

  // ----------------------------------------------------------
  // SPACES
  // ----------------------------------------------------------

  const spaces =
    p.spaces?.map((s) => {
      const spaceStyle =
        s.stylePreference;

      return {
        // Real database ID.
        // Frontend should use this ID when assigning
        // a style to a specific space.
        id: s.id,

        spaceType:
          toFrontendSpaceType(s.type),

        name:
          s.customName ||
          s.type.toLowerCase(),

        customName:
          s.customName ??
          undefined,

        stylePreference: spaceStyle
          ? {
              id: spaceStyle.id,

              spaceId:
                spaceStyle.spaceId,

              styleId:
                spaceStyle.styleId,

              styleName:
                spaceStyle.styleName ??
                undefined,

              notes:
                spaceStyle.notes ??
                undefined,
            }
          : undefined,
      };
    }) ?? [];

  // ----------------------------------------------------------
  // CUSTOMER LOCATION
  // ----------------------------------------------------------

  const customerLocation =
    p.location
      ? {
          country:
            p.location.country,

          countryCode:
            p.location.countryCode ??
            undefined,

          city:
            p.location.city,

          timezone:
            p.location.timezone,

          phone:
            p.location.phone ??
            undefined,

          phoneCountryCode:
            p.location.phoneCountryCode ??
            undefined,
        }
      : undefined;

  // ----------------------------------------------------------
  // REPRESENTATIVE
  // ----------------------------------------------------------

  const representative =
    p.representative
      ? {
          hasRepresentative:
            p.representative.hasRepresentative,

          valentiaManagedDirectly:
            p.representative
              .valentiaManagedDirectly,

          name:
            p.representative.name ??
            undefined,

          phone:
            p.representative.phone ??
            undefined,

          phoneCountryCode:
            p.representative.phoneCountryCode ??
            undefined,

          email:
            p.representative.email ??
            undefined,

          relationship:
            p.representative.relationship ??
            undefined,

          authorizationScope:
            p.representative.authorizationScope ??
            undefined,
        }
      : undefined;

  // ----------------------------------------------------------
  // SCOPE
  // ----------------------------------------------------------

  const scope =
    p.scope
      ? {
          scopeType:
            toFrontendScopeType(
              p.scope.scopeType,
            ),

          notes:
            p.scope.notes ??
            undefined,
        }
      : undefined;

  // ----------------------------------------------------------
  // BUDGET
  // ----------------------------------------------------------

  const budget =
    p.budget
      ? {
          budgetType:
            toFrontendBudgetType(
              p.budget.budgetType,
            ),

          exactAmount:
            p.budget.exactAmount !== null
              ? Number(p.budget.exactAmount)
              : undefined,

          minAmount:
            p.budget.minAmount !== null
              ? Number(p.budget.minAmount)
              : undefined,

          maxAmount:
            p.budget.maxAmount !== null
              ? Number(p.budget.maxAmount)
              : undefined,

          currency:
            p.budget.currency,
        }
      : undefined;

  // ----------------------------------------------------------
  // TIMELINE
  // ----------------------------------------------------------

  const timeline =
    p.timeline
      ? {
          deadlineType:
            toFrontendDeadlineType(
              p.timeline.deadlineType,
            ),

          targetDate:
            p.timeline.targetDate
              ? p.timeline.targetDate.toISOString()
              : undefined,

          durationDescription:
            p.timeline.durationDescription ??
            undefined,
        }
      : undefined;

  // ----------------------------------------------------------
  // DOCUMENTS
  // ----------------------------------------------------------

  const documents =
    p.documents?.map((d) => ({
      id: d.id,

      name:
        d.name,

      category:
        toFrontendDocumentCategory(
          d.category,
        ),

      url:
        d.url,

      sizeBytes:
        d.sizeBytes !== null &&
        d.sizeBytes !== undefined
          ? d.sizeBytes
          : undefined,

      uploadedAt:
        d.uploadedAt
          ? d.uploadedAt.toISOString()
          : d.createdAt.toISOString(),
    })) ?? [];

  // ----------------------------------------------------------
  // ASSIGNMENTS
  // ----------------------------------------------------------

  const assignments =
    p.assignments?.map((assignment) => ({
      engineerId:
        assignment.engineerId,

      engineerUsername:
        assignment.engineer?.username,
    })) ?? [];

  // ----------------------------------------------------------
  // FINAL FRONTEND OBJECT
  // ----------------------------------------------------------

  return {
    id: String(p.id),

    proposedTitle:
      p.title,

    // title:
    //   p.title,

    status:
      toFrontendProjectStatus(
        p.status,
      ),

    clientId:
      p.clientId,

    property,

    spaces,

    stylePreference:
      projectStylePreference,

    customerLocation,

    representative,

    scope,

    budget,

    timeline,

    documents,

    coverImage:
      p.coverImage ??
      undefined,

    createdAt:
      p.createdAt.toISOString(),

    updatedAt:
      p.updatedAt.toISOString(),

    // --------------------------------------------------------
    // Legacy / convenient flattened fields
    // --------------------------------------------------------

    propertyType:
      property?.propertyType,

    areaSqm:
      property?.areaSqm,

    city:
      property?.city,

    compound:
      property?.compound,

    // --------------------------------------------------------
    // Assignments
    // --------------------------------------------------------

    assignments,
  };
}