"use client";

import * as React from "react";
import {
  MOCK_SITE_VISITS,
  MOCK_ENGINEERING_ITEMS,
} from "@/lib/mock-data";
import {
  SiteVisit,
  SiteVisitStatus,
  EngineeringDimensionItem,
} from "@/lib/types";
import {
  Compass,
  CheckCircle,
  Phone,
  MapPin,
  SealCheck,
  CaretRight,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const STATUS_STEPS: SiteVisitStatus[] = [
  "ASSIGNED",
  "ON_THE_WAY",
  "ARRIVED",
  "IN_PROGRESS",
  "COMPLETED",
];

const STATUS_LABELS: Record<SiteVisitStatus, string> = {
  ASSIGNED: "Assigned",
  ON_THE_WAY: "En Route",
  ARRIVED: "On Site",
  IN_PROGRESS: "Survey Active",
  COMPLETED: "Completed",
};

export function EngineerDashboard() {
  const [siteVisits, setSiteVisits] = React.useState<SiteVisit[]>(MOCK_SITE_VISITS);
  const [dimensionItems, setDimensionItems] = React.useState<EngineeringDimensionItem[]>(
    MOCK_ENGINEERING_ITEMS
  );
  const [selectedVisit, setSelectedVisit] = React.useState<SiteVisit>(siteVisits[0]);

  // Handle advancing site visit status stepper
  const handleAdvanceStatus = (visitId: string) => {
    setSiteVisits((prev) =>
      prev.map((v) => {
        if (v.id !== visitId) return v;
        const currentIndex = STATUS_STEPS.indexOf(v.status);
        if (currentIndex < STATUS_STEPS.length - 1) {
          const nextStatus = STATUS_STEPS[currentIndex + 1];
          return { ...v, status: nextStatus };
        }
        return v;
      })
    );
  };

  // Handle certifying dimension by engineer
  const handleCertifyDimension = (itemId: string, certifiedValue: string) => {
    setDimensionItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              engineerVerified: certifiedValue,
              status: "ENGINEER_VERIFIED",
              verifiedBy: "Eng. Karim El-Sayed",
              verifiedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
            }
          : item
      )
    );
  };

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>FIELD ENGINEERING & SPECIFICATION STUDIO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-foreground">
            Site Survey & Technical Certification
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Execute laser scans on location, audit drawing dimensions, and enforce engineer verification over AI extractions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg border border-border bg-card text-xs flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">LEAD ARCHITECT:</span>
            <span className="font-semibold text-foreground">Eng. Karim El-Sayed</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: TODAY'S SITE VISITS & STEPPER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground font-serif">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Scheduled Site Visits & Location Telemetry</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {siteVisits.length} Visits Assigned Today
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {siteVisits.map((visit) => {
            const currentStepIdx = STATUS_STEPS.indexOf(visit.status);
            const isCompleted = visit.status === "COMPLETED";

            return (
              <div
                key={visit.id}
                className={cn(
                  "p-5 rounded-xl border bg-card shadow-xs transition-all flex flex-col justify-between",
                  selectedVisit.id === visit.id
                    ? "border-primary ring-1 ring-primary/30"
                    : "border-border hover:border-foreground/30"
                )}
                onClick={() => setSelectedVisit(visit)}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {visit.scheduledTime} · {visit.scheduledDate}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[10px] px-2 py-0.5 rounded uppercase font-semibold",
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800"
                          : visit.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800 animate-pulse"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {STATUS_LABELS[visit.status]}
                    </span>
                  </div>

                  <h3 className="font-medium text-foreground text-sm leading-snug">
                    {visit.projectName}
                  </h3>

                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{visit.compound}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{visit.clientName} ({visit.clientPhone})</span>
                    </div>
                  </div>

                  {visit.notes && (
                    <p className="mt-3 text-[11px] text-muted-foreground/90 bg-muted/30 p-2.5 rounded-lg border border-border/50 italic">
                      “{visit.notes}”
                    </p>
                  )}
                </div>

                {/* Stepper Bar & Advance Action */}
                <div className="mt-5 pt-4 border-t border-border">
                  <div className="grid grid-cols-5 gap-1 mb-3">
                    {STATUS_STEPS.map((s, idx) => (
                      <div
                        key={s}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          idx <= currentStepIdx
                            ? "bg-primary"
                            : "bg-muted"
                        )}
                        title={STATUS_LABELS[s]}
                      />
                    ))}
                  </div>

                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdvanceStatus(visit.id);
                      }}
                      className="w-full h-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>
                        Advance:{" "}
                        {STATUS_LABELS[
                          STATUS_STEPS[Math.min(currentStepIdx + 1, STATUS_STEPS.length - 1)]
                        ]}
                      </span>
                      <CaretRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isCompleted && (
                    <div className="flex items-center justify-center gap-1.5 text-emerald-700 text-xs font-mono font-medium py-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Survey Certified & Uploaded</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: CAD & AI SPECIFICATION CERTIFICATION STUDIO */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 text-foreground font-semibold text-base font-serif">
              <SealCheck className="w-5 h-5 text-primary" />
              <span>Engineering Data Precedence & Verification Studio</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rule §17: <code className="text-primary font-mono font-medium">Engineer Verified &gt; CAD Extracted &gt; AI Inferred</code>. Never overwrite certified measurements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-muted text-muted-foreground">
              PROJECT: {selectedVisit.projectName}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-[10px] uppercase font-mono text-muted-foreground border-b border-border">
              <tr>
                <th className="py-3 px-4">Room & Parameter</th>
                <th className="py-3 px-4">Customer Entered</th>
                <th className="py-3 px-4">CAD Extracted</th>
                <th className="py-3 px-4">AI Inferred</th>
                <th className="py-3 px-4">Engineer Certified</th>
                <th className="py-3 px-4 text-center">Data Authority</th>
                <th className="py-3 px-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dimensionItems.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    <div>{item.spaceName}</div>
                    <div className="text-[10px] text-muted-foreground">{item.parameter}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-muted-foreground">
                    {item.customerEntered}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-muted-foreground">
                    {item.cadExtracted || "—"}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-muted-foreground">
                    {item.aiInferred || "—"}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                    {item.engineerVerified ? (
                      <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{item.engineerVerified}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">Pending Laser Verification</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold",
                        item.status === "ENGINEER_VERIFIED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : item.status === "CAD_EXTRACTED"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                      )}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-end">
                    {item.status !== "ENGINEER_VERIFIED" ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleCertifyDimension(
                            item.id,
                            item.cadExtracted || item.aiInferred || item.customerEntered
                          )
                        }
                        className="h-7 px-3 rounded bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Certify Laser Scan
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Certified by {item.verifiedBy?.split(" ")[1]}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
