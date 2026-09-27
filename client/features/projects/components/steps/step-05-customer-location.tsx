"use client";

import * as React from "react";
import { GlobeHemisphereWest, Clock } from "@phosphor-icons/react";
import type { CustomerLocation } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";
import { CountrySelect } from "../country-select";
import { CitySelect } from "../city-select";
import { PhoneInputWithCountry } from "../phone-input-with-country";
import { findCountry, type CountryOption } from "../../lib/geo-countries";

interface StepCustomerLocationProps {
  location: CustomerLocation;
  onChangeLocation: (location: CustomerLocation) => void;
}

const COMMON_REGIONS = [
  {
    countryEn: "Egypt",
    countryAr: "مصر",
    code: "EG",
    dialCode: "+20",
    cityEn: "Cairo",
    cityAr: "القاهرة",
    timezone: "Africa/Cairo (GMT+2)",
  },
  {
    countryEn: "Saudi Arabia",
    countryAr: "المملكة العربية السعودية",
    code: "SA",
    dialCode: "+966",
    cityEn: "Riyadh",
    cityAr: "الرياض",
    timezone: "Asia/Riyadh (GMT+3)",
  },
  {
    countryEn: "United Arab Emirates",
    countryAr: "الإمارات العربية المتحدة",
    code: "AE",
    dialCode: "+971",
    cityEn: "Dubai",
    cityAr: "دبي",
    timezone: "Asia/Dubai (GMT+4)",
  },
  {
    countryEn: "Qatar",
    countryAr: "قطر",
    code: "QA",
    dialCode: "+974",
    cityEn: "Doha",
    cityAr: "الدوحة",
    timezone: "Asia/Qatar (GMT+3)",
  },
  {
    countryEn: "Kuwait",
    countryAr: "الكويت",
    code: "KW",
    dialCode: "+965",
    cityEn: "Kuwait City",
    cityAr: "مدينة الكويت",
    timezone: "Asia/Kuwait (GMT+3)",
  },
  {
    countryEn: "United Kingdom",
    countryAr: "المملكة المتحدة",
    code: "GB",
    dialCode: "+44",
    cityEn: "London",
    cityAr: "لندن",
    timezone: "Europe/London (GMT+0)",
  },
  {
    countryEn: "United States",
    countryAr: "الولايات المتحدة",
    code: "US",
    dialCode: "+1",
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
      ...location,
      country: isRTL ? preset.countryAr : preset.countryEn,
      countryCode: preset.code,
      city: isRTL ? preset.cityAr : preset.cityEn,
      timezone: preset.timezone,
      phoneCountryCode: preset.dialCode,
    });
  };

  const handleCountryChange = (country: CountryOption) => {
    const defaultCity = country.cities[0]
      ? isRTL
        ? country.cities[0].nameAr
        : country.cities[0].nameEn
      : "";

    onChangeLocation({
      ...location,
      country: isRTL ? country.nameAr : country.nameEn,
      countryCode: country.id,
      city: defaultCity,
      timezone: country.defaultTimezone,
      phoneCountryCode: country.dialCode,
    });
  };

  const currentCountryObj = React.useMemo(() => {
    return findCountry(location.country) || findCountry(location.countryCode || "") || undefined;
  }, [location.country, location.countryCode]);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
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
            {isRTL ? "الخطوة الخامسة • مكان إقامتك ورقم التواصل" : "05 — 06 TIMEZONE & RESIDENCE"}
          </span>
        </div>
        <h2 className="mt-2 text-[#1C1917] font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight">
          {isRTL ? "مكان إقامتك حالياً فين؟" : "Where are you currently based?"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#78716C] font-normal leading-relaxed max-w-xl">
          {isRTL
            ? "كتير من عملاء فالنتيا عايشين برة مصر (في الخليج، أوروبا، أو أمريكا). اختار بلدك ومدينتك عشان ننسق مواعيد الاستشارات ومتابعة تشطيب بيتك في التوقيت المناسب ليك."
            : "Many of our clients reside overseas in the GCC, Europe, or the Americas. Selecting your country, city, and contact details ensures presentations and site alerts synchronize smoothly with your schedule."}
        </p>
      </div>

      {/* Preset Regional Shortcuts */}
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-1.5 text-xs font-medium text-[#503C2C]">
          <GlobeHemisphereWest className="w-3.5 h-3.5 text-[#B88460]" />
          <span>{isRTL ? "أكتر بلاد عملاءنا مقيمين فيها" : "Frequent Client Locations"}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {COMMON_REGIONS.map((region, idx) => {
            const isMatch =
              location.country === (isRTL ? region.countryAr : region.countryEn) ||
              location.countryCode === region.code;
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
                  <div className="text-[#1C1917] text-xs font-medium">
                    {isRTL ? region.countryAr : region.countryEn}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#78716C] font-normal">
                    {isRTL ? region.cityAr : region.cityEn}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#B88460]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{region.timezone.split(" ")[1] || region.timezone}</span>
                  </div>
                  <span className="opacity-75">{region.dialCode}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selection Fields Form Container */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border flex flex-col gap-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Country Dropdown */}
          <CountrySelect
            label={isRTL ? "البلد (اختار من القائمة) *" : "Country (Dropdown menu) *"}
            value={location.country || ""}
            onChange={handleCountryChange}
            required
          />

          {/* City Dependent Dropdown */}
          <CitySelect
            label={isRTL ? "المدينة (بتتحدث تلقائياً حسب البلد) *" : "City (Dependent on Country) *"}
            country={currentCountryObj}
            value={location.city || ""}
            onChange={(city) => onChangeLocation({ ...location, city })}
            required
          />

          {/* Timezone */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1 text-xs font-medium text-[#503C2C]">
              <Clock className="w-3.5 h-3.5 text-[#B88460]" />
              <span>{isRTL ? "التوقيت المحلي (Timezone) *" : "Timezone *"}</span>
            </label>
            <input
              type="text"
              required
              value={location.timezone || ""}
              onChange={(e) =>
                onChangeLocation({ ...location, timezone: e.target.value })
              }
              placeholder="e.g. Africa/Cairo (GMT+2)"
              className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460]"
            />
          </div>
        </div>

        {/* Direct Contact Phone Number with Country Code Picker */}
        <div className="pt-2 border-t border-border/70">
          <PhoneInputWithCountry
            label={isRTL ? "رقم تليفونك للتواصل والمتابعة *" : "Your Contact Phone Number *"}
            description={
              isRTL
                ? "بنستخدم كود الدولة للتواصل معاك عبر الواتساب والمكالمات لمتابعة كل مراحل التشطيب والتصميم أول بأول."
                : "Includes country dial code for seamless consultation scheduling and digital site updates."
            }
            phone={location.phone || ""}
            countryCode={location.phoneCountryCode || "+20"}
            onChangePhone={(phone) => onChangeLocation({ ...location, phone })}
            onChangeCountryCode={(phoneCountryCode) =>
              onChangeLocation({ ...location, phoneCountryCode })
            }
            placeholder={isRTL ? "010 1234 5678" : "e.g. 10 1234 5678"}
            required
          />
        </div>
      </div>
    </div>
  );
}
