"use client"

import * as React from "react"
import {
  ProjectListItem,
  ProjectReviewContext,
  ProjectActivity,
  ConsultationAppointment,
  EngineerWorkQueueFilter,
} from "../types/engineer.types"
import {
  getAssignedProjects,
  getProjectReviewContext,
  startReview,
  markReadyForConsultation,
  getProjectActivity,
  getConsultations,
} from "../api/engineer.api"
import { useLanguage } from "@/lib/i18n/language-context"

export function useEngineerWorkspace() {
  const [projects, setProjects] = React.useState<ProjectListItem[]>([])
  const [consultations, setConsultations] = React.useState<
    ConsultationAppointment[]
  >([])
  const [selectedProjectId, setSelectedProjectId] = React.useState<
    number | null
  >(null)
  const [reviewContext, setReviewContext] =
    React.useState<ProjectReviewContext | null>(null)
  const [activities, setActivities] = React.useState<ProjectActivity[]>([])
  const [activeFilter, setActiveFilter] =
    React.useState<EngineerWorkQueueFilter>("ALL")
  const { language, isRTL, toggleLanguage } = useLanguage()
  const [isLoading, setIsLoading] = React.useState(true)
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  // Fetch initial assigned projects & consultations
  React.useEffect(() => {
    let ignore = false

    async function initializeWorkspace() {
      try {
        const [fetchedProjects, fetchedConsultations] =
          await Promise.allSettled([getAssignedProjects(), getConsultations()])

        if (ignore) return

        if (
          fetchedProjects.status === "fulfilled" &&
          Array.isArray(fetchedProjects.value)
        ) {
          setProjects(fetchedProjects.value)
        } else {
          setProjects([])
          setFeedback({
            type: "error",
            text: "Unable to load assigned projects. Please retry.",
          })
        }

        if (fetchedConsultations.status === "fulfilled") {
          setConsultations(fetchedConsultations.value)
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.warn("Unable to load assigned projects", err)
          setProjects([])
          setFeedback({
            type: "error",
            text: "Unable to load assigned projects. Please retry.",
          })
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    initializeWorkspace()

    return () => {
      ignore = true
    }
  }, [])

  const selectProject = React.useCallback((id: number | null) => {
    setSelectedProjectId(id)
    setReviewContext(null)
    setActivities([])
  }, [])

  // Load single project context when selected
  React.useEffect(() => {
    if (!selectedProjectId) {
      return
    }

    let isMounted = true
    async function fetchDetails() {
      try {
        const [contextRes, activityRes] = await Promise.allSettled([
          getProjectReviewContext(selectedProjectId!),
          getProjectActivity(selectedProjectId!),
        ])

        if (!isMounted) return

        if (contextRes.status === "fulfilled") {
          setReviewContext(contextRes.value)
        } else {
          setReviewContext(null)
          setFeedback({
            type: "error",
            text: "Unable to load project review. Please retry.",
          })
        }

        if (activityRes.status === "fulfilled") {
          setActivities(activityRes.value)
        } else {
          setFeedback({
            type: "error",
            text: "Unable to load project activity.",
          })
        }
      } catch (err) {
        console.warn("Error fetching review context:", err)
      }
    }

    fetchDetails()
    return () => {
      isMounted = false
    }
  }, [selectedProjectId, projects])

  // Workflow Action 1: Start Review
  const handleStartReview = async (projectId: number, note?: string) => {
    setIsTransitioning(true)
    try {
      const res = await startReview(projectId, note)
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: res.status } : p))
      )
      if (selectedProjectId === projectId) {
        setReviewContext((prev) =>
          prev
            ? {
                ...prev,
                status: res.status,
                allowedActions: res.allowedActions,
                activities: [res.activity, ...(prev.activities || [])],
              }
            : null
        )
      }
      setFeedback({
        type: "success",
        text:
          language === "ar"
            ? "تم بدء مراجعة المشروع رسميًا وتحويله إلى: قيد المراجعة الهندسية."
            : "Project review officially started. State moved to: Under Review.",
      })
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Project update failed.",
      })
    } finally {
      setIsTransitioning(false)
    }
  }

  // Workflow Action 2: Mark Ready For Consultation
  const handleReadyForConsultation = async (
    projectId: number,
    note?: string
  ) => {
    setIsTransitioning(true)
    try {
      const res = await markReadyForConsultation(projectId, note)
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: res.status } : p))
      )
      if (selectedProjectId === projectId) {
        setReviewContext((prev) =>
          prev
            ? {
                ...prev,
                status: res.status,
                allowedActions: res.allowedActions,
                activities: [res.activity, ...(prev.activities || [])],
              }
            : null
        )
      }
      setFeedback({
        type: "success",
        text:
          language === "ar"
            ? "تم اعتماد الجاهزية للاستشارة الهندسية بنجاح. أصبحت الاستشارة متاحة للعميل."
            : "Project marked ready for consultation. Customer may now book.",
      })
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Project update failed.",
      })
    } finally {
      setIsTransitioning(false)
    }
  }

  return {
    projects,
    consultations,
    selectedProjectId,
    reviewContext,
    activities,
    activeFilter,
    language,
    isRTL,
    isLoading,
    isTransitioning,
    feedback,
    setSelectedProjectId: selectProject,
    setActiveFilter,
    toggleLanguage,
    setFeedback,
    handleStartReview,
    handleReadyForConsultation,
    refetchProjects: async () => {
      try {
        const fetched = await getAssignedProjects()
        setProjects(fetched)
      } catch {
        setFeedback({
          type: "error",
          text: "Unable to refresh assigned projects. Please retry.",
        })
      }
    },
  }
}
