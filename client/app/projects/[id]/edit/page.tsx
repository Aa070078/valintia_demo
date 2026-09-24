"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check } from "@phosphor-icons/react";
import { CustomerShell } from "@/components/layout/customer-shell";
import { EditorialHeader } from "@/features/projects/components/editorial-header";
import { PropertyInfoForm } from "@/features/projects/components/property-info-form";
import { SpacesSelector } from "@/features/projects/components/spaces-selector";
import {
  projectFormSchema,
  type ProjectFormValues,
} from "@/features/projects/schemas/project.schema";
import {
  useProject,
  useUpdateProject,
} from "@/features/projects/hooks/use-projects";
import { Spinner } from "@/components/ui/spinner";

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id as string;

  const { data: project, isLoading } = useProject(id);
  const updateMutation = useUpdateProject(id);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      propertyType: "villa",
      areaSqm: 250,
      city: "",
      compound: "",
      spaces: [],
      notes: "",
    },
  });

  const { reset, setValue, handleSubmit } = form;
  const currentSpaces = useWatch({ control: form.control, name: "spaces" }) || [];
  const currentNotes = useWatch({ control: form.control, name: "notes" }) || "";

  React.useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        propertyType: project.propertyType,
        areaSqm: project.areaSqm,
        city: project.city,
        compound: project.compound || "",
        spaces: project.spaces || [],
        notes: project.notes || "",
      });
    }
  }, [project, reset]);

  if (isLoading) {
    return (
      <CustomerShell>
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </CustomerShell>
    );
  }

  if (!project) {
    return (
      <CustomerShell>
        <div className="py-20 text-center">
          <h2 className="font-serif text-2xl font-medium text-foreground">
            Project Not Found
          </h2>
          <Link
            href="/projects"
            className="mt-4 inline-block rounded-full bg-primary px-6 py-2 text-xs font-semibold uppercase text-primary-foreground"
          >
            Back to Portfolio
          </Link>
        </div>
      </CustomerShell>
    );
  }

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      await updateMutation.mutateAsync({
        title: data.title,
        propertyType: data.propertyType,
        areaSqm: Number(data.areaSqm),
        city: data.city,
        compound: data.compound || undefined,
        spaces: data.spaces,
        notes: data.notes,
      });
      router.push(`/projects/${id}`);
    } catch (err) {
      console.error("Failed to update project", err);
    }
  };

  return (
    <CustomerShell>
      <div className="mx-auto max-w-5xl flex flex-col gap-10">
        <div className="flex flex-col gap-6 border-b border-border/80 pb-8">
          <div className="flex items-center justify-between">
            <Link
              href={`/projects/${id}`}
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              <ArrowLeft
                size={14}
                className="transition-transform group-hover:-translate-x-1"
              />
              <span>Back to Project Overview</span>
            </Link>

            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Edit Mode
            </span>
          </div>

          <EditorialHeader
            eyebrow="Modify Specifications"
            title="Edit Project Details"
            description="Adjust your foundational property dimensions, unit category, and included spaces."
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-12">
          <PropertyInfoForm form={form} />

          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-2xl font-medium text-foreground">
              Spatial Scope & Spaces
            </h3>
            <SpacesSelector
              spaces={currentSpaces}
              onChange={(newSpaces) => setValue("spaces", newSpaces)}
            />
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col gap-3 shadow-xs">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Special Directives & Notes
            </label>
            <textarea
              rows={3}
              value={currentNotes}
              onChange={(e) => setValue("notes", e.target.value)}
              placeholder="e.g. Preferred wood finishes, lighting preferences, etc."
              className="w-full rounded-xl border border-border/80 bg-background p-4 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border/80 pt-6">
            <Link
              href={`/projects/${id}`}
              className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {updateMutation.isPending ? (
                <>
                  <Spinner className="mr-1.5 h-4 w-4" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check size={14} weight="bold" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </CustomerShell>
  );
}
