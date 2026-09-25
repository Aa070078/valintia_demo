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
    titleAr: "طوب أحمر (Core & Shell)",
    descEn: "Raw structure with no plumbing, electrical, or plaster layers.",
    descAr: "هيكل خرساني خام بدون تمديدات أو بياض محارة.",
  },
  {
    id: "semi_finished",
    titleEn: "Semi-Finished",
    titleAr: "نصف تشطيب (محارة وحلوق)",
    descEn: "Plastered walls, basic rough-ins ready for final architectural fit-out.",
    descAr: "محارة وبنية تحتية أساسية جاهزة للبدء في التشطيبات النهائية.",
  },
  {
    id: "under_construction",
    titleEn: "Under Construction",
    titleAr: "قيد الإنشاء والتسليم",
    descEn: "Delivery within the coming months from master developer.",
    descAr: "من المقرر الاستلام من المطور العقاري خلال الأشهر القادمة.",
  },
  {
    id: "occupied",
    titleEn: "Existing / Renovation",
    titleAr: "مبنى قائم / إعادة تأهيل",
    descEn: "Fully finished or occupied space requiring comprehensive remodel.",
    descAr: "عقار قائم أو مسكون يحتاج لتعديلات معمارية وتجديد كامل.",
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
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78716C] dark:text-[#989692]">
            {isRTL ? "الخطوة ٠٤ · بيانات العقار والموقع" : "STEP 04 · PROPERTY SPECIFICATIONS"}
          </span>
        </div>
        <h2 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#1C1917] dark:text-[#FAF7F2]">
          {isRTL ? "تفاصيل العقار وموقعه الجغرافي" : "Where is your property located?"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#78716C] dark:text-[#989692] leading-relaxed max-w-xl">
          {isRTL
            ? "حدد موقع المشروع، والمجمع السكني، والمساحة الإجمالية، وحالة العقار الحالية لتخطيط الفرق الهندسية بدقة."
            : "Specify the geographic region, compound, gross footprint, and current condition to calibrate logistical execution."}
        </p>
      </div>

      {/* Form Fields Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Compound / Development */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3] flex items-center gap-1.5">
            <Buildings className="w-3.5 h-3.5 text-[#B88460]" />
            <span>{isRTL ? "اسم الكمبوند أو المشروع السكني" : "Masterplan / Compound"}</span>
          </label>
          <input
            type="text"
            value={property.compound || ""}
            onChange={(e) => updateField("compound", e.target.value)}
            placeholder={
              isRTL
                ? "مثال: بالم هيلز، قطامية ديونز، مراسي..."
                : "e.g. Palm Hills Golf, Katameya Dunes, Marassi..."
            }
            className="text-xs px-3.5 py-2.5 rounded-xl border border-[#E6DDD2] dark:border-[#38332E] bg-white dark:bg-[#141210] text-[#1C1917] dark:text-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#B88460]"
          />
          {/* Preset tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESET_COMPOUNDS.slice(0, 4).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateField("compound", c)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F2] dark:bg-[#25221F] border border-[#E6DDD2] text-[#78716C] hover:text-[#503C2C] hover:border-[#B88460] transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* City / District */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#B88460]" />
            <span>{isRTL ? "المدينة / الحي *" : "City / District *"}</span>
          </label>
          <input
            type="text"
            required
            value={property.city || ""}
            onChange={(e) => updateField("city", e.target.value)}
            placeholder={
              isRTL
                ? "مثال: القاهرة الجديدة، الشيخ زايد، الساحل الشمالي، الجونة..."
                : "e.g. New Cairo, Sheikh Zayed, North Coast, El Gouna..."
            }
            className="text-xs px-3.5 py-2.5 rounded-xl border border-[#E6DDD2] dark:border-[#38332E] bg-white dark:bg-[#141210] text-[#1C1917] dark:text-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#B88460]"
          />
          <span className="text-[10px] text-[#78716C]">
            {isRTL ? "يحدد فريق الإشراف الهندسي الأقرب" : "Determines logistical dispatch atelier"}
          </span>
        </div>

        {/* Gross Surface Area (sqm) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3] flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#B88460]" />
            <span>{isRTL ? "المساحة الإجمالية (متر مربع) *" : "Gross Area (m²) *"}</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min={10}
              max={10000}
              value={property.areaSqm || ""}
              onChange={(e) => updateField("areaSqm", Number(e.target.value))}
              placeholder="e.g. 450"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E6DDD2] dark:border-[#38332E] bg-white dark:bg-[#141210] text-[#1C1917] dark:text-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#B88460]"
            />
            <span className="absolute end-3 top-2.5 text-[11px] font-mono text-[#78716C]">
              m²
            </span>
          </div>
          <span className="text-[10px] text-[#78716C]">
            {isRTL
              ? "مساحة تقريبية، سيتم إجراء مسح ليزري دقيق ثلاثي الأبعاد لاحقاً"
              : "Approximate footprint; 3D laser survey will verify exact dimensions"}
          </span>
        </div>

        {/* Floors / Levels */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3] flex items-center gap-1.5">
            <Stack className="w-3.5 h-3.5 text-[#B88460]" />
            <span>{isRTL ? "عدد الأدوار / الطوابق" : "Levels / Floors"}</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((fl) => (
              <button
                key={fl}
                type="button"
                onClick={() => updateField("floors", fl)}
                className={cn(
                  "py-2.5 rounded-xl text-xs font-mono font-medium border transition-all text-center",
                  (property.floors || 1) === fl
                    ? "bg-[#503C2C] text-[#FAF7F2] border-[#503C2C]"
                    : "bg-white dark:bg-[#141210] border-[#E6DDD2] dark:border-[#38332E] text-[#1C1917] dark:text-[#FAF7F2] hover:border-[#B88460]"
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
        <label className="text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3] flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-[#B88460]" />
          <span>{isRTL ? "الحالة الإنشائية الحالية للموقع" : "Current Property Condition"}</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {PROPERTY_CONDITIONS.map((cond) => {
            const isSelected = (property.condition || "semi_finished") === cond.id;
            return (
              <div
                key={cond.id}
                onClick={() => updateField("condition", cond.id)}
                className={cn(
                  "cursor-pointer p-4 rounded-2xl border transition-all duration-200 bg-[#FAF7F2] dark:bg-[#1E1B18]",
                  isSelected
                    ? "border-[#503C2C] dark:border-[#B88460] shadow-sm ring-1 ring-[#503C2C]/20"
                    : "border-[#E6DDD2] dark:border-[#2E2A27] hover:border-[#B88460]/60"
                )}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#1C1917] dark:text-[#FAF7F2]">
                    {isRTL ? cond.titleAr : cond.titleEn}
                  </h4>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#B88460]" />
                  )}
                </div>
                <p className="mt-1 text-[11px] text-[#78716C] dark:text-[#A8A29E] leading-relaxed">
                  {isRTL ? cond.descAr : cond.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Site Accessibility & Gate Notes */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#503C2C] dark:text-[#D4C3B3] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#B88460]" />
          <span>{isRTL ? "تصاريح الدخول وملاحظات الوصول للموقع" : "Site Accessibility & Gate Passes"}</span>
        </label>
        <textarea
          rows={2}
          value={property.accessibilityNotes || ""}
          onChange={(e) => updateField("accessibilityNotes", e.target.value)}
          placeholder={
            isRTL
              ? "ملاحظات الدخول: مثل وجود مصعد خدمي، مواعيد العمل المسموح بها في الكمبوند، أو متطلبات بوابة الأمن..."
              : "e.g., Service elevator access available, compound permits construction between 8 AM - 5 PM..."
          }
          className="text-xs px-3.5 py-2.5 rounded-xl border border-[#E6DDD2] dark:border-[#38332E] bg-white dark:bg-[#141210] text-[#1C1917] dark:text-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#B88460] resize-none"
        />
      </div>
    </div>
  );
}
