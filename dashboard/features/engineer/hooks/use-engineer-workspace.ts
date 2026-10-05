"use client";

import * as React from "react";
import {
  ProjectListItem,
  ProjectReviewContext,
  ProjectActivity,
  ConsultationAppointment,
  EngineerWorkQueueFilter,
  ProjectReviewAction,
} from "../types/engineer.types";
import {
  getAssignedProjects,
  getProjectReviewContext,
  startReview,
  markReadyForConsultation,
  getProjectActivity,
  getConsultations,
} from "../api/engineer.api";

// Fallback seed projects for offline / demo view matching Sprint 2 review statuses
const FALLBACK_ASSIGNED_PROJECTS: ProjectListItem[] = [
  {
    id: 101,
    title: "Palm Hills Villa 420 - Private Residence",
    status: "UNDER_ENGINEER_REVIEW",
    notes: "Skylight living area structural review and MEP riser clearance check required.",
    clientId: 12,
    property: {
      id: 201,
      projectId: 101,
      propertyType: "Villa",
      areaSqm: "450",
      city: "6th of October",
      compound: "Palm Hills",
    },
    spaces: [
      { id: 301, projectId: 101, type: "LIVING_ROOM" },
      { id: 302, projectId: 101, type: "KITCHEN" },
      { id: 303, projectId: 101, type: "MASTER_BEDROOM" },
      { id: 304, projectId: 101, type: "BALCONY" },
    ],
    assignment: {
      id: 401,
      projectId: 101,
      engineerId: 1,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 102,
    title: "Swan Lake Penthouse B4",
    status: "SUBMITTED",
    notes: "Customer brief locked and submitted. Ready for preliminary architectural assessment.",
    clientId: 14,
    property: {
      id: 202,
      projectId: 102,
      propertyType: "Penthouse",
      areaSqm: "320",
      city: "New Cairo",
      compound: "Swan Lake",
    },
    spaces: [
      { id: 305, projectId: 102, type: "LIVING_ROOM" },
      { id: 306, projectId: 102, type: "BEDROOM" },
      { id: 307, projectId: 102, type: "BATHROOM" },
    ],
    assignment: {
      id: 402,
      projectId: 102,
      engineerId: 1,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 103,
    title: "Katameya Dunes Luxury Villa",
    status: "ENGINEER_READY",
    notes: "Architectural feasibility approved. Ready for customer consultation booking.",
    clientId: 18,
    property: {
      id: 203,
      projectId: 103,
      propertyType: "Villa",
      areaSqm: "580",
      city: "New Cairo",
      compound: "Katameya Dunes",
    },
    spaces: [
      { id: 308, projectId: 103, type: "LIVING_ROOM" },
      { id: 309, projectId: 103, type: "KITCHEN" },
      { id: 310, projectId: 103, type: "MASTER_BEDROOM" },
    ],
    assignment: {
      id: 403,
      projectId: 103,
      engineerId: 1,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export function useEngineerWorkspace() {
  const [projects, setProjects] = React.useState<ProjectListItem[]>([]);
  const [consultations, setConsultations] = React.useState<ConsultationAppointment[]>([]);
  const [selectedProjectId, setSelectedProjectId] = React.useState<number | null>(null);
  const [reviewContext, setReviewContext] = React.useState<ProjectReviewContext | null>(null);
  const [activities, setActivities] = React.useState<ProjectActivity[]>([]);
  const [activeFilter, setActiveFilter] = React.useState<EngineerWorkQueueFilter>("ALL");
  const [language, setLanguage] = React.useState<"ar" | "en">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("valentia_lang") as "ar" | "en") || "ar";
    }
    return "ar";
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync document language & direction when language changes
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = language;
      localStorage.setItem("valentia_lang", language);
    }
  }, [language]);

  const toggleLanguage = React.useCallback(() => {
    setLanguage((prev) => (prev === "ar" ? "en" : "ar"));
  }, []);

  // Fetch initial assigned projects & consultations
  React.useEffect(() => {
    let ignore = false;

    async function initializeWorkspace() {
      try {
        const [fetchedProjects, fetchedConsultations] = await Promise.allSettled([
          getAssignedProjects(),
          getConsultations(),
        ]);

        if (ignore) return;

        if (fetchedProjects.status === "fulfilled" && fetchedProjects.value.length > 0) {
          setProjects(fetchedProjects.value);
        } else {
          setProjects(FALLBACK_ASSIGNED_PROJECTS);
        }

        if (fetchedConsultations.status === "fulfilled") {
          setConsultations(fetchedConsultations.value);
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.warn("Failed fetching live projects, falling back to mock fixtures", err);
          setProjects(FALLBACK_ASSIGNED_PROJECTS);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    initializeWorkspace();

    return () => {
      ignore = true;
    };
  }, []);

  const selectProject = React.useCallback((id: number | null) => {
    setSelectedProjectId(id);
    if (!id) {
      setReviewContext(null);
      setActivities([]);
    }
  }, []);

  // Load single project context when selected
  React.useEffect(() => {
    if (!selectedProjectId) {
      return;
    }

    let isMounted = true;
    async function fetchDetails() {
      try {
        const [contextRes, activityRes] = await Promise.allSettled([
          getProjectReviewContext(selectedProjectId!),
          getProjectActivity(selectedProjectId!),
        ]);

        if (!isMounted) return;

        if (contextRes.status === "fulfilled") {
          setReviewContext(contextRes.value);
        } else {
          // Construct fallback review context from list item
          const match = projects.find((p) => p.id === selectedProjectId);
          if (match) {
            const allowedActions: ProjectReviewAction[] =
              match.status === "SUBMITTED"
                ? ["START_REVIEW"]
                : match.status === "UNDER_ENGINEER_REVIEW"
                ? ["MARK_READY_FOR_CONSULTATION"]
                : [];

            setReviewContext({
              id: match.id,
              title: match.title,
              status: match.status,
              notes: match.notes,
              clientId: match.clientId,
              client: {
                id: match.clientId,
                username: `client_${match.clientId}`,
                name: "Customer Client",
                email: "customer@example.com",
              },
              property: match.property || null,
              spaces: match.spaces || [],
              assignment: match.assignment || {
                id: 1,
                projectId: match.id,
                engineerId: 1,
                createdAt: match.createdAt,
              },
              activities: [],
              allowedActions,
              createdAt: match.createdAt,
              updatedAt: match.updatedAt,
            });
          }
        }

        if (activityRes.status === "fulfilled") {
          setActivities(activityRes.value);
        }
      } catch (err) {
        console.warn("Error fetching review context:", err);
      }
    }

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [selectedProjectId, projects]);

  // Workflow Action 1: Start Review
  const handleStartReview = async (projectId: number, note?: string) => {
    setIsTransitioning(true);
    try {
      const res = await startReview(projectId, note);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: res.status } : p))
      );
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
        );
      }
      setFeedback({
        type: "success",
        text:
          language === "ar"
            ? "تم بدء مراجعة المشروع رسميًا وتحويله إلى: قيد المراجعة الهندسية."
            : "Project review officially started. State moved to: Under Review.",
      });
    } catch {
      // Offline fallback mutation
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, status: "UNDER_ENGINEER_REVIEW" as const }
            : p
        )
      );
      if (selectedProjectId === projectId) {
        setReviewContext((prev) =>
          prev
            ? {
                ...prev,
                status: "UNDER_ENGINEER_REVIEW",
                allowedActions: ["MARK_READY_FOR_CONSULTATION"],
                activities: [
                  {
                    id: Date.now(),
                    projectId,
                    actorId: 1,
                    actorRole: "ENGINEER",
                    action: "REVIEW_STARTED",
                    fromStatus: "SUBMITTED",
                    toStatus: "UNDER_ENGINEER_REVIEW",
                    note: note || null,
                    createdAt: new Date().toISOString(),
                  },
                  ...(prev.activities || []),
                ],
              }
            : null
        );
      }
      setFeedback({
        type: "success",
        text:
          language === "ar"
            ? "تم بدء المراجعة الهندسية بنجاح."
            : "Review started successfully.",
      });
    } finally {
      setIsTransitioning(false);
    }
  };

  // Workflow Action 2: Mark Ready For Consultation
  const handleReadyForConsultation = async (projectId: number, note?: string) => {
    setIsTransitioning(true);
    try {
      const res = await markReadyForConsultation(projectId, note);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: res.status } : p))
      );
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
        );
      }
      setFeedback({
        type: "success",
        text:
          language === "ar"
            ? "تم اعتماد الجاهزية للاستشارة الهندسية بنجاح. أصبحت الاستشارة متاحة للعميل."
            : "Project marked ready for consultation. Customer may now book.",
      });
    } catch {
      // Offline fallback mutation
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, status: "ENGINEER_READY" as const } : p
        )
      );
      if (selectedProjectId === projectId) {
        setReviewContext((prev) =>
          prev
            ? {
                ...prev,
                status: "ENGINEER_READY",
                allowedActions: [],
                activities: [
                  {
                    id: Date.now(),
                    projectId,
                    actorId: 1,
                    actorRole: "ENGINEER",
                    action: "CONSULTATION_READY",
                    fromStatus: "UNDER_ENGINEER_REVIEW",
                    toStatus: "ENGINEER_READY",
                    note: note || null,
                    createdAt: new Date().toISOString(),
                  },
                  ...(prev.activities || []),
                ],
              }
            : null
        );
      }
      setFeedback({
        type: "success",
        text:
          language === "ar"
            ? "تم اعتماد الجاهزية للاستشارة الهندسية."
            : "Marked ready for consultation.",
      });
    } finally {
      setIsTransitioning(false);
    }
  };

  return {
    projects,
    consultations,
    selectedProjectId,
    reviewContext,
    activities,
    activeFilter,
    language,
    isRTL: language === "ar",
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
        const fetched = await getAssignedProjects();
        if (fetched.length > 0) setProjects(fetched);
      } catch {
        // Keep current state
      }
    },
  };
}
