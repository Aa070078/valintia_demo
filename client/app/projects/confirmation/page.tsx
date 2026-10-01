"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Buildings,
  ShieldCheck,
  Sparkle,
  Compass,
  FileText,
  PhoneCall,
  Clock,
  HouseLine,
} from "@phosphor-icons/react";
import { useLanguage } from "@/lib/i18n/language-context";
import { TiltCard } from "@/components/motion/tilt-card";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "1";
  const title = searchParams.get("title") || "Bespoke Residence";
  const { language, toggleLanguage, isRTL } = useLanguage();

  const formattedRef = `VAL-${String(id).replace(/\D/g, "").padStart(4, "0") || "0101"}`;
  const submissionDate = new Date().toLocaleDateString(
    isRTL ? "ar-EG" : "en-US",
    { month: "long", day: "numeric", year: "numeric" }
  );

  return (
    <div className="min-h-screen w-full bg-[#ECE3D5] text-[#1C1917] flex flex-col justify-between relative overflow-x-hidden">
      {/* Top Floating Atelier Nav */}
      <header className="w-full px-6 py-5 sm:px-12 flex items-center justify-between z-20">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#503C2C] hover:text-[#1C1917] transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-[#503C2C] text-[#FAF7F2] flex items-center justify-center shadow-xs">
            <Buildings className="w-4 h-4" />
          </div>
          <span className="font-serif text-sm tracking-normal">VALENTIA ATELIER</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            type="button"
            className="text-xs font-medium tracking-wider text-[#503C2C] hover:text-[#1C1917] transition-colors bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D8C8B4]/60 shadow-sm cursor-pointer"
          >
            {language === "en" ? "العربية" : "English"}
          </button>
        </div>
      </header>

      {/* Main Central Celebration Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-8 z-10">
        <RevealOnScroll direction="up" delayMs={150} className="w-full max-w-2xl mx-auto">
          <TiltCard
            maxRotation={3}
            className="p-8 sm:p-12 rounded-3xl bg-white/90 backdrop-blur-xl border border-[#D8C8B4] shadow-2xl text-center flex flex-col items-center gap-6"
          >
            {/* Animated Celebration Icon */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100/90 border-4 border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-xl animate-in zoom-in duration-500">
                <CheckCircle weight="fill" className="w-12 h-12 sm:w-14 sm:h-14" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#B88460] text-white flex items-center justify-center shadow-md animate-pulse">
                <Sparkle weight="fill" className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAE2D7] border border-[#D8C8B4] text-xs font-mono uppercase tracking-widest text-[#503C2C]">
              <span>{isRTL ? "تم تأكيد طلبك بنجاح" : "COMMISSION CONFIRMED"}</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2.5 max-w-xl">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-4xl text-[#1C1917] font-normal leading-tight">
                {isRTL
                  ? "تم تأكيد طلبك بنجاح وفي انتظار مراجعة فريق Valentia"
                  : "Your Commission Is Confirmed — Awaiting Valentia Review"}
              </h1>
              <p className="text-xs sm:text-sm text-[#6B635B] leading-relaxed">
                {isRTL
                  ? "استلمنا كراسة مواصفات مشروعك بالكامل. يقوم فريق مهندسي واستشاريي فالنتيا في القاهرة بمراجعة المخططات الهندسية وسنتواصل معك لتنسيق موعد المعاينة والرفع المعماري للموقع."
                  : "We have safely received your complete architectural specification brief. Our lead architects in Cairo are reviewing the details and will contact you to schedule the comprehensive site survey."}
              </p>
            </div>

            {/* Reference Number & Project Box */}
            <div className="w-full p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#E6DDD2] flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="text-start">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#78716C] block">
                  {isRTL ? "المشروع المعتمد" : "Confirmed Project"}
                </span>
                <span className="font-serif text-base sm:text-lg font-medium text-[#1C1917] block mt-0.5">
                  {title}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-end">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#78716C] block">
                    {isRTL ? "رقم المرجع" : "Reference ID"}
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-[#503C2C] block mt-0.5">
                    {formattedRef}
                  </span>
                </div>
                <div className="h-8 w-px bg-[#D8C8B4]" />
                <div className="text-end">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#78716C] block">
                    {isRTL ? "تاريخ الإرسال" : "Date"}
                  </span>
                  <span className="text-xs font-medium text-[#1C1917] block mt-0.5">
                    {submissionDate}
                  </span>
                </div>
              </div>
            </div>

            {/* 3-Step What Happens Next Roadmap */}
            <div className="w-full text-start pt-2">
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[#503C2C]">
                <Compass className="w-4 h-4 text-[#B88460]" />
                <span>{isRTL ? "ماذا يحدث الآن في الأتيليه؟" : "What Happens Next at Valentia?"}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-[#D8C8B4]/70 bg-white/60 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#B88460]">01</span>
                    <Clock className="w-3.5 h-3.5 text-[#78716C]" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-[#1C1917] block">
                      {isRTL ? "مراجعة المخططات" : "Specs Review"}
                    </span>
                    <span className="text-[11px] text-[#78716C] leading-snug block mt-0.5">
                      {isRTL ? "خلال 24-48 ساعة عمل" : "Within 24-48 hours"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#D8C8B4]/70 bg-white/60 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#B88460]">02</span>
                    <PhoneCall className="w-3.5 h-3.5 text-[#78716C]" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-[#1C1917] block">
                      {isRTL ? "تنسيق المعاينة" : "Survey Scheduling"}
                    </span>
                    <span className="text-[11px] text-[#78716C] leading-snug block mt-0.5">
                      {isRTL ? "تحديد موعد الرفع المعماري" : "Site survey visit"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#D8C8B4]/70 bg-white/60 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#B88460]">03</span>
                    <FileText className="w-3.5 h-3.5 text-[#78716C]" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-[#1C1917] block">
                      {isRTL ? "المقايسة والـ 3D" : "BOQ & 3D Renders"}
                    </span>
                    <span className="text-[11px] text-[#78716C] leading-snug block mt-0.5">
                      {isRTL ? "تسعير بنود شفاف ودقيق" : "Itemized pricing"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons (Go to My Projects + View Dossier) */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4 border-t border-[#D8C8B4]/80">
              <Link
                href="/projects"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <span>
                  {isRTL ? "الذهاب إلى قائمة مشروعاتي" : "Go to My Projects"}
                </span>
                {isRTL ? (
                  <ArrowLeft className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Link>

              <Link
                href={`/projects/${id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/90 hover:bg-white text-[#503C2C] border border-[#D8C8B4] font-medium text-xs shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <HouseLine className="w-4 h-4" />
                <span>
                  {isRTL ? "عرض تفاصيل هذا المشروع" : "View Project Dossier"}
                </span>
              </Link>
            </div>
          </TiltCard>
        </RevealOnScroll>
      </main>

      {/* Security Footer */}
      <footer className="w-full px-6 py-4 flex items-center justify-between text-xs text-[#6B635B] border-t border-[#D8C8B4]/50 z-20">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" weight="fill" />
          <span>{isRTL ? "حماية وتوثيق رسمي لكافة البيانات والمعاملات" : "256-Bit SSL Encrypted Atelier Protocol"}</span>
        </div>
        <span className="font-mono text-[11px]">VALENTIA ATELIER</span>
      </footer>
    </div>
  );
}

export default function ProjectConfirmationPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#ECE3D5] flex items-center justify-center text-[#503C2C]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
            <span>Loading Commission Confirmation...</span>
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </React.Suspense>
  );
}
