"use client";

import * as React from "react";
import { FilePdf, DownloadSimple, HardDrives } from "@phosphor-icons/react";
import type { ProjectDocument } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";

interface ProjectDocumentsTabProps {
  documents: ProjectDocument[];
}

export function ProjectDocumentsTab({ documents }: ProjectDocumentsTabProps) {
  const { isRTL } = useLanguage();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78716C]">
            {isRTL ? "مستودع المخططات والوثائق" : "ARCHITECTURAL ARCHIVE"}
          </div>
          <h4 className="font-serif text-lg text-[#1C1917] dark:text-[#FAF7F2] mt-0.5">
            {isRTL ? "ملفات ومخططات المشروع" : "Project Blueprints & Records"}
          </h4>
          <p className="text-xs text-[#78716C] dark:text-[#989692] mt-0.5">
            {isRTL
              ? "مخططات الكاد التنفيذية، رسومات الأوتوكاد، ونتائج المسح الليزري ثلاثي الأبعاد."
              : "Executive CAD drawings, architectural schematics, and lidar survey scans."}
          </p>
        </div>
      </div>

      {/* Files Grid or Empty State */}
      {documents && documents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-2xl border border-[#E6DDD2] dark:border-[#2E2A27] bg-[#FAF7F2] dark:bg-[#1E1B18] flex items-center justify-between gap-3 shadow-2xs hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F4EEE5] dark:bg-[#25221F] border border-[#E6DDD2] flex items-center justify-center shrink-0">
                  <FilePdf className="w-5 h-5 text-[#B88460]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#1C1917] dark:text-[#FAF7F2] truncate">
                    {doc.name}
                  </div>
                  <div className="text-[10px] font-mono text-[#78716C] uppercase mt-0.5">
                    {doc.category} · {(doc.sizeBytes ? (doc.sizeBytes / 1024 / 1024).toFixed(1) : "1.8")} MB
                  </div>
                </div>
              </div>

              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                download
                className="p-2 rounded-lg bg-white dark:bg-[#141210] border border-[#E6DDD2] text-[#78716C] hover:text-[#503C2C] transition-colors"
              >
                <DownloadSimple className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-dashed border-[#E6DDD2] dark:border-[#2E2A27] text-center flex flex-col items-center justify-center gap-2">
          <HardDrives className="w-8 h-8 text-[#B88460]" />
          <h5 className="text-xs font-semibold text-[#1C1917] dark:text-[#FAF7F2]">
            {isRTL ? "لا توجد ملفات مرفوعة حالياً" : "No Drawings Uploaded"}
          </h5>
          <p className="text-[11px] text-[#78716C] dark:text-[#989692] max-w-sm">
            {isRTL
              ? "سيتم رفع مخططات المسح الليزري ثلاثي الأبعاد والرسومات التنفيذية هنا بعد اكتمال المعاينة الميدانية."
              : "3D lidar point-clouds and CAD schematics will be uploaded here by the engineering atelier following the site visit."}
          </p>
        </div>
      )}
    </div>
  );
}
