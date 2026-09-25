"use client";

import * as React from "react";
import {
  PencilSimple,
  CheckCircle,
  Building,
  Sparkle,
  HouseLine,
  MapPin,
  Globe,
  UserCheck,
  Hammer,
  Coins,
  CalendarCheck,
  FilePdf,
} from "@phosphor-icons/react";
import type {
  PropertyType,
  PropertyEntity,
  SpaceEntity,
  PendingStyleSelection,
  CustomerLocation,
  AuthorizedRepresentative,
  ProjectScope,
  ProjectBudget,
  TargetCompletion,
  ProjectDocument,
} from "../../types";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface StepReviewSubmitProps {
  propertyType: PropertyType;
  primaryStyleId: string;
  pendingStyles: PendingStyleSelection[];
  spaces: SpaceEntity[];
  property: PropertyEntity;
  customerLocation: CustomerLocation;
  representative: AuthorizedRepresentative;
  scope: ProjectScope;
  budget: ProjectBudget;
  timeline: TargetCompletion;
  documents: ProjectDocument[];
  onJumpToStep: (stepNumber: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function StepReviewSubmit({
  propertyType,
  primaryStyleId,
  spaces,
  property,
  customerLocation,
  representative,
  scope,
  budget,
  timeline,
  documents,
  onJumpToStep,
  onSubmit,
  isSubmitting,
}: StepReviewSubmitProps) {
  const { isRTL } = useLanguage();

  const selectedRoomsCount = spaces
    .filter((s) => s.included)
    .reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  const getBudgetText = () => {
    if (budget.budgetType === "exact" && budget.exactAmount) {
      return `${budget.exactAmount.toLocaleString()} ${budget.currency || "EGP"}`;
    }
    if (budget.budgetType === "range" && budget.minAmount && budget.maxAmount) {
      return `${budget.minAmount.toLocaleString()} - ${budget.maxAmount.toLocaleString()} ${budget.currency || "EGP"}`;
    }
    return isRTL ? "مفتوح لدراسة التكلفة وجدول الكميات" : "Open for Preliminary BOQ Study";
  };

  const getTimelineText = () => {
    if (timeline.deadlineType === "specific_date" && timeline.targetDate) {
      return timeline.targetDate;
    }
    if (timeline.deadlineType === "duration" && timeline.durationDescription) {
      return timeline.durationDescription;
    }
    return isRTL ? "جدول زمني مرن يركز على الجودة" : "Flexible Horizon";
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
                ? "font-sans text-xs font-bold tracking-normal text-[#503C2C]"
                : "font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
            )}
          >
            {isRTL ? "الخطوة ١١ · مراجعة المشروع واعتماد التكليف" : "STEP 11 · REVIEW & COMMISSION"}
          </span>
        </div>
        <h2
          className={cn(
            "mt-2 text-[#1C1917]",
            isRTL
              ? "font-sans text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.3] tracking-normal"
              : "font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight"
          )}
        >
          {isRTL ? "مراجعة مواصفات المشروع" : "Review your commission brief"}
        </h2>
        <p
          className={cn(
            "mt-2 leading-relaxed max-w-xl",
            isRTL
              ? "text-sm font-medium text-[#4A3E31]"
              : "text-xs sm:text-sm text-[#78716C]"
          )}
        >
          {isRTL
            ? "راجع جميع البيانات والمواصفات المدخلة قبل اعتماد إرسال الملف. يمكنك تعديل أي قسم بالضغط على زر التعديل بجواره."
            : "Examine all architectural parameters before commissioning your atelier. You can jump directly to any step to revise selections."}
        </p>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 01. Property Type */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex items-center gap-2",
                isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
              )}
            >
              <Building className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "النمط المعماري" : "Typology"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className={cn(
                "flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] cursor-pointer",
                isRTL ? "text-xs font-bold" : "text-[11px] font-medium"
              )}
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div
            className={cn(
              "text-[#1C1917] capitalize",
              isRTL ? "font-sans text-base font-bold" : "font-serif text-lg"
            )}
          >
            {propertyType}
          </div>
        </div>

        {/* 02. Aesthetic Direction */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex items-center gap-2",
                isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
              )}
            >
              <Sparkle className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "التوجه الجمالي" : "Aesthetic Direction"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className={cn(
                "flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] cursor-pointer",
                isRTL ? "text-xs font-bold" : "text-[11px] font-medium"
              )}
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div
            className={cn(
              "text-[#1C1917] capitalize",
              isRTL ? "font-sans text-base font-bold" : "font-serif text-lg"
            )}
          >
            {primaryStyleId.replace("_", " ")}
          </div>
        </div>

        {/* 03. Spaces */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex items-center gap-2",
                isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
              )}
            >
              <HouseLine className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "الفراغات المعتمدة" : "Spatial Program"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(3)}
              className={cn(
                "flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] cursor-pointer",
                isRTL ? "text-xs font-bold" : "text-[11px] font-medium"
              )}
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div
            className={cn(
              "text-[#1C1917]",
              isRTL ? "font-sans text-base font-bold" : "text-sm font-medium"
            )}
          >
            {selectedRoomsCount} {isRTL ? "غرف وفراغات معتمدة" : "active zones configured"}
          </div>
        </div>

        {/* 04. Property Specs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex items-center gap-2",
                isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
              )}
            >
              <MapPin className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "مواصفات وموقع العقار" : "Property & Location"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(4)}
              className={cn(
                "flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] cursor-pointer",
                isRTL ? "text-xs font-bold" : "text-[11px] font-medium"
              )}
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div className="text-xs text-[#1C1917]">
            <div className={cn(isRTL ? "font-bold text-sm" : "font-medium")}>
              {property.compound ? `${property.compound}, ` : ""}{property.city || "Cairo"}
            </div>
            <div className={cn("font-mono text-[#503C2C] mt-0.5", isRTL && "font-sans font-semibold")}>
              {property.areaSqm || 450} {isRTL ? "م²" : "m²"} · {property.floors || 1} {isRTL ? "أدوار" : "Floors"}
            </div>
          </div>
        </div>

        {/* 05. Customer Timezone */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex items-center gap-2",
                isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
              )}
            >
              <Globe className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "بلد الإقامة والمنطقة الزمنية" : "Client Base & Timezone"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(5)}
              className={cn(
                "flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] cursor-pointer",
                isRTL ? "text-xs font-bold" : "text-[11px] font-medium"
              )}
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div className="text-xs text-[#1C1917]">
            <div className={cn(isRTL ? "font-bold text-sm" : "font-medium")}>
              {customerLocation.city}, {customerLocation.country}
            </div>
            <span className={cn("block text-[#78716C] text-[10px] mt-0.5", isRTL ? "font-sans font-medium" : "font-mono")}>
              {customerLocation.timezone}
            </span>
          </div>
        </div>

        {/* 06. Representative */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex items-center gap-2",
                isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
              )}
            >
              <UserCheck className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "الممثل في مصر" : "Representation in Egypt"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(6)}
              className={cn(
                "flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] cursor-pointer",
                isRTL ? "text-xs font-bold" : "text-[11px] font-medium"
              )}
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div className={cn("text-xs text-[#1C1917]", isRTL && "font-bold text-sm")}>
            {representative.hasRepresentative
              ? `${representative.name || "Authorized Contact"} (${representative.phone || ""})`
              : isRTL ? "إشراف وإدارة مباشرة من استوديو فالنتيا" : "Valentia Direct Atelier Management"}
          </div>
        </div>

        {/* 07. Scope */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex items-center gap-2",
                isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
              )}
            >
              <Hammer className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "نطاق العمل" : "Scope"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(7)}
              className={cn(
                "flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] cursor-pointer",
                isRTL ? "text-xs font-bold" : "text-[11px] font-medium"
              )}
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div className={cn("text-xs text-[#1C1917] capitalize", isRTL && "font-bold text-sm")}>
            {(scope.scopeType || "full_fitout").replace("_", " ")}
          </div>
        </div>

        {/* 08. Budget */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex items-center gap-2",
                isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
              )}
            >
              <Coins className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "الميزانية المقدرة" : "Target Budget"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(8)}
              className={cn(
                "flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] cursor-pointer",
                isRTL ? "text-xs font-bold" : "text-[11px] font-medium"
              )}
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div className={cn("text-xs font-semibold text-[#1C1917]", isRTL && "font-bold text-sm")}>
            {getBudgetText()}
          </div>
        </div>

        {/* 09. Timeline */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex items-center gap-2",
                isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
              )}
            >
              <CalendarCheck className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "الجدول الزمني" : "Target Timeline"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(9)}
              className={cn(
                "flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] cursor-pointer",
                isRTL ? "text-xs font-bold" : "text-[11px] font-medium"
              )}
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div className={cn("text-xs text-[#1C1917]", isRTL && "font-bold text-sm")}>
            {getTimelineText()}
          </div>
        </div>

        {/* 10. Drawings */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex items-center gap-2",
                isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
              )}
            >
              <FilePdf className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "المخططات الهندسية" : "Drawings & CAD"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(10)}
              className={cn(
                "flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] cursor-pointer",
                isRTL ? "text-xs font-bold" : "text-[11px] font-medium"
              )}
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div className={cn("text-xs text-[#1C1917]", isRTL && "font-bold text-sm")}>
            {documents.length > 0
              ? `${documents.length} ${isRTL ? "ملفات مرفوعة" : "files attached"}`
              : isRTL ? "سيتم المسح الليزري ثلاثي الأبعاد في الموقع" : "Valentia 3D Site Survey scheduled"}
          </div>
        </div>
      </div>

      {/* Submission CTA Banner */}
      <div className="p-6 rounded-3xl bg-[#503C2C] text-[#FAF7F2] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-5">
        <div>
          <h3
            className={cn(
              "leading-tight",
              isRTL ? "font-sans text-xl sm:text-2xl font-bold" : "font-serif text-xl sm:text-2xl font-normal"
            )}
          >
            {isRTL ? "جاهز لاعتماد وإرسال طلب مشروعك؟" : "Ready to commission your atelier?"}
          </h3>
          <p
            className={cn(
              "mt-1 max-w-lg leading-relaxed",
              isRTL ? "text-xs font-medium text-[#E5D7C7]" : "text-xs text-[#D4C3B3]"
            )}
          >
            {isRTL
              ? "بمجرد الإرسال، سيتولى فريق فالنتيا مراجعة المواصفات وإتاحة حجز الاستشارة المباشرة وتنسيق زيارة المعاينة الميدانية."
              : "Submitting establishes your digital project hub. Our engineering team reviews specifications and opens the consultation scheduler."}
          </p>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={cn(
            "shrink-0 px-8 py-3.5 rounded-full bg-[#B88460] text-white hover:bg-[#A37250] transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer",
            isRTL ? "text-xs font-bold tracking-normal" : "text-xs font-medium tracking-wider uppercase"
          )}
        >
          {isSubmitting ? (
            <>
              <Spinner className="w-4 h-4 text-white" />
              <span>{isRTL ? "جاري الاعتماد..." : "Submitting Commission..."}</span>
            </>
          ) : (
            <>
              <CheckCircle weight="fill" className="w-4 h-4" />
              <span>{isRTL ? "إرسال واعتماد المشروع ←" : "Submit & Commission Atelier →"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
