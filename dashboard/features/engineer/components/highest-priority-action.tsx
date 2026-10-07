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
      <div className="relative overflow-hidden rounded-2xl border border-[#D8C8B4] bg-[#FAF7F2] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B88460]/15 text-[#8F5A36] text-xs font-mono font-medium border border-[#B88460]/20">
              <Sparkle className="w-3.5 h-3.5" />
              <span>
                {isRTL ? "الأولوية القصوى اليوم" : "HIGHEST PRIORITY TODAY"}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-medium text-[#1C1917]">
              {isRTL
                ? `استشارة معمارية مؤكدة اليوم: ${todayAppointment.projectTitle}`
                : `Consultation Confirmed Today: ${todayAppointment.projectTitle}`}
            </h3>
            <p className="text-xs sm:text-sm text-[#6B635B] flex items-center gap-3">
              <span className="flex items-center gap-1 text-[#1C1917] font-medium">
                <Clock className="w-3.5 h-3.5 text-[#B88460]" />
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
                className="px-4 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <VideoCamera className="w-4 h-4 text-[#B88460]" />
                <span>{isRTL ? "دخول جلسة الاستشارة" : "Join Consultation"}</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => onOpenProject(todayAppointment.projectId)}
              className="px-4 py-2.5 rounded-xl border border-[#D8C8B4] bg-[#FAF7F2] hover:bg-[#EFE7DC] text-xs font-medium text-[#1C1917] flex items-center gap-1.5 transition-all cursor-pointer"
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
      <div className="relative overflow-hidden rounded-2xl border border-[#D8C8B4] bg-[#FAF7F2] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#503C2C]/10 text-[#503C2C] text-xs font-mono font-medium border border-[#503C2C]/20">
              <FileText className="w-3.5 h-3.5" />
              <span>
                {isRTL ? "مراجعة معمارية بانتظارك" : "REVIEW AWAITING ACTION"}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-medium text-[#1C1917]">
              {submittedProject.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#6B635B]">
              {isRTL
                ? "قام العميل بتسليم وتثبيت كراسة المتطلبات. يتطلب العمل البدء في المراجعة الهندسية الأولية وتدقيق المساحات."
                : "Customer locked and submitted their architectural brief. Requires review start and preliminary space auditing."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenProject(submittedProject.id)}
            className="px-5 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-sm shrink-0 cursor-pointer"
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
      <div className="relative overflow-hidden rounded-2xl border border-[#D8C8B4] bg-[#FAF7F2] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B88460]/15 text-[#8F5A36] text-xs font-mono font-medium border border-[#B88460]/20">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {isRTL ? "قيد التدقيق المعماري" : "FEASIBILITY SIGNOFF PENDING"}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-medium text-[#1C1917]">
              {underReviewProject.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#6B635B]">
              {isRTL
                ? "المشروع قيد المراجعة الفنية. اعتمد الجاهزية للاستشارة لفتح حجز المواعيد للعميل."
                : "Technical evaluation in progress. Sign off feasibility to unlock consultation booking for the client."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenProject(underReviewProject.id)}
            className="px-5 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-sm shrink-0 cursor-pointer"
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
    <div className="rounded-2xl border border-[#D8C8B4] bg-[#FAF7F2] p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#B88460]/15 text-[#B88460] flex items-center justify-center shrink-0">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-[#1C1917]">
            {isRTL
              ? "لا توجد مراجعات أو مواعيد متأخرة اليوم"
              : "All Assigned Reviews & Consultations Up to Date"}
          </h3>
          <p className="text-xs text-[#6B635B] mt-0.5">
            {isRTL
              ? "جميع المشروعات المسندة إليك تسير وفق المخطط. ستظهر التكليفات الجديدة فور إسنادها."
              : "All active commissions are on schedule. New assignments will appear here immediately."}
          </p>
        </div>
      </div>
    </div>
  );
}
