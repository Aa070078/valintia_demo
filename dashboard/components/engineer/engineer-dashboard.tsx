"use client";

import * as React from "react";
import { useEngineerWorkspace } from "@/features/engineer/hooks/use-engineer-workspace";
import { HighestPriorityAction } from "@/features/engineer/components/highest-priority-action";
import { NeedsAttention } from "@/features/engineer/components/needs-attention";
import { AssignedProjectsQueue } from "@/features/engineer/components/assigned-projects-queue";
import { AppointmentsCalendar } from "@/features/engineer/components/appointments-calendar";
import { ProjectWorkspace } from "@/features/engineer/components/project-workspace";
import { ProjectWorkspaceTab } from "@/features/engineer/types/engineer.types";
import {
  Compass,
  Buildings,
  CalendarCheck,
  CheckCircle,
  WarningCircle,
  Translate,
  Spinner,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function EngineerDashboard() {
  const {
    projects,
    consultations,
    selectedProjectId,
    reviewContext,
    activities,
    activeFilter,
    isRTL,
    isLoading,
    isTransitioning,
    feedback,
    setSelectedProjectId,
    setActiveFilter,
    toggleLanguage,
    setFeedback,
    handleStartReview,
    handleReadyForConsultation,
  } = useEngineerWorkspace();

  const [activeMainView, setActiveMainView] = React.useState<"projects" | "calendar">("projects");
  const [targetTab, setTargetTab] = React.useState<ProjectWorkspaceTab>("brief_review");

  // Handle opening project with specific tab
  const handleOpenProject = (projectId: number, tab: ProjectWorkspaceTab = "brief_review") => {
    setTargetTab(tab);
    setSelectedProjectId(projectId);
  };

  // If a project is selected, render the dedicated Project Workspace view
  if (selectedProjectId !== null && reviewContext) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
        <ProjectWorkspace
          context={reviewContext}
          activities={activities}
          consultations={consultations}
          onBack={() => setSelectedProjectId(null)}
          onStartReview={handleStartReview}
          onReadyForConsultation={handleReadyForConsultation}
          isTransitioning={isTransitioning}
          isRTL={isRTL}
          initialTab={targetTab}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Top Header: Operational Workspace Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>
              {isRTL ? "منظومة المهندس المعماري" : "ENGINEER OPERATIONAL DESK"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-foreground tracking-tight">
            {isRTL ? "مساحة عمل المهندس" : "Engineer Workspace"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            {isRTL
              ? "مرحباً، م. كريم السيد. راجع كراسات المتطلبات المسندة إليك، دقق المخططات، اعتمد الجاهزية للاستشارة، وأدر مواعيد ومحاضر الجلسات."
              : "Welcome, Eng. Karim El-Sayed. Review assigned customer briefs, audit floor plans, sign off consultation readiness, and manage session MOM records."}
          </p>
        </div>

        {/* Controls: Language Toggle & User Roster */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-mono text-foreground flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title={isRTL ? "Switch to English" : "التبديل إلى العربية"}
          >
            <Translate className="w-4 h-4 text-primary" />
            <span>{isRTL ? "English" : "عربي"}</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card shadow-xs">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs font-mono">
              KS
            </div>
            <div className="text-start">
              <span className="block text-xs font-medium text-foreground leading-tight">
                Eng. Karim El-Sayed
              </span>
              <span className="block text-[10px] font-mono text-muted-foreground">
                {projects.length} {isRTL ? "مشروعات نشطة" : "Active Commissions"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={cn(
            "p-4 rounded-xl text-xs font-medium flex items-center justify-between animate-in fade-in",
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-destructive/10 border border-destructive/20 text-destructive"
          )}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <WarningCircle className="w-4 h-4 text-destructive shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-muted-foreground hover:text-foreground text-xs font-mono"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading state indicator */}
      {isLoading ? (
        <div className="p-16 text-center space-y-3">
          <Spinner className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-xs text-muted-foreground font-mono">
            {isRTL
              ? "جارٍ تحميل المشروعات والمواعيد المسندة..."
              : "Synchronizing assigned commissions & consultation calendar..."}
          </p>
        </div>
      ) : (
        <>
          {/* 1. Highest Priority Action Hero Card */}
          <HighestPriorityAction
            projects={projects}
            consultations={consultations}
            onOpenProject={(id) => handleOpenProject(id)}
            isRTL={isRTL}
          />

          {/* 2. Needs Attention: Pending Reviews & Today's Appointments */}
          <NeedsAttention
            projects={projects}
            consultations={consultations}
            onOpenProject={(id) => handleOpenProject(id)}
            isRTL={isRTL}
          />

          {/* 3. Section Switcher Tabs: Queue vs Calendar */}
          <div className="flex items-center gap-2 border-b border-border pb-1">
            <button
              type="button"
              onClick={() => setActiveMainView("projects")}
              className={cn(
                "px-4 py-2 rounded-t-xl text-xs font-medium transition-all flex items-center gap-2 border-b-2 cursor-pointer",
                activeMainView === "projects"
                  ? "border-primary text-primary font-semibold bg-muted/30"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Buildings className="w-4 h-4" />
              <span>
                {isRTL
                  ? `طابور المشروعات المسندة (${projects.length})`
                  : `Assigned Projects Queue (${projects.length})`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainView("calendar")}
              className={cn(
                "px-4 py-2 rounded-t-xl text-xs font-medium transition-all flex items-center gap-2 border-b-2 cursor-pointer",
                activeMainView === "calendar"
                  ? "border-primary text-primary font-semibold bg-muted/30"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>
                {isRTL
                  ? `الأجندة والمواعيد (${consultations.length})`
                  : `Consultations & Calendar (${consultations.length})`}
              </span>
            </button>
          </div>

          {/* 4. Main Body: Queue or Calendar */}
          {activeMainView === "projects" ? (
            <AssignedProjectsQueue
              projects={projects}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onSelectProject={(id) => handleOpenProject(id)}
              isRTL={isRTL}
            />
          ) : (
            <AppointmentsCalendar
              consultations={consultations}
              onOpenProject={(id, tab) => handleOpenProject(id, tab)}
              isRTL={isRTL}
            />
          )}
        </>
      )}
    </div>
  );
}
