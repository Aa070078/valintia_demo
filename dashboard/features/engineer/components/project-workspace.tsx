"use client"

import * as React from "react"
import {
  ProjectReviewContext,
  ProjectActivity,
  ConsultationAppointment,
  ProjectWorkspaceTab,
} from "../types/engineer.types"
import { BriefReviewPanel } from "./brief-review-panel"
import { MomComposer } from "./mom-composer"
import { ActivityLogView } from "./activity-log-view"
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
  Lock,
  VideoCamera,
  FolderOpen,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface ProjectWorkspaceProps {
  context: ProjectReviewContext
  activities: ProjectActivity[]
  consultations: ConsultationAppointment[]
  onBack: () => void
  onStartReview: (projectId: number, note?: string) => Promise<void>
  onReadyForConsultation: (projectId: number, note?: string) => Promise<void>
  isTransitioning: boolean
  isRTL: boolean
  initialTab?: ProjectWorkspaceTab
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
  const [activeTab, setActiveTab] =
    React.useState<ProjectWorkspaceTab>(initialTab)

  // Find consultation for this project
  const projectConsultation = consultations.find(
    (c) => c.projectId === context.id
  )

  const getStatusBadge = () => {
    switch (context.status) {
      case "SUBMITTED":
        return {
          label: isRTL
            ? "مُسلّم حديثاً · بانتظار المراجعة"
            : "Submitted · Pending Review",
          className:
            "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
        }
      case "UNDER_ENGINEER_REVIEW":
        return {
          label: isRTL ? "قيد المراجعة الهندسية" : "Under Engineer Review",
          className:
            "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
        }
      case "ENGINEER_READY":
        return {
          label: isRTL ? "معتمد للاستشارة" : "Ready for Consultation",
          className:
            "bg-[#B88460]/15 text-[#8F5A36] dark:bg-[#B88460]/20 dark:text-[#E5D5C5] border-[#B88460]/30",
        }
      default:
        return {
          label: context.status,
          className: "bg-muted text-muted-foreground border-border",
        }
    }
  }

  const statusBadge = getStatusBadge()

  const tabs: {
    id: ProjectWorkspaceTab
    labelAr: string
    labelEn: string
    icon: React.ReactNode
  }[] = [
    {
      id: "brief_review",
      labelAr: "المراجعة الهندسية والاعتماد",
      labelEn: "Brief Review & Signoff",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "overview",
      labelAr: "نظرة عامة على العقار",
      labelEn: "Property Overview",
      icon: <Buildings className="h-4 w-4" />,
    },
    {
      id: "files_drawings",
      labelAr: "الملفات والمخططات",
      labelEn: "Files & Drawings",
      icon: <FolderOpen className="h-4 w-4" />,
    },
    {
      id: "consultation",
      labelAr: "جلسة الاستشارة",
      labelEn: "Consultation Session",
      icon: <CalendarCheck className="h-4 w-4" />,
    },
    {
      id: "mom",
      labelAr: "محضر الاجتماع (MOM)",
      labelEn: "Minutes of Meeting",
      icon: <NotePencil className="h-4 w-4" />,
    },
    {
      id: "activity",
      labelAr: "سجل النشاط الموثق",
      labelEn: "Activity Log",
      icon: <Clock className="h-4 w-4" />,
    },
  ]

  return (
    <div className="animate-in space-y-6 duration-300 fade-in">
      {/* Top Breadcrumb & Back Control */}
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {isRTL ? (
            <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          ) : (
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          )}
          <span>{isRTL ? "العودة للمشروعات" : "Back to projects"}</span>
        </button>

        <span className="font-mono text-xs text-muted-foreground">
          Project ID: #{context.id}
        </span>
      </div>

      {/* Project Identity Hero Bar */}
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                COMMISSION DOSSIER #{context.id}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium",
                  statusBadge.className
                )}
              >
                {statusBadge.label}
              </span>
            </div>

            <h1 className="font-serif text-xl font-medium text-foreground sm:text-2xl">
              {context.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>{context.client.name || context.client.username}</span>
              </span>
              {context.property && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Buildings className="h-3.5 w-3.5" />
                    <span>
                      {context.property.propertyType} ·{" "}
                      {context.property.areaSqm} m²
                    </span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {context.property.compound
                        ? `${context.property.compound}, `
                        : ""}
                      {context.property.city}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Permitted Next Action Box */}
          <div className="max-w-xs shrink-0 space-y-1 rounded-xl border border-border/80 bg-muted/40 p-3 text-xs md:text-end">
            <span className="block font-mono text-[10px] text-muted-foreground uppercase">
              {isRTL ? "الإجراء القادم المسموح به:" : "Permitted Next Action:"}
            </span>
            <span className="block font-semibold text-foreground">
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
                "flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap transition-all",
                activeTab === tab.id
                  ? "bg-primary font-semibold text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
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
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h3 className="border-b border-border pb-3 font-serif text-base font-medium text-foreground">
            {isRTL
              ? "تفاصيل العقار ونطاق الأعمال"
              : "Property & Scope Overview"}
          </h3>

          <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-muted/30 p-3.5">
              <span className="block text-[11px] text-muted-foreground">
                {isRTL ? "النوع المعماري:" : "Typology:"}
              </span>
              <span className="font-mono text-sm font-medium text-foreground">
                {context.property?.propertyType || "Residential"}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3.5">
              <span className="block text-[11px] text-muted-foreground">
                {isRTL ? "المساحة الإجمالية:" : "Gross Area:"}
              </span>
              <span className="font-mono text-sm font-medium text-foreground">
                {context.property?.areaSqm || "—"} m²
              </span>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3.5">
              <span className="block text-[11px] text-muted-foreground">
                {isRTL ? "المجمع / الكمبوند:" : "Compound:"}
              </span>
              <span className="text-sm font-medium text-foreground">
                {context.property?.compound || (isRTL ? "منفصل" : "Standalone")}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3.5">
              <span className="block text-[11px] text-muted-foreground">
                {isRTL ? "المدينة:" : "City:"}
              </span>
              <span className="text-sm font-medium text-foreground">
                {context.property?.city || "Cairo"}
              </span>
            </div>
          </div>

          {/* Spaces Breakdown */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs text-muted-foreground uppercase">
              {isRTL
                ? `المساحات والغرف المحددة (${context.spaces.length})`
                : `Itemized Spaces (${context.spaces.length})`}
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {context.spaces.map((sp) => (
                <div
                  key={sp.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-3 text-xs"
                >
                  <span className="font-medium text-foreground">
                    {sp.type.replace(/_/g, " ")}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    #{sp.id}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Future Stage Indicator (Sprint 3+ locked) */}
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/10 p-4 text-xs text-muted-foreground">
            <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <span className="block font-medium text-foreground">
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
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-serif text-base font-medium text-foreground">
                {isRTL
                  ? "الملفات والمخططات المقدمة"
                  : "Submitted Files & Drawings"}
              </h3>
              <p className="font-mono text-xs text-muted-foreground">
                {isRTL
                  ? "المخططات والصور التي رفعها العميل مع كراسة المتطلبات"
                  : "Customer floor plans, concept photographs, and architectural files"}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {isRTL
              ? "الملفات غير متاحة في عرض المراجعة الحالي."
              : "Attachments are unavailable in the current review view."}
          </p>
        </div>
      )}

      {activeTab === "consultation" && (
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-serif text-base font-medium text-foreground">
                {isRTL
                  ? "جلسة الاستشارة المعمارية المجانية"
                  : "Architectural Consultation Session"}
              </h3>
              <p className="font-mono text-xs text-muted-foreground">
                {isRTL
                  ? "توقيت الجلسة، الرابط، وحالة الموعد"
                  : "Session slot, video link, and appointment status in Cairo Time"}
              </p>
            </div>
          </div>

          {projectConsultation ? (
            <div className="space-y-4 rounded-xl border border-border bg-background/60 p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-[#503C2C]/20 bg-[#503C2C]/10 px-2.5 py-0.5 font-mono text-xs font-medium text-[#503C2C] dark:bg-[#FAF7F2]/10 dark:text-[#FAF7F2]">
                      {projectConsultation.status}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
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
                    Client: {projectConsultation.clientName} (
                    {projectConsultation.clientPhone})
                  </div>
                </div>

                {projectConsultation.meetingLink && (
                  <a
                    href={projectConsultation.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 self-start rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-xs transition-all hover:bg-primary/90 sm:self-center"
                  >
                    <VideoCamera className="h-4 w-4" />
                    <span>
                      {isRTL ? "دخول جلسة الاستشارة" : "Join Consultation"}
                    </span>
                  </a>
                )}
              </div>

              {projectConsultation.notes && (
                <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                  <strong>Agenda Note:</strong> {projectConsultation.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 rounded-xl border border-dashed border-border p-8 text-center">
              <CalendarCheck className="mx-auto h-8 w-8 text-muted-foreground" />
              <h4 className="text-xs font-medium text-foreground">
                {isRTL
                  ? "لم يتم حجز موعد استشارة بعد"
                  : "No Consultation Booked Yet"}
              </h4>
              <p className="mx-auto max-w-sm text-xs text-muted-foreground">
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
  )
}
