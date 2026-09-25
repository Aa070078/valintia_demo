"use client";

import * as React from "react";
import { CheckCircle, Clock, CalendarCheck, ShieldCheck, Sparkle, Hammer } from "@phosphor-icons/react";
import type { ProposedProjectLifecycleStatus } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export interface JourneyStage {
  id: string;
  stepNumber: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  status: "completed" | "in_progress" | "upcoming";
  scheduledDate?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ProjectJourneyProps {
  projectStatus: ProposedProjectLifecycleStatus;
  stages?: JourneyStage[];
}

export function ProjectJourney({ projectStatus, stages }: ProjectJourneyProps) {
  const { isRTL } = useLanguage();

  const isSubmitted = projectStatus === "submitted" || projectStatus === "initial_review";

  const defaultStages: JourneyStage[] = [
    {
      id: "submission",
      stepNumber: "01",
      titleEn: "Commission Submitted",
      titleAr: "اعتماد وتكليف المشروع",
      descEn: "Initial specifications received and undergoing atelier review.",
      descAr: "تم استلام المواصفات وتكليف الاستوديو بالمراجعة الأولية.",
      status: isSubmitted ? "completed" : "in_progress",
      icon: CheckCircle,
    },
    {
      id: "consultation",
      stepNumber: "02",
      titleEn: "Virtual Consultation",
      titleAr: "الاستشارة الافتراضية",
      descEn: "Video sync with lead architect to align vision and materials.",
      descAr: "جلسة فيديو مباشرة مع كبير المعماريين لمناقشة الرؤية والمواد.",
      status: isSubmitted ? "in_progress" : "upcoming",
      scheduledDate: isSubmitted ? "Estimated: Within 48 Hours" : undefined,
      icon: CalendarCheck,
    },
    {
      id: "site_visit",
      stepNumber: "03",
      titleEn: "3D Lidar Site Survey",
      titleAr: "المعاينة والمسح الليزري",
      descEn: "Engineering team inspects site and executes 3D point-cloud scan.",
      descAr: "فريق المسح الميداني يزور العقار لإجراء الرفع الليزري ثلاثي الأبعاد.",
      status: "upcoming",
      icon: ShieldCheck,
    },
    {
      id: "design_concept",
      stepNumber: "04",
      titleEn: "Concept & 3D Renders",
      titleAr: "التصميم والرندرات ثلاثية الأبعاد",
      descEn: "Bespoke spatial design, moodboards, and VR walkthrough.",
      descAr: "إعداد المخططات المعمارية، لوحات الخامات، وجولة الواقع الافتراضي.",
      status: "upcoming",
      icon: Sparkle,
    },
    {
      id: "boq_execution",
      stepNumber: "05",
      titleEn: "Turnkey BOQ & Build",
      titleAr: "جدول الكميات والتنفيذ",
      descEn: "Itemized material pricing, contracts, and on-site fit-out.",
      descAr: "تسعير تفصيلي لبنود الأعمال، توقيع التعاقد، وبدء التنفيذ الميداني.",
      status: "upcoming",
      icon: Hammer,
    },
  ];

  const activeStages = stages || defaultStages;

  return (
    <div className="rounded-3xl border border-[#E6DDD2] dark:border-[#2E2A27] bg-[#FAF7F2] dark:bg-[#1E1B18] p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
      {/* Journey Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6DDD2]/60 dark:border-[#2E2A27]">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78716C] dark:text-[#989692]">
            {isRTL ? "خارطة طريق المشروع" : "COMMISSION ROADMAP"}
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl text-[#1C1917] dark:text-[#FAF7F2] font-normal mt-0.5">
            {isRTL ? "مراحل تطور مشروعك المعماري" : "Your Project Journey"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B88460] animate-pulse" />
          <span className="text-xs font-mono font-medium text-[#503C2C] dark:text-[#D4C3B3]">
            {isRTL ? "مرحلة الدراسة الأولية" : "Initial Review Stage"}
          </span>
        </div>
      </div>

      {/* Horizontal Steps on Desktop, Vertical on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {activeStages.map((stage) => {
          const Icon = stage.icon;
          const isDone = stage.status === "completed";
          const isCurrent = stage.status === "in_progress";

          return (
            <div
              key={stage.id}
              className={cn(
                "p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative",
                isCurrent
                  ? "bg-white dark:bg-[#141210] border-[#503C2C] dark:border-[#B88460] shadow-sm ring-1 ring-[#503C2C]/20"
                  : isDone
                  ? "bg-[#F4EEE5]/50 dark:bg-[#25221F]/50 border-[#E6DDD2] dark:border-[#38332E]"
                  : "bg-white/40 dark:bg-[#141210]/30 border-[#E6DDD2]/60 dark:border-[#2E2A27] opacity-60"
              )}
            >
              {/* Step indicator top row */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full",
                    isCurrent
                      ? "bg-[#503C2C] text-[#FAF7F2]"
                      : isDone
                      ? "bg-[#EAE2D7] text-[#503C2C]"
                      : "bg-[#E6DDD2]/60 text-[#78716C]"
                  )}
                >
                  {stage.stepNumber}
                </span>

                <Icon
                  className={cn(
                    "w-4 h-4",
                    isDone
                      ? "text-[#503C2C] dark:text-[#B88460]"
                      : isCurrent
                      ? "text-[#B88460]"
                      : "text-[#78716C]"
                  )}
                />
              </div>

              {/* Title & Desc */}
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#FAF7F2] leading-snug">
                  {isRTL ? stage.titleAr : stage.titleEn}
                </h4>
                <p className="text-[11px] text-[#78716C] dark:text-[#989692] mt-1 leading-relaxed">
                  {isRTL ? stage.descAr : stage.descEn}
                </p>
              </div>

              {/* Status pill or schedule badge */}
              <div className="pt-2 border-t border-[#E6DDD2]/50 dark:border-[#2E2A27]">
                {isDone && (
                  <span className="text-[10px] font-mono text-[#503C2C] dark:text-[#D4C3B3] flex items-center gap-1 font-semibold">
                    <CheckCircle weight="fill" className="w-3 h-3 text-[#B88460]" />
                    <span>{isRTL ? "مكتمل" : "Completed"}</span>
                  </span>
                )}
                {isCurrent && (
                  <span className="text-[10px] font-mono text-[#B88460] flex items-center gap-1 font-semibold">
                    <Clock className="w-3 h-3" />
                    <span>{stage.scheduledDate || (isRTL ? "جاري التنسيق" : "Active Stage")}</span>
                  </span>
                )}
                {!isDone && !isCurrent && (
                  <span className="text-[10px] font-mono text-[#78716C]">
                    {isRTL ? "المرحلة القادمة" : "Upcoming"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
