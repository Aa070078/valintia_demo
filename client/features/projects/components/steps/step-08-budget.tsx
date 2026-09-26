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
                ? "font-sans text-[11px] font-normal tracking-normal text-[#78716C]"
                : "font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
            )}
          >
            {isRTL ? "الخطوة الثامنة • الميزانية التقديرية" : "STEP 08 · ESTIMATED BUDGET"}
          </span>
        </div>
        <h2 className="mt-2 text-[#1C1917] font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight">
          {isRTL ? "إيه حدود الميزانية اللي حابب تخصصها؟" : "What is your target budget?"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#78716C] font-normal leading-relaxed max-w-xl">
          {isRTL
            ? "بنساعدك تدير تكاليف التشطيب بذكاء ودقة. اختار مبلغ محدد، أو رينج تقريبي، أو سيبها تتحدد بدقة بعد المعاينة والمقايسة التفصيلية (BOQ)."
            : "Guide our design team to balance material palettes and bespoke joinery within your targeted financial framework."}
        </p>
      </div>

      {/* Currency & Type Selector Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-[#B88460]" />
          <span className="text-[#1C1917] text-xs font-medium">
            {isRTL ? "العملة المفضلة في الحساب:" : "Preferred Currency:"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {CURRENCIES.map((curr) => (
            <button
              key={curr}
              type="button"
              onClick={() => updateField("currency", curr)}
              className={cn(
                "px-3 py-1.5 rounded-xl font-mono text-xs font-medium transition-all border cursor-pointer",
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
            <span className="text-[#B88460] font-mono text-xs font-medium">
              {isRTL ? "٠١ · محددة" : "01 · EXACT"}
            </span>
            {budget.budgetType === "exact" && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#B88460]" />
            )}
          </div>
          <div>
            <h3 className="text-[#1C1917] font-serif text-lg font-normal">
              {isRTL ? "مبلغ محدد في بالك" : "Target Cap"}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#78716C] font-normal">
              {isRTL
                ? "عندك رقم مستهدف ومحدد لمصاريف التشطيب كلها."
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
                isRTL ? "text-xs font-normal tracking-normal" : "font-mono text-xs font-semibold"
              )}
            >
              {isRTL ? "٠٢ · رينج" : "02 · RANGE"}
            </span>
            {budget.budgetType === "range" && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#B88460]" />
            )}
          </div>
          <div>
            <h3 className="text-[#1C1917] font-serif text-lg font-normal">
              {isRTL ? "رينج تقريبي (من - إلى)" : "Estimated Range"}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#78716C] font-normal">
              {isRTL
                ? "تحدد حد أدنى وحد أقصى مرن للتشطيب والديكور."
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
            <span className="text-[#B88460] font-mono text-xs font-medium">
              {isRTL ? "٠٣ · مش محددة" : "03 · OPEN"}
            </span>
            {budget.budgetType === "undecided" && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#B88460]" />
            )}
          </div>
          <div>
            <h3 className="text-[#1C1917] font-serif text-lg font-normal">
              {isRTL ? "تتحدد بعد المقايسة والمعاينة" : "Undecided / Open"}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#78716C] font-normal">
              {isRTL
                ? "هنقدملك مقايسة تفصيلية (BOQ) واضحة بعد المعاينة والرفع المساحي واختيار الخامات."
                : "Awaiting preliminary estimate from Valentia based on BOQ."}
            </p>
          </div>
        </div>
      </div>

      {/* Input Fields based on Mode */}
      {budget.budgetType === "exact" && (
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-2 max-w-md animate-in fade-in duration-300 shadow-xs">
          <label className="text-xs font-medium text-[#503C2C]">
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460]"
            />
            <span className="absolute end-3.5 top-2.5 text-xs font-medium text-[#B88460]">
              {budget.currency || "EGP"}
            </span>
          </div>
        </div>
      )}

      {budget.budgetType === "range" && (
        <div className="p-5 rounded-2xl bg-card border border-border grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300 shadow-xs">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#503C2C]">
              {isRTL ? "من أول مبلغ تقريباً" : "Minimum Amount"}
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={10000}
                value={budget.minAmount || ""}
                onChange={(e) => updateField("minAmount", Number(e.target.value))}
                placeholder="e.g. 2,000,000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460]"
              />
              <span className="absolute end-3.5 top-2.5 text-xs font-medium text-[#B88460]">
                {budget.currency || "EGP"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#503C2C]">
              {isRTL ? "لحد أقصى مبلغ تقريباً" : "Maximum Amount"}
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={10000}
                value={budget.maxAmount || ""}
                onChange={(e) => updateField("maxAmount", Number(e.target.value))}
                placeholder="e.g. 4,500,000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460]"
              />
              <span className="absolute end-3.5 top-2.5 text-xs font-medium text-[#B88460]">
                {budget.currency || "EGP"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
