"use client";

import * as React from "react";
import { UserCheck, ShieldCheck, Key, Phone, EnvelopeSimple, IdentificationCard } from "@phosphor-icons/react";
import type { AuthorizedRepresentative } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

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
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78716C] dark:text-[#989692]">
            {isRTL ? "الخطوة ٠٦ · الممثل القانوني في مصر" : "STEP 06 · LOCAL REPRESENTATION"}
          </span>
        </div>
        <h2 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#1C1917] dark:text-[#FAF7F2]">
          {isRTL ? "هل لديك ممثل أو وكيل داخل مصر؟" : "Do you have a representative in Egypt?"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#78716C] dark:text-[#989692] leading-relaxed max-w-xl">
          {isRTL
            ? "يمكنك تفويض شخص موثوق لاستلام المفاتيح وحضور زيارة المعاينة، أو توكيل فريق فالنتيا بالإشراف والإدارة الكاملة والمباشرة نيابة عنك."
            : "Delegate an authorized contact in Egypt for site keys and physical inspections, or authorize Valentia to manage site custody and approvals directly."}
        </p>
      </div>

      {/* Choice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option A: Valentia Manages Directly */}
        <div
          onClick={() => handleSelectMode(false)}
          className={cn(
            "cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 bg-[#FAF7F2] dark:bg-[#1E1B18]",
            !representative.hasRepresentative
              ? "border-[#503C2C] dark:border-[#B88460] shadow-md ring-1 ring-[#503C2C]/20"
              : "border-[#E6DDD2] dark:border-[#2E2A27] hover:border-[#B88460]/60 opacity-80 hover:opacity-100"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#F4EEE5] dark:bg-[#25221F] border border-[#E6DDD2] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#503C2C] dark:text-[#B88460]" />
            </div>
            {!representative.hasRepresentative && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#B88460]" />
            )}
          </div>
          <div>
            <h3 className="font-serif text-base sm:text-lg font-medium text-[#1C1917] dark:text-[#FAF7F2]">
              {isRTL ? "إدارة مباشرة وشاملة من فالنتيا" : "Valentia Manages Directly"}
            </h3>
            <p className="mt-1 text-xs text-[#78716C] dark:text-[#989692] leading-relaxed">
              {isRTL
                ? "لا يوجد ممثل محلي. يتولى مهندس مشروعك استلام المفاتيح، والمسح الليزري، والتنسيق المباشر معك عبر المنصة الرقمية."
                : "No local representative required. Our lead project engineer receives site keys, oversees scans, and coordinates directly with you digitally."}
            </p>
          </div>
        </div>

        {/* Option B: Authorized Local Contact */}
        <div
          onClick={() => handleSelectMode(true)}
          className={cn(
            "cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 bg-[#FAF7F2] dark:bg-[#1E1B18]",
            representative.hasRepresentative
              ? "border-[#503C2C] dark:border-[#B88460] shadow-md ring-1 ring-[#503C2C]/20"
              : "border-[#E6DDD2] dark:border-[#2E2A27] hover:border-[#B88460]/60 opacity-80 hover:opacity-100"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#F4EEE5] dark:bg-[#25221F] border border-[#E6DDD2] flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-[#503C2C] dark:text-[#B88460]" />
            </div>
            {representative.hasRepresentative && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#B88460]" />
            )}
          </div>
          <div>
            <h3 className="font-serif text-base sm:text-lg font-medium text-[#1C1917] dark:text-[#FAF7F2]">
              {isRTL ? "لدي ممثل / وكيل داخل مصر" : "I Have an Authorized Representative"}
            </h3>
            <p className="mt-1 text-xs text-[#78716C] dark:text-[#989692] leading-relaxed">
              {isRTL
                ? "يوجد شخص موثوق (فرد من العائلة، محامي، مدير أعمال) لحضور تسليم الموقع والتنسيق الميداني."
                : "A trusted family member, legal representative, or estate manager in Egypt will attend site appointments on your behalf."}
            </p>
          </div>
        </div>
      </div>

      {/* Representative Details Form (Conditional) */}
      {representative.hasRepresentative && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] flex flex-col gap-4 animate-in fade-in duration-300">
          <h4 className="font-serif text-sm font-semibold text-[#1C1917] dark:text-[#FAF7F2]">
            {isRTL ? "بيانات الممثل القانوني أو جهة الاتصال" : "Authorized Contact Details"}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#503C2C] dark:text-[#D4C3B3]">
                {isRTL ? "الاسم بالكامل *" : "Full Name *"}
              </label>
              <input
                type="text"
                required
                value={representative.name || ""}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder={isRTL ? "مثال: م. أحمد عبد العزيز" : "e.g. Eng. Tarek Mansour"}
                className="text-xs px-3.5 py-2.5 rounded-xl border border-[#E6DDD2] dark:border-[#38332E] bg-white dark:bg-[#141210] text-[#1C1917] dark:text-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#B88460]"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#503C2C] dark:text-[#D4C3B3] flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#B88460]" />
                <span>{isRTL ? "رقم الهاتف في مصر *" : "Phone Number (Egypt) *"}</span>
              </label>
              <input
                type="tel"
                required
                value={representative.phone || ""}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+20 100 000 0000"
                className="text-xs px-3.5 py-2.5 rounded-xl border border-[#E6DDD2] dark:border-[#38332E] bg-white dark:bg-[#141210] text-[#1C1917] dark:text-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#B88460]"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#503C2C] dark:text-[#D4C3B3] flex items-center gap-1">
                <EnvelopeSimple className="w-3 h-3 text-[#B88460]" />
                <span>{isRTL ? "البريد الإلكتروني" : "Email Address"}</span>
              </label>
              <input
                type="email"
                value={representative.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="contact@representative.com"
                className="text-xs px-3.5 py-2.5 rounded-xl border border-[#E6DDD2] dark:border-[#38332E] bg-white dark:bg-[#141210] text-[#1C1917] dark:text-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#B88460]"
              />
            </div>

            {/* Relationship */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#503C2C] dark:text-[#D4C3B3] flex items-center gap-1">
                <IdentificationCard className="w-3 h-3 text-[#B88460]" />
                <span>{isRTL ? "صلة القرابة أو الصفة" : "Relationship / Capacity"}</span>
              </label>
              <input
                type="text"
                value={representative.relationship || ""}
                onChange={(e) => updateField("relationship", e.target.value)}
                placeholder={isRTL ? "مثال: شقيق، محامي، مدير أعمال" : "e.g. Brother, Legal Counsel, Property Manager"}
                className="text-xs px-3.5 py-2.5 rounded-xl border border-[#E6DDD2] dark:border-[#38332E] bg-white dark:bg-[#141210] text-[#1C1917] dark:text-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#B88460]"
              />
            </div>
          </div>

          {/* Authorization Scope */}
          <div className="flex flex-col gap-1.5 pt-2">
            <label className="text-xs font-medium text-[#503C2C] dark:text-[#D4C3B3] flex items-center gap-1">
              <Key className="w-3 h-3 text-[#B88460]" />
              <span>{isRTL ? "نطاق الصلاحيات المفوضة" : "Authorization Scope"}</span>
            </label>
            <input
              type="text"
              value={representative.authorizationScope || ""}
              onChange={(e) => updateField("authorizationScope", e.target.value)}
              placeholder={
                isRTL
                  ? "مثال: تسليم واستلام مفاتيح الموقع ومرافقة مهندس المعاينة فقط"
                  : "e.g. Key handover & physical site access accompaniment only"
              }
              className="text-xs px-3.5 py-2.5 rounded-xl border border-[#E6DDD2] dark:border-[#38332E] bg-white dark:bg-[#141210] text-[#1C1917] dark:text-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#B88460]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
