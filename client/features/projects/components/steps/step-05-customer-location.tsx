"use client";

import * as React from "react";
import { GlobeHemisphereWest, Clock } from "@phosphor-icons/react";
import type { CustomerLocation } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface StepCustomerLocationProps {
  location: CustomerLocation;
  onChangeLocation: (location: CustomerLocation) => void;
}

const COMMON_REGIONS = [
  {
    countryEn: "Egypt",
    countryAr: "مصر",
    cityEn: "Cairo",
    cityAr: "القاهرة",
    timezone: "Africa/Cairo (GMT+2)",
  },
  {
    countryEn: "Saudi Arabia",
    countryAr: "المملكة العربية السعودية",
    cityEn: "Riyadh",
    cityAr: "الرياض",
    timezone: "Asia/Riyadh (GMT+3)",
  },
  {
    countryEn: "United Arab Emirates",
    countryAr: "الإمارات العربية المتحدة",
    cityEn: "Dubai",
    cityAr: "دبي",
    timezone: "Asia/Dubai (GMT+4)",
  },
  {
    countryEn: "Qatar",
    countryAr: "قطر",
    cityEn: "Doha",
    cityAr: "الدوحة",
    timezone: "Asia/Qatar (GMT+3)",
  },
  {
    countryEn: "Kuwait",
    countryAr: "الكويت",
    cityEn: "Kuwait City",
    cityAr: "مدينة الكويت",
    timezone: "Asia/Kuwait (GMT+3)",
  },
  {
    countryEn: "United Kingdom",
    countryAr: "المملكة المتحدة",
    cityEn: "London",
    cityAr: "لندن",
    timezone: "Europe/London (GMT+0)",
  },
  {
    countryEn: "United States",
    countryAr: "الولايات المتحدة",
    cityEn: "New York",
    cityAr: "نيويورك",
    timezone: "America/New_York (GMT-5)",
  },
];

export function StepCustomerLocation({
  location,
  onChangeLocation,
}: StepCustomerLocationProps) {
  const { isRTL } = useLanguage();

  const handleSelectPreset = (preset: (typeof COMMON_REGIONS)[0]) => {
    onChangeLocation({
      country: isRTL ? preset.countryAr : preset.countryEn,
      city: isRTL ? preset.cityAr : preset.cityEn,
      timezone: preset.timezone,
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
            {isRTL ? "الخطوة ٠٥ · موقع إقامتك والمنطقة الزمنية" : "STEP 05 · TIMEZONE & RESIDENCE"}
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
          {isRTL ? "أين تتواجد حالياً؟" : "Where are you currently based?"}
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
            ? "يقيم العديد من عملاء فالنتيا في دول الخليج أو أوروبا أو أمريكا. يساعدنا تحديد موقعك في جدولة الاستشارات الافتراضية ومتابعة البث المباشر بما يناسب توقيتك."
            : "Many of our clients reside overseas in the GCC, Europe, or the Americas. Specifying your timezone ensures consultations and milestone presentations synchronize smoothly with your schedule."}
        </p>
      </div>

      {/* Preset Regional Shortcuts */}
      <div className="flex flex-col gap-3">
        <label
          className={cn(
            "flex items-center gap-1.5",
            isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-semibold text-[#503C2C]"
          )}
        >
          <GlobeHemisphereWest className="w-3.5 h-3.5 text-[#B88460]" />
          <span>{isRTL ? "المناطق الأكثر شيوعاً بين عملائنا" : "Frequent Client Locations"}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {COMMON_REGIONS.map((region, idx) => {
            const isMatch =
              location.country === (isRTL ? region.countryAr : region.countryEn) ||
              location.timezone === region.timezone;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(region)}
                className={cn(
                  "p-3 rounded-xl border text-start transition-all flex flex-col justify-between gap-2 bg-card cursor-pointer",
                  isMatch
                    ? "border-[#503C2C] ring-1 ring-[#503C2C]/20 shadow-sm"
                    : "border-border hover:border-[#B88460]/60"
                )}
              >
                <div>
                  <div
                    className={cn(
                      "text-[#1C1917]",
                      isRTL ? "text-sm font-bold tracking-normal" : "text-xs font-semibold"
                    )}
                  >
                    {isRTL ? region.countryAr : region.countryEn}
                  </div>
                  <div
                    className={cn(
                      "mt-0.5",
                      isRTL ? "text-xs font-medium text-[#503C2C]" : "text-[11px] text-[#78716C]"
                    )}
                  >
                    {isRTL ? region.cityAr : region.cityEn}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-[#B88460]">
                  <Clock className="w-3 h-3" />
                  <span>{region.timezone.split(" ")[1] || region.timezone}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Inputs Container */}
      <div className="p-5 rounded-2xl bg-card border border-border grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xs">
        {/* Country */}
        <div className="flex flex-col gap-2">
          <label
            className={cn(
              isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-medium text-[#503C2C]"
            )}
          >
            {isRTL ? "الدولة *" : "Country *"}
          </label>
          <input
            type="text"
            required
            value={location.country || ""}
            onChange={(e) =>
              onChangeLocation({ ...location, country: e.target.value })
            }
            placeholder={isRTL ? "مثال: مصر، السعودية، الإمارات..." : "e.g. United Kingdom"}
            className={cn(
              "px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#B88460]",
              isRTL ? "text-xs font-medium" : "text-xs"
            )}
          />
        </div>

        {/* City */}
        <div className="flex flex-col gap-2">
          <label
            className={cn(
              isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-medium text-[#503C2C]"
            )}
          >
            {isRTL ? "المدينة *" : "City *"}
          </label>
          <input
            type="text"
            required
            value={location.city || ""}
            onChange={(e) =>
              onChangeLocation({ ...location, city: e.target.value })
            }
            placeholder={isRTL ? "مثال: الرياض، دبي، لندن..." : "e.g. London"}
            className={cn(
              "px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#B88460]",
              isRTL ? "text-xs font-medium" : "text-xs"
            )}
          />
        </div>

        {/* Timezone */}
        <div className="flex flex-col gap-2">
          <label
            className={cn(
              "flex items-center gap-1",
              isRTL ? "text-xs font-bold text-[#1C1917]" : "text-xs font-medium text-[#503C2C]"
            )}
          >
            <Clock className="w-3.5 h-3.5 text-[#B88460]" />
            <span>{isRTL ? "المنطقة الزمنية *" : "Timezone *"}</span>
          </label>
          <input
            type="text"
            required
            value={location.timezone || ""}
            onChange={(e) =>
              onChangeLocation({ ...location, timezone: e.target.value })
            }
            placeholder="e.g. GMT+2 / Cairo"
            className={cn(
              "px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#B88460]",
              isRTL ? "text-xs font-medium" : "text-xs"
            )}
          />
        </div>
      </div>
    </div>
  );
}
