"use client";

import * as React from "react";
import {
  ProjectListItem,
  ConsultationAppointment,
} from "../types/engineer.types";
import {
  Sparkle,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle,
  FileText,
  VideoCamera,
} from "@phosphor-icons/react";

interface HighestPriorityActionProps {
  projects: ProjectListItem[];
  consultations: ConsultationAppointment[];
  onOpenProject: (projectId: number) => void;
  isRTL: boolean;
}

export function HighestPriorityAction({
  projects,
  consultations,
  onOpenProject,
  isRTL,
}: HighestPriorityActionProps) {
  // Deterministic priority evaluation:
  // 1. Consultation scheduled for today
  // 2. Project in SUBMITTED awaiting review start
  // 3. Project in UNDER_ENGINEER_REVIEW awaiting feasibility signoff
  // 4. Consultation COMPLETED with MOM pending

  const todayAppointment = consultations.find((c) => {
    if (c.status !== "CONFIRMED") return false;
    const apptDate = new Date(c.scheduledAt).toDateString();
    const today = new Date().toDateString();
    return apptDate === today;
  });

  const submittedProject = projects.find((p) => p.status === "SUBMITTED");
  const underReviewProject = projects.find(
    (p) => p.status === "UNDER_ENGINEER_REVIEW"
  );

  if (todayAppointment) {
    const formattedTime = new Intl.DateTimeFormat(isRTL ? "ar-EG" : "en-US", {
      timeZone: "Africa/Cairo",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(todayAppointment.scheduledAt));

    return (
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-mono font-medium">
              <Sparkle className="w-3.5 h-3.5" />
              <span>
                {isRTL ? "الأولوية القصوى اليوم" : "HIGHEST PRIORITY TODAY"}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-medium text-foreground">
              {isRTL
                ? `استشارة معمارية مؤكدة اليوم: ${todayAppointment.projectTitle}`
                : `Consultation Confirmed Today: ${todayAppointment.projectTitle}`}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-3">
              <span className="flex items-center gap-1 text-foreground font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {formattedTime} ({isRTL ? "توقيت القاهرة" : "Cairo Time"})
                </span>
              </span>
              <span>·</span>
              <span>
                {isRTL ? "العميل: " : "Client: "}
                <strong>{todayAppointment.clientName}</strong>
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {todayAppointment.meetingLink && (
              <a
                href={todayAppointment.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs"
              >
                <VideoCamera className="w-4 h-4" />
                <span>{isRTL ? "دخول جلسة الاستشارة" : "Join Consultation"}</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => onOpenProject(todayAppointment.projectId)}
              className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-foreground flex items-center gap-1.5 transition-all"
            >
              <span>{isRTL ? "مساحة المشروع" : "Project Workspace"}</span>
              {isRTL ? (
                <ArrowLeft className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submittedProject) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-mono font-medium">
              <FileText className="w-3.5 h-3.5" />
              <span>
                {isRTL ? "مراجعة معمارية بانتظارك" : "REVIEW AWAITING ACTION"}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-medium text-foreground">
              {submittedProject.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isRTL
                ? "قام العميل بتسليم وتثبيت كراسة المتطلبات. يتطلب العمل البدء في المراجعة الهندسية الأولية وتدقيق المساحات."
                : "Customer locked and submitted their architectural brief. Requires review start and preliminary space auditing."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenProject(submittedProject.id)}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>{isRTL ? "بدء المراجعة الهندسية الآن" : "Start Review Now"}</span>
            {isRTL ? (
              <ArrowLeft className="w-3.5 h-3.5" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    );
  }

  if (underReviewProject) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-mono font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {isRTL ? "قيد التدقيق المعماري" : "FEASIBILITY SIGNOFF PENDING"}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-medium text-foreground">
              {underReviewProject.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isRTL
                ? "المشروع قيد المراجعة الفنية. اعتمد الجاهزية للاستشارة لفتح حجز المواعيد للعميل."
                : "Technical evaluation in progress. Sign off feasibility to unlock consultation booking for the client."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenProject(underReviewProject.id)}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>
              {isRTL
                ? "إكمال مراجعة الجاهزية"
                : "Complete Feasibility Signoff"}
            </span>
            {isRTL ? (
              <ArrowLeft className="w-3.5 h-3.5" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    );
  }

  // All clear state
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-foreground">
            {isRTL
              ? "لا توجد مراجعات أو مواعيد متأخرة اليوم"
              : "All Assigned Reviews & Consultations Up to Date"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isRTL
              ? "جميع المشروعات المسندة إليك تسير وفق المخطط. ستظهر التكليفات الجديدة فور إسنادها."
              : "All active commissions are on schedule. New assignments will appear here immediately."}
          </p>
        </div>
      </div>
    </div>
  );
}
