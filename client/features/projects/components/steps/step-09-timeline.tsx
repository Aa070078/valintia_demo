"use client";

import * as React from "react";
import { Calendar, Hourglass, Infinity as InfinityIcon } from "@phosphor-icons/react";
import type { TargetCompletion } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface StepTimelineProps {
  timeline: TargetCompletion;
  onChangeTimeline: (timeline: TargetCompletion) => void;
}

const DURATIONS = [
  { value: "3_months", labelEn: "3 Months (Fast Track)", labelAr: "٣ أشهر (مسار سريع)" },
  { value: "6_months", labelEn: "6 Months (Standard)", labelAr: "٦ أشهر (المدة المعيارية)" },
  { value: "9_months", labelEn: "9 Months (Extensive)", labelAr: "٩ أشهر (مشروع كبير)" },
  { value: "12_months", labelEn: "12+ Months (Palatial)", labelAr: "١٢+ شهراً (قصور ومساحات كبرى)" },
];

export function StepTimeline({ timeline, onChangeTimeline }: StepTimelineProps) {
  const { isRTL } = useLanguage();

  const handleSelectType = (type: TargetCompletion["deadlineType"]) => {
    onChangeTimeline({
      ...timeline,
      deadlineType: type,
    });
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[#78716C]",
              isRTL
                ? "font-sans text-[11px] font-normal tracking-normal text-[#78716C]"
                : "font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
            )}
          >
            {isRTL ? "٠٩ — ٠٦ • الجدول الزمني وموعد التسليم" : "STEP 09 · TARGET COMPLETION"}
          </span>
        </div>
        <h2 className="mt-2 text-[#1C1917] font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight">
          {isRTL ? "متى ترغب في استلام مشروعك جاهزاً؟" : "What is your target handover date?"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#78716C] font-normal leading-relaxed max-w-xl">
          {isRTL
            ? "نحدد خطة التنفيذ وتوريد المواد بناءً على موعدك المستهدف، سواء كان تاريخاً محدداً أو فترة زمنية مرنة."
            : "Whether aiming for a specific summer handover or a steady milestone cadence, define your completion horizon."}
        </p>
      </div>

      {/* Mode Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Mode 1: Duration */}
        <div
          onClick={() => handleSelectType("duration")}
          className={cn(
            "cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 bg-card",
            timeline.deadlineType === "duration"
              ? "border-[#503C2C] shadow-md ring-1 ring-[#503C2C]/20"
              : "border-border hover:border-[#B88460]/60 opacity-80 hover:opacity-100"
          )}
        >
          <div className="flex items-start justify-between">
            <Hourglass className="w-5 h-5 text-[#B88460]" />
            {timeline.deadlineType === "duration" && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#B88460]" />
            )}
          </div>
          <div>
            <h3 className="text-[#1C1917] font-serif text-lg font-normal">
              {isRTL ? "مدة زمنية تقريبية" : "Target Duration"}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#78716C] font-normal">
              {isRTL ? "تحديد مدة كـ ٦ أو ٩ أشهر من التعاقد" : "e.g. 6 or 9 months from signing"}
            </p>
          </div>
        </div>

        {/* Mode 2: Specific Date */}
        <div
          onClick={() => handleSelectType("specific_date")}
          className={cn(
            "cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 bg-card",
            timeline.deadlineType === "specific_date"
              ? "border-[#503C2C] shadow-md ring-1 ring-[#503C2C]/20"
              : "border-border hover:border-[#B88460]/60 opacity-80 hover:opacity-100"
          )}
        >
          <div className="flex items-start justify-between">
            <Calendar className="w-5 h-5 text-[#B88460]" />
            {timeline.deadlineType === "specific_date" && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#B88460]" />
            )}
          </div>
          <div>
            <h3 className="text-[#1C1917] font-serif text-lg font-normal">
              {isRTL ? "تاريخ محدد للتسليم" : "Specific Calendar Date"}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#78716C] font-normal">
              {isRTL ? "مناسبة خاصة، موسم صيف، زواج، إلخ" : "Before summer, wedding, or relocation"}
            </p>
          </div>
        </div>

        {/* Mode 3: No Deadline */}
        <div
          onClick={() => handleSelectType("no_deadline")}
          className={cn(
            "cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 bg-card",
            timeline.deadlineType === "no_deadline"
              ? "border-[#503C2C] shadow-md ring-1 ring-[#503C2C]/20"
              : "border-border hover:border-[#B88460]/60 opacity-80 hover:opacity-100"
          )}
        >
          <div className="flex items-start justify-between">
            <InfinityIcon className="w-5 h-5 text-[#B88460]" />
            {timeline.deadlineType === "no_deadline" && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#B88460]" />
            )}
          </div>
          <div>
            <h3 className="text-[#1C1917] font-serif text-lg font-normal">
              {isRTL ? "مرن بدون موعد حرج" : "Flexible Horizon"}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#78716C] font-normal">
              {isRTL ? "التركيز على الجودة الحرفية العالية دون استعجال" : "Priority on artisanal execution"}
            </p>
          </div>
        </div>
      </div>

      {/* Inputs according to choice */}
      {timeline.deadlineType === "duration" && (
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-3 animate-in fade-in duration-300 shadow-xs">
          <label className="text-xs font-medium text-[#503C2C]">
            {isRTL ? "اختر المدة الزمنية المستهدفة" : "Select Target Duration"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DURATIONS.map((dur) => (
              <button
                key={dur.value}
                type="button"
                onClick={() =>
                  onChangeTimeline({
                    ...timeline,
                    durationDescription: isRTL ? dur.labelAr : dur.labelEn,
                  })
                }
                className={cn(
                  "p-3 rounded-xl border text-start transition-all cursor-pointer text-xs font-normal",
                  timeline.durationDescription === (isRTL ? dur.labelAr : dur.labelEn)
                    ? "bg-[#503C2C] text-[#FAF7F2] border-[#503C2C] shadow-sm font-medium"
                    : "bg-background border-border text-[#1C1917] hover:border-[#B88460]"
                )}
              >
                {isRTL ? dur.labelAr : dur.labelEn}
              </button>
            ))}
          </div>
        </div>
      )}

      {timeline.deadlineType === "specific_date" && (
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-2 max-w-sm animate-in fade-in duration-300 shadow-xs">
          <label className="text-xs font-medium text-[#503C2C]">
            {isRTL ? "تاريخ التسليم المستهدف" : "Target Handover Date"}
          </label>
          <input
            type="date"
            value={timeline.targetDate || ""}
            onChange={(e) =>
              onChangeTimeline({ ...timeline, targetDate: e.target.value })
            }
            className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460]"
          />
        </div>
      )}
    </div>
  );
}
