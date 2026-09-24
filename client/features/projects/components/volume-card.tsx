"use client";

import * as React from "react";
import { Check, ArrowUpRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

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
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border text-start transition-all duration-300 cursor-pointer select-none",
        "bg-[#FAF6F0] dark:bg-[#1A1A1E]",
        selected
          ? "border-[#1C1917] ring-2 ring-[#1C1917]/20 shadow-md -translate-y-1"
          : "border-[#E2D7C8] hover:border-[#1C1917]/40 hover:shadow-card hover:-translate-y-0.5",
        className
      )}
    >
      {/* Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EDE6DB]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Volume Monogram Badge */}
        <div className="absolute bottom-2.5 start-2.5 z-10 rounded bg-[#1C1917]/85 px-2 py-0.5 backdrop-blur-xs shadow-2xs">
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#FAF7F2]">
            {volume}
          </span>
        </div>

        {/* Selected Checkmark Badge (Circular badge) */}
        {selected && (
          <div className="absolute top-2.5 end-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#1C1917] shadow-md ring-2 ring-white/80 animate-in fade-in zoom-in-75 duration-200">
            <Check size={13} weight="bold" />
          </div>
        )}
      </div>

      {/* Card Details (Warm latte / travertine surface) */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4 bg-[#FAF6F0] dark:bg-[#1A1A1E]">
        <div>
          <h3 className="font-serif text-lg font-medium tracking-tight text-[#1C1917] dark:text-[#FAF7F2]">
            {title}
          </h3>
          <p className="mt-1 text-[11px] text-[#78716C] dark:text-[#989692] line-clamp-1 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Footer row with typology tag & corner arrow */}
        <div className="mt-3 flex items-center justify-between border-t border-[#E8DFD3] dark:border-[#2C2C32] pt-2 text-[10px] text-[#78716C] dark:text-[#989692]">
          <span className="font-medium tracking-wide truncate max-w-[100px] sm:max-w-[120px]">
            {tag}
          </span>
          <ArrowUpRight
            size={13}
            weight="bold"
            className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:rotate-[-90deg] rtl:group-hover:-translate-x-0.5 text-[#1C1917] dark:text-[#FAF7F2]"
          />
        </div>
      </div>
    </button>
  );
}
