import * as React from "react";
import { WarningCircle, ArrowClockwise } from "@phosphor-icons/react";
import type { Project } from "../types";
import { ProjectCard } from "./project-card";
import { EmptyProjectsState } from "./empty-projects-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n/language-context";

interface ProjectsGridProps {
  projects?: Project[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function ProjectsGrid({
  projects,
  isLoading,
  isError,
  error,
  onRetry,
}: ProjectsGridProps) {
  const { t } = useLanguage();
  const [filter, setFilter] = React.useState<"all" | "active" | "review" | "draft">("all");

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-0 shadow-xs"
          >
            <Skeleton className="aspect-[16/10] w-full" />
            <div className="flex flex-col gap-3.5 p-6">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border/80 bg-card p-10 text-center sm:p-14 shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <WarningCircle size={24} weight="bold" />
        </div>
        <h3 className="font-serif text-2xl font-medium text-foreground">
          Unable to Load Portfolio Projects
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
          {error?.message ||
            "A network or server connectivity issue occurred while retrieving your project records."}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground shadow-2xs transition-all hover:bg-muted cursor-pointer active:scale-[0.98]"
          >
            <ArrowClockwise size={14} weight="bold" />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    );
  }

  // 3. Empty State
  if (!projects || projects.length === 0) {
    return <EmptyProjectsState />;
  }

  // Filter projects
  const filtered = projects.filter((p) => {
    if (filter === "active") {
      return (
        p.status === "execution" ||
        p.status === "boq_confirmed" ||
        p.status === "design_in_progress"
      );
    }
    if (filter === "review") {
      return (
        p.status === "submitted" ||
        p.status === "initial_review" ||
        p.status === "under_engineer_review" ||
        p.status === "meeting_scheduled" ||
        p.status === "site_visit_scheduled"
      );
    }
    if (filter === "draft") {
      return p.status === "draft";
    }
    return true;
  });

  // 4. Populated State with Filter Tabs
  return (
    <div className="flex flex-col gap-6">
      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2">
          {(
            [
              { key: "all", label: t("portfolio.tab_all"), count: projects.length },
              {
                key: "active",
                label: t("portfolio.tab_active"),
                count: projects.filter((p) =>
                  ["execution", "boq_confirmed", "design_in_progress"].includes(p.status)
                ).length,
              },
              {
                key: "review",
                label: t("portfolio.tab_review"),
                count: projects.filter((p) =>
                  [
                    "under_engineer_review",
                    "meeting_scheduled",
                    "site_visit_scheduled",
                  ].includes(p.status)
                ).length,
              },
              {
                key: "draft",
                label: t("portfolio.tab_draft"),
                count: projects.filter((p) => p.status === "draft").length,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide transition-all cursor-pointer ${
                filter === tab.key
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  filter === tab.key
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-border text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <span className="text-xs text-muted-foreground">
          {t("portfolio.showing")} {filtered.length} {t("portfolio.of_properties")} ({projects.length})
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground rounded-2xl border border-dashed border-border/70 bg-card/40">
          No projects found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
