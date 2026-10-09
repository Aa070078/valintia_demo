"use client"
import { useLanguage } from "@/lib/i18n/language-context"
export interface BookedAppointment {
  id: string
  projectId: string | number
  type: "CONSULTATION_MEETING"
  date: string // ISO date string (YYYY-MM-DD)
  timeSlot: string // e.g. "11:30 AM"
  notes?: string
  status: "CONFIRMED" | "RESCHEDULED" | "COMPLETED"
  createdAt: string
  meetingChannel?: string
}

interface ConsultationSchedulerProps {
  projectId: string | number
  projectTitle: string
  projectLocation?: string
  initialAppointment?: BookedAppointment | null
  onAppointmentBooked?: (appointment: BookedAppointment | null) => void
  projectStatus?: string
  assignedEngineerName?: string
  engineerNote?: string
}

export function ConsultationScheduler({
  projectTitle,
}: ConsultationSchedulerProps) {
  const { isRTL } = useLanguage()
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-semibold">{projectTitle}</h3>
      <p className="mt-3 text-sm text-muted-foreground">
        {isRTL
          ? "حجز الاستشارات غير متاح حاليًا. تواصل مع فريق فالنتيا لتحديد موعد."
          : "Consultation booking is currently unavailable. Contact the Valentia team to arrange an appointment."}
      </p>
    </section>
  )
}
