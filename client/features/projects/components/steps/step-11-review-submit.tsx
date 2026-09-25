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
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78716C] dark:text-[#989692]">
            {isRTL ? "الخطوة ١١ · مراجعة المشروع واعتماد التكليف" : "STEP 11 · REVIEW & COMMISSION"}
          </span>
        </div>
        <h2 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#1C1917] dark:text-[#FAF7F2]">
          {isRTL ? "مراجعة مواصفات المشروع" : "Review your commission brief"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#78716C] dark:text-[#989692] leading-relaxed max-w-xl">
          {isRTL
            ? "راجع جميع البيانات والمواصفات المدخلة قبل اعتماد إرسال الملف. يمكنك تعديل أي قسم بالضغط على زر التعديل بجواره."
            : "Examine all architectural parameters before commissioning your atelier. You can jump directly to any step to revise selections."}
        </p>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 01. Property Type */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3]">
              <Building className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "النمط المعماري" : "Typology"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="text-[11px] flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] font-medium"
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div className="font-serif text-lg text-[#1C1917] dark:text-[#FAF7F2] capitalize">
            {propertyType}
          </div>
        </div>

        {/* 02. Aesthetic Direction */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3]">
              <Sparkle className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "التوجه الجمالي" : "Aesthetic Direction"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="text-[11px] flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] font-medium"
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div className="font-serif text-lg text-[#1C1917] dark:text-[#FAF7F2] capitalize">
            {primaryStyleId.replace("_", " ")}
          </div>
        </div>

        {/* 03. Spaces */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3]">
              <HouseLine className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "الفراغات المعتمدة" : "Spatial Program"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(3)}
              className="text-[11px] flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] font-medium"
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div className="text-sm font-medium text-[#1C1917] dark:text-[#FAF7F2]">
            {selectedRoomsCount} {isRTL ? "غرف وفراغات معتمدة" : "active zones configured"}
          </div>
        </div>

        {/* 04. Property Specs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3]">
              <MapPin className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "مواصفات وموقع العقار" : "Property & Location"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(4)}
              className="text-[11px] flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] font-medium"
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div className="text-xs text-[#1C1917] dark:text-[#FAF7F2]">
            <div>{property.compound ? `${property.compound}, ` : ""}{property.city || "Cairo"}</div>
            <div className="font-mono text-[#78716C] mt-0.5">{property.areaSqm || 450} m² · {property.floors || 1} {isRTL ? "أدوار" : "Floors"}</div>
          </div>
        </div>

        {/* 05. Customer Timezone */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3]">
              <Globe className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "بلد الإقامة والمنطقة الزمنية" : "Client Base & Timezone"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(5)}
              className="text-[11px] flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] font-medium"
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div className="text-xs text-[#1C1917] dark:text-[#FAF7F2]">
            {customerLocation.city}, {customerLocation.country}
            <span className="block font-mono text-[#78716C] text-[10px] mt-0.5">{customerLocation.timezone}</span>
          </div>
        </div>

        {/* 06. Representative */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3]">
              <UserCheck className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "الممثل في مصر" : "Representation in Egypt"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(6)}
              className="text-[11px] flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] font-medium"
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div className="text-xs text-[#1C1917] dark:text-[#FAF7F2]">
            {representative.hasRepresentative
              ? `${representative.name || "Authorized Contact"} (${representative.phone || ""})`
              : isRTL ? "إشراف وإدارة مباشرة من استوديو فالنتيا" : "Valentia Direct Atelier Management"}
          </div>
        </div>

        {/* 07. Scope */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3]">
              <Hammer className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "نطاق العمل" : "Scope"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(7)}
              className="text-[11px] flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] font-medium"
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div className="text-xs text-[#1C1917] dark:text-[#FAF7F2] capitalize">
            {(scope.scopeType || "full_fitout").replace("_", " ")}
          </div>
        </div>

        {/* 08. Budget */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3]">
              <Coins className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "الميزانية المقدرة" : "Target Budget"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(8)}
              className="text-[11px] flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] font-medium"
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div className="text-xs font-semibold text-[#1C1917] dark:text-[#FAF7F2]">
            {getBudgetText()}
          </div>
        </div>

        {/* 09. Timeline */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3]">
              <CalendarCheck className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "الجدول الزمني" : "Target Timeline"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(9)}
              className="text-[11px] flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] font-medium"
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div className="text-xs text-[#1C1917] dark:text-[#FAF7F2]">
            {getTimelineText()}
          </div>
        </div>

        {/* 10. Drawings */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3]">
              <FilePdf className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "المخططات الهندسية" : "Drawings & CAD"}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(10)}
              className="text-[11px] flex items-center gap-1 text-[#B88460] hover:text-[#503C2C] font-medium"
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </button>
          </div>
          <div className="text-xs text-[#1C1917] dark:text-[#FAF7F2]">
            {documents.length > 0
              ? `${documents.length} ${isRTL ? "ملفات مرفوعة" : "files attached"}`
              : isRTL ? "سيتم المسح الليزري ثلاثي الأبعاد في الموقع" : "Valentia 3D Site Survey scheduled"}
          </div>
        </div>
      </div>

      {/* Submission CTA Banner */}
      <div className="p-6 rounded-3xl bg-[#503C2C] text-[#FAF7F2] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-5">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-normal leading-tight">
            {isRTL ? "جاهز لاعتماد وإرسال طلب مشروعك؟" : "Ready to commission your atelier?"}
          </h3>
          <p className="text-xs text-[#D4C3B3] mt-1 max-w-lg leading-relaxed">
            {isRTL
              ? "بمجرد الإرسال، سيتولى فريق فالنتيا مراجعة المواصفات وإتاحة حجز الاستشارة المباشرة وتنسيق زيارة المعاينة الميدانية."
              : "Submitting establishes your digital project hub. Our engineering team reviews specifications and opens the consultation scheduler."}
          </p>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="shrink-0 px-8 py-3.5 rounded-full bg-[#B88460] text-white font-medium text-xs tracking-wider uppercase hover:bg-[#A37250] transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
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
