"use client"

import * as React from "react"
import { useEngineerWorkspace } from "@/features/engineer/hooks/use-engineer-workspace"
import { HighestPriorityAction } from "@/features/engineer/components/highest-priority-action"
import { NeedsAttention } from "@/features/engineer/components/needs-attention"
import { AssignedProjectsQueue } from "@/features/engineer/components/assigned-projects-queue"
import { AppointmentsCalendar } from "@/features/engineer/components/appointments-calendar"
import { ProjectWorkspace } from "@/features/engineer/components/project-workspace"
import { ProjectWorkspaceTab } from "@/features/engineer/types/engineer.types"
import {
  Compass,
  Buildings,
  CalendarCheck,
  CheckCircle,
  WarningCircle,
  Translate,
  Spinner,
} from "@phosphor-icons/react"
import { useAuth } from "@/components/auth/auth-context"
import { cn } from "@/lib/utils"

export function EngineerDashboard() {
  const { user } = useAuth()
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
  } = useEngineerWorkspace()

  const [activeMainView, setActiveMainView] = React.useState<
    "projects" | "calendar"
  >("projects")
  const [targetTab, setTargetTab] =
    React.useState<ProjectWorkspaceTab>("brief_review")

  // Handle opening project with specific tab
  const handleOpenProject = (
    projectId: number,
    tab: ProjectWorkspaceTab = "brief_review"
  ) => {
    setTargetTab(tab)
    setSelectedProjectId(projectId)
  }

  // If a project is selected, render the dedicated Project Workspace view
  if (selectedProjectId !== null && reviewContext) {
    return (
      <div className="mx-auto w-full max-w-7xl animate-in p-4 duration-300 fade-in sm:p-6 lg:p-8">
        {feedback && (
          <p
            role="status"
            className={cn(
              "mb-4 rounded-xl border p-4 text-sm",
              feedback.type === "error"
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-primary/30 bg-primary/10 text-primary"
            )}
          >
            {feedback.text}
          </p>
        )}
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
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl animate-in space-y-8 p-4 duration-300 fade-in sm:p-6 lg:p-8">
      {/* Top Header: Operational Workspace Identity */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 font-mono text-xs tracking-wider text-primary uppercase">
            <Compass className="h-3.5 w-3.5" />
            <span>
              {isRTL ? "منظومة المهندس المعماري" : "ENGINEER OPERATIONAL DESK"}
            </span>
          </div>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            {isRTL ? "مساحة عمل المهندس" : "Engineer Workspace"}
          </h1>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {isRTL
              ? "راجع المشاريع المسندة إليك واعتمد الجاهزية للاستشارة."
              : "Review your assigned customer briefs and sign off consultation readiness."}
          </p>
        </div>

        {/* Controls: Language Toggle & User Roster */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 font-mono text-xs text-foreground shadow-xs transition-all hover:bg-muted"
            title={isRTL ? "Switch to English" : "التبديل إلى العربية"}
          >
            <Translate className="h-4 w-4 text-primary" />
            <span>{isRTL ? "English" : "عربي"}</span>
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 shadow-xs">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
              {user?.username?.slice(0, 2).toUpperCase() || "—"}
            </div>
            <div className="text-start">
              <span className="block text-xs leading-tight font-medium text-foreground">
                {user?.username || "—"}
              </span>
              <span className="block font-mono text-[10px] text-muted-foreground">
                {projects.length}{" "}
                {isRTL ? "مشروعات نشطة" : "Active Commissions"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={cn(
            "flex animate-in items-center justify-between rounded-xl p-4 text-xs font-medium fade-in",
            feedback.type === "success"
              ? "border border-[#B88460]/30 bg-[#EFE8DE] text-[#503C2C] dark:border-[#B88460]/40 dark:bg-[#2C2621] dark:text-[#F5EFE6]"
              : "border border-destructive/20 bg-destructive/10 text-destructive"
          )}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0 text-[#B88460]" />
            ) : (
              <WarningCircle className="h-4 w-4 shrink-0 text-destructive" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading state indicator */}
      {isLoading ? (
        <div className="space-y-3 p-16 text-center">
          <Spinner className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="font-mono text-xs text-muted-foreground">
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
                "flex cursor-pointer items-center gap-2 rounded-t-xl border-b-2 px-4 py-2 text-xs font-medium transition-all",
                activeMainView === "projects"
                  ? "border-primary bg-muted/30 font-semibold text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Buildings className="h-4 w-4" />
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
                "flex cursor-pointer items-center gap-2 rounded-t-xl border-b-2 px-4 py-2 text-xs font-medium transition-all",
                activeMainView === "calendar"
                  ? "border-primary bg-muted/30 font-semibold text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarCheck className="h-4 w-4" />
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
            <div className="space-y-4">
              <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                {isRTL
                  ? "إدارة مواعيد الاستشارات غير متاحة حاليًا."
                  : "Consultation scheduling is currently unavailable."}
              </p>
              <AppointmentsCalendar
                consultations={consultations}
                onOpenProject={(id, tab) => handleOpenProject(id, tab)}
                isRTL={isRTL}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
