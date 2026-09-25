"use client";

import * as React from "react";
import { UploadSimple, FilePdf, Trash, ShieldCheck } from "@phosphor-icons/react";
import type { ProjectDocument } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface StepDrawingsProps {
  documents: ProjectDocument[];
  onChangeDocuments: (docs: ProjectDocument[]) => void;
  onProceedWithoutDrawings: () => void;
}

export function StepDrawings({
  documents,
  onChangeDocuments,
  onProceedWithoutDrawings,
}: StepDrawingsProps) {
  const { isRTL } = useLanguage();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocs: ProjectDocument[] = Array.from(files).map((f) => ({
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: f.name,
      category: f.name.endsWith(".dwg") || f.name.endsWith(".cad") ? "architectural" : "engineering",
      url: URL.createObjectURL(f),
      sizeBytes: f.size,
      uploadedAt: new Date().toISOString(),
    }));

    onChangeDocuments([...documents, ...newDocs]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveDoc = (id: string) => {
    onChangeDocuments(documents.filter((d) => d.id !== id));
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
            {isRTL ? "الخطوة ١٠ · المخططات والرسومات المعمارية" : "STEP 10 · DRAWINGS & CAD PLANS"}
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
          {isRTL ? "هل لديك مخططات أو كاد للعقار؟" : "Do you have existing CAD or PDF drawings?"}
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
            ? "إذا كانت المخططات التنفيذية متوفرة لديك من المطور العقاري فقم برفعها هنا. وإذا لم تكن متوفرة، سيتولى فريق فالنتيا مسح الموقع بالكامل ليزرياً."
            : "Upload developer blueprints, CAD files, or sketches if available. If you don't have drawings, our engineering team will perform a full 3D lidar scan during site inspection."}
        </p>
      </div>

      {/* Unblocking Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#B88460]" />
          </div>
          <div>
            <h4
              className={cn(
                "text-[#1C1917]",
                isRTL ? "font-sans text-sm font-bold tracking-normal" : "text-xs font-semibold"
              )}
            >
              {isRTL ? "لا تملك مخططات هندسية حالياً؟" : "Don't have architectural plans?"}
            </h4>
            <p
              className={cn(
                "mt-0.5 leading-relaxed",
                isRTL ? "text-xs font-medium text-[#4A3E31]" : "text-[11px] text-[#78716C]"
              )}
            >
              {isRTL
                ? "هذا طبيعي تماماً. يتضمن بروتوكول فالنتيا مسحاً ليزرياً شاملاً (3D Lidar Survey) في أول زيارة ميدانية."
                : "No problem at all. Valentia conducts an exhaustive 3D point-cloud lidar scan during the physical survey visit."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onProceedWithoutDrawings}
          className={cn(
            "shrink-0 px-4 py-2 rounded-xl border border-[#503C2C] text-[#503C2C] hover:bg-[#503C2C] hover:text-[#FAF7F2] transition-colors cursor-pointer",
            isRTL ? "text-xs font-bold tracking-normal" : "text-xs font-medium"
          )}
        >
          {isRTL ? "المتابعة دون مخططات ←" : "Proceed Without Drawings →"}
        </button>
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer border-2 border-dashed border-border hover:border-[#B88460] rounded-3xl p-8 sm:p-12 bg-card hover:bg-card/80 transition-all flex flex-col items-center justify-center text-center gap-3 shadow-xs"
      >
        <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center">
          <UploadSimple className="w-6 h-6 text-[#503C2C]" />
        </div>
        <div>
          <p
            className={cn(
              "text-[#1C1917]",
              isRTL ? "font-sans text-sm font-bold tracking-normal" : "text-sm font-medium"
            )}
          >
            {isRTL
              ? "اضغط لاختيار الملفات أو اسحبها إلى هنا"
              : "Click to browse or drop drawings here"}
          </p>
          <p
            className={cn(
              "mt-1",
              isRTL ? "text-xs font-semibold text-[#503C2C]" : "text-xs text-[#78716C]"
            )}
          >
            DWG, DXF, PDF, JPG, PNG {isRTL ? "(بحد أقصى ٥٠ ميجابايت)" : "(Up to 50MB per file)"}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".dwg,.dxf,.pdf,image/*"
          onChange={handleSimulatedFileUpload}
          className="hidden"
        />
      </div>

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h4
            className={cn(
              "text-[#78716C]",
              isRTL ? "font-sans text-xs font-bold tracking-normal text-[#503C2C]" : "text-xs font-mono font-semibold uppercase tracking-wider"
            )}
          >
            {isRTL ? `الملفات المرفوعة (${documents.length})` : `Uploaded Files (${documents.length})`}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border">
                    <FilePdf className="w-5 h-5 text-[#B88460]" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={cn(
                        "text-[#1C1917] truncate",
                        isRTL ? "text-xs font-bold" : "text-xs font-medium"
                      )}
                    >
                      {doc.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#78716C] uppercase">
                      {doc.category} · {(doc.sizeBytes ? (doc.sizeBytes / 1024 / 1024).toFixed(1) : "1.2")} MB
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDoc(doc.id)}
                  className="p-1.5 text-[#78716C] hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
