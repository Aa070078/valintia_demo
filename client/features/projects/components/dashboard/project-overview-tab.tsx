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
import { cn } from "@/lib/utils";

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
      {/* 2-Column Grid of Architectural Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Property & Location */}
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-3 shadow-xs">
          <div
            className={cn(
              "flex items-center gap-2",
              isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
            )}
          >
            <Building className="w-4 h-4 text-[#B88460]" />
            <span>{isRTL ? "بيانات ونوع العقار" : "Property & Typology"}</span>
          </div>
          <div className="space-y-1.5 text-xs text-[#1C1917]">
            <div
              className={cn(
                "capitalize",
                isRTL ? "font-sans text-lg font-bold" : "font-serif text-lg"
              )}
            >
              {property.propertyType}
            </div>
            <div className="flex items-center gap-1.5 text-[#503C2C]">
              <MapPin className="w-3.5 h-3.5 text-[#B88460]" />
              <span className={cn(isRTL ? "font-bold" : "font-medium")}>
                {property.compound ? `${property.compound}, ` : ""}{property.city}
              </span>
            </div>
            <div className={cn("flex items-center gap-3 text-[#78716C] pt-1", isRTL ? "font-sans text-xs font-semibold" : "font-mono text-[11px]")}>
              <span>{property.areaSqm} {isRTL ? "م²" : "m²"}</span>
              <span>•</span>
              <span>{property.floors || 1} {isRTL ? "أدوار" : "Levels"}</span>
              <span>•</span>
              <span className="capitalize">{(property.condition || "semi_finished").replace("_", " ")}</span>
            </div>
          </div>
        </div>

        {/* Client Residence & Timezone */}
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-3 shadow-xs">
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
                ? "بالمواعيد دي بننسق معاك مكالمات الفيديو والتحديثات حسب توقيت بلدك."
                : "Virtual sessions and live updates are scheduled around this local time."}
            </p>
          </div>
        </div>

        {/* Local Representative */}
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-3 shadow-xs">
          <div
            className={cn(
              "flex items-center gap-2",
              isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
            )}
          >
            <UserCheck className="w-4 h-4 text-[#B88460]" />
            <span>{isRTL ? "مين هينوب عنك في مصر" : "Representation in Egypt"}</span>
          </div>
          <div className="text-xs text-[#1C1917]">
            {project.representative?.hasRepresentative ? (
              <div className="space-y-1">
                <div className={cn(isRTL ? "font-bold text-sm" : "font-medium")}>{project.representative.name}</div>
                <div className={cn("text-[#78716C]", isRTL ? "font-sans font-semibold" : "font-mono")}>{project.representative.phone}</div>
                <div className={cn(isRTL ? "text-xs font-medium text-[#4A3E31]" : "text-[11px] text-[#78716C]")}>{project.representative.authorizationScope || "Key handover & site visits"}</div>
              </div>
            ) : (
              <div className={cn("leading-relaxed", isRTL ? "text-xs font-medium text-[#4A3E31]" : "text-[#78716C]")}>
                {isRTL
                  ? "فالنتيا بتدير كل حاجة مباشرة: مهندس الموقع بيستلم المفاتيح وبيعمل المعاينة ورفع المقاسات من غير ما تشيل هم وسيط في مصر."
                  : "Valentia Direct Custody: Our team manages keys, scans, and site logistics directly with you."}
              </div>
            )}
          </div>
        </div>

        {/* Scope of Work */}
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-3 shadow-xs">
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
              {(project.scope?.scopeType || "full_fitout").replace("_", " ")}
            </div>
            {project.scope?.customDetails && (
              <p className={cn("leading-relaxed", isRTL ? "text-xs font-medium text-[#4A3E31]" : "text-[11px] text-[#78716C]")}>
                {project.scope.customDetails}
              </p>
            )}
          </div>
        </div>

        {/* Financial & Budget Bracket */}
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-3 shadow-xs">
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
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-3 shadow-xs">
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
    </div>
  );
}
