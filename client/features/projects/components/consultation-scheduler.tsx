"use client";

import * as React from "react";
import {
  CalendarBlank,
  Clock,
  VideoCamera,
  CheckCircle,
  Sparkle,
  CalendarPlus,
  ArrowRight,
  ArrowLeft,
  X,
  LockKey,
} from "@phosphor-icons/react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export interface BookedAppointment {
  id: string;
  projectId: string | number;
  type: "CONSULTATION_MEETING";
  date: string; // ISO date string (YYYY-MM-DD)
  timeSlot: string; // e.g. "11:30 AM"
  notes?: string;
  status: "CONFIRMED" | "RESCHEDULED" | "COMPLETED";
  createdAt: string;
  meetingChannel?: string;
}

interface ConsultationSchedulerProps {
  projectId: string | number;
  projectTitle: string;
  projectLocation?: string;
  initialAppointment?: BookedAppointment | null;
  onAppointmentBooked?: (appointment: BookedAppointment | null) => void;
  projectStatus?: string;
  assignedEngineerName?: string;
  engineerNote?: string;
}

const TIME_SLOTS = [
  "10:00 AM",
  "11:30 AM",
  "01:00 PM",
  "02:30 PM",
  "04:00 PM",
  "05:30 PM",
  "07:00 PM",
];

const DAYS_OF_WEEK_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAYS_OF_WEEK_AR = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_NAMES_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

export function ConsultationScheduler({
  projectId,
  projectTitle,
  initialAppointment,
  onAppointmentBooked,
  projectStatus = "submitted",
  assignedEngineerName,
  engineerNote,
}: ConsultationSchedulerProps) {
  const { isRTL } = useLanguage();

  const storageKey = `valentia_appointment_proj_${projectId}`;

  const [appointment, setAppointment] = React.useState<BookedAppointment | null>(() => {
    if (initialAppointment) return initialAppointment;
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false);

  // Calendar month state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(today.getMonth());
  const [currentYear, setCurrentYear] = React.useState(today.getFullYear());

  // Selected date (YYYY-MM-DD)
  const tomorrow = new Date(Date.now() + 86400000);
  const initialDateStr = tomorrow.toISOString().split("T")[0];
  const [selectedDateStr, setSelectedDateStr] = React.useState<string>(initialDateStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<string>("11:30 AM");
  const [notes, setNotes] = React.useState("");
  const [isSuccessFeedback, setIsSuccessFeedback] = React.useState(false);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Days in month calculation
  const calendarGrid = React.useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const cells: Array<{ day: number; dateStr: string; isPast: boolean; isToday: boolean }> = [];
    const todayStr = new Date().toISOString().split("T")[0];

    // Padding empty days
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: 0, dateStr: "", isPast: true, isToday: false });
    }

    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      const monthPadded = String(currentMonth + 1).padStart(2, "0");
      const dayPadded = String(d).padStart(2, "0");
      const dStr = `${currentYear}-${monthPadded}-${dayPadded}`;
      const cellDate = new Date(currentYear, currentMonth, d);
      const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday = dStr === todayStr;

      cells.push({ day: d, dateStr: dStr, isPast, isToday });
    }

    return cells;
  }, [currentYear, currentMonth]);

  const handleConfirmBooking = () => {
    const newAppointment: BookedAppointment = {
      id: `apt-${Date.now()}`,
      projectId,
      type: "CONSULTATION_MEETING",
      date: selectedDateStr,
      timeSlot: selectedTimeSlot,
      notes: notes.trim() || undefined,
      status: "CONFIRMED",
      createdAt: new Date().toISOString(),
      meetingChannel: isRTL
        ? "مكالمة فيديو مباشرة (Google Meet) مع رئيس المهندسين"
        : "Live Video Meeting (Google Meet) with Lead Architect",
    };

    setAppointment(newAppointment);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newAppointment));
    } catch (e) {
      console.warn("Could not save appointment in localStorage:", e);
    }

    setIsSuccessFeedback(true);
    setTimeout(() => {
      setIsSuccessFeedback(false);
      setIsBookingModalOpen(false);
      if (onAppointmentBooked) onAppointmentBooked(newAppointment);
    }, 1000);
  };

  const handleCancelAppointment = () => {
    setAppointment(null);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    if (onAppointmentBooked) onAppointmentBooked(null);
  };

  const formattedDate = appointment
    ? new Date(appointment.date).toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="w-full">
      {/* ─────────────────────────────────────────────────────────────
          1. IF APPOINTMENT IS ALREADY BOOKED: SHOW CONFIRMED CARD
      ───────────────────────────────────────────────────────────── */}
      {appointment ? (
        <div className="p-6 sm:p-7 rounded-3xl bg-[#FAF7F2] border border-[#B88460]/40 shadow-md relative overflow-hidden text-[#1C1917]">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#B88460]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8DEC8] pb-5 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-[#FAF7F2] flex items-center justify-center shadow-md">
                <CheckCircle className="w-6 h-6 text-[#FAF7F2]" weight="fill" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono uppercase tracking-wider mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isRTL ? "تم تأكيد موعد ميتينج الاستشارة · مرحلة 02" : "CONSULTATION MEETING CONFIRMED · STAGE 02"}</span>
                </div>
                <h4 className="text-base sm:text-lg font-serif font-bold text-[#1C1917]">
                  {isRTL ? "مكالمة الاستشارة المعمارية مع رئيس المهندسين" : "Consultation Meeting with Lead Architect"}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="px-4 py-2 rounded-full border border-[#D8C8B4] bg-white text-xs font-semibold text-[#503C2C] hover:bg-[#FAF7F2] transition-colors shadow-2xs cursor-pointer"
              >
                {isRTL ? "تعديل الميعاد" : "Reschedule"}
              </button>
              <button
                type="button"
                onClick={handleCancelAppointment}
                className="px-3 py-2 text-xs text-red-600 hover:text-red-700 transition-colors cursor-pointer"
              >
                {isRTL ? "إلغاء الميعاد" : "Cancel"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] flex items-center gap-3">
              <CalendarBlank className="w-5 h-5 text-[#B88460] shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#78716C]">
                  {isRTL ? "تاريخ المقابلة" : "Meeting Date"}
                </div>
                <div className="text-xs font-semibold text-[#1C1917] mt-0.5">
                  {formattedDate}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#B88460] shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#78716C]">
                  {isRTL ? "توقيت الجلسة" : "Session Time"}
                </div>
                <div className="text-xs font-semibold text-[#1C1917] mt-0.5">
                  {appointment.timeSlot} (Cairo Time · GMT+2)
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] flex items-center gap-3">
              <VideoCamera className="w-5 h-5 text-[#B88460] shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#78716C]">
                  {isRTL ? "نوع اللقاء والقناة" : "Channel"}
                </div>
                <div className="text-xs font-semibold text-[#1C1917] mt-0.5 truncate max-w-[200px]">
                  {appointment.meetingChannel || (isRTL ? "مكالمة فيديو مباشرة (Google Meet)" : "Video Call (Google Meet)")}
                </div>
              </div>
            </div>
          </div>

          {appointment.notes && (
            <div className="mt-4 p-3.5 rounded-2xl bg-white/70 border border-[#E8DEC8] text-xs text-[#503C2C]">
              <span className="font-semibold">{isRTL ? "ملاحظاتك للمهندس: " : "Notes for the Architect: "}</span>
              <span className="text-[#78716C]">{appointment.notes}</span>
            </div>
          )}

          {/* Sequential Progression Note */}
          <div className="mt-4 pt-3 border-t border-[#E8DEC8] flex items-center gap-2 text-[11px] text-[#78716C]">
            <LockKey className="w-3.5 h-3.5 text-[#B88460] shrink-0" />
            <span>
              {isRTL
                ? "ملاحظة: فور إتمام جلسة الاستشارة بالفيديو واعتماد التوجه المعماري، سيتم فتح حجز موعد المعاينة الميدانية ورفع المقاسات (المرحلة 03) تلقائياً."
                : "Note: Upon completing this consultation meeting, the 3D Site Survey scheduling (Stage 03) will unlock automatically."}
            </span>
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            2. IF NOT BOOKED: INVITATION BANNER ADAPTED TO REVIEW STATE
        ───────────────────────────────────────────────────────────── */
        (() => {
          const normalized = (projectStatus || "submitted").toLowerCase();
          const isAwaiting = normalized === "submitted" || normalized === "initial_review";
          const isUnderReview = normalized === "under_engineer_review";
          const isReady = normalized === "engineer_ready";

          if (isAwaiting) {
            return (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#FAF7F2] border border-[#E8DEC8] text-[#1C1917] shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#B88460]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-2 max-w-xl text-start">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] uppercase font-mono tracking-widest text-amber-900 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>{isRTL ? "المرحلة 02 من 05 · في انتظار مراجعة المهندس" : "STAGE 02 · AWAITING ENGINEER REVIEW"}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1917]">
                    {isRTL
                      ? "طلبك تم تسليمه وقيد المراجعة الفنية الأولية"
                      : "Commission Submitted & Under Priority Technical Review"}
                  </h3>

                  <p className="text-xs text-[#78716C] leading-relaxed">
                    {isRTL
                      ? "استلمنا بيانات بيتك، والمهندس المسؤول بيفحص الرسومات المرفقة والمساحات للتأكد من اكتمالها قبل فتح المواعيد. سنرسل لك إشعاراً فور انتهاء المهندس وتأكيد جاهزيته لميتينج الاستشارة."
                      : "Our architectural atelier is checking drawings and spatial requirements. You will receive an instant notification as soon as the lead architect declares readiness for the video consultation."}
                  </p>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
                  <div className="px-5 py-3 rounded-full bg-[#EFE8DE] text-[#78716C] border border-[#D8C8B4] text-xs font-semibold flex items-center gap-2 select-none">
                    <Clock className="w-4 h-4 text-[#B88460]" />
                    <span>{isRTL ? "في انتظار اعتماد المهندس ⏳" : "Awaiting Engineer Review ⏳"}</span>
                  </div>
                  <span className="text-[10px] text-[#A8A29E]">
                    {isRTL ? "سيتم فتح حجز الميعاد تلقائياً فور الاعتماد" : "Booking unlocks upon architect readiness"}
                  </span>
                </div>
              </div>
            );
          }

          if (isUnderReview) {
            return (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#FAF7F2] border border-[#B88460]/50 text-[#1C1917] shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-2 max-w-xl text-start">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-[10px] uppercase font-mono tracking-widest text-emerald-900 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>{isRTL ? "المرحلة 02 من 05 · فحص المخططات جاري الآن" : "STAGE 02 · ARCHITECTURAL REVIEW ACTIVE"}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1917]">
                    {isRTL
                      ? "المهندس المسؤول يقوم بدراسة تفاصيل مشروعك حالياً"
                      : "Lead Architect Is Currently Reviewing Your Blueprints"}
                  </h3>

                  <p className="text-xs text-[#78716C] leading-relaxed">
                    {isRTL
                      ? "المهندس المعين بدأ بمطابقة المساحات والرسومات الهندسية والخامات. فور تأكيده للجاهزية، سيصلك إشعار فوري ويمكنك حجز جلسة الاستشارة بالفيديو مباشرة."
                      : "The assigned architect is analyzing floorplans and specifications. Booking will open immediately upon confirmation."}
                  </p>

                  {engineerNote && (
                    <div className="mt-3 p-3 rounded-xl bg-white border border-[#E8DEC8] text-xs text-[#503C2C] flex items-start gap-2">
                      <span className="font-bold shrink-0">{isRTL ? "ملاحظة المهندس:" : "Architect Note:"}</span>
                      <span className="text-[#78716C] italic">{engineerNote}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
                  <div className="px-5 py-3 rounded-full bg-emerald-700 text-[#FAF7F2] text-xs font-semibold flex items-center gap-2 shadow-xs select-none">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isRTL ? "المراجعة جارية بالمكتب الفني 📐" : "Review In Progress 📐"}</span>
                  </div>
                  <span className="text-[10px] text-[#A8A29E]">
                    {isRTL ? "جاري الفحص... سيصلك تنبيه فوري" : "Live review active · notification incoming"}
                  </span>
                </div>
              </div>
            );
          }

          // Case: ENGINEER_READY (Or confirmed review)
          return (
            <div className="p-6 sm:p-7 rounded-3xl bg-[#503C2C] text-[#FAF7F2] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#B88460]/40">
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#B88460]/25 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-2 max-w-xl text-start">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B88460]/20 border border-[#B88460]/40 text-[10px] uppercase font-mono tracking-widest text-[#FAF7F2] font-bold">
                  <Sparkle className="w-3.5 h-3.5 text-[#B88460]" />
                  <span>{isRTL ? "المهندس جاهز لمقابلتك الآن · مرحلة 02" : "ARCHITECT READY · STAGE 02 UNLOCKED"}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  {isRTL
                    ? "المهندس اعتمد المراجعة! احجز موعد ميتينج الاستشارة الآن"
                    : "Architect Ready! Pick Your Consultation Time Slot"}
                </h3>

                <p className="text-xs text-[#E5D7C7] leading-relaxed">
                  {isRTL
                    ? "انتهى المهندس من فحص كامل الملف الفني واعتماده، والآن يمكنك اختيار الميعاد الأنسب لك لمناقشة أسلوب التصميم والخامات بالفيديو عبر Google Meet."
                    : "Review is fully certified. Choose your preferred time slot to discuss design aesthetics, materials, and spatial planning live on video."}
                </p>

                {engineerNote && (
                  <div className="mt-2 p-3 rounded-xl bg-black/20 border border-white/10 text-xs text-[#E5D7C7]">
                    <span className="font-bold text-white">{isRTL ? "ملاحظة المهندس: " : "Architect's Note: "}</span>
                    <span>{engineerNote}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className={cn(
                  "shrink-0 px-7 py-3.5 rounded-full bg-[#B88460] text-white hover:bg-[#A37250] active:scale-95 transition-all shadow-md flex items-center gap-2.5 font-semibold text-xs tracking-wider uppercase cursor-pointer animate-pulse hover:animate-none",
                  isRTL && "tracking-normal font-sans"
                )}
              >
                <CalendarPlus className="w-4 h-4" />
                <span>{isRTL ? "اختيار وقت الميتينج الآن ←" : "Pick Meeting Time →"}</span>
              </button>
            </div>
          );
        })()
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. INTERACTIVE 21ST CALENDAR APPOINTMENT PICKER MODAL
             (LOCKED TO STAGE 02 CONSULTATION MEETING ONLY)
      ───────────────────────────────────────────────────────────── */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={cn(
              "w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#FAF7F2] border border-[#D8C8B4] p-5 sm:p-7 shadow-2xl relative text-[#1C1917]",
              isRTL ? "text-right" : "text-left"
            )}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white border border-[#D8C8B4] flex items-center justify-center text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="mb-5 pr-8">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#B88460] animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] font-semibold">
                  {isRTL ? "المرحلة 02 من 05 · مكالمة الاستشارة" : "STAGE 02 OF 05 · CONSULTATION MEETING"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1917]">
                {isRTL ? "تحديد موعد ميتينج الاستشارة مع رئيس المهندسين" : "Pick Consultation Meeting Date & Time"}
              </h2>
              <p className="text-xs text-[#78716C] mt-1">
                {isRTL
                  ? "مكالمة فيديو تفاعلية لمناقشة أسلوب التصميم، متطلبات الغرف، والمواد قبل بدء المعاينات الميدانية."
                  : "Interactive video session to align spatial needs and materials before scheduling site inspections."}
              </p>
            </div>

            {/* Sequential Stage Notice Banner */}
            <div className="mb-5 p-3.5 rounded-2xl bg-white border border-[#D8C8B4] flex items-center gap-3 text-xs text-[#503C2C]">
              <div className="w-8 h-8 rounded-xl bg-[#503C2C] text-[#FAF7F2] flex items-center justify-center shrink-0">
                <VideoCamera className="w-4 h-4 text-[#B88460]" />
              </div>
              <div className="leading-relaxed">
                <span className="font-bold text-[#1C1917]">
                  {isRTL ? "جلسة فيديو مباشرة (أونلاين): " : "Direct Video Meeting: "}
                </span>
                <span className="text-[#78716C]">
                  {isRTL
                    ? "اختر التاريخ والوقت الأنسب لك أدناه. مواعيد المراحل التالية (كالمعاينة الميدانية ثلاثية الأبعاد) ستفتح تلقائياً بعد إنهاء هذا الميتينج."
                    : "Select your preferred date and slot below. Next stages (such as 3D Site Survey) will unlock after this meeting."}
                </span>
              </div>
            </div>

            {/* Calendar & Time Slots 2-Column (21st Component Pattern) */}
            <div className="mb-6 rounded-2xl border border-[#D8C8B4] bg-white overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x md:divide-[#D8C8B4]">
              {/* Left Calendar (7 cols) */}
              <div className="md:col-span-7 p-4 sm:p-5">
                {/* Month Nav */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-mono uppercase font-bold text-[#503C2C] tracking-wider">
                    {isRTL ? MONTH_NAMES_AR[currentMonth] : MONTH_NAMES_EN[currentMonth]} {currentYear}
                  </h4>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="w-7 h-7 rounded-lg border border-[#D8C8B4] hover:bg-[#FAF7F2] flex items-center justify-center text-[#503C2C] transition-colors cursor-pointer"
                    >
                      {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="w-7 h-7 rounded-lg border border-[#D8C8B4] hover:bg-[#FAF7F2] flex items-center justify-center text-[#503C2C] transition-colors cursor-pointer"
                    >
                      {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {(isRTL ? DAYS_OF_WEEK_AR : DAYS_OF_WEEK_EN).map((d, i) => (
                    <span key={i} className="text-[10px] font-mono text-[#A8A29E] font-medium">
                      {d}
                    </span>
                  ))}
                </div>

                {/* Day Cells */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarGrid.map((cell, idx) => {
                    if (cell.day === 0) {
                      return <div key={idx} className="h-8 w-8" />;
                    }

                    const isSelected = cell.dateStr === selectedDateStr;

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={cell.isPast}
                        onClick={() => setSelectedDateStr(cell.dateStr)}
                        className={cn(
                          "h-8 sm:h-9 w-full rounded-xl text-xs font-mono font-medium flex items-center justify-center transition-all cursor-pointer relative",
                          cell.isPast && "text-[#D8C8B4] opacity-40 cursor-not-allowed",
                          !cell.isPast && !isSelected && "hover:bg-[#FAF7F2] text-[#1C1917]",
                          isSelected && "bg-[#503C2C] text-[#FAF7F2] font-bold shadow-xs",
                          cell.isToday && !isSelected && "border border-[#B88460] font-bold text-[#B88460]"
                        )}
                      >
                        {cell.day}
                        {cell.isToday && !isSelected && (
                          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#B88460]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Time Slots (5 cols) */}
              <div className="md:col-span-5 p-4 sm:p-5 flex flex-col justify-between bg-[#FAF7F2]/50">
                <div>
                  <div className="flex items-center gap-1.5 mb-3 text-xs font-mono font-bold text-[#503C2C] uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-[#B88460]" />
                    <span>{isRTL ? "المواعيد المتاحة للميتينج" : "Available Slots"}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={cn(
                            "py-2 px-2.5 rounded-xl text-[11px] font-mono font-semibold transition-all border text-center cursor-pointer",
                            isSelected
                              ? "bg-[#B88460] text-white border-[#B88460] shadow-xs"
                              : "bg-white text-[#503C2C] border-[#D8C8B4] hover:bg-[#F5EFE6]"
                          )}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8DEC8] text-[11px] text-[#78716C] font-mono">
                  {selectedDateStr && (
                    <span>
                      {isRTL ? "الميعاد المختار:" : "Chosen:"}{" "}
                      <strong className="text-[#1C1917]">{selectedDateStr} @ {selectedTimeSlot}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Optional Notes */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#503C2C] mb-1.5 uppercase tracking-wider">
                {isRTL ? "ملاحظات أو أسئلة للمهندس قبل المكالمة (اختياري)" : "Notes / Questions for the Lead Architect (Optional)"}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  isRTL
                    ? "مثال: حابب نركز على استغلال مساحة غرفة الماستر والمطبخ المفتوح، وتنسيق الألوان المحايدة..."
                    : "e.g. Focus on master suite layout and open kitchen flow, warm neutral tones..."
                }
                className="w-full p-3 rounded-xl bg-white border border-[#D8C8B4] text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#B88460] focus:border-transparent transition-all shadow-inner"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="text-xs text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={!selectedDateStr || !selectedTimeSlot || isSuccessFeedback}
                className={cn(
                  "px-8 py-3.5 rounded-full bg-[#503C2C] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider shadow-md hover:bg-[#3D2E22] active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50",
                  isRTL && "tracking-normal font-sans"
                )}
              >
                {isSuccessFeedback ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" weight="fill" />
                    <span>{isRTL ? "تم حجز موعد الميتينج بنجاح!" : "Meeting Booked Successfully!"}</span>
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4 text-[#B88460]" />
                    <span>{isRTL ? "تأكيد حجز ميعاد الميتينج ←" : "Confirm Meeting Time →"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
