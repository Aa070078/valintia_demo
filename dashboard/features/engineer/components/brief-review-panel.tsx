"use client";

import * as React from "react";
import {
  ProjectReviewContext,
} from "../types/engineer.types";
import {
  Buildings,
  User,
  CheckCircle,
  FileText,
  ArrowsOutCardinal,
  NotePencil,
  Check,
  WarningCircle,
  Clock,
  ShieldCheck,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface BriefReviewPanelProps {
  context: ProjectReviewContext;
  onStartReview: (projectId: number, note?: string) => Promise<void>;
  onReadyForConsultation: (projectId: number, note?: string) => Promise<void>;
  isTransitioning: boolean;
  isRTL: boolean;
}

export function BriefReviewPanel({
  context,
  onStartReview,
  onReadyForConsultation,
  isTransitioning,
  isRTL,
}: BriefReviewPanelProps) {
  const [reviewNotes, setReviewNotes] = React.useState("");
  const [reviewChecks, setReviewChecks] = React.useState({
    spaceDistribution: false,
    dimensionsFeasible: false,
    mepGuidelinesNoted: false,
    styleAlignmentChecked: false,
  });
  const [decision, setDecision] = React.useState<"ACCEPT" | "CHANGES_REQUESTED">("ACCEPT");
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const allChecksPassed =
    reviewChecks.spaceDistribution &&
    reviewChecks.dimensionsFeasible &&
    reviewChecks.mepGuidelinesNoted &&
    reviewChecks.styleAlignmentChecked;

  const handleStartReviewClick = async () => {
    setValidationError(null);
    await onStartReview(context.id, reviewNotes.trim() || undefined);
    setReviewNotes("");
  };

  const handleMarkReadyClick = async () => {
    setValidationError(null);
    if (!allChecksPassed) {
      setValidationError(
        isRTL
          ? "يُرجى تدقيق واعتماد جميع معايير التحقق الفني الأربعة قبل اعتماد الجاهزية للاستشارة."
          : "Please verify and check all four technical feasibility criteria before signing off readiness."
      );
      return;
    }
    await onReadyForConsultation(context.id, reviewNotes.trim() || undefined);
    setReviewNotes("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
      {/* Column 1 (7 cols): Customer Submitted Brief (Locked / Read-Only) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-medium text-foreground">
                  {isRTL
                    ? "كراسة العميل المُسلّمة (مُقفلة للقراءة)"
                    : "Customer Submitted Brief (Locked)"}
                </h3>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {isRTL
                    ? "نسخة معتمدة ومثبتة من مدخلات العميل"
                    : "Immutable snapshot submitted by customer"}
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isRTL ? "مقفلة للتدقيق" : "LOCKED"}</span>
            </span>
          </div>

          {/* Client & Contact Identity */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted-foreground">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>{isRTL ? "بيانات العميل والاتصال" : "Client & Contact"}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-muted-foreground block text-[11px]">
                  {isRTL ? "اسم العميل:" : "Client Name:"}
                </span>
                <span className="font-medium text-foreground">
                  {context.client.name || context.client.username}
                </span>
              </div>
              {context.client.email && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    {isRTL ? "البريد الإلكتروني:" : "Email:"}
                  </span>
                  <span className="font-mono text-foreground">
                    {context.client.email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Property Specifications */}
          {context.property && (
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted-foreground">
                <Buildings className="w-3.5 h-3.5 text-primary" />
                <span>
                  {isRTL
                    ? "مواصفات العقار والموقع"
                    : "Property Specifications"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    {isRTL ? "النوع المعماري:" : "Typology:"}
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    {context.property.propertyType}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    {isRTL ? "المساحة الإجمالية:" : "Gross Area:"}
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    {context.property.areaSqm} m²
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    {isRTL ? "المجمع / الكمبوند:" : "Compound:"}
                  </span>
                  <span className="font-medium text-foreground">
                    {context.property.compound || (isRTL ? "منفصل" : "Standalone")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    {isRTL ? "المدينة:" : "City:"}
                  </span>
                  <span className="font-medium text-foreground">
                    {context.property.city}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Configured Spaces Scope */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted-foreground">
                <ArrowsOutCardinal className="w-3.5 h-3.5 text-primary" />
                <span>
                  {isRTL
                    ? `المساحات المطلوبة (${context.spaces.length})`
                    : `Configured Spaces Scope (${context.spaces.length})`}
                </span>
              </div>
            </div>

            {context.spaces.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                {isRTL
                  ? "لم يتم تحديد تفاصيل الغرف بشكل منفصل."
                  : "No discrete spaces itemized in customer submission."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {context.spaces.map((sp) => (
                  <div
                    key={sp.id}
                    className="p-3 rounded-xl border border-border/80 bg-background/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-foreground">
                      {sp.type.replace(/_/g, " ")}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary font-medium">
                      Itemized
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Dossier Notes */}
          {context.notes && (
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <span className="text-[11px] font-mono uppercase text-muted-foreground block">
                {isRTL ? "ملاحظات وتوجيهات العميل:" : "Customer Brief Notes:"}
              </span>
              <div className="p-3 rounded-xl bg-background border border-border/60 text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap">
                {context.notes}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Column 2 (5 cols): Engineer Technical Review Workspace */}
      <div className="lg:col-span-5 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <NotePencil className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-medium text-foreground">
                  {isRTL
                    ? "لوحة التدقيق والاعتماد الهندسي"
                    : "Technical Review & Signoff"}
                </h3>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {isRTL ? "إجراءات المهندس المعتمد" : "Lead Architect Actions"}
                </span>
              </div>
            </div>

            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border",
                context.status === "ENGINEER_READY"
                  ? "bg-[#B88460]/15 text-[#8F5A36] border-[#B88460]/30 dark:bg-[#B88460]/20 dark:text-[#E5D5C5] dark:border-[#B88460]/40"
                  : context.status === "UNDER_ENGINEER_REVIEW"
                  ? "bg-[#503C2C]/10 text-[#503C2C] border-[#503C2C]/20 dark:bg-[#FAF7F2]/10 dark:text-[#FAF7F2]"
                  : "bg-muted text-muted-foreground border-border"
              )}
            >
              {context.status}
            </span>
          </div>

          {/* Workflow Status 1: SUBMITTED - Action: Start Review */}
          {context.status === "SUBMITTED" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                {isRTL
                  ? "المشروع مُسلّم حالياً من العميل وبانتظار بدء المراجعة الهندسية الرسمية. يؤدي بدء المراجعة إلى تحديث الحالة إلى: قيد المراجعة الهندسية وتوثيق ذلك في سجل المشروع."
                  : "This project is newly submitted by the customer. Starting review will officially move it to 'Under Engineer Review' and log the action in the audit trail."}
              </div>

              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  {isRTL
                    ? "ملاحظة أولية للعميل (اختياري):"
                    : "Initial note for customer (optional):"}
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    isRTL
                      ? "اكتب أي ملاحظة أولية يراها العميل عند بدء المراجعة..."
                      : "Add initial review acknowledgement visible to the client..."
                  }
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
                />
              </div>

              <button
                type="button"
                onClick={handleStartReviewClick}
                disabled={isTransitioning}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                <span>
                  {isTransitioning
                    ? isRTL
                      ? "جارٍ المعالجة..."
                      : "Processing..."
                    : isRTL
                    ? "بدء المراجعة الهندسية (SUBMITTED → UNDER_REVIEW)"
                    : "Start Engineering Review (SUBMITTED → UNDER_REVIEW)"}
                </span>
              </button>
            </div>
          )}

          {/* Workflow Status 2: UNDER_ENGINEER_REVIEW - Action: Mark Ready for Consultation */}
          {context.status === "UNDER_ENGINEER_REVIEW" && (
            <div className="space-y-4">
              {/* Decision Tabs */}
              <div className="flex rounded-lg border border-border p-1 bg-muted/40">
                <button
                  type="button"
                  onClick={() => setDecision("ACCEPT")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                    decision === "ACCEPT"
                      ? "bg-background text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isRTL
                    ? "اعتماد الكراسة والجاهزية للاستشارة"
                    : "Accept Brief & Mark Ready"}
                </button>
                <button
                  type="button"
                  onClick={() => setDecision("CHANGES_REQUESTED")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                    decision === "CHANGES_REQUESTED"
                      ? "bg-background text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isRTL ? "طلب توضيح / تعديلات" : "Request Clarifications"}
                </button>
              </div>

              {/* Technical Checkpoints */}
              <div className="space-y-2.5 p-3.5 rounded-xl bg-muted/30 border border-border/80">
                <span className="text-[11px] font-mono text-muted-foreground uppercase block">
                  {isRTL
                    ? "معايير التحقق المعماري الإلزامية:"
                    : "Architectural Verification Checkpoints:"}
                </span>

                <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={reviewChecks.spaceDistribution}
                    onChange={(e) =>
                      setReviewChecks((prev) => ({
                        ...prev,
                        spaceDistribution: e.target.checked,
                      }))
                    }
                    className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>
                    {isRTL
                      ? "توزيع المساحات ومسارات الحركة متوافقة مع المخطط المعماري"
                      : "Space distribution and circulation layout verified feasible"}
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={reviewChecks.dimensionsFeasible}
                    onChange={(e) =>
                      setReviewChecks((prev) => ({
                        ...prev,
                        dimensionsFeasible: e.target.checked,
                      }))
                    }
                    className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>
                    {isRTL
                      ? "المساحات الإجمالية وأبعاد الغرف مطابقة لنموذج الوحدة"
                      : "Room dimensions and gross area match unit typology specs"}
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={reviewChecks.mepGuidelinesNoted}
                    onChange={(e) =>
                      setReviewChecks((prev) => ({
                        ...prev,
                        mepGuidelinesNoted: e.target.checked,
                      }))
                    }
                    className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>
                    {isRTL
                      ? "تم تدقيق متطلبات الكهروميكانيك MEP واشتراطات المجمع"
                      : "MEP riser constraints & compound architectural rules checked"}
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={reviewChecks.styleAlignmentChecked}
                    onChange={(e) =>
                      setReviewChecks((prev) => ({
                        ...prev,
                        styleAlignmentChecked: e.target.checked,
                      }))
                    }
                    className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>
                    {isRTL
                      ? "التوجه المعماري للمواد والتصميم قابل للتنفيذ الميداني"
                      : "Material palette & stylistic direction confirmed buildable"}
                  </span>
                </label>
              </div>

              {/* Validation Warning */}
              {validationError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                  <WarningCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Reviewer Notes */}
              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  {isRTL
                    ? "تقرير المهندس وتوصيات جلسة الاستشارة:"
                    : "Architectural Feasibility Notes & Consultation Topics:"}
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    isRTL
                      ? "اكتب تقريرك المعماري ومقترحاتك التي سيتم مناقشتها مع العميل في جلسة الاستشارة..."
                      : "Record engineering assessment and key agenda items for client consultation..."
                  }
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleMarkReadyClick}
                disabled={isTransitioning}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isTransitioning
                    ? isRTL
                      ? "جارٍ الحفظ والاعتماد..."
                      : "Saving & Signing Off..."
                    : isRTL
                    ? "اعتماد الجاهزية للاستشارة (UNDER_REVIEW → ENGINEER_READY)"
                    : "Sign Off Ready for Consultation (UNDER_REVIEW → ENGINEER_READY)"}
                </span>
              </button>
            </div>
          )}

          {/* Workflow Status 3: ENGINEER_READY - Status Completed */}
          {context.status === "ENGINEER_READY" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#EFE8DE] border border-[#B88460]/30 text-[#503C2C] dark:bg-[#2C2621] dark:border-[#B88460]/40 dark:text-[#F5EFE6] text-xs space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 text-[#B88460] shrink-0" />
                  <span>
                    {isRTL
                      ? "تم اعتماد الجاهزية للاستشارة الهندسية بنجاح"
                      : "Architectural Review Completed & Signed Off"}
                  </span>
                </div>
                <p className="leading-relaxed">
                  {isRTL
                    ? "كراسة المشروع معتمدة فنيًا ومتاحة الآن للعميل لحجز جلسة استشارة مجانية. بعد انعقاد الجلسة، ستتمكن من تسجيل محضر الاجتماع MOM ومشاركته مع العميل."
                    : "The brief has been verified. Consultation booking is now unlocked for the customer. Once the meeting takes place, you will record the Minutes of Meeting (MOM)."}
                </p>
              </div>

              {context.activities && context.activities.length > 0 && (
                <div className="space-y-2 border-t border-border/60 pt-3">
                  <span className="text-[11px] font-mono uppercase text-muted-foreground block">
                    {isRTL ? "آخر تحديث موثق في السجل:" : "Latest Recorded Activity:"}
                  </span>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {new Date(context.activities[0].createdAt).toLocaleString(
                        isRTL ? "ar-EG" : "en-US"
                      )}
                    </div>
                    <div className="font-medium text-foreground">
                      Action: {context.activities[0].action}
                    </div>
                    {context.activities[0].note && (
                      <div className="text-muted-foreground italic">
                        &quot;{context.activities[0].note}&quot;
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
