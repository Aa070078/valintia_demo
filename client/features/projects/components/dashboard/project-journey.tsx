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
      titleAr: "تأكيد طلب المشروع",
      descEn: "Initial specifications received and undergoing atelier review.",
      descAr: "استلمنا بيانات ومواصفات شقتك/فيلتك وفريق التصميم بيراجعها حالياً.",
      status: isSubmitted ? "completed" : "in_progress",
      icon: CheckCircle,
    },
    {
      id: "consultation",
      stepNumber: "02",
      titleEn: "Virtual Consultation",
      titleAr: "مكالمة الاستشارة أونلاين",
      descEn: "Video sync with lead architect to align vision and materials.",
      descAr: "ميتينج فيديو مع رئيس المهندسين عشان نفهم ذوقك ونظبط تفاصيل التصميم والخامات.",
      status: isSubmitted ? "in_progress" : "upcoming",
      scheduledDate: isSubmitted ? "Estimated: Within 48 Hours" : undefined,
      icon: CalendarCheck,
    },
    {
      id: "site_visit",
      stepNumber: "03",
      titleEn: "3D Lidar Site Survey",
      titleAr: "معاينة ورفع مقاسات الموقع",
      descEn: "Engineering team inspects site and executes 3D point-cloud scan.",
      descAr: "فريق الهندسة هينزل الموقع يرفع المقاسات بالمللي بماسحات الليزر ثلاثية الأبعاد.",
      status: "upcoming",
      icon: ShieldCheck,
    },
    {
      id: "design_concept",
      stepNumber: "04",
      titleEn: "Concept & 3D Renders",
      titleAr: "التصميمات والريندرات 3D",
      descEn: "Bespoke spatial design, moodboards, and VR walkthrough.",
      descAr: "هنجهز لك تصميمات البيت كاملة ثلاثية الأبعاد مع لوحات الخامات وجولة افتراضية.",
      status: "upcoming",
      icon: Sparkle,
    },
    {
      id: "boq_execution",
      stepNumber: "05",
      titleEn: "Turnkey BOQ & Build",
      titleAr: "المقايسة (BOQ) وبدء التشطيب",
      descEn: "Itemized material pricing, contracts, and on-site fit-out.",
      descAr: "جدول كميات مفصل بالأسعار، توقيع العقد، والنزول فوراً لبدء أعمال التشطيب والتسليم على المفتاح.",
      status: "upcoming",
      icon: Hammer,
    },
  ];

  const activeStages = stages || defaultStages;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
      {/* Journey Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
        <div>
          <div
            className={cn(
              "text-[#78716C]",
              isRTL
                ? "font-sans text-xs font-bold tracking-normal text-[#503C2C]"
                : "font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
            )}
          >
            {isRTL ? "خطوات تنفيذ مشروعك" : "COMMISSION ROADMAP"}
          </div>
          <h3
            className={cn(
              "text-[#1C1917] mt-0.5",
              isRTL ? "font-sans text-2xl sm:text-3xl font-bold leading-tight" : "font-serif text-2xl sm:text-3xl font-normal"
            )}
          >
            {isRTL ? "مراحل تطور وتشطيب بيتك" : "Your Project Journey"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B88460] animate-pulse" />
          <span
            className={cn(
              "text-[#503C2C]",
              isRTL ? "text-xs font-bold" : "text-xs font-mono font-medium"
            )}
          >
            {isRTL ? "مرحلة المراجعة الأولية" : "Initial Review Stage"}
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
                  ? "bg-background border-[#503C2C] shadow-sm ring-1 ring-[#503C2C]/20"
                  : isDone
                  ? "bg-background/70 border-border"
                  : "bg-background/40 border-border/60 opacity-60"
              )}
            >
              {/* Step indicator top row */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold",
                    isRTL ? "font-sans" : "font-mono",
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
                      ? "text-[#503C2C]"
                      : isCurrent
                      ? "text-[#B88460]"
                      : "text-[#78716C]"
                  )}
                />
              </div>

              {/* Title & Desc */}
              <div>
                <h4
                  className={cn(
                    "text-[#1C1917] leading-snug",
                    isRTL ? "font-sans text-xs sm:text-sm font-bold tracking-normal" : "text-xs sm:text-sm font-semibold"
                  )}
                >
                  {isRTL ? stage.titleAr : stage.titleEn}
                </h4>
                <p
                  className={cn(
                    "mt-1 leading-relaxed",
                    isRTL ? "text-xs font-medium text-[#4A3E31]" : "text-[11px] text-[#78716C]"
                  )}
                >
                  {isRTL ? stage.descAr : stage.descEn}
                </p>
              </div>

              {/* Status pill or schedule badge */}
              <div className="pt-2 border-t border-border/70">
                {isDone && (
                  <span
                    className={cn(
                      "text-[#503C2C] flex items-center gap-1 font-semibold",
                      isRTL ? "text-xs font-bold" : "text-[10px] font-mono"
                    )}
                  >
                    <CheckCircle weight="fill" className="w-3.5 h-3.5 text-[#B88460]" />
                    <span>{isRTL ? "خلصت" : "Completed"}</span>
                  </span>
                )}
                {isCurrent && (
                  <span
                    className={cn(
                      "text-[#B88460] flex items-center gap-1 font-semibold",
                      isRTL ? "text-xs font-bold" : "text-[10px] font-mono"
                    )}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{stage.scheduledDate || (isRTL ? "شغالين فيها" : "Active Stage")}</span>
                  </span>
                )}
                {!isDone && !isCurrent && (
                  <span
                    className={cn(
                      "text-[#78716C]",
                      isRTL ? "text-xs font-medium" : "text-[10px] font-mono"
                    )}
                  >
                    {isRTL ? "المرحلة الجاية" : "Upcoming"}
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
