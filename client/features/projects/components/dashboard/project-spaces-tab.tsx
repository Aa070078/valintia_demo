"use client";

import * as React from "react";
import Image from "next/image";
import { HouseLine, Sparkle } from "@phosphor-icons/react";
import type { SpaceEntity } from "../../types";
import { CURATED_SPACES } from "../spaces-architecture";
import { useLanguage } from "@/lib/i18n/language-context";

interface ProjectSpacesTabProps {
  spaces: SpaceEntity[];
}

export function ProjectSpacesTab({ spaces }: ProjectSpacesTabProps) {
  const { t, isRTL } = useLanguage();

  const activeSpaces = spaces.filter((s) => s.included !== false);

  if (activeSpaces.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27] text-center">
        <HouseLine className="w-8 h-8 text-[#B88460] mx-auto mb-2" />
        <p className="text-xs text-[#78716C] dark:text-[#989692]">
          {isRTL ? "لم يتم تحديد فراغات معمارية بعد." : "No spatial zones configured for this project."}
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
            className="rounded-2xl border border-[#E6DDD2] dark:border-[#2E2A27] bg-[#FAF7F2] dark:bg-[#1E1B18] overflow-hidden flex flex-col justify-between"
          >
            <div className="relative h-36 w-full">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-3 start-3 end-3 text-white">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#E0CFB8]">
                  {space.quantity || 1} {isRTL ? "وحدة" : (space.quantity || 1) === 1 ? "Unit" : "Units"}
                </span>
                <h4 className="font-serif text-base font-normal mt-0.5">{title}</h4>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-2.5">
              {space.stylePreference ? (
                <div className="flex items-center gap-1.5 text-xs text-[#503C2C] dark:text-[#D4C3B3]">
                  <Sparkle className="w-3.5 h-3.5 text-[#B88460]" />
                  <span>{space.stylePreference.styleName}</span>
                </div>
              ) : (
                <div className="text-[11px] text-[#78716C] dark:text-[#989692]">
                  {isRTL ? "مدرج ضمن النطاق المعماري العام" : "Aligned to overall residence atmosphere"}
                </div>
              )}

              {space.notes && (
                <p className="text-[11px] text-[#78716C] dark:text-[#989692] italic border-t border-[#E6DDD2]/60 pt-2">
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
