import * as React from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export function EmptyProjectsState() {
  const { t, isRTL } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
      <div className="grid grid-cols-1 items-center lg:grid-cols-12">
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:col-span-6 lg:p-14 text-start">
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-foreground/40" />
            <span className={cn(
              "text-[11px] font-semibold text-muted-foreground",
              isRTL ? "tracking-normal font-sans font-bold text-xs text-[#503C2C]" : "uppercase tracking-[0.18em]"
            )}>
              {t("hero.eyebrow")}
            </span>
          </div>

          <h2 className={cn(
            "mt-4 text-foreground transition-colors",
            isRTL
              ? "font-sans font-bold text-2xl sm:text-3xl lg:text-4xl text-[#1C1917] leading-snug"
              : "font-serif text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl"
          )}>
            {t("portfolio.empty_title")}
          </h2>

          <p className={cn(
            "mt-4 max-w-lg leading-relaxed",
            isRTL
              ? "font-medium text-sm sm:text-base text-[#4A3E31] leading-relaxed"
              : "text-sm text-muted-foreground sm:text-base"
          )}>
            {t("portfolio.empty_desc")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/projects/new"
              className={cn(
                "inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-xs text-primary-foreground shadow-xs transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer",
                isRTL ? "tracking-normal font-sans font-bold" : "font-semibold uppercase tracking-wider"
              )}
            >
              <span>{t("hero.cta_start")}</span>
              {isRTL ? (
                <ArrowLeft size={14} weight="bold" />
              ) : (
                <ArrowRight size={14} weight="bold" />
              )}
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted lg:col-span-6 lg:aspect-auto lg:h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80"
            alt="Valentia Architectural Interior"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent lg:hidden" />
        </div>
      </div>
    </div>
  );
}
