"use client";

import * as React from "react";
import { ArrowRight, ArrowLeft, Play, Plus, X, SlidersHorizontal, ShieldCheck } from "@phosphor-icons/react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface HeroAtelierProps {
  onStart: () => void;
  onExploreMood: () => void;
}

const PREVIEW_ROOMS = [
  {
    title: "Minimal Living Lounge",
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Bespoke Travertine Dining",
    src: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Sanctuary Master Suite",
    src: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80",
  },
];

export function HeroAtelier({ onStart, onExploreMood }: HeroAtelierProps) {
  const { t, isRTL } = useLanguage();
  const [isVideoOpen, setIsVideoOpen] = React.useState(false);

  return (
    <>
      <div className="relative w-full overflow-hidden rounded-3xl border border-[#E2D7C8] bg-[#FAF7F2] shadow-editorial transition-all dark:border-[#2C2C32] dark:bg-[#1A1A1E]">
        {/* Background Image: Living Room looking out to Pyramids / Landscape */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-pyramids.jpg"
            alt="Valentia Luxury Residence Interior Overlooking Pyramids"
            className="h-full w-full object-cover object-[65%_center] filter brightness-[1.02] contrast-[1.02]"
          />
          {/* Soft natural architectural scrim - preserves rich sunlit pyramids and interior view */}
          <div
            className={cn(
              "absolute inset-0 pointer-events-none transition-all duration-500",
              isRTL
                ? "bg-gradient-to-l from-[#ECE3D5]/30 via-[#ECE3D5]/10 to-transparent dark:from-[#121214]/65 dark:via-[#121214]/25 dark:to-transparent"
                : "bg-gradient-to-r from-[#ECE3D5]/30 via-[#ECE3D5]/10 to-transparent dark:from-[#121214]/65 dark:via-[#121214]/25 dark:to-transparent"
            )}
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex min-h-[580px] sm:min-h-[640px] flex-col justify-between p-6 sm:p-10 lg:p-12">
          {/* Main Stage Grid */}
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            {/* Center-Left Editorial Headline & CTAs */}
            <div className="flex flex-col justify-center lg:col-span-7 text-start">
              {/* Eyebrow */}
              <div className="flex items-center gap-2.5">
                <span className="h-px w-6 bg-[#1C1917]/40 dark:bg-[#FAF7F2]/40" />
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-[#78716C] dark:text-[#989692]">
                  {t("hero.eyebrow") || "YOUR JOURNEY STARTS HERE"}
                </span>
              </div>

              {/* Serif Headline with Italic emphasis */}
              <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#1C1917] dark:text-[#FAF7F2] leading-[1.08]">
                {t("hero.title_1") || "From a place"} <br />
                <span className="italic font-light">
                  {t("hero.title_2") || "to a lifestyle"}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-4 max-w-xl text-xs sm:text-sm leading-relaxed text-[#78716C] dark:text-[#989692]">
                {t("hero.description") ||
                  "We design and build exceptional spaces in Egypt, while you stay connected from anywhere."}
              </p>

              {/* Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onStart}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-[#1C1917] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#FAF7F2] shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] cursor-pointer dark:bg-[#FAF7F2] dark:text-[#1C1917]"
                >
                  <span>{t("hero.cta_start") || "Start Your Project"}</span>
                  {isRTL ? (
                    <ArrowLeft size={13} weight="bold" className="transition-transform group-hover:-translate-x-1" />
                  ) : (
                    <ArrowRight size={13} weight="bold" className="transition-transform group-hover:translate-x-1" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsVideoOpen(true)}
                  className="group inline-flex items-center gap-3 rounded-full border border-[#DFD6C7] bg-[#FAF7F2]/80 px-4 py-2.5 text-xs font-medium text-[#1C1917] backdrop-blur-md shadow-2xs hover:bg-[#FAF7F2] active:scale-95 transition-all cursor-pointer dark:border-[#2C2C32] dark:bg-[#1A1A1E]/80 dark:text-[#FAF7F2]"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1C1917]/10 text-[#1C1917] dark:bg-white/10 dark:text-white">
                    <Play size={11} weight="fill" className="ms-0.5" />
                  </div>
                  <div className="flex flex-col text-start">
                    <span className="text-[11px] font-semibold">{t("hero.cta_watch") || "Watch how it works"}</span>
                    <span className="text-[9px] text-[#78716C] dark:text-[#989692]">
                      {t("hero.cta_watch_duration") || "2 min"}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Floating Architectural Glass Card (Matching Image 5) */}
            <div className="lg:col-span-5 flex justify-end">
              <div className="w-full max-w-sm rounded-3xl border border-white/80 bg-[#FAF7F2]/90 p-5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#1A1A1E]/90">
                <div className="flex items-center justify-between pb-1.5">
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#78716C] dark:text-[#989692]">
                    SPATIAL NARRATIVE
                  </span>
                  <SlidersHorizontal size={14} className="text-[#78716C] dark:text-[#989692]" />
                </div>

                <h3 className="font-serif text-xl font-medium tracking-tight text-[#1C1917] dark:text-[#FAF7F2]">
                  {t("hero.floating_title_1") || "A home"}{" "}
                  <span className="italic font-light">
                    {t("hero.floating_title_2") || "that feels like you"}
                  </span>
                </h3>

                <div className="my-2.5 h-px w-8 bg-[#1C1917]/20 dark:bg-white/20" />

                {/* 3 Room Thumbnails + 1 '+' button */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {PREVIEW_ROOMS.map((room, idx) => (
                    <div
                      key={idx}
                      className="group/item relative aspect-[4/3] overflow-hidden rounded-xl bg-[#EDE6DC] shadow-2xs"
                      title={room.title}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={room.src}
                        alt={room.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={onExploreMood}
                    className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-[#DFD6C7] bg-[#F4EEE5] text-[#78716C] hover:border-[#1C1917] hover:text-[#1C1917] active:scale-95 transition-all cursor-pointer dark:border-[#2C2C32] dark:bg-[#24242A] dark:hover:text-white"
                    title="Explore Mood"
                  >
                    <Plus size={14} weight="bold" />
                  </button>
                </div>

                {/* Phase Track */}
                <div className="mt-6 border-t border-[#E8DFD3] pt-3 dark:border-[#2C2C32]">
                  <div className="flex items-center justify-between text-[9px] font-semibold tracking-wider text-[#78716C] uppercase dark:text-[#989692]">
                    <span className="text-[#1C1917] dark:text-[#FAF7F2] font-bold">
                      {t("hero.phase_concept") || "CONCEPT"} (01/04)
                    </span>
                    <span>{t("hero.phase_design") || "DESIGN"}</span>
                    <span>{t("hero.phase_execution") || "EXECUTION"}</span>
                    <span>{t("hero.phase_handover") || "HANDOVER"}</span>
                  </div>
                  {/* Connected Track */}
                  <div className="relative mt-2.5 flex items-center justify-between">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-[#DFD6C7] dark:bg-[#2C2C32]" />
                    <div className="relative z-10 h-2.5 w-2.5 rounded-full bg-[#1C1917] ring-4 ring-[#1C1917]/15 dark:bg-[#FAF7F2]" />
                    <div className="relative z-10 h-2 w-2 rounded-full bg-[#DFD6C7] dark:bg-[#2C2C32]" />
                    <div className="relative z-10 h-2 w-2 rounded-full bg-[#DFD6C7] dark:bg-[#2C2C32]" />
                    <div className="relative z-10 h-2 w-2 rounded-full bg-[#DFD6C7] dark:bg-[#2C2C32]" />
                  </div>
                </div>

                {/* Footer link in card */}
                <div className="mt-4 flex items-center justify-between text-[10px] text-[#78716C] dark:text-[#989692]">
                  <span>Average fit-out timeline: 12–16 weeks</span>
                  <button
                    type="button"
                    onClick={onStart}
                    className="font-semibold underline text-[#1C1917] dark:text-[#FAF7F2] cursor-pointer"
                  >
                    ATELIER SCOPE
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Strip from Image 5 */}
          <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-[#E8DFD3] pt-4 dark:border-[#2C2C32]">
            <div className="flex flex-wrap items-center gap-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78716C] dark:text-[#989692]">
              <span className="text-[#1C1917] dark:text-[#FAF7F2]">01 WELCOME / INITIATION</span>
              <span>02 PROPERTY & TYPOLOGY</span>
              <span>03 SPATIAL ZONING</span>
            </div>

            <div className="flex items-center gap-5 text-[10px] text-[#78716C] dark:text-[#989692]">
              <span>Curated Architecture & Interior Turnkey · CAIRO · LONDON · DUBAI</span>
              <div className="flex items-center gap-1 font-medium text-[#1C1917] dark:text-[#FAF7F2]">
                <ShieldCheck size={14} weight="fill" className="text-emerald-700" />
                <span>Bespoke Commission Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Presentation Modal */}
      {isVideoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
        >
          <div className="relative w-full max-w-xl rounded-3xl border border-[#E2D7C8] bg-[#FAF7F2] p-6 shadow-2xl dark:border-[#2C2C32] dark:bg-[#1A1A1E]">
            <button
              type="button"
              onClick={() => setIsVideoOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE3D7] text-[#1C1917] hover:bg-[#DFD6C7] cursor-pointer"
            >
              <X size={15} weight="bold" />
            </button>

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78716C]">
              THE VALENTIA METHOD
            </span>
            <h3 className="mt-1 font-serif text-2xl font-medium text-[#1C1917] dark:text-[#FAF7F2]">
              Turnkey Interior Fit-Out, Engineered
            </h3>
            <p className="mt-2 text-xs text-[#78716C] leading-relaxed dark:text-[#989692]">
              Discover how we turn high-end residential architecture into reality with end-to-end design, construction management, and uncompromising execution standards in Egypt.
            </p>

            <div className="mt-6 flex justify-end gap-3 border-t border-[#E8DFD3] pt-4 dark:border-[#2C2C32]">
              <button
                type="button"
                onClick={() => setIsVideoOpen(false)}
                className="rounded-full border border-[#DFD6C7] px-4 py-2 text-xs font-semibold text-[#1C1917] dark:text-[#FAF7F2]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsVideoOpen(false);
                  onStart();
                }}
                className="rounded-full bg-[#1C1917] px-6 py-2 text-xs font-semibold text-[#FAF7F2] shadow-xs"
              >
                Start Project Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
