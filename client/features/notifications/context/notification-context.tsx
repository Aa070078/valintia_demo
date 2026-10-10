"use client"

import * as React from "react"
import { apiClient } from "@/lib/api/client"
import { useAuth } from "@/features/auth/context/auth-context"

export interface AppNotification {
  id: string
  projectId?: number | string
  titleAr: string
  titleEn: string
  messageAr: string
  messageEn: string
  type: "info" | "review_started" | "engineer_ready" | "appointment_booked"
  timestamp: string
  read: boolean
  link?: string
}

interface NotificationContextType {
  notifications: AppNotification[]
  unreadCount: number
  activeToast: AppNotification | null
  dismissToast: () => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (
    notif: Omit<AppNotification, "id" | "timestamp" | "read">
  ) => void
  clearAll: () => void
}

const NotificationContext = React.createContext<
  NotificationContextType | undefined
>(undefined)

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user } = useAuth()
  const [notifications, setNotifications] = React.useState<AppNotification[]>(
    []
  )

  const [activeToast, setActiveToast] = React.useState<AppNotification | null>(
    null
  )
  const previousStatusMap = React.useRef<Record<string, string>>({})
  const [notificationOwner, setNotificationOwner] = React.useState(user?.id)
  if (notificationOwner !== user?.id) {
    setNotificationOwner(user?.id)
    setNotifications([])
    setActiveToast(null)
  }
  React.useEffect(() => {
    previousStatusMap.current = {}
  }, [user?.id])

  const addNotification = React.useCallback(
    (notif: Omit<AppNotification, "id" | "timestamp" | "read">) => {
      const newNotification: AppNotification = {
        ...notif,
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        read: false,
      }

      setNotifications((prev) => [newNotification, ...prev])
      setActiveToast(newNotification)

      // Auto-hide toast after 7 seconds
      setTimeout(() => {
        setActiveToast((current) =>
          current?.id === newNotification.id ? null : current
        )
      }, 7000)
    },
    []
  )

  const markAsRead = React.useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = React.useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearAll = React.useCallback(() => {
    setNotifications([])
  }, [])

  const dismissToast = React.useCallback(() => {
    setActiveToast(null)
  }, [])

  // Listen for explicit project status change events
  React.useEffect(() => {
    const handleStatusChangeEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{
        projectId: number | string
        projectTitle?: string
        fromStatus?: string
        toStatus: string
        note?: string
      }>

      if (!customEvent.detail) return
      const { projectId, projectTitle, toStatus, note } = customEvent.detail
      const title = projectTitle || `مشروع #${projectId}`
      const normalizedStatus = toStatus.toUpperCase()

      if (normalizedStatus === "UNDER_ENGINEER_REVIEW") {
        addNotification({
          projectId,
          titleAr: "المراجعة الفنية جارية لمشروعك",
          titleEn: "Technical Review Started",
          messageAr: note
            ? `المهندس بدأ فحص ومراجعة تفاصيل ومخططات ${title}. ملاحظة: ${note}`
            : `المهندس المعماري بدأ الآن فحص المخططات ومواصفات التشطيب لمشروعك (${title}).`,
          messageEn: note
            ? `Lead architect started reviewing ${title}. Note: ${note}`
            : `Lead architect started reviewing drawings and spatial specs for ${title}.`,
          type: "review_started",
          link: `/projects/${projectId}`,
        })
      } else if (normalizedStatus === "ENGINEER_READY") {
        addNotification({
          projectId,
          titleAr: "المهندس مستعد لمقابلتك! احجز ميعادك الآن 🎉",
          titleEn: "Architect Ready! Book Consultation Now 🎉",
          messageAr: note
            ? `اعتمد المهندس المراجعة الفنية لمشروعك (${title}) وهو جاهز للميتينج. ملاحظة: ${note}`
            : `اعتمد المهندس المراجعة الفنية لمشروعك (${title}). يمكنك الآن الدخول واختيار موعد ميتينج الاستشارة بالفيديو.`,
          messageEn: note
            ? `Review certified for ${title}. Ready for meeting. Note: ${note}`
            : `Technical review approved for ${title}. You can now select your consultation meeting slot.`,
          type: "engineer_ready",
          link: `/projects/${projectId}#consultation-schedule`,
        })
      }
    }

    window.addEventListener(
      "valentia:project-status-change",
      handleStatusChangeEvent
    )
    return () => {
      window.removeEventListener(
        "valentia:project-status-change",
        handleStatusChangeEvent
      )
    }
  }, [addNotification])

  // Background Worker: polls user projects periodically to detect status updates
  React.useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false

    const checkProjectsWorker = async () => {
      try {
        const response =
          await apiClient.get<
            Array<{ id: number; title: string; status: string }>
          >("/projects")
        const projects = response.data
        if (cancelled || !Array.isArray(projects)) return

        projects.forEach((proj) => {
          const prevStatus = previousStatusMap.current[proj.id]
          const currentStatus = proj.status.toUpperCase()

          if (prevStatus && prevStatus !== currentStatus) {
            window.dispatchEvent(
              new CustomEvent("valentia:project-status-change", {
                detail: {
                  projectId: proj.id,
                  projectTitle: proj.title,
                  fromStatus: prevStatus,
                  toStatus: currentStatus,
                },
              })
            )
          }
          previousStatusMap.current[proj.id] = currentStatus
        })
      } catch {
        // Silent catch for polling
      }
    }

    // Initial check
    checkProjectsWorker()

    // Poll every 12 seconds
    const interval = setInterval(checkProjectsWorker, 12000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [isAuthenticated, user?.id])

  const unreadCount = React.useMemo(() => {
    return notifications.filter((n) => !n.read).length
  }, [notifications])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeToast,
        dismissToast,
        markAsRead,
        markAllAsRead,
        addNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = React.useContext(NotificationContext)
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    )
  }
  return context
}
