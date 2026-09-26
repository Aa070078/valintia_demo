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
} from "@phosphor-icons/react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

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

        <div className="overflow-x-auto">
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
