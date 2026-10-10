import type {
  PropertyType,
  PropertyEntity,
  SpaceEntity,
  PendingStyleSelection,
  CustomerLocation,
  AuthorizedRepresentative,
  ProjectScope,
  ProjectBudget,
  TargetCompletion,
  ProjectDocument,
} from "../types"

export interface WizardFormData {
  propertyType: PropertyType | "" | null
  property: PropertyEntity
  spaces: SpaceEntity[]
  primaryStyleId: string
  pendingStyles: PendingStyleSelection[]
  customerLocation: CustomerLocation
  representative: AuthorizedRepresentative
  scope: ProjectScope
  budget: ProjectBudget
  timeline: TargetCompletion
  documents: ProjectDocument[]
}

export interface StepValidationResult {
  isValid: boolean
  errorEn?: string
  errorAr?: string
}

/**
 * Validates a single wizard step (1 to 11).
 * Bilingual error strings (English & Egyptian Arabic).
 */
export function validateStep(
  step: number,
  data: WizardFormData
): StepValidationResult {
  switch (step) {
    case 1: {
      // Step 1: Property Type (Selected value required)
      const valid = Boolean(
        data.propertyType && data.propertyType.trim().length > 0
      )
      return {
        isValid: valid,
        errorEn: valid
          ? undefined
          : "Please select a property typology to proceed.",
        errorAr: valid ? undefined : "يرجى اختيار نوع العقار للمتابعة.",
      }
    }

    case 2: {
      // Step 2: Property Information / Specs (City required, Area > 0; compound is OPTIONAL)
      const hasCity = Boolean(
        data.property?.city && data.property.city.trim().length > 0
      )
      const hasArea = Boolean(
        data.property?.areaSqm && Number(data.property.areaSqm) > 0
      )
      const valid = hasCity && hasArea
      return {
        isValid: valid,
        errorEn: valid
          ? undefined
          : !hasCity
            ? "Please enter the city or region in Egypt."
            : "Please enter a valid total area (m²).",
        errorAr: valid
          ? undefined
          : !hasCity
            ? "يرجى إدخال المدينة أو المنطقة في مصر."
            : "يرجى إدخال إجمالي المساحة بالمتر المربع (م²).",
      }
    }

    case 3: {
      // Step 3: Spaces (At least one included space with quantity > 0)
      const valid = Boolean(
        data.spaces &&
        data.spaces.some(
          (s) => s.included && (Number(s.quantity) > 0 || Number(s.count) > 0)
        )
      )
      return {
        isValid: valid,
        errorEn: valid
          ? undefined
          : "Please select at least one space or room for fit-out.",
        errorAr: valid
          ? undefined
          : "يرجى إضافة فراغ أو غرفة واحدة على الأقل للتشطيب.",
      }
    }

    case 4: {
      // Step 4: Style Discovery (Primary style OR pending style/reference selection required)
      const hasPrimary = Boolean(
        data.primaryStyleId && data.primaryStyleId.trim().length > 0
      )
      const hasPending = Boolean(
        data.pendingStyles && data.pendingStyles.length > 0
      )
      const valid = hasPrimary || hasPending
      return {
        isValid: valid,
        errorEn: valid
          ? undefined
          : "Please choose an aesthetic style direction.",
        errorAr: valid
          ? undefined
          : "يرجى اختيار التوجه الجمالي والتصميمي للوحدة.",
      }
    }

    case 5: {
      // Step 5: Customer Location / Timezone (Country, City, Phone required)
      const hasCountry = Boolean(
        data.customerLocation?.country &&
        data.customerLocation.country.trim().length > 0
      )
      const hasCity = Boolean(
        data.customerLocation?.city &&
        data.customerLocation.city.trim().length > 0
      )
      const hasPhone = Boolean(
        data.customerLocation?.phone &&
        data.customerLocation.phone.trim().replace(/\s+/g, "").length >= 7
      )
      const valid = hasCountry && hasCity && hasPhone
      return {
        isValid: valid,
        errorEn: valid
          ? undefined
          : "Please provide your residence country, city, and a valid phone number.",
        errorAr: valid
          ? undefined
          : "يرجى إدخال دولة الإقامة والمدينة ورقم هاتف صالح للتواصل.",
      }
    }

    case 6: {
      // Step 6: Authorized Representative (If representative selected, name & phone required; if false, valid)
      if (!data.representative?.hasRepresentative) {
        return { isValid: true }
      }
      const hasName = Boolean(
        data.representative.name && data.representative.name.trim().length >= 2
      )
      const hasPhone = Boolean(
        data.representative.phone &&
        data.representative.phone.trim().replace(/\s+/g, "").length >= 7
      )
      const valid = hasName && hasPhone
      return {
        isValid: valid,
        errorEn: valid
          ? undefined
          : "Please provide the representative's full name and valid phone number.",
        errorAr: valid
          ? undefined
          : "يرجى إدخال اسم ورقم هاتف المفوض بمصر للمتابعة.",
      }
    }

    case 7: {
      // Step 7: Scope of Work (scopeType required)
      const valid = Boolean(
        data.scope?.scopeType && data.scope.scopeType.trim().length > 0
      )
      return {
        isValid: valid,
        errorEn: valid
          ? undefined
          : "Please select the scope of work for this commission.",
        errorAr: valid
          ? undefined
          : "يرجى تحديد حجم ونطاق أعمال التشطيب المطلوبة.",
      }
    }

    case 8: {
      // Step 8: Budget (exact: exactAmount > 0; range: min > 0 and max >= min; undecided: valid)
      const type = data.budget?.budgetType
      if (type === "undecided") {
        return { isValid: true }
      }
      if (type === "exact") {
        const exact = Number(data.budget?.exactAmount)
        const valid = !isNaN(exact) && exact > 0
        return {
          isValid: valid,
          errorEn: valid
            ? undefined
            : "Please enter a valid target budget amount.",
          errorAr: valid
            ? undefined
            : "يرجى إدخال قيمة الميزانية التقديرية بشكل صحيح.",
        }
      }
      if (type === "range") {
        const min = Number(data.budget?.minAmount)
        const max = Number(data.budget?.maxAmount)
        const valid = !isNaN(min) && !isNaN(max) && min > 0 && max >= min
        return {
          isValid: valid,
          errorEn: valid
            ? undefined
            : "Please specify a valid budget range where maximum is greater than or equal to minimum.",
          errorAr: valid
            ? undefined
            : "يرجى تحديد مدى ميزانية صالح بحيث يكون الحد الأقصى أكبر من أو يساوي الحد الأدنى.",
        }
      }
      return {
        isValid: false,
        errorEn: "Please select a budget preference or choose undecided.",
        errorAr: "يرجى تحديد تفضيل الميزانية أو اختيار غير محدد.",
      }
    }

    case 9: {
      // Step 9: Target Completion (deadlineType selected)
      const valid = Boolean(
        data.timeline?.deadlineType &&
        data.timeline.deadlineType.trim().length > 0
      )
      return {
        isValid: valid,
        errorEn: valid
          ? undefined
          : "Please select your target completion timeline.",
        errorAr: valid ? undefined : "يرجى تحديد الموعد المستهدف للتسليم.",
      }
    }

    case 10: {
      // Step 10: Drawings / Documents (Optional)
      return { isValid: true }
    }

    case 11: {
      // Step 11: Review & Submit (All steps 1 through 10 must pass)
      for (let s = 1; s <= 10; s++) {
        const res = validateStep(s, data)
        if (!res.isValid) {
          return {
            isValid: false,
            errorEn: `Step ${s} is incomplete: ${res.errorEn}`,
            errorAr: `الخطوة ${s} غير مكتملة: ${res.errorAr}`,
          }
        }
      }
      return { isValid: true }
    }

    default:
      return { isValid: true }
  }
}

/**
 * Returns the highest unlocked step (1 to 11) for sequential forward progression.
 * Evaluates steps 1 through 10 sequentially. Returns the first invalid step, or 11 if all pass.
 */
export function getMaxUnlockedStep(data: WizardFormData): number {
  for (let s = 1; s <= 10; s++) {
    const res = validateStep(s, data)
    if (!res.isValid) {
      return s
    }
  }
  return 11
}

/**
 * Default spaces template for fresh real customers .
 */
export const DEFAULT_SPACES_LIST: SpaceEntity[] = [
  {
    id: "living",
    spaceType: "living",
    customName: "Living Room & Salon",
    included: false,
    quantity: 0,
  },
  {
    id: "dining",
    spaceType: "dining",
    customName: "Formal Dining Area",
    included: false,
    quantity: 0,
  },
  {
    id: "kitchen",
    spaceType: "kitchen",
    customName: "Chef Kitchen & Pantry",
    included: false,
    quantity: 0,
  },
  {
    id: "master_bedroom",
    spaceType: "master_bedroom",
    customName: "Master Suite",
    included: false,
    quantity: 0,
  },
  {
    id: "guest_bedrooms",
    spaceType: "guest_bedrooms",
    customName: "Guest Bedrooms",
    included: false,
    quantity: 0,
  },
  {
    id: "bathrooms",
    spaceType: "bathrooms",
    customName: "Bathrooms & Spa",
    included: false,
    quantity: 0,
  },
  {
    id: "terrace",
    spaceType: "terrace",
    customName: "Private Terrace & Loggia",
    included: false,
    quantity: 0,
  },
  {
    id: "office",
    spaceType: "office",
    customName: "Home Office & Library",
    included: false,
    quantity: 0,
  },
]

/**
 * Showcase pre-filled state for Demo/Mock mode.
 */
export const INITIAL_REAL_WIZARD_STATE: WizardFormData = {
  propertyType: "" as unknown as PropertyType,
  primaryStyleId: "",
  pendingStyles: [],
  spaces: DEFAULT_SPACES_LIST,
  property: {
    propertyType: "villa",
    compound: "",
    city: "",
    areaSqm: 0,
    floors: 1,
    condition: "semi_finished",
    accessibilityNotes: "",
  },
  customerLocation: {
    country: "",
    countryCode: "EG",
    city: "",
    timezone: "",
    phone: "",
    phoneCountryCode: "+20",
  },
  representative: {
    hasRepresentative: false,
    valentiaManagedDirectly: true,
    phone: "",
    phoneCountryCode: "+20",
  },
  scope: {
    scopeType: "" as unknown as ProjectScope["scopeType"],
    customDetails: "",
  },
  budget: {
    budgetType: "undecided",
    currency: "EGP",
  },
  timeline: {
    deadlineType: "" as unknown as TargetCompletion["deadlineType"],
    durationDescription: "",
  },
  documents: [],
}

/**
 * Centralized initial state selector for new project forms.
 */
export function getInitialWizardState(): WizardFormData {
  return structuredClone(INITIAL_REAL_WIZARD_STATE)
}
