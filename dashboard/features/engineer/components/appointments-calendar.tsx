"use client";

import * as React from "react";
import {
  ConsultationAppointment,
  ProjectWorkspaceTab,
} from "../types/engineer.types";
import {
  CalendarCheck,
  Clock,
  VideoCamera,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  NotePencil,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface AppointmentsCalendarProps {
  consultations: ConsultationAppointment[];
  onOpenProject: (projectId: number, tab?: ProjectWorkspaceTab) => void;
  isRTL: boolean;
}

export function AppointmentsCalendar({
  consultations,
  onOpenProject,
  isRTL,
}: AppointmentsCalendarProps) {
  const formatCairoTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const timeStr = new Intl.DateTimeFormat(isRTL ? "ar-EG" : "en-US", {
        timeZone: "Africa/Cairo",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date);

      const dateStr = new Intl.DateTimeFormat(isRTL ? "ar-EG" : "en-US", {
        timeZone: "Africa/Cairo",
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(date);

      return { timeStr, dateStr };
    } catch {
      return { timeStr: isoString, dateStr: "" };
    }
  };

  const getStatusBadge = (status: ConsultationAppointment["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return {
          label: isRTL ? "مؤكد" : "Confirmed",
          className:
            "bg-[#503C2C]/10 text-[#503C2C] dark:bg-[#FAF7F2]/10 dark:text-[#FAF7F2] border-[#503C2C]/20 dark:border-[#FAF7F2]/20",
        };
      case "REQUESTED":
        return {
          label: isRTL ? "بانتظار التأكيد" : "Requested",
          className:
            "bg-[#B88460]/15 text-[#8F5A36] dark:bg-[#B88460]/20 dark:text-[#E5D5C5] border-[#B88460]/30 dark:border-[#B88460]/40",
        };
      case "COMPLETED":
        return {
          label: isRTL ? "مكتمل" : "Completed",
          className:
            "bg-[#EFE8DE] text-[#503C2C] dark:bg-[#2C2621] dark:text-[#F5EFE6] border-[#E6DED4] dark:border-[#3A322C]",
        };
      default:
        return {
          label: status,
          className: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-medium text-foreground">
            {isRTL ? "جدول الاستشارات والمواعيد" : "Consultation Schedule & Calendar"}
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            {isRTL
              ? "مواعيد جلسات الاستشارة المعمارية بتوقيت القاهرة (Africa/Cairo)"
              : "Architectural consultation sessions in Cairo Timezone (Africa/Cairo)"}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted border border-border text-xs font-mono text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>IANA: Africa/Cairo (UTC+2)</span>
        </div>
      </div>

      {consultations.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-border bg-card/40 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-medium text-foreground">
            {isRTL
              ? "لا توجد جلسات استشارة مجدولة حالياً"
              : "No consultations currently scheduled"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {isRTL
              ? "عندما يقوم العملاء بحجز مواعيد استشارة بعد اعتماد الجاهزية، ستظهر الجلسات هنا مباشرة."
              : "When clients book consultation slots after feasibility signoff, confirmed appointments will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map((c) => {
            const { timeStr, dateStr } = formatCairoTime(c.scheduledAt);
            const statusConfig = getStatusBadge(c.status);

            return (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-border bg-card text-card-foreground shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left/Start side: Date & Project Info */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-muted/60 border border-border text-center shrink-0 w-24">
                    <span className="block text-[11px] font-mono text-muted-foreground uppercase">
                      {dateStr}
                    </span>
                    <span className="block text-sm font-mono font-bold text-foreground mt-0.5">
                      {timeStr}
                    </span>
                    <span className="block text-[10px] text-muted-foreground font-mono mt-0.5">
                      {c.durationMinutes} {isRTL ? "دقيقة" : "min"}
                    </span>
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase text-muted-foreground">
                        #{c.projectId}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.2 rounded text-[10px] font-mono font-medium border",
                          statusConfig.className
                        )}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    <h3 className="text-base font-serif font-medium text-foreground truncate">
                      {c.projectTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{c.clientName}</span>
                      </span>
                      {c.clientPhone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{c.clientPhone}</span>
                        </span>
                      )}
                    </div>

                    {c.notes && (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        &quot;{c.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Right/End side: Action Controls */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                  {c.meetingLink && c.status === "CONFIRMED" && (
                    <a
                      href={c.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <VideoCamera className="w-4 h-4" />
                      <span>{isRTL ? "دخول جلسة الاستشارة" : "Join Consultation"}</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenProject(c.projectId, "mom")}
                    className="px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-foreground flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <NotePencil className="w-3.5 h-3.5 text-primary" />
                    <span>{isRTL ? "تسجيل محضر MOM" : "Record MOM"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenProject(c.projectId, "overview")}
                    className="px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  >
                    <span>{isRTL ? "تفاصيل المشروع" : "Project Dossier"}</span>
                    {isRTL ? (
                      <ArrowLeft className="w-3.5 h-3.5 ms-1 inline" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 ms-1 inline" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
