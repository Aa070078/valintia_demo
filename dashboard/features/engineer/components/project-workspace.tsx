"use client";

import * as React from "react";
import {
  ProjectReviewContext,
  ProjectActivity,
  ConsultationAppointment,
  ProjectWorkspaceTab,
} from "../types/engineer.types";
import { BriefReviewPanel } from "./brief-review-panel";
import { MomComposer } from "./mom-composer";
import { ActivityLogView } from "./activity-log-view";
import {
  ArrowLeft,
  ArrowRight,
  Buildings,
  MapPin,
  User,
  Clock,
  FileText,
  CalendarCheck,
  NotePencil,
  FilePdf,
  Image as ImageIcon,
  Lock,
  VideoCamera,
  FolderOpen,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ProjectWorkspaceProps {
  context: ProjectReviewContext;
  activities: ProjectActivity[];
  consultations: ConsultationAppointment[];
  onBack: () => void;
  onStartReview: (projectId: number, note?: string) => Promise<void>;
  onReadyForConsultation: (projectId: number, note?: string) => Promise<void>;
  isTransitioning: boolean;
  isRTL: boolean;
  initialTab?: ProjectWorkspaceTab;
}

export function ProjectWorkspace({
  context,
  activities,
  consultations,
  onBack,
  onStartReview,
  onReadyForConsultation,
  isTransitioning,
  isRTL,
  initialTab = "brief_review",
}: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = React.useState<ProjectWorkspaceTab>(initialTab);

  // Find consultation for this project
  const projectConsultation = consultations.find(
    (c) => c.projectId === context.id
  );

  const getStatusBadge = () => {
    switch (context.status) {
      case "SUBMITTED":
        return {
          label: isRTL ? "مُسلّم حديثاً · بانتظار المراجعة" : "Submitted · Pending Review",
          className:
            "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
        };
      case "UNDER_ENGINEER_REVIEW":
        return {
          label: isRTL ? "قيد المراجعة الهندسية" : "Under Engineer Review",
          className:
            "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
        };
      case "ENGINEER_READY":
        return {
          label: isRTL ? "معتمد للاستشارة" : "Ready for Consultation",
          className:
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
        };
      default:
        return {
          label: context.status,
          className: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  const statusBadge = getStatusBadge();

  const tabs: {
    id: ProjectWorkspaceTab;
    labelAr: string;
    labelEn: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "brief_review",
      labelAr: "المراجعة الهندسية والاعتماد",
      labelEn: "Brief Review & Signoff",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "overview",
      labelAr: "نظرة عامة على العقار",
      labelEn: "Property Overview",
      icon: <Buildings className="w-4 h-4" />,
    },
    {
      id: "files_drawings",
      labelAr: "الملفات والمخططات (2)",
      labelEn: "Files & Drawings (2)",
      icon: <FolderOpen className="w-4 h-4" />,
    },
    {
      id: "consultation",
      labelAr: "جلسة الاستشارة",
      labelEn: "Consultation Session",
      icon: <CalendarCheck className="w-4 h-4" />,
    },
    {
      id: "mom",
      labelAr: "محضر الاجتماع (MOM)",
      labelEn: "Minutes of Meeting",
      icon: <NotePencil className="w-4 h-4" />,
    },
    {
      id: "activity",
      labelAr: "سجل النشاط الموثق",
      labelEn: "Activity Log",
      icon: <Clock className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Back Control */}
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
        >
          {isRTL ? (
            <ArrowRight className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          ) : (
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          )}
          <span>{isRTL ? "العودة للمشروعات" : "Back to projects"}</span>
        </button>

        <span className="text-xs font-mono text-muted-foreground">
          Project ID: #{context.id}
        </span>
      </div>

      {/* Project Identity Hero Bar */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                COMMISSION DOSSIER #{context.id}
              </span>
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border",
                  statusBadge.className
                )}
              >
                {statusBadge.label}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-serif font-medium text-foreground">
              {context.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>{context.client.name || context.client.username}</span>
              </span>
              {context.property && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Buildings className="w-3.5 h-3.5" />
                    <span>
                      {context.property.propertyType} · {context.property.areaSqm} m²
                    </span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {context.property.compound ? `${context.property.compound}, ` : ""}
                      {context.property.city}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Permitted Next Action Box */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/80 text-xs space-y-1 md:text-end shrink-0 max-w-xs">
            <span className="text-[10px] font-mono uppercase text-muted-foreground block">
              {isRTL ? "الإجراء القادم المسموح به:" : "Permitted Next Action:"}
            </span>
            <span className="font-semibold text-foreground block">
              {context.status === "SUBMITTED"
                ? isRTL
                  ? "بدء المراجعة الهندسية وتدقيق المخططات"
                  : "Start Engineering Review"
                : context.status === "UNDER_ENGINEER_REVIEW"
                ? isRTL
                  ? "تدقيق المواصفات وتأكيد الجاهزية للاستشارة"
                  : "Audit & Sign Off Readiness"
                : isRTL
                ? "بانتظار قيام العميل بحجز جلسة الاستشارة"
                : "Waiting for Client to Book Session"}
            </span>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-border/60 pt-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {tab.icon}
              <span>{isRTL ? tab.labelAr : tab.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "brief_review" && (
        <BriefReviewPanel
          context={context}
          onStartReview={onStartReview}
          onReadyForConsultation={onReadyForConsultation}
          isTransitioning={isTransitioning}
          isRTL={isRTL}
        />
      )}

      {activeTab === "overview" && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-xs">
          <h3 className="text-base font-serif font-medium text-foreground border-b border-border pb-3">
            {isRTL ? "تفاصيل العقار ونطاق الأعمال" : "Property & Scope Overview"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
              <span className="text-muted-foreground block text-[11px]">
                {isRTL ? "النوع المعماري:" : "Typology:"}
              </span>
              <span className="font-mono font-medium text-sm text-foreground">
                {context.property?.propertyType || "Residential"}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
              <span className="text-muted-foreground block text-[11px]">
                {isRTL ? "المساحة الإجمالية:" : "Gross Area:"}
              </span>
              <span className="font-mono font-medium text-sm text-foreground">
                {context.property?.areaSqm || "—"} m²
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
              <span className="text-muted-foreground block text-[11px]">
                {isRTL ? "المجمع / الكمبوند:" : "Compound:"}
              </span>
              <span className="font-medium text-sm text-foreground">
                {context.property?.compound || (isRTL ? "منفصل" : "Standalone")}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
              <span className="text-muted-foreground block text-[11px]">
                {isRTL ? "المدينة:" : "City:"}
              </span>
              <span className="font-medium text-sm text-foreground">
                {context.property?.city || "Cairo"}
              </span>
            </div>
          </div>

          {/* Spaces Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase text-muted-foreground">
              {isRTL
                ? `المساحات والغرف المحددة (${context.spaces.length})`
                : `Itemized Spaces (${context.spaces.length})`}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {context.spaces.map((sp) => (
                <div
                  key={sp.id}
                  className="p-3 rounded-xl border border-border bg-background/50 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-foreground">
                    {sp.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    #{sp.id}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Future Stage Indicator (Sprint 3+ locked) */}
          <div className="p-4 rounded-xl border border-dashed border-border bg-muted/10 text-xs text-muted-foreground flex items-center gap-3">
            <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
            <div>
              <span className="font-medium text-foreground block">
                {isRTL
                  ? "مراحل المسح الميداني والتنفيذ (مراحل مستقبلية)"
                  : "Field Survey, BOQ & Procurement (Future Sprint Stages)"}
              </span>
              <span>
                {isRTL
                  ? "تفتح مراحل المعاينة الميدانية المدفوعة وجداول الكميات بعد اعتماد محضر الاستشارة MOM وموافقة العميل."
                  : "Site survey, BOQ estimation, and procurement gates unlock following consultation MOM confirmation."}
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "files_drawings" && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-base font-serif font-medium text-foreground">
                {isRTL ? "الملفات والمخططات المقدمة" : "Submitted Files & Drawings"}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                {isRTL
                  ? "المخططات والصور التي رفعها العميل مع كراسة المتطلبات"
                  : "Customer floor plans, concept photographs, and architectural files"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border bg-background/60 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <FilePdf className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-foreground">
                  Architectural-Layout-FloorPlan.pdf
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  4.2 MB · Submitted with brief
                </div>
                <span className="inline-block mt-1 text-[11px] text-primary hover:underline font-mono cursor-pointer">
                  {isRTL ? "معاينة المخطط المعماري" : "Inspect Floor Plan"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background/60 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-foreground">
                  Existing-Site-Condition-Photos.zip
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  18.5 MB · Uploaded by Customer
                </div>
                <span className="inline-block mt-1 text-[11px] text-primary hover:underline font-mono cursor-pointer">
                  {isRTL ? "تنزيل وفحص الصور" : "Download & Inspect Photos"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "consultation" && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-base font-serif font-medium text-foreground">
                {isRTL ? "جلسة الاستشارة المعمارية المجانية" : "Architectural Consultation Session"}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                {isRTL
                  ? "توقيت الجلسة، الرابط، وحالة الموعد"
                  : "Session slot, video link, and appointment status in Cairo Time"}
              </p>
            </div>
          </div>

          {projectConsultation ? (
            <div className="p-5 rounded-xl border border-border bg-background/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {projectConsultation.status}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {projectConsultation.durationMinutes} min
                    </span>
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {new Intl.DateTimeFormat(isRTL ? "ar-EG" : "en-US", {
                      timeZone: "Africa/Cairo",
                      dateStyle: "full",
                      timeStyle: "short",
                    }).format(new Date(projectConsultation.scheduledAt))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Client: {projectConsultation.clientName} ({projectConsultation.clientPhone})
                  </div>
                </div>

                {projectConsultation.meetingLink && (
                  <a
                    href={projectConsultation.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium flex items-center gap-1.5 shadow-xs transition-all self-start sm:self-center"
                  >
                    <VideoCamera className="w-4 h-4" />
                    <span>{isRTL ? "دخول جلسة الاستشارة" : "Join Consultation"}</span>
                  </a>
                )}
              </div>

              {projectConsultation.notes && (
                <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
                  <strong>Agenda Note:</strong> {projectConsultation.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-border text-center space-y-2">
              <CalendarCheck className="w-8 h-8 mx-auto text-muted-foreground" />
              <h4 className="text-xs font-medium text-foreground">
                {isRTL ? "لم يتم حجز موعد استشارة بعد" : "No Consultation Booked Yet"}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {context.status === "ENGINEER_READY"
                  ? isRTL
                    ? "المشروع جاهز للاستشارة وبانتظار قيام العميل باختيار وتأكيد الموعد المناسب."
                    : "Feasibility is signed off. Waiting for customer to select and book a consultation slot."
                  : isRTL
                  ? "يجب إنهاء المراجعة الهندسية واعتماد الجاهزية للاستشارة أولاً حتى يتمكن العميل من حجز الموعد."
                  : "Complete engineering review and sign off readiness first to unlock consultation booking for customer."}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "mom" && (
        <MomComposer
          projectId={context.id}
          projectTitle={context.title}
          clientName={context.client.name || context.client.username}
          isRTL={isRTL}
        />
      )}

      {activeTab === "activity" && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <ActivityLogView activities={activities} isRTL={isRTL} />
        </div>
      )}
    </div>
  );
}
