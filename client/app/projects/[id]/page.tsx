"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PencilSimple, PaperPlaneTilt } from "@phosphor-icons/react";
import { CustomerShell } from "@/components/layout/customer-shell";
import { EditorialHeader } from "@/features/projects/components/editorial-header";
import { StatusChip } from "@/features/projects/components/status-chip";
import { ProjectReviewCard } from "@/features/projects/components/project-review-card";
import {
  useProject,
  useSubmitProject,
} from "@/features/projects/hooks/use-projects";
import { Spinner } from "@/components/ui/spinner";

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id as string;

  const { data: project, isLoading, error } = useProject(id);
  const submitMutation = useSubmitProject(id);

  if (isLoading) {
    return (
      <CustomerShell>
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </CustomerShell>
    );
  }

  if (error || !project) {
    return (
      <CustomerShell>
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <h2 className="font-serif text-2xl font-medium text-foreground">
            Project Not Found
          </h2>
          <p className="text-sm text-muted-foreground">
            The project you requested does not exist or has been moved.
          </p>
          <Link
            href="/projects"
            className="mt-4 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground"
          >
            Back to Portfolio
          </Link>
        </div>
      </CustomerShell>
    );
  }

  const isDraft = project.status === "draft";

  // Extract style name from notes if saved in the form "Style: X. ..."
  const styleMatch = project.notes?.match(/Style:\s*([^.]+)/i);
  const detectedStyle = styleMatch ? styleMatch[1].trim() : "Modern";

  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync();
    } catch (err) {
      console.error("Failed to submit project", err);
    }
  };

  return (
    <CustomerShell>
      <div className="mx-auto max-w-5xl flex flex-col gap-10">
        {/* Navigation & Status Header */}
        <div className="flex flex-col gap-6 border-b border-border/80 pb-8">
          <div className="flex items-center justify-between">
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              <ArrowLeft
                size={14}
                className="transition-transform group-hover:-translate-x-1"
              />
              <span>Back to Portfolio</span>
            </Link>

            <StatusChip status={project.status} />
          </div>

          <EditorialHeader
            eyebrow={`Project Reference · ${project.id}`}
            title={project.title}
            description={`Created on ${new Date(
              project.createdAt
            ).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })} · ${project.city}`}
            action={
              isDraft && (
                <div className="flex items-center gap-3">
                  <Link
                    href={`/projects/${project.id}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-foreground shadow-2xs transition-all hover:bg-muted"
                  >
                    <PencilSimple size={13} />
                    <span>Edit Project</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Spinner className="mr-1.5 h-3.5 w-3.5" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <PaperPlaneTilt size={13} weight="bold" />
                        <span>Submit to Engineer</span>
                      </>
                    )}
                  </button>
                </div>
              )
            }
          />
        </div>

        {/* Project Review Content */}
        <ProjectReviewCard
          title={project.title}
          propertyType={project.propertyType}
          areaSqm={project.areaSqm}
          city={project.city}
          compound={project.compound}
          styleName={detectedStyle}
          spaces={project.spaces || []}
          notes={project.notes}
          onEditProperty={
            isDraft
              ? () => router.push(`/projects/${project.id}/edit`)
              : undefined
          }
          onEditSpaces={
            isDraft
              ? () => router.push(`/projects/${project.id}/edit`)
              : undefined
          }
          onEditStyle={
            isDraft
              ? () => router.push(`/projects/${project.id}/edit`)
              : undefined
          }
        />
      </div>
    </CustomerShell>
  );
}
