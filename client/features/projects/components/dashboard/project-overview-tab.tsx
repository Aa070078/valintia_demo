"use client";

import * as React from "react";
import {
  Building,
  MapPin,
  Globe,
  UserCheck,
  Hammer,
  Coins,
  CalendarCheck,
  Sparkle,
  HouseLine,
  ShieldCheck,
  Clock,
  CheckCircle,
} from "@phosphor-icons/react";
import type { Project } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";
import { getProjectStatusInfo } from "../../lib/project-status-resolver";
import { getSpaceDisplayName, getStyleDisplayName } from "../../lib/space-names";
import { cn } from "@/lib/utils";

interface ProjectOverviewTabProps {
  project: Project;
}

export function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
  const { isRTL } = useLanguage();
  const statusInfo = getProjectStatusInfo(project.status, isRTL);

  const property = project.property || {
    propertyType: project.propertyType || "villa",
    city: project.city || "Cairo",
    areaSqm: project.areaSqm || 450,
    compound: project.compound,
    floors: 2,
    condition: "semi_finished",
  };

  const activeSpaces = (project.spaces || []).filter((s) => s.included !== false);

  const getBudgetText = () => {
    if (!project.budget) return isRTL ? "هيتحدد بعد المعاينة والمقايسة" : "Under Preliminary Study";
    if (project.budget.budgetType === "exact" && project.budget.exactAmount) {
      return `${project.budget.exactAmount.toLocaleString()} ${project.budget.currency || "EGP"}`;
    }
    if (project.budget.budgetType === "range" && project.budget.minAmount && project.budget.maxAmount) {
      return `${project.budget.minAmount.toLocaleString()} - ${project.budget.maxAmount.toLocaleString()} ${project.budget.currency || "EGP"}`;
    }
    return isRTL ? "هيتحدد بعد المقايسة التفصيلية (BOQ)" : "Open for Preliminary BOQ Study";
  };

  const getTimelineText = () => {
    if (!project.timeline) return isRTL ? "براحتنا ومن غير استعجال (تركيز على الجودة)" : "Flexible Horizon";
    if (project.timeline.deadlineType === "specific_date" && project.timeline.targetDate) {
      return project.timeline.targetDate;
    }
    if (project.timeline.deadlineType === "duration" && project.timeline.durationDescription) {
      return project.timeline.durationDescription;
    }
    return isRTL ? "براحتنا ومن غير استعجال (تركيز على الجودة)" : "Flexible Horizon";
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* 1. Executive Telemetry & Milestone Progress Banner */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-xs flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-2xs",
                statusInfo.badgeClass,
                isRTL ? "font-sans font-bold" : "uppercase tracking-wider"
              )}
            >
              <span className="me-1.5 h-2 w-2 rounded-full bg-current opacity-80" />
              {statusInfo.label}
            </span>
            <span className="text-xs font-mono text-[#78716C]">
              {isRTL ? "كود المشروع:" : "Ref:"} VAL-{String(project.id).padStart(4, "0")}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#503C2C] font-semibold">
            <Clock className="w-4 h-4 text-[#B88460]" />
            <span>
              {isRTL ? "نسبة إنجاز المشروع:" : "Progress Track:"}
            </span>
            <span className="font-mono text-sm font-bold text-[#1C1917]">
              {statusInfo.percentage}%
            </span>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="h-2 w-full bg-[#EAE2D7] rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-700 rounded-full", statusInfo.progressColorClass)}
            style={{ width: `${statusInfo.percentage}%` }}
          />
        </div>

        {/* Current Stage & Action Required */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#78716C] font-medium">{isRTL ? "المرحلة الحالية:" : "Current Stage:"}</span>
            <span className="font-semibold text-[#1C1917]">{statusInfo.stageLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#B88460] font-bold shrink-0">{isRTL ? "الخطوة القادمة:" : "Next Step:"}</span>
            <span className="text-[#4A3E31] font-medium truncate">{statusInfo.nextStepLabel}</span>
          </div>
        </div>
      </div>

      {/* 2. Architectural Parameter Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Property & Typology */}
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
          <div
            className={cn(
              "flex items-center gap-2",
              isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
            )}
          >
            <Building className="w-4 h-4 text-[#B88460]" />
            <span>{isRTL ? "بيانات ومواصفات العقار" : "Property Specifications"}</span>
          </div>
          <div className="space-y-1.5 text-xs text-[#1C1917]">
            <div
              className={cn(
                "capitalize",
                isRTL ? "font-sans text-lg font-bold" : "font-serif text-lg"
              )}
            >
              {isRTL
                ? property.propertyType === "villa"
                  ? "فيلا مستقلة فاخرة"
                  : property.propertyType === "penthouse"
                  ? "بنتهاوس مع رووف"
                  : property.propertyType === "duplex"
                  ? "دوبلكس راقي"
                  : property.propertyType === "commercial"
                  ? "مقر إداري / تجاري"
                  : "شقة سكنية راقية"
                : property.propertyType.replace("_", " ")}
            </div>
            <div className="flex items-center gap-1.5 text-[#503C2C]">
              <MapPin className="w-3.5 h-3.5 text-[#B88460]" />
              <span className={cn(isRTL ? "font-bold" : "font-medium")}>
                {property.compound ? `${property.compound}, ` : ""}{property.city}
              </span>
            </div>
            <div className={cn("flex flex-wrap items-center gap-3 text-[#78716C] pt-1", isRTL ? "font-sans text-xs font-semibold" : "font-mono text-[11px]")}>
              <span>{property.areaSqm} {isRTL ? "م² مساحة مباني" : "m² Area"}</span>
              <span>•</span>
              <span>{property.floors || 2} {isRTL ? "مستويات / أدوار" : "Levels"}</span>
              <span>•</span>
              <span className="capitalize">
                {isRTL
                  ? property.condition === "core_shell"
                    ? "على الطوب الأحمر"
                    : property.condition === "semi_finished"
                    ? "نصف تشطيب (محارة وحلوق)"
                    : "تشطيب كامل يتطلب إعادة تهيئة"
                  : (property.condition || "semi_finished").replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Client Residence & Timezone */}
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
          <div
            className={cn(
              "flex items-center gap-2",
              isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
            )}
          >
            <Globe className="w-4 h-4 text-[#B88460]" />
            <span>{isRTL ? "مكان إقامتك الحالي وتوقيتك" : "Client Base & Timezone"}</span>
          </div>
          <div className="space-y-1.5 text-xs text-[#1C1917]">
            <div
              className={cn(
                isRTL ? "font-sans text-lg font-bold" : "font-serif text-lg"
              )}
            >
              {project.customerLocation?.city || "Cairo"}, {project.customerLocation?.country || "Egypt"}
            </div>
            <div className={cn("text-[#78716C] text-[11px]", isRTL ? "font-sans font-medium" : "font-mono")}>
              {project.customerLocation?.timezone || "Africa/Cairo (GMT+2)"}
            </div>
            <p className={cn("pt-1", isRTL ? "text-xs font-medium text-[#4A3E31]" : "text-[11px] text-[#78716C]")}>
              {isRTL
                ? "بننسق معاك مكالمات الفيديو وتقارير الموقع الأسبوعية مباشرة حسب توقيتك المحلي."
                : "Virtual sessions and live updates are scheduled around this local time."}
            </p>
          </div>
        </div>

        {/* Local Representative in Egypt */}
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
          <div
            className={cn(
              "flex items-center gap-2",
              isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
            )}
          >
            <UserCheck className="w-4 h-4 text-[#B88460]" />
            <span>{isRTL ? "التمثيل واستلام المفاتيح في مصر" : "Representation in Egypt"}</span>
          </div>
          <div className="text-xs text-[#1C1917]">
            {project.representative?.hasRepresentative ? (
              <div className="space-y-1">
                <div className={cn(isRTL ? "font-bold text-sm" : "font-medium")}>
                  {project.representative.name}
                </div>
                <div className={cn("text-[#78716C]", isRTL ? "font-sans font-semibold" : "font-mono")}>
                  {project.representative.phone}
                </div>
                <div className={cn(isRTL ? "text-xs font-medium text-[#4A3E31]" : "text-[11px] text-[#78716C]")}>
                  {project.representative.authorizationScope || (isRTL ? "تسليم المفاتيح وحضور المعاينة والمطابقة" : "Key handover & site visits")}
                </div>
              </div>
            ) : (
              <div className={cn("leading-relaxed", isRTL ? "text-xs font-medium text-[#4A3E31]" : "text-[#78716C]")}>
                {isRTL
                  ? "إدارة مباشرة من فالنتيا: مهندس الموقع يستلم المفاتيح مباشرة وينسق معك كافة الخطوات رقمياً."
                  : "Valentia Direct Custody: Our team manages keys, scans, and site logistics directly with you."}
              </div>
            )}
          </div>
        </div>

        {/* Scope of Fit-Out */}
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
          <div
            className={cn(
              "flex items-center gap-2",
              isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
            )}
          >
            <Hammer className="w-4 h-4 text-[#B88460]" />
            <span>{isRTL ? "حجم ونوع التشطيب المطلوب" : "Commission Scope"}</span>
          </div>
          <div className="space-y-1.5 text-xs text-[#1C1917]">
            <div
              className={cn(
                "capitalize",
                isRTL ? "font-sans text-lg font-bold" : "font-serif text-lg"
              )}
            >
              {isRTL
                ? "تشطيب معماري وديكور متكامل (على المفتاح)"
                : (project.scope?.scopeType || "full_fitout").replace("_", " ")}
            </div>
            <p className={cn("leading-relaxed", isRTL ? "text-xs font-medium text-[#4A3E31]" : "text-[11px] text-[#78716C]")}>
              {project.scope?.customDetails ||
                (isRTL
                  ? "يشمل الأعمال الكهربائية، السباكة الفندقية، تجليد الحوائط والرخام، الأسقف المعلقة، والأبواب الخشبية المصممة خصيصاً."
                  : "Includes MEP infrastructure, custom joinery, natural stone cladding, and recessed architectural lighting.")}
            </p>
          </div>
        </div>

        {/* Financial & Budget Bracket */}
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
          <div
            className={cn(
              "flex items-center gap-2",
              isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
            )}
          >
            <Coins className="w-4 h-4 text-[#B88460]" />
            <span>{isRTL ? "الميزانية التقديرية" : "Target Investment"}</span>
          </div>
          <div className="text-xs text-[#1C1917]">
            <div
              className={cn(
                "text-[#B88460]",
                isRTL ? "font-sans text-xl font-bold" : "font-serif text-xl font-normal"
              )}
            >
              {getBudgetText()}
            </div>
            <p className={cn("mt-1", isRTL ? "text-xs font-medium text-[#4A3E31]" : "text-[11px] text-[#78716C]")}>
              {isRTL
                ? "البنود والأسعار بتتفصّل بدقة في مرحلة المقايسة الهندسية (BOQ)."
                : "Refined and itemized during the BOQ engineering phase."}
            </p>
          </div>
        </div>

        {/* Target Handover Horizon */}
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
          <div
            className={cn(
              "flex items-center gap-2",
              isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
            )}
          >
            <CalendarCheck className="w-4 h-4 text-[#B88460]" />
            <span>{isRTL ? "ميعاد التسليم المستهدف" : "Target Handover Horizon"}</span>
          </div>
          <div className="text-xs text-[#1C1917]">
            <div
              className={cn(
                isRTL ? "font-sans text-xl font-bold" : "font-serif text-xl font-normal"
              )}
            >
              {getTimelineText()}
            </div>
            <p className={cn("mt-1", isRTL ? "text-xs font-medium text-[#4A3E31]" : "text-[11px] text-[#78716C]")}>
              {isRTL
                ? "بنتابع خطوات التنفيذ في الموقع أسبوعياً وبنبعتلك صور حية أول بأول."
                : "Tracked weekly with high-resolution photographic milestones."}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Spaces & Finishes Architecture Overview */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
            <HouseLine className="w-4 h-4 text-[#B88460]" />
            <span>{isRTL ? "ملخص الغرف والمساحات المحددة" : "Configured Spatial Zones"}</span>
          </div>
          <span className="text-xs font-mono text-[#503C2C] font-bold">
            {activeSpaces.length} {isRTL ? "فراغ معتمد" : "Zones"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeSpaces.map((space) => {
            const spaceTitle = getSpaceDisplayName(space, isRTL);
            const styleTitle = space.stylePreference?.styleName
              ? getStyleDisplayName(space.stylePreference.styleName, isRTL)
              : isRTL
              ? "الستايل العام للبيت"
              : "Harmonized Residence Palette";

            return (
              <div
                key={space.id}
                className="p-3.5 rounded-xl border border-border/80 bg-secondary/30 flex items-start justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-[#1C1917] truncate">{spaceTitle}</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#B88460] mt-1 font-medium truncate">
                    <Sparkle className="w-3 h-3 shrink-0" />
                    <span className="truncate">{styleTitle}</span>
                  </div>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-white border border-[#D8C8B4] text-[10px] font-mono text-[#503C2C]">
                  x{space.quantity || 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Atelier Assurance & Guarantee Seal */}
      <div className="p-5 rounded-2xl bg-[#FAF6F0] border border-[#E6DDD2] flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#503C2C] text-[#FAF7F2] flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#FAF7F2]" weight="fill" />
          </div>
          <div>
            <div className="font-semibold text-[#1C1917]">
              {isRTL ? "ضمان فالنتيا الشامل للأعمال المعمارية" : "Valentia Comprehensive Atelier Warranty"}
            </div>
            <div className="text-[11px] text-[#78716C] mt-0.5">
              {isRTL
                ? "مقايسة تفصيلية معتمدة BOQ، جداول زمنية ملزمة، وتأمين هندسي لكافة البنود والتوريدات."
                : "Itemized BOQ certainty, binding milestones, and complete materials certification."}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-[#503C2C]">
          <CheckCircle className="w-4 h-4 text-emerald-600" weight="fill" />
          <span>{isRTL ? "مواصفات قياسية معتمدة" : "Engineering Grade Standards"}</span>
        </div>
      </div>
    </div>
  );
}
