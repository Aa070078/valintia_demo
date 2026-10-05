"use client";

import * as React from "react";
import { ProjectActivity } from "../types/engineer.types";
import {
  Clock,
  User,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ActivityLogViewProps {
  activities: ProjectActivity[];
  isRTL: boolean;
}

export function ActivityLogView({
  activities,
  isRTL,
}: ActivityLogViewProps) {
  const formatCairoDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat(isRTL ? "ar-EG" : "en-US", {
        timeZone: "Africa/Cairo",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "REVIEW_STARTED":
        return {
          title: isRTL ? "بدء المراجعة الهندسية" : "Engineering Review Started",
          desc: isRTL
            ? "تم انتقال المشروع من مسلّم إلى قيد المراجعة الهندسية"
            : "Project transitioned: SUBMITTED → UNDER_ENGINEER_REVIEW",
          badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
        };
      case "CONSULTATION_READY":
        return {
          title: isRTL ? "اعتماد الجاهزية للاستشارة" : "Consultation Readiness Signed Off",
          desc: isRTL
            ? "تم اعتماد المواصفات وفتح حجز الاستشارة: UNDER_ENGINEER_REVIEW → ENGINEER_READY"
            : "Specifications confirmed & consultation unlocked: UNDER_ENGINEER_REVIEW → ENGINEER_READY",
          badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
        };
      default:
        return {
          title: action,
          desc: "",
          badgeColor: "bg-muted text-muted-foreground",
        };
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="border-b border-border pb-3">
        <h3 className="text-base font-serif font-medium text-foreground">
          {isRTL ? "سجل النشاط الموثق للمشروع" : "Project Audited Activity Log"}
        </h3>
        <p className="text-xs text-muted-foreground font-mono">
          {isRTL
            ? "سجل غير قابل للتعديل يوثق جميع الانتقالات والقرارات الفنية بتوقيت القاهرة"
            : "Immutable chronological trail of review transitions and engineer notes in Cairo Time"}
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-border text-center text-xs text-muted-foreground">
          {isRTL
            ? "لم يتم تسجيل أنشطة أو قرارات مراجعة لهذا المشروع بعد."
            : "No review activities or recorded transitions yet."}
        </div>
      ) : (
        <div className="relative border-s-2 border-border/80 ms-4 space-y-6 py-2">
          {activities.map((act) => {
            const config = getActionLabel(act.action);
            return (
              <div key={act.id} className="relative ps-6">
                {/* Timeline Node Dot */}
                <div className="absolute -start-[9px] top-1 w-4 h-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>

                <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {config.title}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.2 rounded text-[10px] font-mono font-medium",
                          config.badgeColor
                        )}
                      >
                        {act.action}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatCairoDate(act.createdAt)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {config.desc}
                  </div>

                  {act.note && (
                    <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs font-mono text-foreground italic">
                      &quot;{act.note}&quot;
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                    <User className="w-3 h-3" />
                    <span>
                      Actor: #{act.actorId} ({act.actorRole})
                    </span>
                    <span>·</span>
                    <span>
                      State: {act.fromStatus} → {act.toStatus}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
