"use client";

import * as React from "react";
import { VideoCamera, ShieldCheck } from "@phosphor-icons/react";
import type { Project } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface ProjectTeamTabProps {
  project?: Project;
}

export function ProjectTeamTab({}: ProjectTeamTabProps) {
  const { isRTL } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
      {/* Assigned Team Card */}
      <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between gap-6 shadow-xs">
        <div>
          <div
            className={cn(
              "text-[#78716C]",
              isRTL ? "font-sans text-xs font-bold tracking-normal text-[#503C2C]" : "font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
            )}
          >
            {isRTL ? "فريق العمل المعماري" : "ASSIGNED ATELIER TEAM"}
          </div>
          <h4
            className={cn(
              "text-[#1C1917] mt-1",
              isRTL ? "font-sans text-xl font-bold" : "font-serif text-xl"
            )}
          >
            {isRTL ? "مهندسين المشروع والمسؤولين عنك" : "Project Leadership"}
          </h4>
          <p
            className={cn(
              "mt-1 leading-relaxed",
              isRTL ? "text-xs font-medium text-[#4A3E31]" : "text-xs text-[#78716C]"
            )}
          >
            {isRTL
              ? "المهندسين المعماريين اللي هيتابعوا معاك كل تفصيلة في التصميم، ورفع المقاسات، واستلام الشغل على أعلى مستوى."
              : "Dedicated architectural leads coordinating your spatial vision, lidar scans, and execution quality."}
          </p>
        </div>

        <div className="space-y-4">
          {/* Lead Architect */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-background border border-border">
            <div className="w-10 h-10 rounded-full bg-[#503C2C] text-[#FAF7F2] flex items-center justify-center font-serif font-medium text-sm">
              TM
            </div>
            <div className="min-w-0">
              <div
                className={cn(
                  "text-[#1C1917]",
                  isRTL ? "text-sm font-bold" : "text-xs font-semibold"
                )}
              >
                {isRTL ? "م. طارق منصور" : "Arch. Tarek Mansour"}
              </div>
              <div
                className={cn(
                  "text-[#503C2C]",
                  isRTL ? "text-xs font-bold" : "text-[11px] text-[#B88460]"
                )}
              >
                {isRTL ? "رئيس المهندسين المعماريين" : "Senior Architectural Partner"}
              </div>
            </div>
          </div>

          {/* Project Manager */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-background border border-border">
            <div className="w-10 h-10 rounded-full bg-[#EAE2D7] text-[#503C2C] flex items-center justify-center font-serif font-medium text-sm">
              KH
            </div>
            <div className="min-w-0">
              <div
                className={cn(
                  "text-[#1C1917]",
                  isRTL ? "text-sm font-bold" : "text-xs font-semibold"
                )}
              >
                {isRTL ? "م. كريم حسني" : "Eng. Karim Hosny"}
              </div>
              <div
                className={cn(
                  "text-[#78716C]",
                  isRTL ? "text-xs font-medium text-[#503C2C]" : "text-[11px]"
                )}
              >
                {isRTL ? "مدير التنفيذ والإشراف على الموقع" : "Fit-Out Project Director"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation & Survey Actions */}
      <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between gap-6 shadow-xs">
        <div>
          <div
            className={cn(
              "text-[#78716C]",
              isRTL ? "font-sans text-xs font-bold tracking-normal text-[#503C2C]" : "font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
            )}
          >
            {isRTL ? "المحطات الجاية" : "UPCOMING MILESTONES"}
          </div>
          <h4
            className={cn(
              "text-[#1C1917] mt-1",
              isRTL ? "font-sans text-xl font-bold" : "font-serif text-xl"
            )}
          >
            {isRTL ? "ميعاد الاستشارة ومعاينة الموقع" : "Consultation & Survey"}
          </h4>
          <p
            className={cn(
              "mt-1 leading-relaxed",
              isRTL ? "text-xs font-medium text-[#4A3E31]" : "text-xs text-[#78716C]"
            )}
          >
            {isRTL
              ? "فريق فالنتيا هيكلمك على الواتساب عشان نحدد ميعاد مكالمة الفيديو ونرتب ميعاد نزول الموقع لرفع المقاسات."
              : "Valentia concierge will reach out to confirm your virtual briefing call and coordinate site key handover."}
          </p>
        </div>

        <div className="space-y-3">
          {/* Virtual Call Action */}
          <div className="p-4 rounded-xl border border-[#B88460]/40 bg-background/80 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <VideoCamera className="w-5 h-5 text-[#B88460]" />
              <div>
                <div
                  className={cn(
                    "text-[#1C1917]",
                    isRTL ? "text-sm font-bold" : "text-xs font-semibold"
                  )}
                >
                  {isRTL ? "مكالمة الاستشارة أونلاين" : "Virtual Consultation Session"}
                </div>
                <div
                  className={cn(
                    "text-[#78716C]",
                    isRTL ? "text-xs font-medium text-[#503C2C]" : "text-[11px]"
                  )}
                >
                  {isRTL ? "ميتينج فيديو مع رئيس المهندسين" : "Direct video conference with Lead Architect"}
                </div>
              </div>
            </div>
            <span
              className={cn(
                "px-2.5 py-1 rounded bg-[#503C2C] text-[#FAF7F2] font-semibold",
                isRTL ? "text-xs font-bold tracking-normal" : "text-[10px] font-mono"
              )}
            >
              {isRTL ? "بننسق الميعاد" : "Pending Sync"}
            </span>
          </div>

          {/* 3D Survey */}
          <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#503C2C]" />
              <div>
                <div
                  className={cn(
                    "text-[#1C1917]",
                    isRTL ? "text-sm font-bold" : "text-xs font-semibold"
                  )}
                >
                  {isRTL ? "رفع المقاسات بالليزر ثلاثي الأبعاد" : "3D Lidar Site Survey"}
                </div>
                <div
                  className={cn(
                    "text-[#78716C]",
                    isRTL ? "text-xs font-medium text-[#503C2C]" : "text-[11px]"
                  )}
                >
                  {isRTL ? "معاينة ميدانية في موقع البيت بدقة متناهية" : "Point-cloud precision spatial scan"}
                </div>
              </div>
            </div>
            <span
              className={cn(
                "px-2 py-1 rounded bg-card text-[#78716C] border border-border",
                isRTL ? "text-xs font-bold tracking-normal" : "text-[10px] font-mono"
              )}
            >
              {isRTL ? "المرحلة ٣" : "Stage 03"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
