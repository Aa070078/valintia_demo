"use client";

import * as React from "react";
import { Heart, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export interface StyleOption {
  id: string;
  name: string;
  tagline: string;
  description: string;
  imageSrc: string;
  palette: string[];
}

export const DESIGN_STYLES: StyleOption[] = [
  {
    id: "modern",
    name: "Modern",
    tagline: "Clean lines & architectural balance",
    description:
      "Clean lines, open, calm spaces and a refined balance of materials. Emphasizes natural light, neutral undertones, and warm oak carpentry.",
    imageSrc:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    palette: ["#FAF8F6", "#E6E0DA", "#503C2C", "#B88460"],
  },
  {
    id: "mediterranean",
    name: "Mediterranean",
    tagline: "Sunlit coastal luxury & organic textures",
    description:
      "Arched thresholds, hand-finished lime plaster walls, natural travertine tiles, and organic terracotta tones inspired by the North Coast.",
    imageSrc:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    palette: ["#F9F6F0", "#D8C7B5", "#8A6D4A", "#4A6B82"],
  },
  {
    id: "minimal",
    name: "Warm Minimalist",
    tagline: "Serenity through restrained materiality",
    description:
      "Subtle textural richness with zero visual clutter. Low-slung boucle furnishings, flush hidden doors, and indirect architectural cove lighting.",
    imageSrc:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
    palette: ["#FFFFFF", "#F3EFEA", "#A89F91", "#332B25"],
  },
  {
    id: "neo_classic",
    name: "Neo Classic",
    tagline: "Timeless Parisian moldings & marble",
    description:
      "Delicate wall boiserie, herringbone French oak parquetry, Calacatta marble fireplaces, and sculptural contemporary brass chandeliers.",
    imageSrc:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    palette: ["#FCFBF7", "#E2DCD5", "#4B4237", "#C5A059"],
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    tagline: "Airy ash wood, wool, and Nordic warmth",
    description:
      "Pale wood joinery, ergonomic designer seating, layered tactile textiles, and an abundance of serene ambient diffused daylight.",
    imageSrc:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
    palette: ["#F7F7F7", "#E0DFDB", "#6E6D68", "#2C3E50"],
  },
  {
    id: "islamic_heritage",
    name: "Contemporary Islamic",
    tagline: "Historic Cairo geometry reinterpreted",
    description:
      "Sophisticated geometric mashrabiya screening, hand-chiseled limestone accents, and serene interior courtyards designed for modern Cairo.",
    imageSrc:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    palette: ["#F5F2EB", "#D4C5A9", "#785E38", "#2A3D34"],
  },
  {
    id: "industrial_luxury",
    name: "Industrial Luxury",
    tagline: "Patinated bronze & raw architectural elegance",
    description:
      "Blackened steel frames, patinated bronze accents, fluted glass partitions, and raw architectural concrete balanced with plush velvets.",
    imageSrc:
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80",
    palette: ["#2B2B2B", "#4A4A4A", "#8C7B6B", "#C29B38"],
  },
  {
    id: "japandi",
    name: "Japandi",
    tagline: "Japanese wabi-sabi meets Nordic functionality",
    description:
      "Natural cedar woodwork, handwoven paper cord elements, organic ceramic vessels, and low-profile horizontal planes emphasizing tranquility.",
    imageSrc:
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
    palette: ["#F2EDE4", "#D9CDBF", "#736456", "#2D2622"],
  },
];

interface StyleDiscoveryProps {
  selectedStyleId: string;
  onSelectStyle: (styleId: string) => void;
}

export function StyleDiscovery({
  selectedStyleId,
  onSelectStyle,
}: StyleDiscoveryProps) {
  const { t, isRTL } = useLanguage();
  const [likedStyles, setLikedStyles] = React.useState<Record<string, boolean>>({
    modern: true,
  });

  const activeIndex = DESIGN_STYLES.findIndex((s) => s.id === selectedStyleId);
  const currentIndex = activeIndex >= 0 ? activeIndex : 0;
  const currentStyle = DESIGN_STYLES[currentIndex];

  const prevIndex = (currentIndex - 1 + DESIGN_STYLES.length) % DESIGN_STYLES.length;
  const nextIndex = (currentIndex + 1) % DESIGN_STYLES.length;

  const prevStyle = DESIGN_STYLES[prevIndex];
  const nextStyle = DESIGN_STYLES[nextIndex];

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedStyles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStyleName = (s: StyleOption) => t(`style.${s.id}`) || s.name;
  const getStyleTagline = (s: StyleOption) => t(`style.${s.id}_tagline`) || s.tagline;
  const getStyleDesc = (s: StyleOption) => t(`style.${s.id}_desc`) || s.description;

  return (
    <div className="flex flex-col gap-10">
      {/* 3D Depth Card Stage with Genuine Perspective transforms */}
      <div className="relative mx-auto flex h-[460px] w-full max-w-4xl items-center justify-center overflow-hidden py-4 perspective-1200">
        {/* Left Arrow Control */}
        <button
          type="button"
          onClick={() => onSelectStyle(isRTL ? nextStyle.id : prevStyle.id)}
          aria-label="Previous Style"
          className="absolute left-2 sm:left-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/85 text-foreground backdrop-blur-md transition-all hover:bg-card hover:scale-110 active:scale-90 shadow-md cursor-pointer"
        >
          <CaretLeft size={16} weight="bold" />
        </button>

        {/* Right Arrow Control */}
        <button
          type="button"
          onClick={() => onSelectStyle(isRTL ? prevStyle.id : nextStyle.id)}
          aria-label="Next Style"
          className="absolute right-2 sm:right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/85 text-foreground backdrop-blur-md transition-all hover:bg-card hover:scale-110 active:scale-90 shadow-md cursor-pointer"
        >
          <CaretRight size={16} weight="bold" />
        </button>

        {/* Left Fanned Card (3D perspective tilt) */}
        <button
          type="button"
          onClick={() => onSelectStyle(prevStyle.id)}
          className="absolute left-4 sm:left-14 z-10 hidden sm:block h-[360px] w-[280px] md:w-[320px] rounded-3xl border border-white/40 bg-card shadow-2xl opacity-60 transition-all duration-500 hover:opacity-85 hover:scale-95 cursor-pointer overflow-hidden filter brightness-90"
          style={{
            transform: "perspective(1200px) rotateY(24deg) scale(0.86) translateZ(-40px)",
            transformOrigin: "center right",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={prevStyle.imageSrc}
            alt={getStyleName(prevStyle)}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-card/80 p-3.5 backdrop-blur-md">
            <span className="font-serif text-base font-medium text-foreground">
              {getStyleName(prevStyle)}
            </span>
          </div>
        </button>

        {/* Center Primary Featured Card (Screen 2 Reference) */}
        <div
          className="relative z-20 h-[430px] w-[92%] max-w-[480px] rounded-3xl border border-white/70 bg-card shadow-3d-floating transition-all duration-500 overflow-hidden group"
          style={{
            transform: "perspective(1200px) rotateY(0deg) translateZ(25px) scale(1)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentStyle.imageSrc}
            alt={getStyleName(currentStyle)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Floating Favorite / Like Button with Spring bounce */}
          <button
            type="button"
            onClick={(e) => toggleLike(e, currentStyle.id)}
            aria-label="Save style to favorites"
            className={cn(
              "absolute top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-foreground shadow-md backdrop-blur-md transition-transform duration-200 hover:scale-115 active:scale-130 cursor-pointer ring-2 ring-white/60",
              isRTL ? "left-4" : "right-4"
            )}
          >
            <Heart
              size={20}
              weight={likedStyles[currentStyle.id] ? "fill" : "regular"}
              className={likedStyles[currentStyle.id] ? "text-foreground fill-foreground scale-110" : "text-foreground"}
            />
          </button>

          {/* Floating White Info Box (Reference Style Screen 2) */}
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/80 bg-white/95 p-5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-card/95">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-medium tracking-tight text-foreground">
                {getStyleName(currentStyle)}
              </h3>
              {/* Palette dots */}
              <div className="flex items-center gap-1.5">
                {currentStyle.palette.map((color, i) => (
                  <span
                    key={i}
                    className="h-3 w-3 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {getStyleDesc(currentStyle)}
            </p>
          </div>
        </div>

        {/* Right Fanned Card (3D perspective tilt) */}
        <button
          type="button"
          onClick={() => onSelectStyle(nextStyle.id)}
          className="absolute right-4 sm:right-14 z-10 hidden sm:block h-[360px] w-[280px] md:w-[320px] rounded-3xl border border-white/40 bg-card shadow-2xl opacity-60 transition-all duration-500 hover:opacity-85 hover:scale-95 cursor-pointer overflow-hidden filter brightness-90"
          style={{
            transform: "perspective(1200px) rotateY(-24deg) scale(0.86) translateZ(-40px)",
            transformOrigin: "center left",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={nextStyle.imageSrc}
            alt={getStyleName(nextStyle)}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-card/80 p-3.5 backdrop-blur-md">
            <span className="font-serif text-base font-medium text-foreground">
              {getStyleName(nextStyle)}
            </span>
          </div>
        </button>
      </div>

      {/* Style Thumbnail Selector Strip (8 Horizontal Capsules from Screen 2 Reference) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("step3.archetypes_title")} ({DESIGN_STYLES.length})
          </span>
          <span className="text-xs text-muted-foreground">{t("step3.archetypes_sub")}</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {DESIGN_STYLES.map((style) => {
            const isSelected = selectedStyleId === style.id;
            const styleName = getStyleName(style);
            const styleTag = getStyleTagline(style);

            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onSelectStyle(style.id)}
                className={cn(
                  "group flex shrink-0 items-center gap-3 rounded-2xl border p-2 text-left transition-all duration-300 cursor-pointer bg-card min-w-[170px] active:scale-[0.98]",
                  isSelected
                    ? "border-foreground ring-2 ring-foreground/20 shadow-md bg-foreground/[0.03] -translate-y-0.5"
                    : "border-border/80 hover:border-foreground/30 hover:shadow-2xs hover:-translate-y-0.5"
                )}
              >
                <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={style.imageSrc}
                    alt={styleName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-foreground/15" />
                  )}
                </div>
                <div className="pr-2">
                  <span
                    className={cn(
                      "block text-xs font-semibold tracking-tight transition-colors",
                      isSelected ? "text-foreground font-bold" : "text-foreground group-hover:text-foreground"
                    )}
                  >
                    {styleName}
                  </span>
                  <span className="block text-[10px] text-muted-foreground truncate max-w-[110px]">
                    {styleTag}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
