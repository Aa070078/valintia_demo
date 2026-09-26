"use client";

import * as React from "react";
import Image from "next/image";
import { HouseLine, Sparkle } from "@phosphor-icons/react";
import type { SpaceEntity } from "../../types";
import { CURATED_SPACES } from "../spaces-architecture";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface ProjectSpacesTabProps {
  spaces: SpaceEntity[];
}

export function ProjectSpacesTab({ spaces }: ProjectSpacesTabProps) {
  const { t, isRTL } = useLanguage();

  const activeSpaces = spaces.filter((s) => s.included !== false);

  if (activeSpaces.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-card border border-border text-center shadow-xs">
        <HouseLine className="w-8 h-8 text-[#B88460] mx-auto mb-2" />
        <p className={cn("text-xs text-[#78716C]", isRTL && "font-medium")}>
          {isRTL ? "لسه ما حددتش أي غرف أو مساحات للمشروع." : "No spatial zones configured for this project."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300">
      {activeSpaces.map((space) => {
        const curated = CURATED_SPACES.find((c) => c.id === space.id);
        const title =
          space.customName ||
          (curated ? t(curated.nameKey) || curated.defaultName : space.spaceType) ||
          "Space";
        const image = curated?.imageSrc || "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80";

        return (
          <div
            key={space.id}
            className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col justify-between shadow-xs"
          >
            <div className="relative h-36 w-full">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="absolute bottom-3 start-3 end-3 text-white">
                <span
                  className={cn(
                    "text-[#E0CFB8]",
                    isRTL ? "text-[10px] font-bold tracking-normal" : "font-mono text-[9px] uppercase tracking-wider"
                  )}
                >
                  {space.quantity || 1} {isRTL ? "غرفة" : (space.quantity || 1) === 1 ? "Unit" : "Units"}
                </span>
                <h4
                  className={cn(
                    "text-white mt-0.5",
                    isRTL ? "font-sans text-base font-bold tracking-normal" : "font-serif text-base font-normal"
                  )}
                >
                  {title}
                </h4>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-2.5">
              {space.stylePreference ? (
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-xs text-[#503C2C]",
                    isRTL ? "font-bold" : "font-medium"
                  )}
                >
                  <Sparkle className="w-3.5 h-3.5 text-[#B88460]" />
                  <span>{space.stylePreference.styleName}</span>
                </div>
              ) : (
                <div className={cn("text-[11px] text-[#78716C]", isRTL && "font-medium text-[#503C2C]")}>
                  {isRTL ? "ماشي مع الستايل والجو العام للبيت" : "Aligned to overall residence atmosphere"}
                </div>
              )}

              {space.notes && (
                <p
                  className={cn(
                    "text-[11px] text-[#78716C] border-t border-border pt-2",
                    isRTL ? "font-medium not-italic text-[#4A3E31]" : "italic"
                  )}
                >
                  &ldquo;{space.notes}&rdquo;
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
