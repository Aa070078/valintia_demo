import * as React from "react";
import type { UseFormReturn } from "react-hook-form";
import type { PropertyType } from "../types";
import type { ProjectFormValues } from "../schemas/project.schema";
import { ImageSelectCard } from "./image-select-card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const PROPERTY_TYPES: Array<{
  id: PropertyType;
  title: string;
  description: string;
  imageSrc: string;
}> = [
  {
    id: "villa",
    title: "Villa",
    description: "Standalone luxury residences, twin houses, and townhouses.",
    imageSrc:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "apartment",
    title: "Apartment",
    description: "Single-level contemporary residences and flats.",
    imageSrc:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "duplex",
    title: "Duplex",
    description: "Multi-level apartments with dedicated internal stairs.",
    imageSrc:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "penthouse",
    title: "Penthouse",
    description: "Top-floor units with expansive private terraces.",
    imageSrc:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "commercial",
    title: "Commercial / Office",
    description: "Administrative workspaces, studios, and retail boutiques.",
    imageSrc:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "other",
    title: "Bespoke Space",
    description: "Chalets, vacation homes, and specialized properties.",
    imageSrc:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
  },
];

interface PropertyInfoFormProps {
  form: UseFormReturn<ProjectFormValues>;
}

export function PropertyInfoForm({ form }: PropertyInfoFormProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const selectedType = watch("propertyType");

  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="h-px w-5 bg-foreground/40" />
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/75">
            Select Property Type *
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {PROPERTY_TYPES.map((type) => (
            <ImageSelectCard
              key={type.id}
              title={type.title}
              description={type.description}
              imageSrc={type.imageSrc}
              selected={selectedType === type.id}
              onClick={() =>
                setValue("propertyType", type.id, { shouldValidate: true })
              }
            />
          ))}
        </div>
        {errors.propertyType && (
          <p className="mt-2 text-xs text-destructive" role="alert">
            {errors.propertyType.message}
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
        <h3 className="font-serif text-xl font-medium text-foreground mb-6">
          Core Property Specifications
        </h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="title">Project / Residence Name *</FieldLabel>
            <Input
              id="title"
              placeholder="e.g. Palm Hills Residence, Zayed Duplex"
              className="rounded-xl border-border/80 bg-background/60"
              {...register("title")}
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title && (
              <FieldError errors={[{ message: errors.title.message }]} />
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="areaSqm">Total Area (m²) *</FieldLabel>
            <Input
              id="areaSqm"
              type="number"
              placeholder="e.g. 350"
              className="rounded-xl border-border/80 bg-background/60"
              {...register("areaSqm", { valueAsNumber: true })}
              aria-invalid={Boolean(errors.areaSqm)}
            />
            {errors.areaSqm && (
              <FieldError errors={[{ message: errors.areaSqm.message }]} />
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="city">City / Region *</FieldLabel>
            <Input
              id="city"
              placeholder="e.g. Sheikh Zayed, New Cairo, North Coast"
              className="rounded-xl border-border/80 bg-background/60"
              {...register("city")}
              aria-invalid={Boolean(errors.city)}
            />
            {errors.city && (
              <FieldError errors={[{ message: errors.city.message }]} />
            )}
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="compound">Compound / Gated Community (Optional)</FieldLabel>
            <Input
              id="compound"
              placeholder="e.g. Mivida, Allegria, Swan Lake, SODIC"
              className="rounded-xl border-border/80 bg-background/60"
              {...register("compound")}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
