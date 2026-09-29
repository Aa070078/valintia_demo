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
} from "../types";

export interface WizardFormData {
  propertyType: PropertyType | "" | null;
  property: PropertyEntity;
  spaces: SpaceEntity[];
  primaryStyleId: string;
  pendingStyles: PendingStyleSelection[];
  customerLocation: CustomerLocation;
  representative: AuthorizedRepresentative;
  scope: ProjectScope;
  budget: ProjectBudget;
  timeline: TargetCompletion;
  documents: ProjectDocument[];
}

export interface StepValidationResult {
  isValid: boolean;
  errorEn?: string;
  errorAr?: string;
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
      const valid = Boolean(data.propertyType && data.propertyType.trim().length > 0);
      return {
        isValid: valid,
        errorEn: valid ? undefined : "Please select a property typology to proceed.",
        errorAr: valid ? undefined : "يرجى اختيار نوع العقار للمتابعة.",
      };
    }

    case 2: {
      // Step 2: Property Information / Specs (City required, Area > 0; compound is OPTIONAL)
      const city = data.property?.city?.trim() || "";
      const hasCity = city.length >= 2;
      const area = Number(data.property?.areaSqm);
      const hasArea = !isNaN(area) && area > 0 && area <= 50000;
      const condition = data.property?.condition?.trim() || "";
      const hasCondition = condition.length > 0;

      if (!hasCity) {
        return {
          isValid: false,
          errorEn: "Please enter the city or region in Egypt (at least 2 characters).",
          errorAr: "يرجى إدخال اسم المدينة أو المنطقة في مصر (حرفين على الأقل).",
        };
      }
      if (!hasArea) {
        return {
          isValid: false,
          errorEn: "Please enter a valid total area between 1 and 50,000 m².",
          errorAr: "يرجى إدخال إجمالي المساحة بالمتر المربع بشكل صحيح (بين 1 و 50,000 م²).",
        };
      }
      if (!hasCondition) {
        return {
          isValid: false,
          errorEn: "Please select the handover condition of the property.",
          errorAr: "يرجى تحديد حالة استلام العقار (نصف تشطيب، ع المحارة، إلخ).",
        };
      }
      return { isValid: true };
    }

    case 3: {
      // Step 3: Spaces (At least one included space with quantity > 0)
      const spaces = data.spaces || [];
      const includedSpaces = spaces.filter(
        (s) => s.included !== false && (Number(s.quantity ?? s.count ?? 0) > 0 || s.included === true)
      );

      if (includedSpaces.length === 0) {
        return {
          isValid: false,
          errorEn: "Please select at least one space or room for fit-out.",
          errorAr: "يرجى إضافة فراغ أو غرفة واحدة على الأقل للتشطيب.",
        };
      }

      // Check if any included space has quantity <= 0
      const invalidQuantitySpace = includedSpaces.find(
        (s) => Number(s.quantity ?? s.count ?? 0) <= 0
      );
      if (invalidQuantitySpace) {
        const name = invalidQuantitySpace.customName || invalidQuantitySpace.spaceType || "Space";
        return {
          isValid: false,
          errorEn: `Please specify a valid count (at least 1) for "${name}".`,
          errorAr: `يرجى تحديد عدد أو كمية صالحة (1 على الأقل) لـ "${name}".`,
        };
      }

      return { isValid: true };
    }

    case 4: {
      // Step 4: Style Discovery
      // Mode 1: Atelier / Designer curated
      const isDesigner = data.pendingStyles?.some((p) => p.targetSpaceKey === "designer_curated");
      if (isDesigner) {
        return { isValid: true };
      }

      // Mode 2: Unified (single style for all)
      const hasUnified = data.pendingStyles?.some((p) => p.targetSpaceKey === "general");
      if (hasUnified && data.primaryStyleId && data.primaryStyleId.trim().length > 0) {
        return { isValid: true };
      }

      // Mode 3: Per-space curation (Every included active space must have an assigned style)
      const activeSpaces = (data.spaces || []).filter(
        (s) => s.included !== false && (Number(s.quantity ?? s.count ?? 0) > 0 || s.included === true)
      );

      if (activeSpaces.length === 0) {
        return {
          isValid: false,
          errorEn: "Please configure your spaces in the previous step first.",
          errorAr: "يرجى تحديد الغرف في الخطوة السابقة أولاً.",
        };
      }

      // Spaces missing a style assignment
      const unassignedSpaces = activeSpaces.filter((space) => {
        return !data.pendingStyles?.some(
          (p) =>
            p.targetSpaceKey === space.id &&
            p.targetSpaceKey !== "general" &&
            p.targetSpaceKey !== "designer_curated" &&
            Boolean(p.styleId && p.styleId.trim().length > 0)
        );
      });

      if (unassignedSpaces.length > 0) {
        const missingNames = unassignedSpaces.map((s) => s.customName || s.spaceType || s.id);
        const previewMissing = missingNames.slice(0, 3).join("، ");
        const moreSuffix = missingNames.length > 3 ? ` وغيرها (${missingNames.length})` : "";
        const previewMissingEn = missingNames.slice(0, 3).join(", ");
        const moreSuffixEn = missingNames.length > 3 ? ` and ${missingNames.length - 3} more` : "";

        return {
          isValid: false,
          errorEn: `Please assign a style to all remaining spaces before proceeding (${unassignedSpaces.length} unassigned: ${previewMissingEn}${moreSuffixEn}).`,
          errorAr: `يرجى تحديد الستايل لبقية الغرف للمتابعة (${unassignedSpaces.length} غرف متبقية: ${previewMissing}${moreSuffix}).`,
        };
      }

      // If no pending styles at all
      if (!data.pendingStyles || data.pendingStyles.length === 0) {
        return {
          isValid: false,
          errorEn: "Please choose an aesthetic style direction for your residence.",
          errorAr: "يرجى اختيار التوجه الجمالي والتصميمي للوحدة.",
        };
      }

      return { isValid: true };
    }

    case 5: {
      // Step 5: Customer Location / Timezone (Country, City, Phone required)
      const country = data.customerLocation?.country?.trim() || "";
      const city = data.customerLocation?.city?.trim() || "";
      const rawPhone = data.customerLocation?.phone?.trim() || "";
      const phoneDigits = rawPhone.replace(/\D/g, "");

      if (country.length < 2) {
        return {
          isValid: false,
          errorEn: "Please specify your country of residence.",
          errorAr: "يرجى تحديد دولة الإقامة الحالية.",
        };
      }
      if (city.length < 2) {
        return {
          isValid: false,
          errorEn: "Please specify your city of residence.",
          errorAr: "يرجى كتابة مدينة الإقامة الحالية.",
        };
      }
      if (phoneDigits.length < 7) {
        return {
          isValid: false,
          errorEn: "Please provide a valid phone number (at least 7 digits).",
          errorAr: "يرجى إدخال رقم هاتف صالح للتواصل (٧ أرقام على الأقل).",
        };
      }

      return { isValid: true };
    }

    case 6: {
      // Step 6: Authorized Representative
      if (!data.representative?.hasRepresentative) {
        return { isValid: true };
      }
      const name = data.representative.name?.trim() || "";
      const rawPhone = data.representative.phone?.trim() || "";
      const phoneDigits = rawPhone.replace(/\D/g, "");

      if (name.length < 2) {
        return {
          isValid: false,
          errorEn: "Please provide the representative's full name (at least 2 characters).",
          errorAr: "يرجى إدخال اسم المفوض بمصر بالكامل (حرفين على الأقل).",
        };
      }
      if (phoneDigits.length < 7) {
        return {
          isValid: false,
          errorEn: "Please provide a valid phone number for the representative.",
          errorAr: "يرجى إدخال رقم هاتف صالح للمفوض بمصر (٧ أرقام على الأقل).",
        };
      }
      return { isValid: true };
    }

    case 7: {
      // Step 7: Scope of Work
      const scopeType = data.scope?.scopeType?.trim() || "";
      if (!scopeType) {
        return {
          isValid: false,
          errorEn: "Please select the scope of work for this commission.",
          errorAr: "يرجى تحديد حجم ونطاق أعمال التشطيب المطلوبة.",
        };
      }
      if (scopeType === "custom" || scopeType === "other") {
        const details = data.scope?.customDetails?.trim() || "";
        if (details.length < 5) {
          return {
            isValid: false,
            errorEn: "Please provide brief details for your custom scope of work (at least 5 characters).",
            errorAr: "يرجى كتابة تفاصيل ونطاق العمل المطلوب (٥ أحرف على الأقل).",
          };
        }
      }
      return { isValid: true };
    }

    case 8: {
      // Step 8: Budget
      const type = data.budget?.budgetType;
      if (type === "undecided") {
        return { isValid: true };
      }
      if (type === "exact") {
        const exact = Number(data.budget?.exactAmount);
        const valid = !isNaN(exact) && exact > 0;
        return {
          isValid: valid,
          errorEn: valid ? undefined : "Please enter a valid target budget amount greater than 0.",
          errorAr: valid ? undefined : "يرجى إدخال قيمة الميزانية التقديرية بشكل صحيح (أكبر من 0).",
        };
      }
      if (type === "range") {
        const min = Number(data.budget?.minAmount);
        const max = Number(data.budget?.maxAmount);
        const valid = !isNaN(min) && !isNaN(max) && min > 0 && max >= min;
        return {
          isValid: valid,
          errorEn: valid
            ? undefined
            : !min || min <= 0
            ? "Please specify a minimum budget amount greater than 0."
            : "The maximum budget must be greater than or equal to the minimum budget.",
          errorAr: valid
            ? undefined
            : !min || min <= 0
            ? "يرجى تحديد حد أدنى للميزانية أكبر من 0."
            : "يجب أن يكون الحد الأقصى للميزانية أكبر من أو يساوي الحد الأدنى.",
        };
      }
      return {
        isValid: false,
        errorEn: "Please select a budget preference or choose undecided.",
        errorAr: "يرجى تحديد تفضيل الميزانية أو اختيار غير محدد.",
      };
    }

    case 9: {
      // Step 9: Target Completion
      const deadlineType = data.timeline?.deadlineType?.trim() || "";
      if (!deadlineType) {
        return {
          isValid: false,
          errorEn: "Please select your target completion timeline.",
          errorAr: "يرجى تحديد الموعد المستهدف للتسليم.",
        };
      }
      if (deadlineType === "duration") {
        const desc = data.timeline?.durationDescription?.trim() || "";
        if (!desc) {
          return {
            isValid: false,
            errorEn: "Please specify the expected project duration.",
            errorAr: "يرجى تحديد المدة التقديرية المتوقعة للمشروع.",
          };
        }
      }
      if (deadlineType === "specific_date") {
        const targetDate = data.timeline?.targetDate?.trim() || "";
        if (!targetDate) {
          return {
            isValid: false,
            errorEn: "Please select your specific target delivery date.",
            errorAr: "يرجى تحديد التاريخ المستهدف لتسليم المشروع.",
          };
        }
      }
      return { isValid: true };
    }

    case 10: {
      // Step 10: Drawings / Documents (Optional)
      return { isValid: true };
    }

    case 11: {
      // Step 11: Review & Submit (All steps 1 through 10 must pass)
      for (let s = 1; s <= 10; s++) {
        const res = validateStep(s, data);
        if (!res.isValid) {
          return {
            isValid: false,
            errorEn: `Step ${s} is incomplete: ${res.errorEn}`,
            errorAr: `الخطوة ${s} غير مكتملة: ${res.errorAr}`,
          };
        }
      }
      return { isValid: true };
    }

    default:
      return { isValid: true };
  }
}

/**
 * Returns the highest unlocked step (1 to 11) for sequential forward progression.
 * Evaluates steps 1 through 10 sequentially. Returns the first invalid step, or 11 if all pass.
 */
export function getMaxUnlockedStep(data: WizardFormData): number {
  for (let s = 1; s <= 10; s++) {
    const res = validateStep(s, data);
    if (!res.isValid) {
      return s;
    }
  }
  return 11;
}

/**
 * Default spaces template for fresh real customers and demo showcase.
 */
export const DEFAULT_SPACES_LIST: SpaceEntity[] = [
  { id: "living", spaceType: "living", customName: "Living Room & Salon", included: false, quantity: 0 },
  { id: "dining", spaceType: "dining", customName: "Formal Dining Area", included: false, quantity: 0 },
  { id: "kitchen", spaceType: "kitchen", customName: "Chef Kitchen & Pantry", included: false, quantity: 0 },
  { id: "master_bedroom", spaceType: "master_bedroom", customName: "Master Suite", included: false, quantity: 0 },
  { id: "guest_bedrooms", spaceType: "guest_bedrooms", customName: "Guest Bedrooms", included: false, quantity: 0 },
  { id: "bathrooms", spaceType: "bathrooms", customName: "Bathrooms & Spa", included: false, quantity: 0 },
  { id: "terrace", spaceType: "terrace", customName: "Private Terrace & Loggia", included: false, quantity: 0 },
  { id: "office", spaceType: "office", customName: "Home Office & Library", included: false, quantity: 0 },
];

/**
 * Showcase pre-filled state for Demo/Mock mode.
 */
export const DEMO_SHOWCASE_WIZARD_STATE: WizardFormData = {
  propertyType: "villa",
  primaryStyleId: "japandi",
  pendingStyles: [
    {
      targetSpaceKey: "general",
      styleId: "japandi",
      styleName: "Japandi & Warm Minimal",
      referenceImages: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      ],
      notes: "",
    },
  ],
  spaces: [
    { id: "living", spaceType: "living", customName: "Living Room & Salon", included: true, quantity: 1 },
    { id: "dining", spaceType: "dining", customName: "Formal Dining Area", included: true, quantity: 1 },
    { id: "kitchen", spaceType: "kitchen", customName: "Chef Kitchen & Pantry", included: true, quantity: 1 },
    { id: "master_bedroom", spaceType: "master_bedroom", customName: "Master Suite", included: true, quantity: 1 },
    { id: "guest_bedrooms", spaceType: "guest_bedrooms", customName: "Guest Bedrooms", included: true, quantity: 3 },
    { id: "bathrooms", spaceType: "bathrooms", customName: "Bathrooms & Spa", included: true, quantity: 4 },
    { id: "terrace", spaceType: "terrace", customName: "Private Terrace & Loggia", included: true, quantity: 2 },
    { id: "office", spaceType: "office", customName: "Home Office & Library", included: false, quantity: 0 },
  ],
  property: {
    propertyType: "villa",
    compound: "Palm Hills Golf Extensions",
    city: "New Cairo",
    areaSqm: 480,
    floors: 2,
    condition: "semi_finished",
    accessibilityNotes: "",
  },
  customerLocation: {
    country: "Egypt",
    countryCode: "EG",
    city: "Cairo",
    timezone: "Africa/Cairo (GMT+2)",
    phone: "+20 100 123 4567",
    phoneCountryCode: "+20",
  },
  representative: {
    hasRepresentative: false,
    valentiaManagedDirectly: true,
    phone: "",
    phoneCountryCode: "+20",
  },
  scope: {
    scopeType: "full_fitout",
    customDetails: "",
  },
  budget: {
    budgetType: "range",
    minAmount: 2500000,
    maxAmount: 4500000,
    currency: "EGP",
  },
  timeline: {
    deadlineType: "duration",
    durationDescription: "6 Months (Standard)",
  },
  documents: [],
};

/**
 * Initial empty state for real customer in API mode.
 * Required fields begin empty so Step 1 is the first incomplete step.
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
};

/**
 * Centralized initial state selector based on runtime flag.
 */
export function getInitialWizardState(): WizardFormData {
  const isMockEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCK_FALLBACK === "true";
  return isMockEnabled ? DEMO_SHOWCASE_WIZARD_STATE : INITIAL_REAL_WIZARD_STATE;
}
