import * as React from "react";
import { Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ImageSelectCardProps {
  title: string;
  description?: string;
  imageSrc: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ImageSelectCard({
  title,
  description,
  imageSrc,
  selected,
  onClick,
  className,
}: ImageSelectCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300 cursor-pointer bg-card",
        selected
          ? "border-foreground ring-2 ring-foreground/15 shadow-card -translate-y-1"
          : "border-border/80 hover:border-foreground/30 hover:shadow-card hover:-translate-y-0.5",
        className
      )}
    >
      {/* Upper Area: Warm Sunlit Architectural Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Selected Checkmark Badge (Circular white badge with black checkmark from reference) */}
        {selected && (
          <div className="absolute top-3.5 right-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-foreground shadow-md ring-2 ring-white/90 animate-in fade-in zoom-in-75 duration-200">
            <Check size={14} weight="bold" />
          </div>
        )}
      </div>

      {/* Lower Area: Pure White Section with Crisp Black Typography */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 bg-card">
        <div>
          <span className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
            {title}
          </span>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
