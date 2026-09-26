"use client";

import * as React from "react";
import { Buildings, MapPin, Gauge, Stack, Wrench, ShieldCheck } from "@phosphor-icons/react";
import type { PropertyEntity, PropertyCondition } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface StepPropertyInfoProps {
  property: PropertyEntity;
  onChangeProperty: (property: PropertyEntity) => void;
}

const PROPERTY_CONDITIONS: Array<{
  id: PropertyCondition;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
}> = [
  {
    id: "red_brick",
    titleEn: "Core & Shell (Red Brick)",
    titleAr: "على الطوب الأحمر (Core & Shell)",
    descEn: "Raw structure with no plumbing, electrical, or plaster layers.",
    descAr: "هيكل خرساني ومباني بدون تأسيس سباكة أو كهرباء أو محارة.",
  },
  {
    id: "semi_finished",
    titleEn: "Semi-Finished",
    titleAr: "نص تشطيب (محارة وحلوق)",
    descEn: "Plastered walls, basic rough-ins ready for final architectural fit-out.",
    descAr: "متأسس محارة وحلوق ووصلات أساسية، جاهز للتشطيب والديكور.",
  },
  {
    id: "under_construction",
    titleEn: "Under Construction",
    titleAr: "تحت الإنشاء (استلام قريب)",
    descEn: "Delivery within the coming months from master developer.",
    descAr: "هتستلم من المطور العقاري خلال الشهور اللي جاية.",
  },
  {
    id: "occupied",
    titleEn: "Existing / Renovation",
    titleAr: "عقار قائم ومحتاج تجديد شامل",
    descEn: "Fully finished or occupied space requiring comprehensive remodel.",
    descAr: "متشطب أو مسكون ومحتاج تجديد ديكورات وتعديل معماري.",
  },
];

const PRESET_COMPOUNDS = [
  "Palm Hills Golf Extensions",
  "Katameya Dunes",
  "Marassi Marina",
  "Allegria",
  "Mivida",
  "El Gouna Heights",
  "Badya",
  "Swan Lake Residences",
];

const PRESET_CITIES = [
  { en: "New Cairo", ar: "القاهرة الجديدة" },
  { en: "Sheikh Zayed", ar: "الشيخ زايد" },
  { en: "6th of October", ar: "السادس من أكتوبر" },
  { en: "North Coast", ar: "الساحل الشمالي" },
  { en: "El Gouna", ar: "الجونة" },
  { en: "New Capital", ar: "العاصمة الإدارية" },
];

export function StepPropertyInfo({
  property,
  onChangeProperty,
}: StepPropertyInfoProps) {
  const { isRTL } = useLanguage();

  const updateField = <K extends keyof PropertyEntity>(
    key: K,
    value: PropertyEntity[K]
  ) => {
    onChangeProperty({
      ...property,
      [key]: value,
    });
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-start">
        <div className="flex items-center gap-2">
          <span className="h-px w-6 bg-foreground/50" />
          <span
            className={cn(
              "text-[#78716C]",
              isRTL
                ? "font-sans text-[11px] font-normal tracking-normal text-[#78716C]"
                : "font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
            )}
          >
            {isRTL ? "الخطوة الثانية • بيانات وموقع العقار" : "02 — 06 PROPERTY SPECS"}
          </span>
        </div>
        <h2 className="mt-2 text-[#1C1917] font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight">
          {isRTL ? "عقارك موجود فين؟ وبيانات المشروع" : "Where is your property located?"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#78716C] font-normal leading-relaxed max-w-xl">
          {isRTL
            ? "حدد مكان العقار، اسم الكمبوند، المساحة التقريبية، وحالة الاستلام عشان نظبط جدول الشغل وفرق المهندسين بالموقع."
            : "Specify the geographic region, compound, gross footprint, and current condition to calibrate logistical execution."}
        </p>
      </div>

      {/* Form Fields Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Compound / Development */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-xs font-medium text-[#503C2C]">
            <Buildings className="w-3.5 h-3.5 text-[#B88460]" />
            <span>{isRTL ? "اسم الكمبوند أو المنطقة السكنية" : "Masterplan / Compound"}</span>
          </label>
          <input
            type="text"
            value={property.compound || ""}
            onChange={(e) => updateField("compound", e.target.value)}
            placeholder={
              isRTL
                ? "مثال: بالم هيلز، قطامية ديونز، مراسي، ميفيدا..."
                : "e.g. Palm Hills Golf, Katameya Dunes, Marassi..."
            }
            className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460]"
          />
          {/* Preset tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESET_COMPOUNDS.slice(0, 4).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateField("compound", c)}
                className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-card border border-border text-[#503C2C] hover:text-[#1C1917] hover:border-[#B88460] transition-colors cursor-pointer"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* City / District Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-xs font-medium text-[#503C2C]">
            <MapPin className="w-3.5 h-3.5 text-[#B88460]" />
            <span>{isRTL ? "المدينة / المنطقة في مصر (اختار من القائمة) *" : "City / District in Egypt (Select from list) *"}</span>
          </label>
          <div className="flex gap-2">
            <select
              value={
                PRESET_CITIES.some((c) => (isRTL ? c.ar : c.en) === property.city)
                  ? property.city
                  : "custom"
              }
              onChange={(e) => {
                if (e.target.value !== "custom") {
                  updateField("city", e.target.value);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460] cursor-pointer"
            >
              <option value="" disabled>
                {isRTL ? "-- اختار المدينة أو المنطقة --" : "-- Select Egyptian City or Region --"}
              </option>
              {PRESET_CITIES.map((c) => (
                <option key={c.en} value={isRTL ? c.ar : c.en}>
                  {isRTL ? c.ar : c.en}
                </option>
              ))}
              <option value="custom">
                {isRTL ? "منطقة تانية (اكتبها بنفسك)..." : "Other District (Type custom)..."}
              </option>
            </select>
          </div>
          {(!PRESET_CITIES.some((c) => (isRTL ? c.ar : c.en) === property.city) || property.city === "") && (
            <input
              type="text"
              value={property.city || ""}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder={isRTL ? "اكتب اسم المدينة أو الحي هنا..." : "Type custom city or district..."}
              className="px-3.5 py-2 rounded-xl border border-border bg-background text-[#1C1917] text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460]"
            />
          )}
          <span className="text-[#78716C] text-[10px] font-normal">
            {isRTL ? "عشان نوجه أقرب مهندس إشراف للموقع بتاعك" : "Calibrates field engineering logistical dispatch in Egypt"}
          </span>
        </div>

        {/* Gross Surface Area (sqm) */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-xs font-medium text-[#503C2C]">
            <Gauge className="w-3.5 h-3.5 text-[#B88460]" />
            <span>{isRTL ? "المساحة الإجمالية (بالمتر المربع) *" : "Gross Area (m²) *"}</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min={10}
              max={10000}
              value={property.areaSqm || ""}
              onChange={(e) => updateField("areaSqm", Number(e.target.value))}
              placeholder="e.g. 450"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460]"
            />
            <span className="absolute end-3 top-2.5 text-xs font-normal text-[#78716C]">
              {isRTL ? "م²" : "m²"}
            </span>
          </div>
          <span className="text-[#78716C] text-[10px] font-normal">
            {isRTL
              ? "مساحة تقريبية، والمهندس هيعمل رفع مساحي ليزر دقيق لما يعاين"
              : "Approximate footprint; 3D laser survey will verify exact dimensions"}
          </span>
        </div>

        {/* Floors / Levels */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-xs font-medium text-[#503C2C]">
            <Stack className="w-3.5 h-3.5 text-[#B88460]" />
            <span>{isRTL ? "عدد الأدوار" : "Levels / Floors"}</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((fl) => (
              <button
                key={fl}
                type="button"
                onClick={() => updateField("floors", fl)}
                className={cn(
                  "py-2.5 rounded-xl border transition-all text-center cursor-pointer text-xs font-normal",
                  (property.floors || 1) === fl
                    ? "bg-[#503C2C] text-[#FAF7F2] border-[#503C2C] shadow-xs font-medium"
                    : "bg-background border-border text-[#1C1917] hover:border-[#B88460]"
                )}
              >
                {fl} {isRTL ? "دور" : fl === 1 ? "Level" : "Levels"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Property Condition Cards */}
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-1.5 text-xs font-medium text-[#503C2C]">
          <Wrench className="w-3.5 h-3.5 text-[#B88460]" />
          <span>{isRTL ? "حالة العقار حالياً إيه؟" : "Current Property Condition"}</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {PROPERTY_CONDITIONS.map((cond) => {
            const isSelected = (property.condition || "semi_finished") === cond.id;
            return (
              <div
                key={cond.id}
                onClick={() => updateField("condition", cond.id)}
                className={cn(
                  "cursor-pointer p-4 rounded-2xl border transition-all duration-200 bg-card text-start",
                  isSelected
                    ? "border-[#503C2C] shadow-sm ring-1 ring-[#503C2C]/20"
                    : "border-border hover:border-[#B88460]/60"
                )}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-[#1C1917] text-xs font-medium">
                    {isRTL ? cond.titleAr : cond.titleEn}
                  </h4>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#B88460]" />
                  )}
                </div>
                <p className="mt-1 leading-relaxed text-[11px] text-[#78716C] font-normal">
                  {isRTL ? cond.descAr : cond.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Site Accessibility & Gate Notes */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-1.5 text-xs font-medium text-[#503C2C]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#B88460]" />
          <span>{isRTL ? "ملاحظات دخول الموقع وتصاريح الكمبوند" : "Site Accessibility & Gate Passes"}</span>
        </label>
        <textarea
          rows={2}
          value={property.accessibilityNotes || ""}
          onChange={(e) => updateField("accessibilityNotes", e.target.value)}
          placeholder={
            isRTL
              ? "مثلاً: مواعيد العمل في الكمبوند، تصاريح أمن البوابة، أو وجود أسانسير خدمات..."
              : "e.g., Service elevator access available, compound permits construction between 8 AM - 5 PM..."
          }
          className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460] resize-none"
        />
      </div>
    </div>
  );
}
