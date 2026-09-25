"use client";

import * as React from "react";
import { Check, ArrowUpRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export interface VolumeCardProps {
  volume: string;
  title: string;
  description: string;
  tag: string;
  imageSrc: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export function VolumeCard({
  volume,
  title,
  description,
  tag,
  imageSrc,
  selected,
  onClick,
  className,
}: VolumeCardProps) {
  const { isRTL } = useLanguage();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border text-start transition-all duration-300 cursor-pointer select-none",
        "bg-card",
        selected
          ? "border-primary ring-2 ring-primary/20 shadow-md -translate-y-1"
          : "border-border hover:border-foreground/40 hover:shadow-card hover:-translate-y-0.5",
        className
      )}
    >
      {/* Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Volume Monogram Badge */}
        <div className="absolute bottom-2.5 start-2.5 z-10 rounded bg-[#1C1917]/85 px-2 py-0.5 backdrop-blur-xs shadow-2xs">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#FAF7F2]">
            {volume}
          </span>
        </div>

        {/* Selected Checkmark Badge (Circular badge) */}
        {selected && (
          <div className="absolute top-2.5 end-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-primary shadow-md ring-2 ring-white/80 animate-in fade-in zoom-in-75 duration-200">
            <Check size={13} weight="bold" />
          </div>
        )}
      </div>

      {/* Card Details (Warm latte / travertine surface) */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4 bg-card">
        <div>
          <h3 className={cn(
            "text-[#1C1917] dark:text-[#FAF7F2] transition-colors",
            isRTL ? "font-sans font-bold text-base sm:text-lg leading-snug" : "font-serif text-lg font-medium tracking-tight"
          )}>
            {title}
          </h3>
          <p className={cn(
            "mt-1 line-clamp-1 leading-relaxed",
            isRTL ? "text-xs font-medium text-[#4A3E31]" : "text-[11px] text-muted-foreground"
          )}>
            {description}
          </p>
        </div>

        {/* Footer row with typology tag & corner arrow */}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[10px]">
          <span className={cn(
            "truncate max-w-[100px] sm:max-w-[120px]",
            isRTL ? "font-bold text-[#503C2C] text-[11px]" : "font-medium text-muted-foreground tracking-wide"
          )}>
            {tag}
          </span>
          <ArrowUpRight
            size={13}
            weight="bold"
            className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:rotate-[-90deg] rtl:group-hover:-translate-x-0.5 text-foreground"
          />
        </div>
      </div>
    </button>
  );
}
