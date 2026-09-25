"use client";

import * as React from "react";
import { Hammer, Sparkle, CompassTool, Rows } from "@phosphor-icons/react";
import type { ProjectScope } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface StepScopeProps {
  scope: ProjectScope;
  onChangeScope: (scope: ProjectScope) => void;
}

const SCOPE_OPTIONS = [
  {
    id: "full_fitout",
    titleEn: "Turnkey Design & Build (Full Fit-Out)",
    titleAr: "تصميم وتنفيذ متكامل (تسليم مفتاح)",
    descEn:
      "Comprehensive architectural design, MEP rough-ins, bespoke joinery, finishes, and turnkey handover.",
    descAr:
      "تصميم معماري وديكور كامل، أعمال كهروميكانيكية، تجاليد وتشطيبات مخصصة، وتسليم نهائي بالمفتاح.",
    badgeEn: "Most Requested",
    badgeAr: "الأكثر طلباً",
    icon: Hammer,
  },
  {
    id: "renovation",
    titleEn: "Architectural Renovation & Remodel",
    titleAr: "تجديد وإعادة هيكلة معمارية",
    descEn:
      "Structural adjustments, wall reconfiguration, updated infrastructure, and luxury spatial transformation.",
    descAr:
      "تعديلات إنشائية، إعادة تقسيم المساحات، تحديث كامل لشبكات السباكة والكهرباء، وتطوير شامل للفراغ.",
    badgeEn: "Structural Remodel",
    badgeAr: "إعادة تأهيل شامل",
    icon: CompassTool,
  },
  {
    id: "interior_design",
    titleEn: "Interior Design & FF&E Procurement",
    titleAr: "تصميم داخلي واختيار الأثاث والفرش",
    descEn:
      "3D spatial visualizations, technical design packages, lighting design, and curated furniture procurement.",
    descAr:
      "مخططات ثلاثية الأبعاد، لوحات خامات تفصيلية، دراسات إضاءة، واختيار وتوريد الأثاث والإكسسوارات.",
    badgeEn: "Design Package",
    badgeAr: "حزمة تصميمية",
    icon: Sparkle,
  },
  {
    id: "other",
    titleEn: "Custom Architectural Scope",
    titleAr: "نطاق عمل مخصص",
    descEn:
      "Landscape and private swimming pools, facade alterations, or tailored boutique commercial spaces.",
    descAr:
      "تنسيق حدائق ومسابح خاصة، تعديل واجهات خارجية، أو مقرات إدارية وتجارية متخصصة.",
    badgeEn: "Tailored",
    badgeAr: "مخصص",
    icon: Rows,
  },
];

export function StepScope({ scope, onChangeScope }: StepScopeProps) {
  const { isRTL } = useLanguage();

  const handleSelectType = (type: ProjectScope["scopeType"]) => {
    onChangeScope({
      ...scope,
      scopeType: type,
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
            {isRTL ? "٠٧ — ٠٦ • نطاق العمل المطلوب" : "STEP 07 · SCOPE OF WORK"}
          </span>
        </div>
        <h2 className="mt-2 text-[#1C1917] font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight">
          {isRTL ? "ما هو نطاق العمل المطلوب من فالنتيا؟" : "What is the desired scope of work?"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#78716C] font-normal leading-relaxed max-w-xl">
          {isRTL
            ? "اختر مستوى التدخل الهندسي المناسب، بدءاً من التصميم الداخلي وتوريد الأثاث حتى التنفيذ الشامل وتسليم المفتاح."
            : "Select the depth of involvement required from our atelier, from design-only packages through end-to-end turnkey construction."}
        </p>
      </div>

      {/* Scope Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SCOPE_OPTIONS.map((opt) => {
          const isSelected = (scope.scopeType || "full_fitout") === opt.id;
          const IconComponent = opt.icon;
          return (
            <div
              key={opt.id}
              onClick={() => handleSelectType(opt.id as ProjectScope["scopeType"])}
              className={cn(
                "cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 bg-card",
                isSelected
                  ? "border-[#503C2C] shadow-md ring-1 ring-[#503C2C]/20"
                  : "border-border hover:border-[#B88460]/60 opacity-85 hover:opacity-100"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-[#503C2C]" />
                </div>
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full border text-[10px] font-normal",
                    isSelected
                      ? "bg-[#503C2C] text-[#FAF7F2] border-[#503C2C]"
                      : "bg-background text-[#78716C] border-border"
                  )}
                >
                  {isRTL ? opt.badgeAr : opt.badgeEn}
                </span>
              </div>

              <div>
                <h3 className="text-[#1C1917] font-serif text-lg font-normal">
                  {isRTL ? opt.titleAr : opt.titleEn}
                </h3>
                <p className="mt-1.5 leading-relaxed text-xs text-[#78716C] font-normal">
                  {isRTL ? opt.descAr : opt.descEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom details / Notes */}
      <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-3 shadow-xs">
        <label className="text-xs font-medium text-[#503C2C]">
          {isRTL ? "تفاصيل إضافية أو متطلبات خاصة في التنفيذ" : "Specific Custom Scope Requirements"}
        </label>
        <textarea
          rows={3}
          value={scope.customDetails || ""}
          onChange={(e) =>
            onChangeScope({ ...scope, customDetails: e.target.value })
          }
          placeholder={
            isRTL
              ? "مثال: نرغب في إضافة نظام سمارت هوم كامل (KNX)، وعزل صوتي لغرف النوم، وتعديل مكان المطبخ ليكون مفتوحاً على المعيشة..."
              : "e.g., Integrate full KNX smart home system, acoustic double walls for private quarters, open-concept kitchen island..."
          }
          className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460] resize-none"
        />
      </div>
    </div>
  );
}
