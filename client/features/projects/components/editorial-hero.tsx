"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Plus,
  X,
  Sparkle,
  Compass,
  CheckCircle,
  Hammer,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

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

const PROCESS_STEPS = [
  {
    title: "01 · Concept & Architectural Vision",
    desc: "Collaborative discovery with our senior design leads. We curate moodboards, 3D spatial renders, and material boards tailored to your lifestyle.",
    icon: Compass,
  },
  {
    title: "02 · Detailed Technical Design & BOQ",
    desc: "Rigorous CAD floorplans, MEP engineering schematics, and itemized bill-of-quantities with guaranteed price points before construction begins.",
    icon: Sparkle,
  },
  {
    title: "03 · Turnkey Execution & Site Supervision",
    desc: "Master craftsmen and dedicated site engineers execute every millimeter, logged daily with real-time milestone photos and progress tracking.",
    icon: Hammer,
  },
  {
    title: "04 · Handover & 10-Year Warranty",
    desc: "Final architectural snagging, white-glove staging, and immediate issuance of structural and finishing warranties.",
    icon: CheckCircle,
  },
];

export function EditorialHero() {
  const [isVideoOpen, setIsVideoOpen] = React.useState(false);
  const { t, isRTL } = useLanguage();

  const stepsLocalized = [
    { num: "01", name: t("lifecycle.step_property") || "Typology", stepId: 1, active: true },
    { num: "02", name: t("lifecycle.step_style") || "Style & Mood", stepId: 2 },
    { num: "03", name: t("lifecycle.step_spaces") || "Spatial Program", stepId: 3 },
    { num: "04", name: t("lifecycle.step_property_info") || "Property Specs", stepId: 4 },
    { num: "05", name: t("lifecycle.step_location") || "Client Location", stepId: 5 },
    { num: "06", name: t("lifecycle.step_representative") || "Representative", stepId: 6 },
    { num: "07", name: t("lifecycle.step_scope") || "Scope of Work", stepId: 7 },
    { num: "08", name: t("lifecycle.step_budget") || "Target Budget", stepId: 8 },
    { num: "09", name: t("lifecycle.step_timeline") || "Timeline", stepId: 9 },
    { num: "10", name: t("lifecycle.step_drawings") || "Drawings & CAD", stepId: 10 },
    { num: "11", name: t("lifecycle.step_review") || "Review & Submit", stepId: 11 },
  ];

  return (
    <>
      <section className="relative w-full overflow-hidden rounded-3xl border border-border/70 bg-card shadow-editorial transition-all duration-300">
        {/* Luxury Architectural Background Image: Living Room overlooking Pyramids */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-pyramids.jpg"
            alt="Valentia Luxury Residence Interior Overlooking Pyramids"
            className="h-full w-full object-cover object-[65%_center] filter brightness-[1.0] contrast-[1.04] saturate-[1.06] transition-transform duration-1000 ease-out hover:scale-[1.01]"
          />
          {/* Gentle warm directional tint - preserves vivid golden hour, desert pyramids and deep interior tones */}
          <div
            className={cn(
              "absolute inset-0 pointer-events-none transition-all duration-500",
              isRTL
                ? "bg-gradient-to-l from-background/30 via-background/10 to-transparent"
                : "bg-gradient-to-r from-background/30 via-background/10 to-transparent"
            )}
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex min-h-[620px] flex-col justify-between p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            {/* Left Vertical Step Tracker (Matching reference screen 1) */}
            <div className="hidden lg:col-span-2 lg:flex lg:flex-col lg:gap-4">
              <div className="flex flex-col gap-2.5">
                {stepsLocalized.map((step, idx) => (
                  <Link
                    key={step.num}
                    href={`/projects/new?step=${step.stepId}`}
                    className={cn(
                      "group flex items-center gap-3 text-xs transition-all duration-200 hover:-translate-y-0.5",
                      step.active
                        ? "font-semibold text-foreground"
                        : "text-foreground/75 hover:text-foreground"
                    )}
                  >
                    <div className="relative flex items-center justify-center">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full transition-all duration-300",
                          step.active
                            ? "bg-primary scale-125 ring-4 ring-primary/20 shadow-2xs"
                            : "bg-foreground/35 group-hover:bg-primary/70 group-hover:scale-110"
                        )}
                      />
                      {idx < stepsLocalized.length - 1 && (
                        <div className="absolute top-2.5 h-3.5 w-px bg-border/80" />
                      )}
                    </div>
                    <span className="font-mono text-[10px] tracking-wider opacity-60">
                      {step.num}
                    </span>
                    <span className={cn(
                      "text-[11px] tracking-wide truncate max-w-[110px]",
                      step.active ? "font-bold text-foreground" : "font-medium text-foreground/80 hover:text-foreground"
                    )}>
                      {step.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Center-Left Editorial Headline & CTAs with Dedicated Warm Frosted Backing */}
            <div className={cn(
              "flex flex-col justify-center lg:col-span-6 text-start p-5 sm:p-7 rounded-3xl transition-all",
              "bg-background/45 backdrop-blur-[3px] border border-border/40 shadow-xs"
            )}>
              {/* Eyebrow with dash rule */}
              <div className="flex items-center gap-2.5">
                <span className="h-px w-7 bg-foreground/60" />
                <span className={cn(
                  "text-[11px] font-bold text-foreground/90",
                  isRTL ? "tracking-normal text-xs font-bold text-[#503C2C]" : "uppercase tracking-[0.24em] text-foreground/80"
                )}>
                  {t("hero.eyebrow")}
                </span>
              </div>

              {/* High-Contrast Editorial Serif / Sans Headline */}
              <h1 className={cn(
                "mt-4 tracking-tight text-foreground transition-all duration-300",
                isRTL
                  ? "font-sans font-bold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-[1.25] text-[#1C1917]"
                  : "font-serif text-4xl font-normal sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.08]"
              )}>
                {t("hero.title_1")}{" "}
                {isRTL ? (
                  <span className="block text-[#503C2C] font-extrabold mt-1">
                    {t("hero.title_2")}
                  </span>
                ) : (
                  <>
                    <br />
                    <span className="italic font-light">{t("hero.title_2")}</span>
                  </>
                )}
              </h1>

              {/* Subtitle with enhanced Arabic legibility */}
              <p className={cn(
                "mt-5 max-w-xl leading-relaxed",
                isRTL
                  ? "text-base sm:text-lg font-medium text-[#2C241E] leading-loose"
                  : "text-sm sm:text-base font-normal text-muted-foreground"
              )}>
                {t("hero.description")}
              </p>

              {/* Action Buttons Row with Micro-Interactions */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/projects/new"
                  className={cn(
                    "group inline-flex items-center gap-2.5 rounded-full bg-[#1C1917] px-8 py-3.5 text-xs text-[#FAF7F2] shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-black/25 hover:scale-[1.03] active:scale-[0.96]",
                    isRTL ? "tracking-normal font-sans font-bold" : "font-bold uppercase tracking-[0.14em]"
                  )}
                >
                  <span>{t("hero.cta_start")}</span>
                  <ArrowRight
                    size={14}
                    weight="bold"
                    className={cn(
                      "transition-transform duration-300",
                      isRTL ? "rotate-180 group-hover:-translate-x-1.5" : "group-hover:translate-x-1.5"
                    )}
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsVideoOpen(true)}
                  className="group inline-flex items-center gap-3 rounded-full border border-border/90 bg-background/85 px-5 py-3 text-xs font-semibold text-foreground backdrop-blur-md transition-all duration-200 hover:bg-background hover:border-foreground/40 hover:scale-[1.02] cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.96]"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/10 text-foreground transition-all duration-300 group-hover:scale-115 group-hover:bg-foreground group-hover:text-background">
                    <Play size={11} weight="fill" className={isRTL ? "mr-0.5" : "ml-0.5"} />
                  </div>
                  <div className="flex flex-col text-start">
                    <span className="tracking-wide font-medium">{t("hero.cta_watch")}</span>
                    <span className="text-[10px] text-muted-foreground">{t("hero.cta_watch_duration")}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Floating 3D Warm Glass Card (Reference Design) */}
            <div className="lg:col-span-4 flex justify-end">
              <div className="w-full max-w-md rounded-3xl border border-white/60 bg-[#F5EFE6]/95 p-6 shadow-3d-floating backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-white/10 dark:bg-card/85">
                <div className="flex items-center justify-between pb-2">
                  <h3 className={cn(
                    "text-xl sm:text-2xl font-medium tracking-tight text-foreground",
                    isRTL ? "font-sans font-bold leading-snug" : "font-serif"
                  )}>
                    {t("hero.floating_title_1")}{" "}
                    {isRTL ? (
                      <span className="block text-[#503C2C] font-extrabold mt-0.5">
                        {t("hero.floating_title_2")}
                      </span>
                    ) : (
                      <>
                        <br />
                        <span className="italic font-light">{t("hero.floating_title_2")}</span>
                      </>
                    )}
                  </h3>
                </div>

                <div className="my-3 h-px w-10 bg-foreground/20" />

                {/* Thumbnail Stack / Strip: 3 rooms + 1 '+' button */}
                <div className="grid grid-cols-4 gap-2.5 mt-4">
                  {PREVIEW_ROOMS.map((room, idx) => (
                    <div
                      key={idx}
                      className="group/item relative aspect-[4/3] overflow-hidden rounded-xl bg-muted shadow-2xs transition-transform duration-300 hover:scale-105"
                      title={room.title}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={room.src}
                        alt={room.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/item:scale-115"
                      />
                    </div>
                  ))}

                  {/* '+' Explore Button */}
                  <Link
                    href="/projects/new?step=2"
                    aria-label="Explore Styles"
                    className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-border bg-background/50 text-muted-foreground transition-all duration-200 hover:border-foreground hover:bg-foreground/5 hover:text-foreground active:scale-95 cursor-pointer group/btn"
                  >
                    <Plus
                      size={16}
                      weight="bold"
                      className="transition-transform duration-300 group-hover/btn:rotate-90 group-hover/btn:scale-110"
                    />
                  </Link>
                </div>

                {/* Progress Track Line Inside Floating Card */}
                <div className="mt-8 border-t border-border/60 pt-4">
                  <div className={cn(
                    "flex items-center justify-between text-[10px] text-muted-foreground",
                    isRTL ? "tracking-normal font-sans font-semibold" : "font-medium tracking-wider uppercase"
                  )}>
                    <span className="text-foreground font-bold">{t("hero.phase_concept")}</span>
                    <span>{t("hero.phase_design")}</span>
                    <span>{t("hero.phase_execution")}</span>
                    <span>{t("hero.phase_handover")}</span>
                  </div>
                  {/* Visual Node Bar */}
                  <div className="relative mt-3 flex items-center justify-between">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-border/70" />
                    <div className="relative z-10 h-2.5 w-2.5 rounded-full bg-foreground ring-4 ring-foreground/15" />
                    <div className="relative z-10 h-2 w-2 rounded-full bg-border" />
                    <div className="relative z-10 h-2 w-2 rounded-full bg-border" />
                    <div className="relative z-10 h-2 w-2 rounded-full bg-border" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video / Interactive Process Modal */}
      {isVideoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-opacity"
        >
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setIsVideoOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground cursor-pointer"
            >
              <X size={16} weight="bold" />
            </button>

            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-foreground/40" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/80">
                The Valentia Method
              </span>
            </div>

            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              Turnkey Interior Fit-Out, Engineered
            </h3>

            <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
              Discover how we turn high-end residential architecture into
              reality with end-to-end design, construction management, and
              uncompromising execution standards in Egypt.
            </p>

            <div className="mt-6 flex flex-col gap-4">
              {PROCESS_STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 rounded-xl border border-border/80 bg-background/50 p-3.5 transition-colors hover:border-foreground/30"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-foreground">
                      <Icon size={16} weight="bold" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold tracking-wide text-foreground">
                        {step.title}
                      </h4>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">
                Ready to build with Valentia?
              </span>
              <Link
                href="/projects/new?step=2"
                onClick={() => setIsVideoOpen(false)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-xs transition-opacity hover:opacity-90"
              >
                <span>Get Started Now</span>
                <ArrowRight size={13} weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
