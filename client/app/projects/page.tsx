"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import { CustomerShell } from "@/components/layout/customer-shell";
import { EditorialHero } from "@/features/projects/components/editorial-hero";
import { EditorialHeader } from "@/features/projects/components/editorial-header";
import { ProjectsGrid } from "@/features/projects/components/projects-grid";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const { t, isRTL } = useLanguage();
  const { data: projects, isLoading, isError, error, refetch } = useProjects();

  return (
    <CustomerShell>
      <div className="flex flex-col gap-14 sm:gap-20">
        {/* Architectural Editorial Hero Banner */}
        <EditorialHero />

        {/* Portfolio Section */}
        <div className="flex flex-col gap-8">
          <EditorialHeader
            eyebrow={t("portfolio.eyebrow")}
            title={t("portfolio.title")}
            description={t("portfolio.description")}
            action={
              <Link
                href="/projects/new"
                className={cn(
                  "group inline-flex items-center gap-2.5 rounded-full bg-primary px-6 py-3 text-xs text-primary-foreground shadow-xs transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                  isRTL ? "tracking-normal font-sans font-bold" : "font-semibold uppercase tracking-[0.14em]"
                )}
              >
                <Plus size={14} weight="bold" />
                <span>{t("nav.start_project")}</span>
              </Link>
            }
          />

          <ProjectsGrid
            projects={projects}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={() => refetch()}
          />
        </div>
      </div>
    </CustomerShell>
  );
}
