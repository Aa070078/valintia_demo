"use client";

import * as React from "react";
import {
  PencilSimple,
  NotePencil,
  Sparkle,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import type { PropertyType, SpaceItem } from "../types";
import { DEFAULT_SPACES } from "./spaces-selector";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

const PROPERTY_IMAGES: Record<PropertyType, string> = {
  villa:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  apartment:
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  duplex:
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
  penthouse:
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  commercial:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
  other:
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
};

const INSPIRATION_PHOTOS = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
];

interface ProjectReviewCardProps {
  title: string;
  propertyType: PropertyType;
  areaSqm: number;
  city: string;
  compound?: string;
  styleName?: string;
  styleImage?: string;
  spaces: SpaceItem[];
  notes?: string;
  onEditProperty?: () => void;
  onEditSpaces?: () => void;
  onEditStyle?: () => void;
  onNotesChange?: (notes: string) => void;
}

export function ProjectReviewCard({
  propertyType,
  styleName = "Modern",
  styleImage,
  spaces,
  notes,
  onEditProperty,
  onEditSpaces,
  onEditStyle,
  onNotesChange,
}: ProjectReviewCardProps) {
  const { t, isRTL } = useLanguage();
  const activeSpaces = spaces.filter((s) => s.included);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const getSpaceImage = (id: string) => {
    const found = DEFAULT_SPACES.find((s) => s.id === id);
    return (
      found?.imageSrc ||
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=300&q=80"
    );
  };

  const propertyImg =
    PROPERTY_IMAGES[propertyType] || PROPERTY_IMAGES.villa;
  const styleImg =
    styleImage ||
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

  const propertyTypeLabel = t(`property.${propertyType}`) || propertyType;

  const scrollInspiration = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: isRTL ? -offset : offset, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Top Two Summary Cards (Reference Screen 4) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Card 1: Property Type */}
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-0 shadow-editorial transition-all duration-300 hover:border-foreground/30 hover:-translate-y-1">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={propertyImg}
              alt={propertyTypeLabel}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
            {onEditProperty && (
              <button
                type="button"
                onClick={onEditProperty}
                className={cn(
                  "absolute top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-foreground backdrop-blur-md transition-transform hover:scale-115 active:scale-95 cursor-pointer shadow-xs",
                  isRTL ? "left-3" : "right-3"
                )}
                title={t("step5.modify")}
              >
                <PencilSimple size={14} />
              </button>
            )}
          </div>
          <div className="flex flex-col p-5 bg-card">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t("step5.property_type")}
            </span>
            <h4 className="mt-1 font-serif text-2xl font-medium text-foreground capitalize truncate">
              {propertyTypeLabel}
            </h4>
          </div>
        </div>

        {/* Card 2: Primary Style & Secondary */}
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-0 shadow-editorial transition-all duration-300 hover:border-foreground/30 hover:-translate-y-1">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={styleImg}
              alt={styleName}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
            {onEditStyle && (
              <button
                type="button"
                onClick={onEditStyle}
                className={cn(
                  "absolute top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-foreground backdrop-blur-md transition-transform hover:scale-115 active:scale-95 cursor-pointer shadow-xs",
                  isRTL ? "left-3" : "right-3"
                )}
                title={t("step5.modify")}
              >
                <PencilSimple size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between p-5 bg-card">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {t("step5.primary_style")}
              </span>
              <h4 className="mt-1 font-serif text-2xl font-medium text-foreground">
                {styleName}
              </h4>
            </div>
            <div className={cn("flex flex-col", isRTL ? "text-left" : "text-right")}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {t("step5.secondary_style")}
              </span>
              <span className="mt-1 text-sm font-medium text-foreground flex items-center gap-1">
                <Sparkle size={12} className="text-foreground" weight="fill" />
                <span>Contemporary</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Included Spaces Row (Circular photo chips from Reference Screen 4) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("step5.included_spaces")}
          </span>
          {onEditSpaces && (
            <button
              type="button"
              onClick={onEditSpaces}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline cursor-pointer"
            >
              <PencilSimple size={12} />
              <span>{t("step5.modify")}</span>
            </button>
          )}
        </div>

        {activeSpaces.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground rounded-2xl border border-dashed border-border/80">
            No spaces selected yet. Click Modify to select rooms.
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            {activeSpaces.map((space) => {
              const localizedSpaceName = t(`space.${space.id}`) || space.name;
              return (
                <div
                  key={space.id}
                  className="group flex flex-col items-center text-center transition-transform hover:scale-105"
                >
                  <div className="relative h-18 w-18 overflow-hidden rounded-full ring-2 ring-border/80 ring-offset-2 ring-offset-background group-hover:ring-foreground transition-all duration-300 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getSpaceImage(space.id)}
                      alt={localizedSpaceName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <span className="mt-2 text-xs font-medium text-foreground tracking-tight max-w-[90px] truncate">
                    {localizedSpaceName}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inspiration Gallery Row (Reference Screen 4) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("step5.inspiration")}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollInspiration(isRTL ? "right" : "left")}
              aria-label="Scroll inspiration left"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <CaretLeft size={14} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => scrollInspiration(isRTL ? "left" : "right")}
              aria-label="Scroll inspiration right"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
        >
          {INSPIRATION_PHOTOS.map((src, index) => (
            <div
              key={index}
              className="group/item relative h-28 w-44 shrink-0 overflow-hidden rounded-2xl bg-muted shadow-2xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Inspiration ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Your Notes Block (Reference Screen 4) */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3">
          <NotePencil size={18} className="text-foreground" />
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
            {t("step5.notes_title")}
          </span>
        </div>
        <textarea
          rows={3}
          value={notes || ""}
          onChange={(e) => onNotesChange?.(e.target.value)}
          placeholder={t("step5.notes_placeholder")}
          className="w-full rounded-xl border border-border/70 bg-background/50 p-4 text-xs sm:text-sm text-foreground outline-none transition-colors focus:border-foreground focus:ring-1 focus:ring-foreground leading-relaxed resize-none"
        />
      </div>
    </div>
  );
}
