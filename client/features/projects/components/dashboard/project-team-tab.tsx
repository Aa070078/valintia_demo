"use client";

import * as React from "react";
import { VideoCamera, ShieldCheck } from "@phosphor-icons/react";
import type { Project } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";

interface ProjectTeamTabProps {
  project?: Project;
}

export function ProjectTeamTab({}: ProjectTeamTabProps) {
  const { isRTL } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
      {/* Assigned Team Card */}
      <div className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col justify-between gap-6">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78716C]">
            {isRTL ? "الفريق المعماري المخصص" : "ASSIGNED ATELIER TEAM"}
          </div>
          <h4 className="font-serif text-xl text-[#1C1917] dark:text-[#FAF7F2] mt-1">
            {isRTL ? "فريق إدارة وهندسة المشروع" : "Project Leadership"}
          </h4>
          <p className="text-xs text-[#78716C] dark:text-[#989692] mt-1 leading-relaxed">
            {isRTL
              ? "مهندسوك المعماريون المخصصون لمتابعة الرؤية التصميمية، والمسح الميداني، وضمان الجودة الحرفية."
              : "Dedicated architectural leads coordinating your spatial vision, lidar scans, and execution quality."}
          </p>
        </div>

        <div className="space-y-4">
          {/* Lead Architect */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white dark:bg-[#141210] border border-[#E6DDD2] dark:border-[#38332E]">
            <div className="w-10 h-10 rounded-full bg-[#503C2C] text-[#FAF7F2] flex items-center justify-center font-serif font-medium text-sm">
              TM
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#1C1917] dark:text-[#FAF7F2]">
                {isRTL ? "م. طارق منصور" : "Arch. Tarek Mansour"}
              </div>
              <div className="text-[11px] text-[#B88460]">
                {isRTL ? "كبير المعماريين ورئيس الأتيليه" : "Senior Architectural Partner"}
              </div>
            </div>
          </div>

          {/* Project Manager */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white dark:bg-[#141210] border border-[#E6DDD2] dark:border-[#38332E]">
            <div className="w-10 h-10 rounded-full bg-[#EAE2D7] text-[#503C2C] flex items-center justify-center font-serif font-medium text-sm">
              KH
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#1C1917] dark:text-[#FAF7F2]">
                {isRTL ? "م. كريم حسني" : "Eng. Karim Hosny"}
              </div>
              <div className="text-[11px] text-[#78716C]">
                {isRTL ? "مدير التنفيذ والموقع" : "Fit-Out Project Director"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation & Survey Actions */}
      <div className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col justify-between gap-6">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78716C]">
            {isRTL ? "المحطات القادمة" : "UPCOMING MILESTONES"}
          </div>
          <h4 className="font-serif text-xl text-[#1C1917] dark:text-[#FAF7F2] mt-1">
            {isRTL ? "جلسة الاستشارة والمعاينة" : "Consultation & Survey"}
          </h4>
          <p className="text-xs text-[#78716C] dark:text-[#989692] mt-1 leading-relaxed">
            {isRTL
              ? "سيقوم فريق فالنتيا بالتواصل معك عبر الواتساب لتأكيد موعد مكالمة الفيديو وجدول زيارة المعاينة الميدانية."
              : "Valentia concierge will reach out to confirm your virtual briefing call and coordinate site key handover."}
          </p>
        </div>

        <div className="space-y-3">
          {/* Virtual Call Action */}
          <div className="p-4 rounded-xl border border-[#B88460]/40 bg-[#F4EEE5]/60 dark:bg-[#25221F] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <VideoCamera className="w-5 h-5 text-[#B88460]" />
              <div>
                <div className="text-xs font-semibold text-[#1C1917] dark:text-[#FAF7F2]">
                  {isRTL ? "مكالمة الفيديو الاستشارية" : "Virtual Consultation Session"}
                </div>
                <div className="text-[11px] text-[#78716C]">
                  {isRTL ? "عبر Google Meet / Zoom المباشر" : "Direct video conference with Lead Architect"}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#503C2C] text-[#FAF7F2]">
              {isRTL ? "قيد التنسيق" : "Pending Sync"}
            </span>
          </div>

          {/* 3D Survey */}
          <div className="p-4 rounded-xl border border-[#E6DDD2] dark:border-[#2E2A27] bg-white dark:bg-[#141210] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#503C2C] dark:text-[#B88460]" />
              <div>
                <div className="text-xs font-semibold text-[#1C1917] dark:text-[#FAF7F2]">
                  {isRTL ? "المسح الليزري ثلاثي الأبعاد" : "3D Lidar Site Survey"}
                </div>
                <div className="text-[11px] text-[#78716C]">
                  {isRTL ? "زيارة ميدانية وتوثيق سحابي للموقع" : "Point-cloud precision spatial scan"}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#FAF7F2] text-[#78716C] border">
              {isRTL ? "المرحلة ٣" : "Stage 03"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
