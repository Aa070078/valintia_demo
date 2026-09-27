import { z } from "zod";

export const propertyTypeEnum = z.enum([
  "villa",
  "apartment",
  "duplex",
  "penthouse",
  "commercial",
  "other",
]);

export const propertyConditionEnum = z.enum([
  "red_brick",
  "semi_finished",
  "occupied",
  "under_construction",
]);

export const propertyEntitySchema = z.object({
  propertyType: propertyTypeEnum,
  compound: z.string().optional(),
  governorate: z.string().optional(),
  city: z.string().min(1, "City / Area is required"),
  areaSqm: z
    .number()
    .positive("Area must be positive")
    .max(10000, "Area must be realistic (< 10,000 m²)"),
  floors: z.number().int().min(1).max(20).optional(),
  condition: propertyConditionEnum.optional(),
  accessibilityNotes: z.string().optional(),
});

export const spaceStylePreferenceSchema = z.object({
  styleId: z.string(),
  styleName: z.string(),
  referenceImages: z.array(z.string()),
  notes: z.string().optional(),
});

export const spaceEntitySchema = z.object({
  id: z.string(),
  spaceType: z.string().optional(),
  name: z.string().optional(),
  customName: z.string().optional(),
  quantity: z.number().int().min(0).optional(),
  count: z.number().int().min(0).optional(),
  included: z.boolean(),
  stylePreference: spaceStylePreferenceSchema.optional(),
  notes: z.string().optional(),
});

export const customerLocationSchema = z.object({
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  timezone: z.string().min(1, "Timezone is required"),
});

export const representativeSchema = z.object({
  hasRepresentative: z.boolean(),
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  relationship: z.string().optional(),
  authorizationScope: z.string().optional(),
  valentiaManagedDirectly: z.boolean(),
});

export const projectScopeSchema = z.object({
  scopeType: z.enum(["full_fitout", "renovation", "interior_design", "other"]),
  customDetails: z.string().optional(),
  notes: z.string().optional(),
});

export const projectBudgetSchema = z.object({
  budgetType: z.enum(["exact", "range", "undecided"]),
  exactAmount: z.number().positive().optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  currency: z.string().default("EGP"),
});

export const targetCompletionSchema = z.object({
  deadlineType: z.enum(["specific_date", "duration", "no_deadline"]),
  targetDate: z.string().optional(),
  durationDescription: z.string().optional(),
});

export const projectDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(["architectural", "engineering", "mep", "boq", "other"]),
  url: z.string(),
  sizeBytes: z.number().optional(),
  uploadedAt: z.string(),
});

export const createProjectSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  property: propertyEntitySchema,
  spaces: z.array(spaceEntitySchema).min(1, "Select at least one space"),
  customerLocation: customerLocationSchema.optional(),
  representative: representativeSchema.optional(),
  scope: projectScopeSchema.optional(),
  budget: projectBudgetSchema.optional(),
  timeline: targetCompletionSchema.optional(),
  documents: z.array(projectDocumentSchema).optional(),
  notes: z.string().optional(),
});

export type CreateProjectSchemaValues = z.infer<typeof createProjectSchema>;

export const projectFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  propertyType: propertyTypeEnum,
  areaSqm: z
    .number()
    .positive("Area must be positive")
    .max(10000, "Area must be realistic (< 10,000 m²)"),
  city: z.string().min(2, "City / Area is required").max(100),
  compound: z.string().max(100).optional(),
  spaces: z.array(spaceEntitySchema).min(1, "Select at least one space"),
  notes: z.string().max(1000).optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
