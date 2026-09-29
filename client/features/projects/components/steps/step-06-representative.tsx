"use client";

import * as React from "react";
import { User, UserCheck, ShieldCheck, Key, EnvelopeSimple, IdentificationCard, CheckCircle } from "@phosphor-icons/react";
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

  const selectedMode =
    representative.representationType ||
    (representative.hasRepresentative
      ? "authorized_representative"
      : representative.valentiaManagedDirectly
      ? "valentia_direct"
      : "client_in_person");

  const handleSelectMode = (mode: "client_in_person" | "valentia_direct" | "authorized_representative") => {
    if (mode === "client_in_person") {
      onChangeRepresentative({
        ...representative,
        hasRepresentative: false,
        valentiaManagedDirectly: false,
        representationType: "client_in_person",
      });
    } else if (mode === "valentia_direct") {
      onChangeRepresentative({
        ...representative,
        hasRepresentative: false,
        valentiaManagedDirectly: true,
        representationType: "valentia_direct",
      });
    } else {
      onChangeRepresentative({
        ...representative,
        hasRepresentative: true,
        valentiaManagedDirectly: false,
        representationType: "authorized_representative",
      });
    }
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
            {isRTL ? "الخطوة السادسة • المتابعة والتفويض في مصر" : "STEP 06 · LOCAL REPRESENTATION"}
          </span>
        </div>
        <h2 className="mt-2 text-[#1C1917] font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight">
          {isRTL ? "مين هيتابع ويستلم في مصر؟" : "Who will handle site access in Egypt?"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#78716C] font-normal leading-relaxed max-w-xl">
          {isRTL
            ? "تقدر تتابع بنفسك لو أنت في مصر، أو تكلف فالنتيا تدير وتشرف على كل حاجة مباشرة، أو تعين شخص موثوق ينوب عنك."
            : "Attend site visits in person, authorize Valentia to manage site custody directly, or delegate a trusted local representative in Egypt."}
        </p>
      </div>

      {/* Choice Cards (3 Options) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Option 1: Client In Person */}
        <div
          onClick={() => handleSelectMode("client_in_person")}
          className={cn(
            "cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 bg-card",
            selectedMode === "client_in_person"
              ? "border-[#503C2C] shadow-md ring-1 ring-[#503C2C]/20 bg-[#FAF7F2]/40"
              : "border-border hover:border-[#B88460]/60 opacity-80 hover:opacity-100"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
              <User className="w-5 h-5 text-[#503C2C]" />
            </div>
            {selectedMode === "client_in_person" && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#B88460]" />
            )}
          </div>
          <div>
            <h3 className="text-[#1C1917] font-serif text-lg font-normal">
              {isRTL ? "أنا بنفسي موجود في مصر" : "I Will Attend in Person"}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#78716C] font-normal">
              {isRTL
                ? "أنا متواجد في مصر وهستلم وأسلم المفاتيح وأحضر المعاينة وأتابع الموقع بنفسي مع المهندس."
                : "You are present in Egypt and will personally attend site appointments and coordinate keys with our lead engineer."}
            </p>
          </div>
        </div>

        {/* Option 2: Valentia Manages Directly */}
        <div
          onClick={() => handleSelectMode("valentia_direct")}
          className={cn(
            "cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 bg-card",
            selectedMode === "valentia_direct"
              ? "border-[#503C2C] shadow-md ring-1 ring-[#503C2C]/20 bg-[#FAF7F2]/40"
              : "border-border hover:border-[#B88460]/60 opacity-80 hover:opacity-100"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#503C2C]" />
            </div>
            {selectedMode === "valentia_direct" && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#B88460]" />
            )}
          </div>
          <div>
            <h3 className="text-[#1C1917] font-serif text-lg font-normal">
              {isRTL ? "الشركة / فالنتيا تدير وتشرف بالكامل" : "Valentia Manages Directly"}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#78716C] font-normal">
              {isRTL
                ? "مش محتاج حد ينوب عنك. مهندس مشروعك هيستلم المفاتيح، ويعمل الرفع المساحي الهندسي المعتمد، ويتواصل معاك لحظة بلحظة."
                : "No local representative required. Our lead project engineer receives site keys, oversees architectural surveys, and coordinates directly with you digitally."}
            </p>
          </div>
        </div>

        {/* Option 3: Authorized Local Contact */}
        <div
          onClick={() => handleSelectMode("authorized_representative")}
          className={cn(
            "cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 bg-card",
            selectedMode === "authorized_representative"
              ? "border-[#503C2C] shadow-md ring-1 ring-[#503C2C]/20 bg-[#FAF7F2]/40"
              : "border-border hover:border-[#B88460]/60 opacity-80 hover:opacity-100"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-[#503C2C]" />
            </div>
            {selectedMode === "authorized_representative" && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#B88460]" />
            )}
          </div>
          <div>
            <h3 className="text-[#1C1917] font-serif text-lg font-normal">
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

      {/* Reassurance Banner for In-Person / Valentia Direct */}
      {selectedMode === "client_in_person" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#D8C8B4]/70 flex items-center gap-3 animate-in fade-in duration-300 text-start">
          <CheckCircle size={22} weight="fill" className="text-[#503C2C] shrink-0" />
          <p className="text-xs text-[#503C2C] font-medium leading-relaxed">
            {isRTL
              ? "ممتاز! مهندس مشروعك هيتواصل معاك مباشرة على رقم هاتفك لتنسيق موعد المعاينة الميدانية واستلام مفاتيح الموقع."
              : "Noted! Your lead architect will contact you directly to arrange the on-site architectural survey and key handover."}
          </p>
        </div>
      )}

      {selectedMode === "valentia_direct" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#D8C8B4]/70 flex items-center gap-3 animate-in fade-in duration-300 text-start">
          <ShieldCheck size={22} weight="fill" className="text-[#503C2C] shrink-0" />
          <p className="text-xs text-[#503C2C] font-medium leading-relaxed">
            {isRTL
              ? "فالنتيا تتولى إدارة الموقع واستلام المفاتيح والرفع المساحي المعتمد بالكامل مع إرسال تقارير مصورة موثقة لك لحظة بلحظة."
              : "Valentia assumes full turnkey site management, secure custody, and certified spatial surveys with live digital telemetry."}
          </p>
        </div>
      )}

      {/* Representative Details Form (Conditional when authorized_representative) */}
      {selectedMode === "authorized_representative" && (
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
