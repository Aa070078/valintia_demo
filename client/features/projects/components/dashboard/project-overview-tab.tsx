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
} from "@phosphor-icons/react";
import type { Project } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";

interface ProjectOverviewTabProps {
  project: Project;
}

export function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
  const { isRTL } = useLanguage();

  const property = project.property || {
    propertyType: project.propertyType || "villa",
    city: project.city || "Cairo",
    areaSqm: project.areaSqm || 450,
    compound: project.compound,
  };

  const getBudgetText = () => {
    if (!project.budget) return isRTL ? "مفتوح لدراسة التكلفة" : "Under Preliminary Study";
    if (project.budget.budgetType === "exact" && project.budget.exactAmount) {
      return `${project.budget.exactAmount.toLocaleString()} ${project.budget.currency || "EGP"}`;
    }
    if (project.budget.budgetType === "range" && project.budget.minAmount && project.budget.maxAmount) {
      return `${project.budget.minAmount.toLocaleString()} - ${project.budget.maxAmount.toLocaleString()} ${project.budget.currency || "EGP"}`;
    }
    return isRTL ? "مفتوح لدراسة التكلفة وجدول الكميات" : "Open for Preliminary BOQ Study";
  };

  const getTimelineText = () => {
    if (!project.timeline) return isRTL ? "مرن بدون موعد حرج" : "Flexible Horizon";
    if (project.timeline.deadlineType === "specific_date" && project.timeline.targetDate) {
      return project.timeline.targetDate;
    }
    if (project.timeline.deadlineType === "duration" && project.timeline.durationDescription) {
      return project.timeline.durationDescription;
    }
    return isRTL ? "جدول زمني مرن يركز على الجودة" : "Flexible Horizon";
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* 2-Column Grid of Architectural Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Property & Location */}
        <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3]">
            <Building className="w-4 h-4 text-[#B88460]" />
            <span>{isRTL ? "بيانات العقار والنمط المعماري" : "Property & Typology"}</span>
          </div>
          <div className="space-y-1.5 text-xs text-[#1C1917] dark:text-[#FAF7F2]">
            <div className="font-serif text-lg capitalize">{property.propertyType}</div>
            <div className="flex items-center gap-1.5 text-[#78716C] dark:text-[#989692]">
              <MapPin className="w-3.5 h-3.5 text-[#B88460]" />
              <span>{property.compound ? `${property.compound}, ` : ""}{property.city}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-[#78716C] pt-1">
              <span>{property.areaSqm} m²</span>
              <span>•</span>
              <span>{property.floors || 1} {isRTL ? "أدوار" : "Levels"}</span>
              <span>•</span>
              <span className="capitalize">{(property.condition || "semi_finished").replace("_", " ")}</span>
            </div>
          </div>
        </div>

        {/* Client Residence & Timezone */}
        <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3]">
            <Globe className="w-4 h-4 text-[#B88460]" />
            <span>{isRTL ? "موقع إقامة العميل والمنطقة الزمنية" : "Client Base & Timezone"}</span>
          </div>
          <div className="space-y-1.5 text-xs text-[#1C1917] dark:text-[#FAF7F2]">
            <div className="font-serif text-lg">
              {project.customerLocation?.city || "Cairo"}, {project.customerLocation?.country || "Egypt"}
            </div>
            <div className="font-mono text-[#78716C] dark:text-[#989692] text-[11px]">
              {project.customerLocation?.timezone || "Africa/Cairo (GMT+2)"}
            </div>
            <p className="text-[11px] text-[#78716C] pt-1">
              {isRTL
                ? "يتم جدولة الجلسات الافتراضية ومكالمات المراجعة وفق توقيت هذا الموقع."
                : "Virtual sessions and live updates are scheduled around this local time."}
            </p>
          </div>
        </div>

        {/* Local Representative */}
        <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3]">
            <UserCheck className="w-4 h-4 text-[#B88460]" />
            <span>{isRTL ? "الممثل والوكيل في مصر" : "Representation in Egypt"}</span>
          </div>
          <div className="text-xs text-[#1C1917] dark:text-[#FAF7F2]">
            {project.representative?.hasRepresentative ? (
              <div className="space-y-1">
                <div className="font-medium">{project.representative.name}</div>
                <div className="font-mono text-[#78716C]">{project.representative.phone}</div>
                <div className="text-[11px] text-[#78716C]">{project.representative.authorizationScope || "Key handover & site visits"}</div>
              </div>
            ) : (
              <div className="text-[#78716C] dark:text-[#989692] leading-relaxed">
                {isRTL
                  ? "إدارة مباشرة من فالنتيا: يتولى مهندس المشروع استلام المفاتيح والمسح الميداني دون الحاجة لوسيط محلي."
                  : "Valentia Direct Custody: Our team manages keys, scans, and site logistics directly with you."}
              </div>
            )}
          </div>
        </div>

        {/* Scope of Work */}
        <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3]">
            <Hammer className="w-4 h-4 text-[#B88460]" />
            <span>{isRTL ? "نطاق العمل المطلوب" : "Commission Scope"}</span>
          </div>
          <div className="space-y-1.5 text-xs text-[#1C1917] dark:text-[#FAF7F2]">
            <div className="font-serif text-lg capitalize">
              {(project.scope?.scopeType || "full_fitout").replace("_", " ")}
            </div>
            {project.scope?.customDetails && (
              <p className="text-[11px] text-[#78716C] leading-relaxed">
                {project.scope.customDetails}
              </p>
            )}
          </div>
        </div>

        {/* Financial & Budget Bracket */}
        <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3]">
            <Coins className="w-4 h-4 text-[#B88460]" />
            <span>{isRTL ? "الميزانية المستهدفة" : "Target Investment"}</span>
          </div>
          <div className="text-xs text-[#1C1917] dark:text-[#FAF7F2]">
            <div className="font-serif text-xl text-[#B88460] font-normal">
              {getBudgetText()}
            </div>
            <p className="text-[11px] text-[#78716C] mt-1">
              {isRTL
                ? "يتم تدقيق البنود والكميات بالتفصيل في مرحلة جدول الكميات (BOQ)."
                : "Refined and itemized during the BOQ engineering phase."}
            </p>
          </div>
        </div>

        {/* Target Handover Horizon */}
        <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3]">
            <CalendarCheck className="w-4 h-4 text-[#B88460]" />
            <span>{isRTL ? "الجدول الزمني المستهدف" : "Target Handover Horizon"}</span>
          </div>
          <div className="text-xs text-[#1C1917] dark:text-[#FAF7F2]">
            <div className="font-serif text-xl font-normal">
              {getTimelineText()}
            </div>
            <p className="text-[11px] text-[#78716C] mt-1">
              {isRTL
                ? "يتم تتبع مراحل التنفيذ الميداني أسبوعياً مع تحديثات مصورة."
                : "Tracked weekly with high-resolution photographic milestones."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
