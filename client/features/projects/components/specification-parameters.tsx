"use client";

import * as React from "react";
import { SlidersHorizontal, CaretDown } from "@phosphor-icons/react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface SpecificationParametersProps {
  title: string;
  onTitleChange: (v: string) => void;
  areaSqm: number;
  onAreaChange: (v: number) => void;
  region: string;
  onRegionChange: (v: string) => void;
  district: string;
  onDistrictChange: (v: string) => void;
  propertyType: string;
}

export function SpecificationParameters({
  title,
  onTitleChange,
  areaSqm,
  onAreaChange,
  region,
  onRegionChange,
  district,
  onDistrictChange,
  propertyType,
}: SpecificationParametersProps) {
  const { t, isRTL } = useLanguage();
  const [unit, setUnit] = React.useState<"sqm" | "sqft">("sqm");

  const displayArea = unit === "sqm" ? areaSqm : Math.round(areaSqm * 10.7639);
  const altAreaText =
    unit === "sqm"
      ? `Approx. ${(areaSqm * 10.7639).toLocaleString()} sq ft`
      : `Approx. ${areaSqm.toLocaleString()} m²`;

  const toggleUnit = () => {
    setUnit((prev) => (prev === "sqm" ? "sqft" : "sqm"));
  };

  const handleAreaInput = (rawVal: string) => {
    const num = Number(rawVal) || 0;
    if (unit === "sqm") {
      onAreaChange(num);
    } else {
      onAreaChange(Math.round(num / 10.7639));
    }
  };

  const regions = [
    { id: "cairo_nac", label: isRTL ? "القاهرة والعاصمة الإدارية الجديدة" : "Cairo & New Administrative Capital" },
    { id: "zayed_october", label: isRTL ? "الشيخ زايد والسادس من أكتوبر" : "Sheikh Zayed & 6th of October" },
    { id: "new_cairo", label: isRTL ? "القاهرة الجديدة والتجمع والمربع الذهبي" : "New Cairo & Golden Square" },
    { id: "north_coast", label: isRTL ? "الساحل الشمالي وسيدي عبد الرحمن" : "North Coast & Mediterranean" },
    { id: "el_gouna", label: isRTL ? "البحر الأحمر والجونة وسوما باي" : "Red Sea & El Gouna" },
  ];

  return (
    <div className="rounded-2xl border border-[#E2D7C8] bg-[#FAF7F2] p-5 sm:p-7 shadow-xs dark:border-[#2C2C32] dark:bg-[#1A1A1E]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#E8DFD3] dark:border-[#2C2C32]">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78716C] dark:text-[#989692]">
            {t("step2.params_title") || "SPECIFICATION PARAMETERS"}
          </span>
          <h3 className="mt-1 font-serif text-xl sm:text-2xl font-medium tracking-tight text-[#1C1917] dark:text-[#FAF7F2]">
            {t("step2.param_scope") || "Property Attributes & Geographic Scope"}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => {}}
          className="inline-flex items-center gap-2 self-start rounded-full border border-[#DFD6C7] bg-[#F4EEE5] px-3.5 py-1.5 text-[11px] font-medium text-[#1C1917] shadow-2xs hover:bg-[#EAE2D5] active:scale-95 transition-all cursor-pointer dark:border-[#2C2C32] dark:bg-[#24242A] dark:text-[#FAF7F2]"
        >
          <SlidersHorizontal size={13} weight="bold" />
          <span>{t("step2.adaptive_calc") || "Adaptive volumetric estimation"}</span>
        </button>
      </div>

      {/* 4-Field Responsive Grid */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Project Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78716C] dark:text-[#989692]">
            {t("step2.field_name") || "PROJECT TITLE"}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={isRTL ? "مثال: فيلا الساحل أو شقة التجمع" : "e.g. Altea Coastal Residence"}
            className="w-full rounded-xl border border-[#DFD6C7] bg-[#F4EEE5] px-3.5 py-2.5 text-xs font-medium text-[#1C1917] outline-none transition-colors focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] dark:border-[#2C2C32] dark:bg-[#24242A] dark:text-[#FAF7F2]"
          />
          <span className="text-[10px] text-[#8C847B] dark:text-[#989692]">
            {t("step2.index_caption") || "Internal atelier project index"}
          </span>
        </div>

        {/* Gross Area */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78716C] dark:text-[#989692]">
              {unit === "sqm" ? (t("step2.field_area") || "GROSS AREA (SQM)") : "GROSS AREA (SQFT)"}
            </label>
            <button
              type="button"
              onClick={toggleUnit}
              className="text-[10px] font-semibold underline text-[#1C1917] dark:text-[#FAF7F2] hover:opacity-75 cursor-pointer"
            >
              {unit === "sqm"
                ? (t("step2.switch_sqft") || "Switch to SQFT")
                : (t("step2.switch_sqm") || "Switch to SQM")}
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              value={displayArea || ""}
              onChange={(e) => handleAreaInput(e.target.value)}
              className={cn(
                "w-full rounded-xl border border-[#DFD6C7] bg-[#F4EEE5] py-2.5 text-xs font-semibold text-[#1C1917] outline-none transition-colors focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] dark:border-[#2C2C32] dark:bg-[#24242A] dark:text-[#FAF7F2]",
                isRTL ? "pl-12 pr-3.5 text-start" : "pr-12 pl-3.5"
              )}
            />
            <span
              className={cn(
                "pointer-events-none absolute top-1/2 -translate-y-1/2 font-mono text-[10px] font-bold text-[#8C847B] uppercase",
                isRTL ? "left-3.5" : "right-3.5"
              )}
            >
              {unit === "sqm" ? "M²" : "SQFT"}
            </span>
          </div>
          <span className="text-[10px] text-[#8C847B] dark:text-[#989692]">
            {altAreaText}
          </span>
        </div>

        {/* Metropolitan Region Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78716C] dark:text-[#989692]">
            {t("step2.field_region") || "METROPOLITAN REGION"}
          </label>
          <div className="relative">
            <select
              value={region}
              onChange={(e) => onRegionChange(e.target.value)}
              className={cn(
                "w-full appearance-none rounded-xl border border-[#DFD6C7] bg-[#F4EEE5] py-2.5 text-xs font-medium text-[#1C1917] outline-none transition-colors focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] dark:border-[#2C2C32] dark:bg-[#24242A] dark:text-[#FAF7F2] cursor-pointer",
                isRTL ? "pl-10 pr-3.5 text-start" : "pr-10 pl-3.5"
              )}
            >
              {regions.map((r) => (
                <option key={r.id} value={r.label} className="bg-[#FAF7F2] text-[#1C1917]">
                  {r.label}
                </option>
              ))}
            </select>
            <CaretDown
              size={13}
              weight="bold"
              className={cn(
                "pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#78716C]",
                isRTL ? "left-3.5" : "right-3.5"
              )}
            />
          </div>
          <span className="text-[10px] text-[#8C847B] dark:text-[#989692]">
            {t("step2.logistics_caption") || "Determines logistics & supply ateliers"}
          </span>
        </div>

        {/* Masterplan / District */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78716C] dark:text-[#989692]">
            {t("step2.field_district") || "MASTERPLAN / DISTRICT"}
          </label>
          <input
            type="text"
            value={district}
            onChange={(e) => onDistrictChange(e.target.value)}
            placeholder={isRTL ? "مثال: بالم هيلز أو مدينتي أو مراسي أو هايد بارك" : "e.g. Palm Hills Golf Extensions"}
            className="w-full rounded-xl border border-[#DFD6C7] bg-[#F4EEE5] px-3.5 py-2.5 text-xs font-medium text-[#1C1917] outline-none transition-colors focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] dark:border-[#2C2C32] dark:bg-[#24242A] dark:text-[#FAF7F2]"
          />
          <span className="text-[10px] text-[#8C847B] dark:text-[#989692]">
            {t("step2.district_caption") || "Gated enclave or plot identifier"}
          </span>
        </div>
      </div>

      {/* Bottom Envelope Banner (matching Reference Image 2) */}
      <div className="mt-7 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-[#E5DCD0] bg-[#F3ECE2] px-4 py-3.5 dark:border-[#2C2C32] dark:bg-[#222226]">
        <div className="flex items-center gap-3">
          {/* Atelier Monogram Icon */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FAF7F2] text-[#1C1917] border border-[#DFD6C7] dark:border-[#2C2C32] dark:bg-[#1A1A1E] dark:text-[#FAF7F2]">
            <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5 stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20L12 4L20 20" />
              <path d="M8 14L16 14" opacity="0.4" />
            </svg>
          </div>
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78716C] dark:text-[#989692]">
              {t("step2.envelope_label") || "Estimated Architectural Envelope"}
            </span>
            <p className="text-xs font-medium text-[#1C1917] dark:text-[#FAF7F2]">
              {isRTL
                ? `المختار: ${propertyType} — ${areaSqm} م² (تشطيب داخلي + مساحات خارجية)`
                : `Selected: ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} — ${areaSqm} m² across 3 levels (Indoor + Exterior Loggia)`}
            </p>
          </div>
        </div>

        {/* Spatial Confidence bar */}
        <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#78716C] dark:text-[#989692]">
            {t("step2.confidence_label") || "SPATIAL CONFIDENCE"}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-serif text-xs font-medium text-[#1C1917] dark:text-[#FAF7F2]">
              {t("step2.confidence_value") || "Preliminary Complete (85%)"}
            </span>
            <div className="h-1.5 w-20 rounded-full bg-[#DFD6C7] dark:bg-[#2C2C32] overflow-hidden">
              <div className="h-full w-[85%] rounded-full bg-[#1C1917] dark:bg-[#FAF7F2]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
