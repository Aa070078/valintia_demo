"use client";

import * as React from "react";
import {
  MOCK_SITE_VISITS,
  MOCK_ENGINEERING_ITEMS,
} from "../mock-data";
import {
  SiteVisit,
  SiteVisitStatus,
  EngineeringDimensionItem,
} from "../types";
import {
  Compass,
  CheckCircle,
  Phone,
  MapPin,
  SealCheck,
  CaretRight,
  CaretLeft,
  CheckSquare,
  PencilSimple,
  Check,
  VideoCamera,
  Play,
  Sparkle,
  ChatCircleText,
  ArrowSquareOut,
  X,
  Clock,
  FileText,
} from "@phosphor-icons/react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";
import { adminApi, type AdminProject } from "../lib/admin-api";

const STATUS_STEPS: SiteVisitStatus[] = [
  "ASSIGNED",
  "ON_THE_WAY",
  "ARRIVED",
  "IN_PROGRESS",
  "COMPLETED",
];

export function EngineerDashboard() {
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const [siteVisits, setSiteVisits] = React.useState<SiteVisit[]>(MOCK_SITE_VISITS);
  const [dimensionItems, setDimensionItems] = React.useState<EngineeringDimensionItem[]>(
    MOCK_ENGINEERING_ITEMS
  );
  const [selectedVisit, setSelectedVisit] = React.useState<SiteVisit>(siteVisits[0]);
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");

  // Assigned projects review queue state
  const [assignedProjects, setAssignedProjects] = React.useState<AdminProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = React.useState(true);
  const [actionLoadingId, setActionLoadingId] = React.useState<number | null>(null);
  const [reviewNoteModal, setReviewNoteModal] = React.useState<{
    projectId: number;
    projectTitle: string;
    action: "START" | "READY";
  } | null>(null);
  const [actionNote, setActionNote] = React.useState("");

  const loadAssignedProjects = React.useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      const data = await adminApi.getProjects();
      setAssignedProjects(data);
    } catch (err) {
      console.warn("Could not load assigned projects:", err);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  React.useEffect(() => {
    loadAssignedProjects();
  }, [loadAssignedProjects]);

  const handleExecuteReviewAction = async () => {
    if (!reviewNoteModal) return;
    const { projectId, projectTitle, action } = reviewNoteModal;
    try {
      setActionLoadingId(projectId);
      if (action === "START") {
        await adminApi.startReview(projectId, actionNote.trim() || undefined);
        window.dispatchEvent(
          new CustomEvent("valentia:project-status-change", {
            detail: {
              projectId,
              projectTitle,
              toStatus: "UNDER_ENGINEER_REVIEW",
              note: actionNote.trim() || undefined,
            },
          })
        );
      } else {
        await adminApi.readyForConsultation(projectId, actionNote.trim() || undefined);
        window.dispatchEvent(
          new CustomEvent("valentia:project-status-change", {
            detail: {
              projectId,
              projectTitle,
              toStatus: "ENGINEER_READY",
              note: actionNote.trim() || undefined,
            },
          })
        );
      }
      setReviewNoteModal(null);
      setActionNote("");
      await loadAssignedProjects();
    } catch (err) {
      console.error("Failed to execute review transition:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Punch list state
  const [punchList, setPunchList] = React.useState([
    { id: 1, task: "فحص مناسيب علب الكهرباء والشرب المعماري", taskEn: "Laser level check for MEP electrical back-boxes", done: true },
    { id: 2, task: "اختبار ضغط شبكة تغذية المياه والمحابس", taskEn: "Plumbing pressure bar test for water network", done: true },
    { id: 3, task: "مراجعة زوايا تربيع وترخيم اللياسة والجبس بورد", taskEn: "Right-angle squaring check for plastering and gypsum board", done: false },
    { id: 4, task: "مطابقة فتحات أبواب وشبابيك الألوميتال مع المقاسات المعتمدة", taskEn: "Verify aluminium window & door openings against certified drawings", done: false },
  ]);

  const togglePunch = (id: number) => {
    setPunchList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const getStatusLabel = (status: SiteVisitStatus) => {
    if (isRTL) {
      switch (status) {
        case "ASSIGNED": return "تم التكليف";
        case "ON_THE_WAY": return "في الطريق";
        case "ARRIVED": return "في الموقع";
        case "IN_PROGRESS": return "جاري الرفع";
        case "COMPLETED": return "تم الاعتماد";
      }
    }
    switch (status) {
      case "ASSIGNED": return "Assigned";
      case "ON_THE_WAY": return "En Route";
      case "ARRIVED": return "On Site";
      case "IN_PROGRESS": return "Survey Active";
      case "COMPLETED": return "Completed";
    }
  };

  // Handle advancing site visit status stepper
  const handleAdvanceStatus = (visitId: string) => {
    setSiteVisits((prev) =>
      prev.map((v) => {
        if (v.id !== visitId) return v;
        const currentIndex = STATUS_STEPS.indexOf(v.status);
        if (currentIndex < STATUS_STEPS.length - 1) {
          const nextStatus = STATUS_STEPS[currentIndex + 1];
          return { ...v, status: nextStatus };
        }
        return v;
      })
    );
  };

  // Handle certifying dimension by engineer
  const handleCertifyDimension = (itemId: string, certifiedValue: string) => {
    setDimensionItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              engineerVerified: certifiedValue,
              status: "ENGINEER_VERIFIED",
              verifiedBy: user?.name || "Eng. Karim El-Sayed",
              verifiedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
            }
          : item
      )
    );
    setEditingItemId(null);
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>{isRTL ? "مكتب مهندس الموقع والرفع المساحي" : "FIELD ENGINEERING & SPECIFICATION STUDIO"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-foreground">
            {isRTL ? "الرفع المساحي واعتماد المقاسات التنفيذية" : "Site Survey & Technical Certification"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            {isRTL
              ? "إجراء الرفع المساحي بالليزر في الموقع، مطابقة مقاسات الأوتوكاد والذكاء الاصطناعي، واعتماد المقاسات الإنشائية."
              : "Execute laser scans on location, audit drawing dimensions, and enforce engineer verification over AI extractions."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg border border-border bg-card text-xs flex items-center gap-2 font-mono shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground">{isRTL ? "المهندس المشرف:" : "LEAD ARCHITECT:"}</span>
            <span className="font-semibold text-foreground">{user?.name || "Eng. Karim El-Sayed"}</span>
          </div>
        </div>
      </div>

      {/* SECTION 0: ARCHITECTURAL REVIEW QUEUE & CONSULTATION READINESS */}
      <div className="p-6 rounded-3xl border border-[#B88460]/40 bg-[#FAF7F2] shadow-sm space-y-5 text-[#1C1917]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DEC8] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#B88460]/15 text-[#B88460] text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
              <Sparkle className="w-3.5 h-3.5" />
              <span>{isRTL ? "منظومة اعتماد المشاريع والاستشارة" : "REVIEW & READINESS WORKFLOW"}</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#1C1917]">
              {isRTL
                ? "طابور مراجعة المشاريع واعتماد الجاهزية للميتينج"
                : "Project Review & Consultation Readiness Queue"}
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              {isRTL
                ? "افحص مخططات ومواصفات مشاريع العملاء، وابدأ المراجعة، ثم اعتمد جاهزيتها ليتم إرسال إشعار فوري للعميل لحجز ميعاد المكالمة."
                : "Review customer specifications, advance state to Under Review, and certify readiness to trigger customer booking notifications."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-white border border-[#D8C8B4] text-[#503C2C] font-semibold">
              {assignedProjects.length} {isRTL ? "مشاريع محالة" : "Assigned Projects"}
            </span>
          </div>
        </div>

        {/* Projects Queue Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedProjects.map((proj) => {
            const statusUpper = proj.status.toUpperCase();
            const isSubmitted = statusUpper === "SUBMITTED";
            const isUnderReview = statusUpper === "UNDER_ENGINEER_REVIEW";
            const isReady = statusUpper === "ENGINEER_READY";

            return (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-white border border-[#E8DEC8] shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A8A29E]">
                      COMMISSION · #{proj.id}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                        isSubmitted && "bg-amber-100 text-amber-900 border border-amber-300",
                        isUnderReview && "bg-emerald-100 text-emerald-900 border border-emerald-300",
                        isReady && "bg-[#B88460]/20 text-[#B88460] border border-[#B88460]/40"
                      )}
                    >
                      {isSubmitted && (isRTL ? "في انتظار الفحص" : "SUBMITTED")}
                      {isUnderReview && (isRTL ? "المراجعة جارية 📐" : "UNDER REVIEW")}
                      {isReady && (isRTL ? "جاهز للميتينج ✨" : "ENGINEER READY")}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-sm text-[#1C1917] line-clamp-1">
                    {proj.title}
                  </h3>

                  <div className="text-xs text-[#78716C] mt-1 space-y-0.5">
                    <div>
                      {isRTL ? "العميل: " : "Client: "}
                      <span className="font-medium text-[#1C1917]">
                        {proj.client?.username || "Client"}
                      </span>
                    </div>
                    <div>
                      {isRTL ? "الموقع: " : "Location: "}
                      <span>{proj.property?.city || "Cairo"} · {proj.property?.compound || proj.property?.propertyType}</span>
                    </div>
                    {proj.spaces && proj.spaces.length > 0 && (
                      <div>
                        {isRTL ? "المساحات المحددة: " : "Configured Spaces: "}
                        <span className="font-mono">{proj.spaces.length} {isRTL ? "غرف" : "spaces"}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="pt-3 border-t border-[#F0E6D9] flex items-center justify-between gap-2">
                  {isSubmitted && (
                    <button
                      type="button"
                      disabled={actionLoadingId === proj.id}
                      onClick={() =>
                        setReviewNoteModal({
                          projectId: proj.id,
                          projectTitle: proj.title,
                          action: "START",
                        })
                      }
                      className="w-full py-2 px-3 rounded-xl bg-[#503C2C] text-[#FAF7F2] text-xs font-semibold hover:bg-[#3D2E22] transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 text-[#B88460]" weight="fill" />
                      <span>{isRTL ? "بدء المراجعة الفنية" : "Start Review"}</span>
                    </button>
                  )}

                  {isUnderReview && (
                    <button
                      type="button"
                      disabled={actionLoadingId === proj.id}
                      onClick={() =>
                        setReviewNoteModal({
                          projectId: proj.id,
                          projectTitle: proj.title,
                          action: "READY",
                        })
                      }
                      className="w-full py-2 px-3 rounded-xl bg-[#B88460] text-white text-xs font-semibold hover:bg-[#A37250] transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer animate-pulse hover:animate-none"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-white" weight="fill" />
                      <span>{isRTL ? "اعتماد وجاهز للميتينج ←" : "Mark Ready For Meeting →"}</span>
                    </button>
                  )}

                  {isReady && (
                    <div className="w-full py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center justify-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" weight="bold" />
                      <span>{isRTL ? "معتمد · إشعار العميل مفعل" : "Ready · Customer Notified"}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Action Modal with Note */}
      {reviewNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#FAF7F2] border border-[#D8C8B4] p-6 shadow-2xl text-[#1C1917] relative">
            <button
              type="button"
              onClick={() => {
                setReviewNoteModal(null);
                setActionNote("");
              }}
              className="absolute top-5 right-5 p-1 rounded-full bg-white border border-[#D8C8B4] text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#B88460] font-bold">
                {reviewNoteModal.action === "START"
                  ? (isRTL ? "بدء المراجعة الهندسية" : "START TECHNICAL REVIEW")
                  : (isRTL ? "اعتماد الجاهزية للميتينج" : "CERTIFY CONSULTATION READINESS")}
              </span>
              <h3 className="text-lg font-serif font-bold text-[#1C1917] mt-0.5">
                {reviewNoteModal.projectTitle}
              </h3>
              <p className="text-xs text-[#78716C] mt-1">
                {reviewNoteModal.action === "START"
                  ? (isRTL
                      ? "سيتم تحويل المشروع إلى (قيد المراجعة) وإعلام العميل بأن المهندس يدرس المخططات."
                      : "Project will move to Under Review; customer will see live engineering review status.")
                  : (isRTL
                      ? "سيتم اعتماد المشروع كـ (جاهز للميتينج) وإرسال إشعار فوري للعميل لحجز ميعاد المكالمة الاستشارية."
                      : "Project will move to Ready; customer will receive instant notification to pick a meeting time.")}
              </p>
            </div>

            <div className="space-y-2 mb-5">
              <label className="text-xs font-semibold text-[#503C2C]">
                {isRTL ? "ملاحظة المهندس للعميل (اختياري):" : "Engineer note for customer (optional):"}
              </label>
              <textarea
                rows={3}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder={
                  reviewNoteModal.action === "START"
                    ? (isRTL
                        ? "مثال: بدأت دراسة توزيع مساحات الغرف ومطابقة الارتفاعات مع الرسومات المرفقة..."
                        : "e.g. Started verifying room dimensions and spatial plans against drawings...")
                    : (isRTL
                        ? "مثال: تم فحص كامل الرسومات والمواصفات المعمارية وهي مكتملة ومستعدون للمناقشة بالفيديو..."
                        : "e.g. Drawings and specs verified; ready to discuss aesthetic direction via video...")
                }
                className="w-full p-3 rounded-xl bg-white border border-[#D8C8B4] text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#B88460] transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8DEC8]">
              <button
                type="button"
                onClick={() => {
                  setReviewNoteModal(null);
                  setActionNote("");
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={actionLoadingId !== null}
                onClick={handleExecuteReviewAction}
                className="px-6 py-2.5 rounded-full bg-[#503C2C] text-[#FAF7F2] text-xs font-semibold hover:bg-[#3D2E22] transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {actionLoadingId !== null
                  ? (isRTL ? "جاري الحفظ..." : "Saving...")
                  : reviewNoteModal.action === "START"
                  ? (isRTL ? "تأكيد وبدء المراجعة" : "Confirm & Start")
                  : (isRTL ? "اعتماد وإرسال الإشعار للعميل ←" : "Confirm & Notify Client →")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: TODAY'S SITE VISITS & STEPPER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground font-serif">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{isRTL ? "زيارات ومعاينات الموقع المجدولة اليوم" : "Scheduled Site Visits & Location Telemetry"}</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {siteVisits.length} {isRTL ? "زيارات مجدولة" : "Visits Assigned Today"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {siteVisits.map((visit) => {
            const currentStepIdx = STATUS_STEPS.indexOf(visit.status);
            const isCompleted = visit.status === "COMPLETED";

            return (
              <div
                key={visit.id}
                className={cn(
                  "p-5 rounded-2xl border bg-card shadow-xs transition-all flex flex-col justify-between cursor-pointer",
                  selectedVisit.id === visit.id
                    ? "border-primary ring-2 ring-primary/20 bg-primary/[0.02]"
                    : "border-border hover:border-foreground/30"
                )}
                onClick={() => setSelectedVisit(visit)}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {visit.scheduledTime} · {visit.scheduledDate}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[10px] px-2.5 py-0.5 rounded-full uppercase font-semibold",
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : visit.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800 border border-blue-300 animate-pulse"
                          : "bg-muted text-muted-foreground border border-border"
                      )}
                    >
                      {getStatusLabel(visit.status)}
                    </span>
                  </div>

                  <h3 className="font-medium text-foreground text-sm leading-snug">
                    {visit.projectName}
                  </h3>

                  <div className="mt-2.5 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{visit.compound}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-mono text-[11px]">{visit.clientName} ({visit.clientPhone})</span>
                    </div>
                  </div>

                  {visit.notes && (
                    <p className="mt-3 text-[11px] text-muted-foreground/90 bg-muted/40 p-2.5 rounded-xl border border-border/60 italic">
                      “{visit.notes}”
                    </p>
                  )}
                </div>

                {/* Stepper Bar & Advance Action */}
                <div className="mt-5 pt-4 border-t border-border">
                  <div className="grid grid-cols-5 gap-1 mb-3">
                    {STATUS_STEPS.map((s, idx) => (
                      <div
                        key={s}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          idx <= currentStepIdx
                            ? "bg-primary"
                            : "bg-muted"
                        )}
                        title={getStatusLabel(s)}
                      />
                    ))}
                  </div>

                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdvanceStatus(visit.id);
                      }}
                      className="w-full h-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98"
                    >
                      <span>
                        {isRTL ? "تحديث الحالة إلى: " : "Advance: "}
                        {getStatusLabel(
                          STATUS_STEPS[Math.min(currentStepIdx + 1, STATUS_STEPS.length - 1)]
                        )}
                      </span>
                      {isRTL ? <CaretLeft className="w-3.5 h-3.5" /> : <CaretRight className="w-3.5 h-3.5" />}
                    </button>
                  )}

                  {isCompleted && (
                    <div className="flex items-center justify-center gap-1.5 text-emerald-700 text-xs font-mono font-medium py-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>{isRTL ? "تم اعتماد الزيارة وتوثيق المقاسات" : "Survey Certified & Uploaded"}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: CAD & AI SPECIFICATION CERTIFICATION STUDIO */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 text-foreground font-semibold text-base font-serif">
              <SealCheck className="w-5 h-5 text-primary" />
              <span>{isRTL ? "استوديو اعتماد وتأكيد الأبعاد الهندسية (قاعدة §١٧)" : "Engineering Data Precedence & Verification Studio"}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRTL
                ? "القاعدة الهندسية §١٧: المقاس المعتمد من المهندس > استخراج الأوتوكاد CAD > تقدير الذكاء الاصطناعي AI. مقاس المهندس ملزم للمقايسة."
                : "Rule §17: Engineer Verified > CAD Extracted > AI Inferred. Certified laser dimensions override all previous estimates."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
              {isRTL ? "المشروع المحدد: " : "PROJECT: "} {selectedVisit.projectName}
            </span>
          </div>
        </div>

        {/* Dimensions Studio: Mobile Cards + Desktop Table */}
        <div>
          {/* Mobile Cards (Viewports < md) */}
          <div className="md:hidden divide-y divide-border">
            {dimensionItems.map((item) => (
              <div key={item.id} className="p-4 space-y-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-foreground text-sm">{item.spaceName}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{item.parameter}</div>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold shrink-0",
                      item.status === "ENGINEER_VERIFIED"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : item.status === "CAD_EXTRACTED"
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-purple-100 text-purple-800 border border-purple-300"
                    )}
                  >
                    {item.status.replace("_", " ")}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-1 border-t border-border/60">
                  <div className="p-2 rounded-lg bg-muted/30">
                    <span className="text-[9px] text-muted-foreground block uppercase">{isRTL ? "العميل" : "Client"}</span>
                    <span className="text-foreground">{item.customerEntered}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <span className="text-[9px] text-muted-foreground block uppercase">CAD</span>
                    <span className="text-foreground">{item.cadExtracted || "—"}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <span className="text-[9px] text-muted-foreground block uppercase">AI</span>
                    <span className="text-foreground">{item.aiInferred || "—"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <div className="text-[11px] text-muted-foreground mb-1.5">{isRTL ? "المقاس المعتمد بالليزر (النهائي):" : "Laser Verified Dimension:"}</div>
                  {editingItemId === item.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="e.g. 7.95m × 5.90m"
                        className="h-9 px-3 rounded-lg border border-primary bg-background text-xs font-mono outline-none flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleCertifyDimension(item.id, editValue || item.cadExtracted || item.customerEntered)}
                        className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={14} />
                        <span>{isRTL ? "تأكيد" : "Save"}</span>
                      </button>
                    </div>
                  ) : item.engineerVerified ? (
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 font-semibold text-sm font-mono">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>{item.engineerVerified}</span>
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {isRTL ? "معتمد بواسطة " : "Certified by "} {item.verifiedBy?.split(" ")[1] || "Engineer"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItemId(item.id);
                          setEditValue(item.cadExtracted || item.aiInferred || item.customerEntered);
                        }}
                        className="h-9 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs text-foreground flex items-center gap-1.5 cursor-pointer"
                        title={isRTL ? "كتابة رقم يدوي" : "Type manual"}
                      >
                        <PencilSimple size={14} />
                        <span>{isRTL ? "تعديل" : "Edit"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleCertifyDimension(
                            item.id,
                            item.cadExtracted || item.aiInferred || item.customerEntered
                          )
                        }
                        className="h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium flex-1 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <SealCheck size={15} />
                        <span>{isRTL ? "اعتماد مقاس الليزر" : "Certify Laser"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (Viewports >= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-[10px] uppercase font-mono text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">{isRTL ? "الغرفة والبيان" : "Room & Parameter"}</th>
                  <th className="py-3 px-4">{isRTL ? "إدخال العميل" : "Customer Entered"}</th>
                  <th className="py-3 px-4">{isRTL ? "استخراج CAD" : "CAD Extracted"}</th>
                  <th className="py-3 px-4">{isRTL ? "تقدير الذكاء الاصطناعي" : "AI Inferred"}</th>
                  <th className="py-3 px-4">{isRTL ? "المعتمد بالليزر (النهائي)" : "Engineer Certified"}</th>
                  <th className="py-3 px-4 text-center">{isRTL ? "مرجعية البيانات" : "Data Authority"}</th>
                  <th className="py-3 px-4 text-end">{isRTL ? "إجراء المهندس" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dimensionItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      <div>{item.spaceName}</div>
                      <div className="text-[10px] text-muted-foreground">{item.parameter}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-muted-foreground">
                      {item.customerEntered}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-muted-foreground">
                      {item.cadExtracted || "—"}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-muted-foreground">
                      {item.aiInferred || "—"}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                      {editingItemId === item.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="e.g. 7.95m × 5.90m"
                            className="h-7 w-32 px-2 rounded border border-primary bg-background text-xs font-mono outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleCertifyDimension(item.id, editValue || item.cadExtracted || item.customerEntered)}
                            className="p-1 rounded bg-emerald-600 text-white"
                          >
                            <Check size={12} />
                          </button>
                        </div>
                      ) : item.engineerVerified ? (
                        <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{item.engineerVerified}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">
                          {isRTL ? "بانتظار مسح الليزر" : "Pending Laser Verification"}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold",
                          item.status === "ENGINEER_VERIFIED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : item.status === "CAD_EXTRACTED"
                            ? "bg-blue-100 text-blue-800 border border-blue-300"
                            : "bg-purple-100 text-purple-800 border border-purple-300"
                        )}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-end">
                      {item.status !== "ENGINEER_VERIFIED" ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItemId(item.id);
                              setEditValue(item.cadExtracted || item.aiInferred || item.customerEntered);
                            }}
                            className="p-1.5 rounded border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                            title={isRTL ? "كتابة رقم مخصص" : "Type manual measurement"}
                          >
                            <PencilSimple size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleCertifyDimension(
                                item.id,
                                item.cadExtracted || item.aiInferred || item.customerEntered
                              )
                            }
                            className="h-7 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            {isRTL ? "اعتماد بالليزر" : "Certify Laser Scan"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {isRTL ? "معتمد بواسطة " : "Certified by "} {item.verifiedBy?.split(" ")[1] || "Engineer"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 3: SITE PUNCH LIST & QUALITY AUDIT */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-lg font-medium text-foreground">
              {isRTL ? "قائمة تدقيق الجودة واستلام البنود بالموقع (Site Punch List)" : "Site Quality & Engineering Punch List"}
            </h3>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {punchList.filter((p) => p.done).length} / {punchList.length} {isRTL ? "بنود مستلمة" : "Inspections Passed"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {punchList.map((item) => (
            <div
              key={item.id}
              onClick={() => togglePunch(item.id)}
              className={cn(
                "p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors text-xs",
                item.done
                  ? "bg-emerald-50/50 border-emerald-200 text-foreground"
                  : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors",
                    item.done
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-border bg-background"
                  )}
                >
                  {item.done && <Check size={12} weight="bold" />}
                </div>
                <span className={cn(item.done && "line-through text-muted-foreground font-normal")}>
                  {isRTL ? item.task : item.taskEn}
                </span>
              </div>
              <span className="text-[10px] font-mono shrink-0">
                {item.done ? (isRTL ? "معتمد" : "PASSED") : (isRTL ? "قيد الفحص" : "PENDING")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
