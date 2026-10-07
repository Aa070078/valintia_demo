"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  PaperPlaneTilt,
  SquaresFour,
  HouseLine,
  UsersThree,
  FilePdf,
  CheckCircle,
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
  ConsultationScheduler,
  type BookedAppointment,
} from "@/features/projects/components/consultation-scheduler";
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
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const { isRTL } = useLanguage();

  const [activeTab, setActiveTab] = React.useState<ActiveTab>("overview");
  const [appointment, setAppointment] = React.useState<BookedAppointment | null>(null);

  const { data: project, isLoading, error } = useProject(id);
  const submitMutation = useSubmitProject(id);

  React.useEffect(() => {
    if (!id) return;
    try {
      const saved = localStorage.getItem(`valentia_appointment_proj_${id}`);
      if (saved) {
        setAppointment(JSON.parse(saved));
      }
    } catch {}
  }, [id]);

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
          <h2 className={cn(
            "text-2xl text-[#1C1917]",
            isRTL ? "font-sans font-bold" : "font-serif font-medium"
          )}>
            {isRTL ? "المشروع مش موجود" : "Commission Not Found"}
          </h2>
          <p className="text-xs font-medium text-[#503C2C]">
            {isRTL
              ? "ملقيناش المشروع ده في حسابك أو ممكن يكون اتحذف."
              : "The requested commission does not exist or has been moved."}
          </p>
          <Link
            href="/projects"
            className={cn(
              "mt-4 rounded-full bg-[#503C2C] px-6 py-2.5 text-xs text-[#FAF7F2] hover:bg-[#3D2E22] transition-colors",
              isRTL ? "font-sans font-bold tracking-normal" : "font-semibold uppercase tracking-wider"
            )}
          >
            {isRTL ? "الرجوع لمشاريعي" : "Back to Projects"}
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
      labelAr: "المواصفات وتفاصيل التشطيب",
      icon: SquaresFour,
    },
    {
      id: "spaces",
      labelEn: `Spaces (${project.spaces?.length || 0})`,
      labelAr: `الغرف والمساحات (${project.spaces?.length || 0})`,
      icon: HouseLine,
    },
    {
      id: "team",
      labelEn: "Atelier Team & Survey",
      labelAr: "فريق العمل والمعاينة",
      icon: UsersThree,
    },
    {
      id: "documents",
      labelEn: `Blueprints (${project.documents?.length || 0})`,
      labelAr: `الرسومات والمخططات (${project.documents?.length || 0})`,
      icon: FilePdf,
    },
  ];

  return (
    <CustomerShell>
      <div className="mx-auto max-w-5xl flex flex-col gap-8 pb-16">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col gap-5 border-b border-border pb-6">
          <div className="flex items-center justify-between">
            <Link
              href="/projects"
              className={cn(
                "group inline-flex items-center gap-2 text-xs font-semibold text-[#503C2C] hover:text-[#1C1917] transition-colors",
                isRTL ? "tracking-normal font-sans font-bold" : "uppercase tracking-[0.14em]"
              )}
            >
              {isRTL ? (
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              ) : (
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              )}
              <span>{isRTL ? "الرجوع للمشاريع" : "Back to Projects"}</span>
            </Link>

            <StatusChip status={project.status} />
          </div>

          <EditorialHeader
            eyebrow={`COMMISSION · ${project.id}`}
            title={displayTitle}
            description={`${
              isRTL ? "تاريخ الطلب:" : "Commissioned on"
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
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full bg-[#503C2C] px-6 py-2.5 text-xs text-[#FAF7F2] shadow-sm hover:bg-[#3D2E22] transition-all disabled:opacity-50 cursor-pointer",
                    isRTL ? "tracking-normal font-sans font-bold" : "font-semibold uppercase tracking-[0.14em]"
                  )}
                >
                  {submitMutation.isPending ? (
                    <>
                      <Spinner className="h-3.5 w-3.5 text-white" />
                      <span>{isRTL ? "ثواني بنعتمد طلبك..." : "Submitting..."}</span>
                    </>
                  ) : (
                    <>
                      <PaperPlaneTilt size={13} weight="bold" />
                      <span>{isRTL ? "تأكيد وإرسال طلب التشطيب ←" : "Commission Atelier"}</span>
                    </>
                  )}
                </button>
              )
            }
          />
        </div>

        {/* Dynamic Project Roadmap Timeline */}
        <ProjectJourney
          projectStatus={project.status}
          consultationAppointment={appointment}
        />

        {/* Just Submitted Success Alert Banner */}
        {searchParams.get("submitted") === "true" && (
          <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle className="w-6 h-6" weight="fill" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950 font-serif">
                  {isRTL ? "تم تسليم واعتماد طلب مشروعك بنجاح!" : "Project Submitted & Commissioned Successfully!"}
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  {isRTL
                    ? "طلبك الآن قيد المراجعة الهندسية الفورية لدى مهندسي فالنتيا. يمكنك حجز موعد ميتينج الاستشارة أدناه."
                    : "Your specifications are now under priority architectural review. Reserve your consultation meeting slot below."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Consultation Scheduling Desk (Locked to Stage 02) */}
        <ConsultationScheduler
          projectId={project.id}
          projectTitle={displayTitle}
          projectLocation={project.property?.city || project.city}
          initialAppointment={appointment}
          onAppointmentBooked={(newApt) => setAppointment(newApt)}
          projectStatus={project.status}
          engineerNote={(project as any).engineerNote || (project as any).reviewNote}
        />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer border",
                  isSelected
                    ? "bg-[#503C2C] border-[#503C2C] text-[#FAF7F2] shadow-xs font-bold"
                    : "bg-card border-border text-[#4A3E31] hover:text-[#1C1917] hover:bg-secondary font-medium",
                  isRTL && "font-sans font-semibold"
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
