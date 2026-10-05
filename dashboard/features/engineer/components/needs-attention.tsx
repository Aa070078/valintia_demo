"use client";

import * as React from "react";
import {
  ProjectListItem,
  ConsultationAppointment,
} from "../types/engineer.types";
import {
  FileText,
  CalendarCheck,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  VideoCamera,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface NeedsAttentionProps {
  projects: ProjectListItem[];
  consultations: ConsultationAppointment[];
  onOpenProject: (projectId: number) => void;
  isRTL: boolean;
}

export function NeedsAttention({
  projects,
  consultations,
  onOpenProject,
  isRTL,
}: NeedsAttentionProps) {
  // Pending reviews: SUBMITTED + UNDER_ENGINEER_REVIEW
  const pendingReviews = projects.filter(
    (p) => p.status === "SUBMITTED" || p.status === "UNDER_ENGINEER_REVIEW"
  );

  // Today's consultations in Cairo timezone
  const todayAppointments = consultations.filter((c) => {
    try {
      const apptDate = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Cairo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(c.scheduledAt));

      const todayDate = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Cairo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

      return apptDate === todayDate;
    } catch {
      return false;
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Box 1: Reviews Waiting on Me */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {isRTL ? "مراجعات بانتظاري" : "Reviews Waiting on Me"}
              </h3>
              <span className="text-[11px] font-mono text-muted-foreground">
                {isRTL
                  ? `${pendingReviews.length} مشروعات تتطلب قراراً فنياً`
                  : `${pendingReviews.length} projects requiring engineering action`}
              </span>
            </div>
          </div>
          <span className="text-lg font-mono font-bold text-foreground">
            {pendingReviews.length}
          </span>
        </div>

        {pendingReviews.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
            <span>
              {isRTL
                ? "لا توجد مراجعات معمارية معلقة حالياً."
                : "No pending architectural reviews."}
            </span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingReviews.slice(0, 3).map((p) => {
              const isSubmitted = p.status === "SUBMITTED";
              return (
                <div
                  key={p.id}
                  onClick={() => onOpenProject(p.id)}
                  className="p-3 rounded-xl border border-border/70 hover:border-primary/50 bg-background/50 hover:bg-muted/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono uppercase text-muted-foreground">
                        #{p.id}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-mono font-medium",
                          isSubmitted
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        )}
                      >
                        {isSubmitted
                          ? isRTL
                            ? "تسليم جديد · ابدأ المراجعة"
                            : "New Submission · Start Review"
                          : isRTL
                          ? "قيد المراجعة · مطلوب الاعتماد"
                          : "Under Review · Signoff Pending"}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {p.title}
                    </div>
                  </div>

                  <span className="text-primary text-xs shrink-0 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    {isRTL ? (
                      <ArrowLeft className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Box 2: Today's Appointments & Consultations */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {isRTL ? "مواعيد واستشارات اليوم" : "Today's Appointments"}
              </h3>
              <span className="text-[11px] font-mono text-muted-foreground">
                {isRTL
                  ? "توقيت القاهرة (Africa/Cairo)"
                  : "Cairo Time (Africa/Cairo)"}
              </span>
            </div>
          </div>
          <span className="text-lg font-mono font-bold text-foreground">
            {todayAppointments.length}
          </span>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <Clock className="w-6 h-6 text-muted-foreground/60" />
            <span>
              {isRTL
                ? "لا توجد جلسات استشارة مجدولة لهذا اليوم."
                : "No consultations scheduled for today."}
            </span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayAppointments.map((c) => {
              const timeDisplay = new Intl.DateTimeFormat(
                isRTL ? "ar-EG" : "en-US",
                {
                  timeZone: "Africa/Cairo",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }
              ).format(new Date(c.scheduledAt));

              return (
                <div
                  key={c.id}
                  className="p-3 rounded-xl border border-border/70 bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-600">
                        {timeDisplay}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ({c.durationMinutes} {isRTL ? "دقيقة" : "min"})
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {c.status}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-foreground truncate">
                      {c.projectTitle}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {isRTL ? "العميل: " : "Client: "} {c.clientName}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {c.meetingLink && (
                      <a
                        href={c.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <VideoCamera className="w-3.5 h-3.5" />
                        <span>{isRTL ? "دخول" : "Join"}</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenProject(c.projectId)}
                      className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-all"
                    >
                      <span>{isRTL ? "الملف" : "Dossier"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
