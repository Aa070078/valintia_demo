"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  PaperPlaneTilt,
  SquaresFour,
  HouseLine,
  UsersThree,
  FilePdf,
} from "@phosphor-icons/react";
import { CustomerShell } from "@/components/layout/customer-shell";
import { EditorialHeader } from "@/features/projects/components/editorial-header";
import { StatusChip } from "@/features/projects/components/status-chip";
import { ProjectJourney } from "@/features/projects/components/dashboard/project-journey";
import { ProjectOverviewTab } from "@/features/projects/components/dashboard/project-overview-tab";
import { ProjectSpacesTab } from "@/features/projects/components/dashboard/project-spaces-tab";
import { ProjectTeamTab } from "@/features/projects/components/dashboard/project-team-tab";
import { ProjectDocumentsTab } from "@/features/projects/components/dashboard/project-documents-tab";
import {
  useProject,
  useSubmitProject,
} from "@/features/projects/hooks/use-projects";
import { getProjectDisplayTitle } from "@/features/projects/types";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

type ActiveTab = "overview" | "spaces" | "team" | "documents";

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { isRTL } = useLanguage();

  const [activeTab, setActiveTab] = React.useState<ActiveTab>("overview");

  const { data: project, isLoading, error } = useProject(id);
  const submitMutation = useSubmitProject(id);

  if (isLoading) {
    return (
      <CustomerShell>
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-8 w-8 text-[#503C2C]" />
        </div>
      </CustomerShell>
    );
  }

  if (error || !project) {
    return (
      <CustomerShell>
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <h2 className="font-serif text-2xl font-medium text-[#1C1917] dark:text-[#FAF7F2]">
            {isRTL ? "المشروع غير موجود" : "Commission Not Found"}
          </h2>
          <p className="text-xs text-[#78716C] dark:text-[#989692]">
            {isRTL
              ? "لم يتم العثور على هذا المشروع في سجلات الأتيليه الخاصة بك."
              : "The requested commission does not exist or has been moved."}
          </p>
          <Link
            href="/projects"
            className="mt-4 rounded-full bg-[#503C2C] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FAF7F2]"
          >
            {isRTL ? "العودة لقائمة المشاريع" : "Back to Projects"}
          </Link>
        </div>
      </CustomerShell>
    );
  }

  const isDraft = project.status === "draft";
  const displayTitle = getProjectDisplayTitle(project);

  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync();
    } catch (err) {
      console.error("Failed to submit project", err);
    }
  };

  const TABS: Array<{
    id: ActiveTab;
    labelEn: string;
    labelAr: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: "overview",
      labelEn: "Overview & Specs",
      labelAr: "المواصفات العامة",
      icon: SquaresFour,
    },
    {
      id: "spaces",
      labelEn: `Spaces (${project.spaces?.length || 0})`,
      labelAr: `الفراغات (${project.spaces?.length || 0})`,
      icon: HouseLine,
    },
    {
      id: "team",
      labelEn: "Atelier Team & Survey",
      labelAr: "فريق الأتيليه والمعاينة",
      icon: UsersThree,
    },
    {
      id: "documents",
      labelEn: `Blueprints (${project.documents?.length || 0})`,
      labelAr: `المخططات (${project.documents?.length || 0})`,
      icon: FilePdf,
    },
  ];

  return (
    <CustomerShell>
      <div className="mx-auto max-w-5xl flex flex-col gap-8 pb-16">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col gap-5 border-b border-[#E6DDD2] dark:border-[#2E2A27] pb-6">
          <div className="flex items-center justify-between">
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#78716C] hover:text-[#1C1917] transition-colors"
            >
              {isRTL ? (
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              ) : (
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              )}
              <span>{isRTL ? "العودة للمشاريع" : "Back to Projects"}</span>
            </Link>

            <StatusChip status={project.status} />
          </div>

          <EditorialHeader
            eyebrow={`COMMISSION · ${project.id}`}
            title={displayTitle}
            description={`${
              isRTL ? "تاريخ التكليف:" : "Commissioned on"
            } ${new Date(project.createdAt).toLocaleDateString(
              isRTL ? "ar-EG" : "en-US",
              { month: "long", day: "numeric", year: "numeric" }
            )} · ${project.property?.city || project.city || "Cairo"}`}
            action={
              isDraft && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-[#503C2C] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#FAF7F2] shadow-sm hover:bg-[#3D2E22] transition-all disabled:opacity-50"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Spinner className="h-3.5 w-3.5 text-white" />
                      <span>{isRTL ? "جاري الاعتماد..." : "Submitting..."}</span>
                    </>
                  ) : (
                    <>
                      <PaperPlaneTilt size={13} weight="bold" />
                      <span>{isRTL ? "اعتماد وإرسال التكليف" : "Commission Atelier"}</span>
                    </>
                  )}
                </button>
              )
            }
          />
        </div>

        {/* Dynamic Project Roadmap Timeline */}
        <ProjectJourney projectStatus={project.status} />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#E6DDD2] dark:border-[#2E2A27] pb-3 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all",
                  isSelected
                    ? "bg-[#503C2C] text-[#FAF7F2] shadow-xs"
                    : "bg-[#FAF7F2] dark:bg-[#1E1B18] text-[#78716C] hover:text-[#1C1917] hover:bg-[#EAE2D7]"
                )}
              >
                <Icon className={cn("w-4 h-4", isSelected ? "text-[#B88460]" : "text-[#78716C]")} />
                <span>{isRTL ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes */}
        {activeTab === "overview" && <ProjectOverviewTab project={project} />}
        {activeTab === "spaces" && <ProjectSpacesTab spaces={project.spaces || []} />}
        {activeTab === "team" && <ProjectTeamTab project={project} />}
        {activeTab === "documents" && (
          <ProjectDocumentsTab documents={project.documents || []} />
        )}
      </div>
    </CustomerShell>
  );
}
