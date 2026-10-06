"use client";

import * as React from "react";
import {
  CalendarBlank,
  Clock,
  VideoCamera,
  Buildings,
  CheckCircle,
  MapPin,
  Sparkle,
  Phone,
  ChatText,
  CalendarPlus,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
} from "@phosphor-icons/react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export type ConsultationType = "ATELIER_CONSULTATION" | "SITE_VISIT" | "VIRTUAL_CALL";

export interface BookedAppointment {
  id: string;
  projectId: string | number;
  type: ConsultationType;
  date: string; // ISO date string (YYYY-MM-DD)
  timeSlot: string; // e.g. "11:30 AM"
  notes?: string;
  status: "CONFIRMED" | "RESCHEDULED" | "COMPLETED";
  createdAt: string;
  meetingLocation?: string;
}

interface ConsultationSchedulerProps {
  projectId: string | number;
  projectTitle: string;
  projectLocation?: string;
  initialAppointment?: BookedAppointment | null;
  onAppointmentBooked?: (appointment: BookedAppointment) => void;
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
  projectLocation,
  initialAppointment,
  onAppointmentBooked,
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
  const [selectedType, setSelectedType] = React.useState<ConsultationType>("ATELIER_CONSULTATION");
  
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
      type: selectedType,
      date: selectedDateStr,
      timeSlot: selectedTimeSlot,
      notes: notes.trim() || undefined,
      status: "CONFIRMED",
      createdAt: new Date().toISOString(),
      meetingLocation:
        selectedType === "ATELIER_CONSULTATION"
          ? "Valentia Design Atelier — New Cairo Flagship Studio"
          : selectedType === "SITE_VISIT"
          ? projectLocation || "Project Site Inspection"
          : "Valentia Virtual Atelier (Google Meet Link)",
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
    }, 1200);
  };

  const handleCancelAppointment = () => {
    setAppointment(null);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
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
                  <span>{isRTL ? "تم تأكيد الميعاد بنجاح" : "APPOINTMENT CONFIRMED"}</span>
                </div>
                <h4 className="text-base sm:text-lg font-serif font-bold text-[#1C1917]">
                  {appointment.type === "ATELIER_CONSULTATION"
                    ? isRTL ? "استشارة معمارية في أتيليه فالنتيا" : "Atelier Design Consultation"
                    : appointment.type === "SITE_VISIT"
                    ? isRTL ? "زيارة ميدانية ومعاينة رفع مساحي بالليزر" : "On-Site Laser Survey & Inspection"
                    : isRTL ? "جلسة استشارة افتراضية (فيديو)" : "Virtual Design Session"}
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
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] flex items-center gap-3">
              <CalendarBlank className="w-5 h-5 text-[#B88460] shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#78716C]">
                  {isRTL ? "تاريخ المقابلة" : "Scheduled Date"}
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
              <MapPin className="w-5 h-5 text-[#B88460] shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#78716C]">
                  {isRTL ? "مكان اللقاء" : "Location / Channel"}
                </div>
                <div className="text-xs font-semibold text-[#1C1917] mt-0.5 truncate max-w-[200px]">
                  {appointment.meetingLocation}
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
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            2. IF NOT BOOKED: INVITATION BANNER TO SCHEDULE
        ───────────────────────────────────────────────────────────── */
        <div className="p-6 sm:p-7 rounded-3xl bg-[#503C2C] text-[#FAF7F2] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#B88460]/40">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#B88460]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 max-w-xl text-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2]/10 border border-[#FAF7F2]/20 text-[10px] uppercase font-mono tracking-widest text-[#E5D7C7]">
              <Sparkle className="w-3.5 h-3.5 text-[#B88460]" />
              <span>{isRTL ? "الخطوة التالية المعتمدة" : "RECOMMENDED NEXT STEP"}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
              {isRTL
                ? "احجز جلستك المعمارية أو موعد المعاينة الميدانية"
                : "Schedule Your Atelier Consultation or Site Survey"}
            </h3>

            <p className="text-xs text-[#E5D7C7] leading-relaxed">
              {isRTL
                ? "اختر الموعد المناسب لك لزيارة أتيليه فالنتيا لمناقشة التصاميم والخامات، أو لتنسيق رفع مساحي ليزري ثلاثي الأبعاد في موقع عقارك."
                : "Pick a convenient date to meet our senior architects at the atelier, or book our 3D laser survey team for your property."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsBookingModalOpen(true)}
            className={cn(
              "shrink-0 px-7 py-3.5 rounded-full bg-[#B88460] text-white hover:bg-[#A37250] active:scale-95 transition-all shadow-md flex items-center gap-2.5 font-semibold text-xs tracking-wider uppercase cursor-pointer",
              isRTL && "tracking-normal font-sans"
            )}
          >
            <CalendarPlus className="w-4 h-4" />
            <span>{isRTL ? "حجز ميعاد المقابلة الآن ←" : "Book Appointment Now →"}</span>
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. INTERACTIVE 21ST CALENDAR APPOINTMENT PICKER MODAL
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
                  {isRTL ? "نظام حجز المواعيد والمعاينات" : "VALENTIA APPOINTMENT DESK"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1917]">
                {isRTL ? "تحديد موعد الاستشارة أو المعاينة" : "Book Consultation or Site Survey"}
              </h2>
            </div>

            {/* Meeting Type Selector */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#503C2C] mb-2 uppercase tracking-wider">
                {isRTL ? "نوع الموعد المطلوب" : "Meeting / Survey Type"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedType("ATELIER_CONSULTATION")}
                  className={cn(
                    "p-3 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-2",
                    selectedType === "ATELIER_CONSULTATION"
                      ? "bg-[#503C2C] text-[#FAF7F2] border-[#503C2C] shadow-sm"
                      : "bg-white text-[#1C1917] border-[#D8C8B4] hover:bg-[#F5EFE6]"
                  )}
                >
                  <Buildings className={cn("w-5 h-5", selectedType === "ATELIER_CONSULTATION" ? "text-[#B88460]" : "text-[#78716C]")} />
                  <div>
                    <div className="text-xs font-bold leading-tight">
                      {isRTL ? "استشارة الأتيليه" : "Atelier Meeting"}
                    </div>
                    <div className={cn("text-[10px] mt-0.5", selectedType === "ATELIER_CONSULTATION" ? "text-[#E5D7C7]" : "text-[#78716C]")}>
                      {isRTL ? "معاينة عينات الخامات" : "Physical material boards"}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType("SITE_VISIT")}
                  className={cn(
                    "p-3 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-2",
                    selectedType === "SITE_VISIT"
                      ? "bg-[#503C2C] text-[#FAF7F2] border-[#503C2C] shadow-sm"
                      : "bg-white text-[#1C1917] border-[#D8C8B4] hover:bg-[#F5EFE6]"
                  )}
                >
                  <Compass className={cn("w-5 h-5", selectedType === "SITE_VISIT" ? "text-[#B88460]" : "text-[#78716C]")} />
                  <div>
                    <div className="text-xs font-bold leading-tight">
                      {isRTL ? "معاينة ميدانية للموقع" : "On-Site Survey"}
                    </div>
                    <div className={cn("text-[10px] mt-0.5", selectedType === "SITE_VISIT" ? "text-[#E5D7C7]" : "text-[#78716C]")}>
                      {isRTL ? "رفع ليزري ثلاثي الأبعاد" : "Laser 3D scanning"}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType("VIRTUAL_CALL")}
                  className={cn(
                    "p-3 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-2",
                    selectedType === "VIRTUAL_CALL"
                      ? "bg-[#503C2C] text-[#FAF7F2] border-[#503C2C] shadow-sm"
                      : "bg-white text-[#1C1917] border-[#D8C8B4] hover:bg-[#F5EFE6]"
                  )}
                >
                  <VideoCamera className={cn("w-5 h-5", selectedType === "VIRTUAL_CALL" ? "text-[#B88460]" : "text-[#78716C]")} />
                  <div>
                    <div className="text-xs font-bold leading-tight">
                      {isRTL ? "جلسة فيديو اونلاين" : "Virtual Video Call"}
                    </div>
                    <div className={cn("text-[10px] mt-0.5", selectedType === "VIRTUAL_CALL" ? "text-[#E5D7C7]" : "text-[#78716C]")}>
                      {isRTL ? "مناقشة عبر شاشتك" : "Interactive screen share"}
                    </div>
                  </div>
                </button>
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
                    <span>{isRTL ? "المواعيد المتاحة" : "Available Slots"}</span>
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
                {isRTL ? "ملاحظات أو استفسارات خاصة للمهندس (اختياري)" : "Notes / Questions for the Architect (Optional)"}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  isRTL
                    ? "مثال: محتاجين نركز على استغلال مساحة غرفة الماستر والمطبخ المفتوح..."
                    : "e.g. Please bring travertine and light oak samples; focus on master bathroom layout..."
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
                    <span>{isRTL ? "تم تأكيد الحجز بنجاح!" : "Appointment Confirmed!"}</span>
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4 text-[#B88460]" />
                    <span>{isRTL ? "تأكيد حجز الميعاد ←" : "Confirm Booking →"}</span>
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
