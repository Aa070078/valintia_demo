"use client";

import * as React from "react";
import { FilePdf, DownloadSimple, HardDrives } from "@phosphor-icons/react";
import type { ProjectDocument } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface ProjectDocumentsTabProps {
  documents: ProjectDocument[];
}

export function ProjectDocumentsTab({ documents }: ProjectDocumentsTabProps) {
  const { isRTL } = useLanguage();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div
            className={cn(
              "text-[#78716C]",
              isRTL ? "font-sans text-xs font-bold tracking-normal text-[#503C2C]" : "font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
            )}
          >
            {isRTL ? "مستودع المخططات والوثائق" : "ARCHITECTURAL ARCHIVE"}
          </div>
          <h4
            className={cn(
              "text-[#1C1917] mt-0.5",
              isRTL ? "font-sans text-lg font-bold" : "font-serif text-lg"
            )}
          >
            {isRTL ? "ملفات ومخططات المشروع" : "Project Blueprints & Records"}
          </h4>
          <p
            className={cn(
              "mt-0.5",
              isRTL ? "text-xs font-medium text-[#4A3E31]" : "text-xs text-[#78716C]"
            )}
          >
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
              className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between gap-3 shadow-2xs hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
                  <FilePdf className="w-5 h-5 text-[#B88460]" />
                </div>
                <div className="min-w-0">
                  <div
                    className={cn(
                      "text-[#1C1917] truncate",
                      isRTL ? "text-xs font-bold" : "text-xs font-semibold"
                    )}
                  >
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
                className="p-2 rounded-lg bg-background border border-border text-[#78716C] hover:text-[#503C2C] transition-colors"
              >
                <DownloadSimple className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-card border border-dashed border-border text-center flex flex-col items-center justify-center gap-2 shadow-xs">
          <HardDrives className="w-8 h-8 text-[#B88460]" />
          <h5
            className={cn(
              "text-[#1C1917]",
              isRTL ? "text-sm font-bold" : "text-xs font-semibold"
            )}
          >
            {isRTL ? "لا توجد ملفات مرفوعة حالياً" : "No Drawings Uploaded"}
          </h5>
          <p
            className={cn(
              "max-w-sm",
              isRTL ? "text-xs font-medium text-[#4A3E31]" : "text-[11px] text-[#78716C]"
            )}
          >
            {isRTL
              ? "سيتم رفع مخططات المسح الليزري ثلاثي الأبعاد والرسومات التنفيذية هنا بعد اكتمال المعاينة الميدانية."
              : "3D lidar point-clouds and CAD schematics will be uploaded here by the engineering atelier following the site visit."}
          </p>
        </div>
      )}
    </div>
  );
}
