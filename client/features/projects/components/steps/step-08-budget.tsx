"use client";

import * as React from "react";
import { Coins } from "@phosphor-icons/react";
import type { ProjectBudget } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface StepBudgetProps {
  budget: ProjectBudget;
  onChangeBudget: (budget: ProjectBudget) => void;
}

const CURRENCIES = ["EGP", "USD", "EUR", "SAR", "AED"];

export function StepBudget({ budget, onChangeBudget }: StepBudgetProps) {
  const { isRTL } = useLanguage();

  const handleSelectType = (type: ProjectBudget["budgetType"]) => {
    onChangeBudget({
      ...budget,
      budgetType: type,
    });
  };

  const updateField = <K extends keyof ProjectBudget>(
    key: K,
    val: ProjectBudget[K]
  ) => {
    onChangeBudget({
      ...budget,
      [key]: val,
    });
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[#78716C]",
              isRTL
                ? "font-sans text-xs font-bold tracking-normal text-[#503C2C]"
                : "font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
            )}
          >
            {isRTL ? "الخطوة ٠٨ · الميزانية الاستثمارية" : "STEP 08 · ESTIMATED BUDGET"}
          </span>
        </div>
        <h2
          className={cn(
            "mt-2 text-[#1C1917]",
            isRTL
              ? "font-sans text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.3] tracking-normal"
              : "font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight"
          )}
        >
          {isRTL ? "ما هو نطاق الميزانية التقديري؟" : "What is your target budget?"}
        </h2>
        <p
          className={cn(
            "mt-2 leading-relaxed max-w-xl",
            isRTL
              ? "text-sm font-medium text-[#4A3E31]"
              : "text-xs sm:text-sm text-[#78716C]"
          )}
        >
          {isRTL
            ? "نساعدك في هندسة التكاليف باحترافية. حدد رقماً مستهدفاً، أو نطاقاً تقريبياً، أو اترك الأمر مفتوحاً لتقدير فريقنا في جدول الكميات (BOQ)."
            : "Guide our design team to balance material palettes and bespoke joinery within your targeted financial framework."}
        </p>
      </div>

      {/* Currency & Type Selector Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-[#B88460]" />
          <span
            className={cn(
              "text-[#1C1917]",
              isRTL ? "text-xs font-bold" : "text-xs font-semibold"
            )}
          >
            {isRTL ? "عملة التقدير المفضلة:" : "Preferred Currency:"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {CURRENCIES.map((curr) => (
            <button
              key={curr}
              type="button"
              onClick={() => updateField("currency", curr)}
              className={cn(
                "px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border cursor-pointer",
                (budget.currency || "EGP") === curr
                  ? "bg-[#503C2C] text-[#FAF7F2] border-[#503C2C] shadow-sm"
                  : "bg-background border-border text-[#78716C] hover:text-[#1C1917]"
              )}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Budget Modes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Mode 1: Exact Amount */}
        <div
          onClick={() => handleSelectType("exact")}
          className={cn(
            "cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 bg-card",
            budget.budgetType === "exact"
              ? "border-[#503C2C] shadow-md ring-1 ring-[#503C2C]/20"
              : "border-border hover:border-[#B88460]/60 opacity-80 hover:opacity-100"
          )}
        >
          <div className="flex items-start justify-between">
            <span
              className={cn(
                "text-[#B88460]",
                isRTL ? "text-xs font-bold tracking-normal" : "font-mono text-xs font-semibold"
              )}
            >
              {isRTL ? "٠١ · محددة" : "01 · EXACT"}
            </span>
            {budget.budgetType === "exact" && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#B88460]" />
            )}
          </div>
          <div>
            <h3
              className={cn(
                "text-[#1C1917]",
                isRTL ? "font-sans text-base font-bold tracking-normal" : "font-serif text-base font-medium"
              )}
            >
              {isRTL ? "ميزانية محددة" : "Target Cap"}
            </h3>
            <p
              className={cn(
                "mt-1 text-xs leading-relaxed",
                isRTL ? "font-medium text-[#4A3E31]" : "text-[#78716C]"
              )}
            >
              {isRTL
                ? "لديك رقم دقيق مستهدف لكامل المشروع."
                : "A defined financial target for the entire commission."}
            </p>
          </div>
        </div>

        {/* Mode 2: Range */}
        <div
          onClick={() => handleSelectType("range")}
          className={cn(
            "cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 bg-card",
            budget.budgetType === "range"
              ? "border-[#503C2C] shadow-md ring-1 ring-[#503C2C]/20"
              : "border-border hover:border-[#B88460]/60 opacity-80 hover:opacity-100"
          )}
        >
          <div className="flex items-start justify-between">
            <span
              className={cn(
                "text-[#B88460]",
                isRTL ? "text-xs font-bold tracking-normal" : "font-mono text-xs font-semibold"
              )}
            >
              {isRTL ? "٠٢ · نطاق" : "02 · RANGE"}
            </span>
            {budget.budgetType === "range" && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#B88460]" />
            )}
          </div>
          <div>
            <h3
              className={cn(
                "text-[#1C1917]",
                isRTL ? "font-sans text-base font-bold tracking-normal" : "font-serif text-base font-medium"
              )}
            >
              {isRTL ? "نطاق تقريبي (من - إلى)" : "Estimated Range"}
            </h3>
            <p
              className={cn(
                "mt-1 text-xs leading-relaxed",
                isRTL ? "font-medium text-[#4A3E31]" : "text-[#78716C]"
              )}
            >
              {isRTL
                ? "تحديد حد أدنى وأقصى مرن للتشطيب والتأثيث."
                : "Flexible minimum and maximum bracket."}
            </p>
          </div>
        </div>

        {/* Mode 3: Undecided */}
        <div
          onClick={() => handleSelectType("undecided")}
          className={cn(
            "cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 bg-card",
            budget.budgetType === "undecided"
              ? "border-[#503C2C] shadow-md ring-1 ring-[#503C2C]/20"
              : "border-border hover:border-[#B88460]/60 opacity-80 hover:opacity-100"
          )}
        >
          <div className="flex items-start justify-between">
            <span
              className={cn(
                "text-[#B88460]",
                isRTL ? "text-xs font-bold tracking-normal" : "font-mono text-xs font-semibold"
              )}
            >
              {isRTL ? "٠٣ · مفتوحة" : "03 · OPEN"}
            </span>
            {budget.budgetType === "undecided" && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#B88460]" />
            )}
          </div>
          <div>
            <h3
              className={cn(
                "text-[#1C1917]",
                isRTL ? "font-sans text-base font-bold tracking-normal" : "font-serif text-base font-medium"
              )}
            >
              {isRTL ? "غير محدد حالياً" : "Undecided / Open"}
            </h3>
            <p
              className={cn(
                "mt-1 text-xs leading-relaxed",
                isRTL ? "font-medium text-[#4A3E31]" : "text-[#78716C]"
              )}
            >
              {isRTL
                ? "نقدم لك مقترح التكلفة بعد المعاينة ودراسة التصميم."
                : "Awaiting preliminary estimate from Valentia based on BOQ."}
            </p>
          </div>
        </div>
      </div>

      {/* Input Fields based on Mode */}
      {budget.budgetType === "exact" && (
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-2 max-w-md animate-in fade-in duration-300 shadow-xs">
          <label
            className={cn(
              isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
            )}
          >
            {isRTL ? "المبلغ المستهدف بالكامل" : "Exact Target Amount"}
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step={10000}
              value={budget.exactAmount || ""}
              onChange={(e) => updateField("exactAmount", Number(e.target.value))}
              placeholder="e.g. 3,500,000"
              className={cn(
                "w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#B88460]",
                isRTL ? "text-xs font-bold" : "text-xs"
              )}
            />
            <span className="absolute end-3.5 top-2.5 text-xs font-bold text-[#B88460]">
              {budget.currency || "EGP"}
            </span>
          </div>
        </div>
      )}

      {budget.budgetType === "range" && (
        <div className="p-5 rounded-2xl bg-card border border-border grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300 shadow-xs">
          <div className="flex flex-col gap-2">
            <label
              className={cn(
                isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
              )}
            >
              {isRTL ? "الحد الأدنى المتوقع" : "Minimum Amount"}
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={10000}
                value={budget.minAmount || ""}
                onChange={(e) => updateField("minAmount", Number(e.target.value))}
                placeholder="e.g. 2,000,000"
                className={cn(
                  "w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#B88460]",
                  isRTL ? "text-xs font-bold" : "text-xs"
                )}
              />
              <span className="absolute end-3.5 top-2.5 text-xs font-bold text-[#B88460]">
                {budget.currency || "EGP"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              className={cn(
                isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
              )}
            >
              {isRTL ? "الحد الأقصى المتوقع" : "Maximum Amount"}
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={10000}
                value={budget.maxAmount || ""}
                onChange={(e) => updateField("maxAmount", Number(e.target.value))}
                placeholder="e.g. 4,500,000"
                className={cn(
                  "w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#B88460]",
                  isRTL ? "text-xs font-bold" : "text-xs"
                )}
              />
              <span className="absolute end-3.5 top-2.5 text-xs font-bold text-[#B88460]">
                {budget.currency || "EGP"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
