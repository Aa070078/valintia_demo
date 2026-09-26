"use client";

import * as React from "react";
import { UserCheck, ShieldCheck, Key, EnvelopeSimple, IdentificationCard } from "@phosphor-icons/react";
import type { AuthorizedRepresentative } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";
import { PhoneInputWithCountry } from "../phone-input-with-country";

interface StepRepresentativeProps {
  representative: AuthorizedRepresentative;
  onChangeRepresentative: (rep: AuthorizedRepresentative) => void;
}

export function StepRepresentative({
  representative,
  onChangeRepresentative,
}: StepRepresentativeProps) {
  const { isRTL } = useLanguage();

  const handleSelectMode = (hasRep: boolean) => {
    onChangeRepresentative({
      ...representative,
      hasRepresentative: hasRep,
      valentiaManagedDirectly: !hasRep,
    });
  };

  const updateField = <K extends keyof AuthorizedRepresentative>(
    key: K,
    val: AuthorizedRepresentative[K]
  ) => {
    onChangeRepresentative({
      ...representative,
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
            {isRTL ? "الخطوة السادسة • من ينوب عنك في مصر" : "STEP 06 · LOCAL REPRESENTATION"}
          </span>
        </div>
        <h2 className="mt-2 text-[#1C1917] font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight">
          {isRTL ? "مين هينوب عنك في مصر؟" : "Do you have a representative in Egypt?"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#78716C] font-normal leading-relaxed max-w-xl">
          {isRTL
            ? "تقدر تحدد شخص موثوق في مصر يستلم ويسلم المفاتيح ويحضر المعاينة، أو تسيب الموضوع كله لفالنتيا تدير وتشرف على كل حاجة مباشرة بالنيابة عنك."
            : "Delegate an authorized contact in Egypt for site keys and physical inspections, or authorize Valentia to manage site custody and approvals directly."}
        </p>
      </div>

      {/* Choice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option A: Valentia Manages Directly */}
        <div
          onClick={() => handleSelectMode(false)}
          className={cn(
            "cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 bg-card",
            !representative.hasRepresentative
              ? "border-[#503C2C] shadow-md ring-1 ring-[#503C2C]/20"
              : "border-border hover:border-[#B88460]/60 opacity-80 hover:opacity-100"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#503C2C]" />
            </div>
            {!representative.hasRepresentative && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#B88460]" />
            )}
          </div>
          <div>
            <h3 className="text-[#1C1917] font-serif text-lg sm:text-xl font-normal">
              {isRTL ? "فالنتيا تدير وتشرف على كل حاجة مباشرة" : "Valentia Manages Directly"}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#78716C] font-normal">
              {isRTL
                ? "مش محتاج حد ينوب عنك. مهندس مشروعك هيستلم المفاتيح، ويعمل الرفع المساحي بالليزر، ويتواصل معاك لحظة بلحظة عبر المنصة."
                : "No local representative required. Our lead project engineer receives site keys, oversees scans, and coordinates directly with you digitally."}
            </p>
          </div>
        </div>

        {/* Option B: Authorized Local Contact */}
        <div
          onClick={() => handleSelectMode(true)}
          className={cn(
            "cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 bg-card",
            representative.hasRepresentative
              ? "border-[#503C2C] shadow-md ring-1 ring-[#503C2C]/20"
              : "border-border hover:border-[#B88460]/60 opacity-80 hover:opacity-100"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-[#503C2C]" />
            </div>
            {representative.hasRepresentative && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#B88460]" />
            )}
          </div>
          <div>
            <h3 className="text-[#1C1917] font-serif text-lg sm:text-xl font-normal">
              {isRTL ? "عندي حد هينوب عني في مصر" : "I Have an Authorized Representative"}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#78716C] font-normal">
              {isRTL
                ? "شخص ثقة (حد من العيلة، صديق، محامي) هيحضر المعاينة ويسلم المفاتيح وينسق معانا على الأرض."
                : "A trusted family member, legal representative, or estate manager in Egypt will attend site appointments on your behalf."}
            </p>
          </div>
        </div>
      </div>

      {/* Representative Details Form (Conditional) */}
      {representative.hasRepresentative && (
        <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border flex flex-col gap-4 animate-in fade-in duration-300 shadow-xs">
          <h4 className="text-[#1C1917] font-serif text-base font-normal">
            {isRTL ? "بيانات الشخص اللي هينوب عنك" : "Authorized Contact Details"}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#503C2C]">
                {isRTL ? "الاسم بالكامل *" : "Full Name *"}
              </label>
              <input
                type="text"
                required
                value={representative.name || ""}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder={isRTL ? "مثال: م. أحمد عبد العزيز" : "e.g. Eng. Tarek Mansour"}
                className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460]"
              />
            </div>

            {/* Phone */}
            <PhoneInputWithCountry
              label={isRTL ? "رقم تليفونه في مصر *" : "Phone Number (Egypt) *"}
              phone={representative.phone || ""}
              countryCode={representative.phoneCountryCode || "+20"}
              onChangePhone={(phone) => updateField("phone", phone)}
              onChangeCountryCode={(code) => updateField("phoneCountryCode", code)}
              placeholder={isRTL ? "010 1234 5678" : "e.g. 10 1234 5678"}
              required
            />

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1 text-xs font-medium text-[#503C2C]">
                <EnvelopeSimple className="w-3 h-3 text-[#B88460]" />
                <span>{isRTL ? "البريد الإلكتروني (اختياري)" : "Email Address"}</span>
              </label>
              <input
                type="email"
                value={representative.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="contact@representative.com"
                className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460]"
              />
            </div>

            {/* Relationship */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1 text-xs font-medium text-[#503C2C]">
                <IdentificationCard className="w-3 h-3 text-[#B88460]" />
                <span>{isRTL ? "صلة القرابة أو المعرفة" : "Relationship / Capacity"}</span>
              </label>
              <input
                type="text"
                value={representative.relationship || ""}
                onChange={(e) => updateField("relationship", e.target.value)}
                placeholder={isRTL ? "مثال: أخويا، قريبي، صديق، محامي" : "e.g. Brother, Legal Counsel, Property Manager"}
                className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460]"
              />
            </div>
          </div>

          {/* Authorization Scope */}
          <div className="flex flex-col gap-1.5 pt-2">
            <label className="flex items-center gap-1 text-xs font-medium text-[#503C2C]">
              <Key className="w-3 h-3 text-[#B88460]" />
              <span>{isRTL ? "صلاحياته إيه بالظبط؟" : "Authorization Scope"}</span>
            </label>
            <input
              type="text"
              value={representative.authorizationScope || ""}
              onChange={(e) => updateField("authorizationScope", e.target.value)}
              placeholder={
                isRTL
                  ? "مثال: تسليم واستلام مفاتيح الموقع ومرافقة المهندس وقت المعاينة"
                  : "e.g. Key handover & physical site access accompaniment only"
              }
              className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
