"use client";

import * as React from "react";
import {
  MomRecord,
  MomStructuredItem,
  MomItemType,
  MomStatus,
} from "../types/engineer.types";
import {
  getMomForProject,
  saveMomRecord,
} from "../api/engineer.api";
import {
  NotePencil,
  Plus,
  Trash,
  CheckCircle,
  WarningCircle,
  FloppyDisk,
  PaperPlaneRight,
  Clock,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface MomComposerProps {
  projectId: number;
  projectTitle: string;
  clientName: string;
  isRTL: boolean;
  onMomUpdated?: () => void;
}

export function MomComposer({
  projectId,
  projectTitle,
  clientName,
  isRTL,
  onMomUpdated,
}: MomComposerProps) {
  const [momRecord, setMomRecord] = React.useState<MomRecord | null>(null);
  const [summary, setSummary] = React.useState("");
  const [discussionPoints, setDiscussionPoints] = React.useState("");
  const [items, setItems] = React.useState<MomStructuredItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [successToast, setSuccessToast] = React.useState<string | null>(null);

  // Load existing MOM for this project if available
  React.useEffect(() => {
    let isMounted = true;
    async function loadMom() {
      setIsLoading(true);
      try {
        const record = await getMomForProject(projectId);
        if (!isMounted) return;
        if (record) {
          setMomRecord(record);
          setSummary(record.summary);
          setDiscussionPoints(record.discussionPoints || "");
          setItems(record.items || []);
        } else {
          // Initialize empty draft
          setMomRecord(null);
          setSummary("");
          setDiscussionPoints("");
          setItems([]);
        }
      } catch (err) {
        console.warn("Failed to load MOM record:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadMom();
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const handleAddItem = () => {
    const newItem: MomStructuredItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: "DECISION",
      body: "",
      owner: "Lead Engineer",
      dueDate: "",
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (
    id: string,
    field: keyof MomStructuredItem,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  // Validate according to contract rules:
  // - summary required, min 20 chars
  // - 0 structured items is VALID!
  // - if an item is present, body must be >= 3 chars
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!summary.trim()) {
      errors.summary = isRTL
        ? "ملخص المحضر: حقل إلزامي."
        : "Meeting summary: required field.";
    } else if (summary.trim().length < 20) {
      errors.summary = isRTL
        ? `ملخص المحضر: اكتب 20 حرفًا على الأقل (الحالي: ${summary.trim().length} حرفًا).`
        : `Meeting summary: write at least 20 characters (current: ${summary.trim().length}).`;
    }

    items.forEach((item, index) => {
      if (!item.body.trim()) {
        errors[`item_${item.id}`] = isRTL
          ? `بند #${index + 1}: وصف البند مطلوب.`
          : `Item #${index + 1}: description is required.`;
      } else if (item.body.trim().length < 3) {
        errors[`item_${item.id}`] = isRTL
          ? `بند #${index + 1}: اكتب 3 أحرف على الأقل.`
          : `Item #${index + 1}: description must be at least 3 characters.`;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (status: MomStatus) => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const saved = await saveMomRecord({
        id: momRecord?.id,
        projectId,
        summary: summary.trim(),
        discussionPoints: discussionPoints.trim() || undefined,
        items,
        status,
        recordedByEngineerId: 1,
        recordedByEngineerName: "Eng. Karim El-Sayed",
        publishedAt: status === "PUBLISHED_TO_CUSTOMER" ? new Date().toISOString() : undefined,
      });

      setMomRecord(saved);
      setSuccessToast(
        status === "PUBLISHED_TO_CUSTOMER"
          ? isRTL
            ? "تم اعتماد ونشر محضر الاجتماع بنجاح للعميل."
            : "MOM officially published and shared with customer."
          : isRTL
          ? "تم حفظ مسودة المحضر بنجاح."
          : "MOM draft saved successfully."
      );
      if (onMomUpdated) onMomUpdated();
    } catch (err: unknown) {
      console.error("Failed saving MOM:", err);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessToast(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        {isRTL ? "جارٍ تحميل محضر الاجتماع..." : "Loading Minutes of Meeting..."}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* MOM Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground">
              {projectTitle}
            </span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span className="text-[10px] font-mono text-muted-foreground">
              {isRTL ? "جلسة الاستشارة المعمارية" : "Architectural Consultation"}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-serif font-medium text-foreground">
            {isRTL ? "محضر الاجتماع الرسمي (MOM)" : "Minutes of Meeting (MOM)"}
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            {isRTL
              ? `توثيق مخرجات الجلسة المنعقدة مع العميل: ${clientName}`
              : `Official record of consultation held with client: ${clientName}`}
          </span>
        </div>

        {/* Current State Badge */}
        <div className="flex items-center gap-2">
          {momRecord?.status === "CONFIRMED_BY_CUSTOMER" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B88460]/15 text-[#8F5A36] dark:bg-[#B88460]/20 dark:text-[#E5D5C5] text-xs font-mono font-medium border border-[#B88460]/30">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isRTL ? "معتمد رسمياً من العميل" : "Confirmed by Customer"}</span>
            </span>
          ) : momRecord?.status === "PUBLISHED_TO_CUSTOMER" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#503C2C]/10 text-[#503C2C] dark:bg-[#FAF7F2]/10 dark:text-[#FAF7F2] text-xs font-mono font-medium border border-[#503C2C]/20">
              <Clock className="w-3.5 h-3.5" />
              <span>{isRTL ? "مُرسل وبانتظار اعتماد العميل" : "Published · Awaiting Customer Confirmation"}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-mono border border-border">
              <NotePencil className="w-3.5 h-3.5" />
              <span>{isRTL ? "مسودة غير منشورة" : "Draft (Not Published)"}</span>
            </span>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-[#EFE8DE] border border-[#B88460]/30 text-[#503C2C] dark:bg-[#2C2621] dark:border-[#B88460]/40 dark:text-[#F5EFE6] text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#B88460] shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Composer Box */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-6 shadow-xs">
        {/* Field 1: Meeting Summary (Required, min 20 chars) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <span>{isRTL ? "ملخص المحضر والقرارات الأساسية *" : "Consultation Summary & Key Alignment *"}</span>
            </label>
            <span
              className={cn(
                "text-[10px] font-mono",
                summary.trim().length >= 20
                  ? "text-[#503C2C] dark:text-[#D8B79B] font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {summary.trim().length} / {isRTL ? "الحد الأدنى 20 حرفاً" : "min 20 chars"}
            </span>
          </div>

          <textarea
            rows={4}
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value);
              if (fieldErrors.summary) {
                setFieldErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.summary;
                  return updated;
                });
              }
            }}
            placeholder={
              isRTL
                ? "اكتب ملخصاً وافياً لجلسة الاستشارة المعمارية، القرارات المتفق عليها مع العميل، وأي تعديلات على المخطط العام (20 حرفاً على الأقل)..."
                : "Write a comprehensive summary of the consultation, design alignment points agreed with client, and scope clarifications (minimum 20 characters)..."
            }
            className={cn(
              "w-full p-3 rounded-xl border bg-background text-xs text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground",
              fieldErrors.summary ? "border-destructive ring-1 ring-destructive/30" : "border-border"
            )}
          />

          {fieldErrors.summary && (
            <p className="text-[11px] text-destructive flex items-center gap-1 mt-1 font-mono">
              <WarningCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.summary}</span>
            </p>
          )}
        </div>

        {/* Field 2: Discussion Points (Optional) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground block">
            {isRTL ? "تفاصيل محاور النقاش المعماري (اختياري)" : "Architectural Discussion Agenda & Scope Points (Optional)"}
          </label>
          <textarea
            rows={3}
            value={discussionPoints}
            onChange={(e) => setDiscussionPoints(e.target.value)}
            placeholder={
              isRTL
                ? "نقاط تفصيلية تم التطرق إليها خلال الجلسة: توزيع الإضاءة، فتح الجدران، مواد الأرضيات، الجدول الزمني المتوقع..."
                : "Detailed points covered: natural lighting, partition removals, marble flooring preferences, target handover schedule..."
            }
            className="w-full p-3 rounded-xl border border-border bg-background text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
          />
        </div>

        {/* Field 3: Structured Action Items (Optional, 0 items valid!) */}
        <div className="space-y-3 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-foreground">
                {isRTL ? "بنود العمل والقرارات المعتمدة" : "Structured Action Items & Decisions"}
              </h3>
              <span className="text-[11px] font-mono text-muted-foreground">
                {isRTL
                  ? "اختياري — يمكن نشر المحضر بدون بنود مفردة (0 بنود صالح)"
                  : "Optional — 0 structured items is valid according to contract"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>{isRTL ? "إضافة بند جديد" : "Add Item"}</span>
            </button>
          </div>

          {items.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
              {isRTL
                ? "لم تتم إضافة بنود مفصلة. ملخص المحضر بالأعلى كافٍ للاعتماد."
                : "No structured items added. The summary above is sufficient for publication."}
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono text-xs font-bold">
                        {idx + 1}
                      </span>
                      <select
                        value={item.type}
                        onChange={(e) =>
                          handleUpdateItem(item.id, "type", e.target.value as MomItemType)
                        }
                        className="h-8 px-2 rounded-lg border border-border bg-background text-xs font-mono text-foreground outline-none cursor-pointer"
                      >
                        <option value="DECISION">
                          {isRTL ? "قرار معتمد" : "Decision"}
                        </option>
                        <option value="ACTION_ITEM">
                          {isRTL ? "إجراء مطلوب" : "Action Item"}
                        </option>
                        <option value="TECHNICAL_NOTE">
                          {isRTL ? "ملاحظة فنية" : "Technical Note"}
                        </option>
                        <option value="SCOPE_CLARIFICATION">
                          {isRTL ? "توضيح نطاق" : "Scope Clarification"}
                        </option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                      title={isRTL ? "حذف البند" : "Delete Item"}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={item.body}
                      onChange={(e) => {
                        handleUpdateItem(item.id, "body", e.target.value);
                        if (fieldErrors[`item_${item.id}`]) {
                          setFieldErrors((prev) => {
                            const updated = { ...prev };
                            delete updated[`item_${item.id}`];
                            return updated;
                          });
                        }
                      }}
                      placeholder={
                        isRTL
                          ? "وصف البند (3 أحرف على الأقل)..."
                          : "Item description (min 3 characters)..."
                      }
                      className={cn(
                        "w-full px-3 py-2 rounded-lg border bg-background text-xs text-foreground outline-none focus:border-primary",
                        fieldErrors[`item_${item.id}`]
                          ? "border-destructive ring-1 ring-destructive/30"
                          : "border-border"
                      )}
                    />
                    {fieldErrors[`item_${item.id}`] && (
                      <p className="text-[10px] text-destructive mt-1 font-mono">
                        {fieldErrors[`item_${item.id}`]}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground block mb-0.5">
                        {isRTL ? "المسؤول (اختياري):" : "Assignee / Owner:"}
                      </label>
                      <input
                        type="text"
                        value={item.owner || ""}
                        onChange={(e) =>
                          handleUpdateItem(item.id, "owner", e.target.value)
                        }
                        placeholder={isRTL ? "مثل: المهندس المعماري / العميل" : "e.g. Lead Architect / Client"}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground block mb-0.5">
                        {isRTL ? "تاريخ الاستحقاق (اختياري):" : "Target Due Date:"}
                      </label>
                      <input
                        type="date"
                        value={item.dueDate || ""}
                        onChange={(e) =>
                          handleUpdateItem(item.id, "dueDate", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            disabled={isSaving}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-foreground flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <FloppyDisk className="w-4 h-4 text-muted-foreground" />
            <span>{isSaving ? "جارٍ الحفظ..." : isRTL ? "حفظ كمسودة" : "Save as Draft"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave("PUBLISHED_TO_CUSTOMER")}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <PaperPlaneRight className="w-4 h-4" />
            <span>
              {isSaving
                ? "جارٍ النشر..."
                : isRTL
                ? "اعتماد ونشر المحضر للعميل (Publish MOM)"
                : "Publish & Share MOM with Client"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
