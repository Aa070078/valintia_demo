import { z } from "zod";

export const propertyTypeEnum = z.enum([
  "villa",
  "apartment",
  "duplex",
  "penthouse",
  "commercial",
  "other",
]);

export const propertyInfoSchema = z.object({
  title: z
    .string()
    .min(3, "Project title must be at least 3 characters")
    .max(100, "Project title cannot exceed 100 characters"),
  propertyType: propertyTypeEnum,
  areaSqm: z
    .number()
    .positive("Area must be greater than 0")
    .max(10000, "Area must be less than 10,000 sqm"),
  city: z.string().min(2, "City or area is required"),
  compound: z.string().optional(),
});

export const spaceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  included: z.boolean(),
  count: z.number().int().min(0),
});

export const projectFormSchema = propertyInfoSchema.extend({
  spaces: z.array(spaceItemSchema).min(1, "Select at least one space"),
  notes: z
    .string()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional(),
});

export type PropertyInfoFormValues = z.infer<typeof propertyInfoSchema>;
export type ProjectFormValues = z.infer<typeof projectFormSchema>;
