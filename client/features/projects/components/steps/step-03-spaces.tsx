"use client";

import * as React from "react";
import Image from "next/image";
import { Plus, Minus, HouseLine, Sparkle, SquaresFour, Bed, CookingPot, Armchair, Sun } from "@phosphor-icons/react";
import type { SpaceEntity, PendingStyleSelection } from "../../types";
import { CURATED_SPACES } from "../spaces-architecture";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface StepSpacesProps {
  spaces: SpaceEntity[];
  onChangeSpaces: (spaces: SpaceEntity[]) => void;
  pendingStyles: PendingStyleSelection[];
  areaSqm: number;
}

type SpaceCategory = "all" | "living" | "suites" | "culinary" | "outdoor";

export function StepSpaces({
  spaces,
  onChangeSpaces,
  pendingStyles,
  areaSqm,
}: StepSpacesProps) {
  const { t, isRTL } = useLanguage();
  const [selectedCategory, setSelectedCategory] = React.useState<SpaceCategory>("all");
  const [customSpaceName, setCustomSpaceName] = React.useState("");

  // Map pending styles to spaces if assigned (only explicit per-space styles, not global default)
  const getStyleForSpace = (spaceId: string) => {
    const specific = pendingStyles.find(
      (p) =>
        p.targetSpaceKey === spaceId &&
        p.targetSpaceKey !== "general" &&
        p.targetSpaceKey !== "designer_curated"
    );
    return specific ? specific.styleName : undefined;
  };

  const toggleSpace = (id: string, currentIncluded: boolean) => {
    onChangeSpaces(
      spaces.map((s) => {
        if (s.id === id) {
          const nextIncluded = !currentIncluded;
          const currentQty = s.quantity ?? s.count ?? 1;
          const newQty = nextIncluded ? (currentQty === 0 ? 1 : currentQty) : 0;
          return {
            ...s,
            included: nextIncluded,
            quantity: newQty,
            count: newQty,
          };
        }
        return s;
      })
    );
  };

  const updateQuantity = (id: string, delta: number) => {
    onChangeSpaces(
      spaces.map((s) => {
        if (s.id === id) {
          const currentQty = s.quantity ?? s.count ?? 1;
          const newQty = Math.max(0, currentQty + delta);
          return {
            ...s,
            quantity: newQty,
            count: newQty,
            included: newQty > 0,
          };
        }
        return s;
      })
    );
  };

  const handleAddCustomSpace = () => {
    if (!customSpaceName.trim()) return;
    const id = `custom_${Date.now()}`;
    const newSpace: SpaceEntity = {
      id,
      spaceType: "custom",
      customName: customSpaceName.trim(),
      quantity: 1,
      included: true,
      notes: "",
    };
    onChangeSpaces([...spaces, newSpace]);
    setCustomSpaceName("");
  };

  const totalSelectedRooms = spaces
    .filter((s) => s.included && (s.quantity ?? 1) > 0)
    .reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  const categories = [
    { id: "all", labelEn: "All Spaces", labelAr: "كل المساحات", icon: SquaresFour },
    { id: "living", labelEn: "Reception & Living", labelAr: "الريسبشن والمعيشة", icon: Armchair },
    { id: "suites", labelEn: "Suites & Bedrooms", labelAr: "غرف النوم والأجنحة", icon: Bed },
    { id: "culinary", labelEn: "Kitchen & Dining", labelAr: "المطبخ والسفرة", icon: CookingPot },
    { id: "outdoor", labelEn: "Terrace & Outdoor", labelAr: "التراس والمساحات الخارجية", icon: Sun },
  ];

  const filteredCuratedSpaces = CURATED_SPACES.filter((space) => {
    if (selectedCategory === "all") return true;
    return space.category === selectedCategory;
  });

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Step Header */}
      <div className="text-start">
        <div className="flex items-center gap-2">
          <span className="h-px w-6 bg-foreground/50" />
          <span
            className={cn(
              "text-[#78716C]",
              isRTL
                ? "font-sans text-[11px] font-normal tracking-normal text-[#78716C]"
                : "font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
            )}
          >
            {isRTL ? "الخطوة الثالثة • الغرف والمساحات" : "03 — 06 SELECT SPACES"}
          </span>
        </div>
        <h2 className="mt-2 text-[#1C1917] font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight">
          {isRTL ? "إيه الغرف والمساحات اللي حابب تضيفها؟" : "Which spaces would you like to include?"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#78716C] font-normal leading-relaxed max-w-xl">
          {isRTL
            ? "حدد الغرف والمساحات اللي عاوز تشطبها في بيتك، وتقدر تزود أو تقلل عدد الغرف، أو تضيف أي غرفة تانية على ذوقك."
            : "Select the spaces for your project. You can calibrate counts, add custom rooms, or assign specific styles."}
        </p>
      </div>

      {/* Top Spatial Metrics Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 sm:gap-8">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#78716C] block">
              {isRTL ? "الغرف المختارة" : "Active Spaces"}
            </span>
            <div className="text-base sm:text-lg font-medium text-[#1C1917] mt-0.5">
              {totalSelectedRooms} {isRTL ? "غرفة" : "Rooms Selected"}
            </div>
          </div>
          <div className="h-8 w-px bg-border/80" />
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#78716C] block">
              {isRTL ? "المساحة الكلية للعقار" : "Gross Footprint"}
            </span>
            <div className="text-base sm:text-lg font-medium text-[#1C1917] mt-0.5">
              {areaSqm || 480} {isRTL ? "متر مربع" : "m² Area"}
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-[#D8C8B4] bg-[#FAF7F2] px-3.5 py-1.5 text-xs text-[#503C2C] shadow-2xs">
          <Sparkle size={13} weight="fill" className="text-[#B88460]" />
          <span className="font-normal">{isRTL ? "توزيع مدروس للمساحات" : "Optimal Spatial Distribution"}</span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as SpaceCategory)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-normal whitespace-nowrap transition-all cursor-pointer",
                isActive
                  ? "bg-[#503C2C] text-[#FAF7F2] shadow-2xs font-medium"
                  : "bg-card border border-border/80 text-[#6B635B] hover:text-[#1C1917] hover:border-[#B88460]/60"
              )}
            >
              <Icon size={14} weight={isActive ? "fill" : "regular"} />
              <span>{isRTL ? cat.labelAr : cat.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Responsive 2-Column Grid of Spaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCuratedSpaces.map((curated) => {
          const existing = spaces.find((s) => s.id === curated.id);
          const isIncluded = existing ? existing.included : false;
          const quantity = existing ? (existing.quantity ?? existing.count ?? 1) : curated.defaultCount;
          const assignedStyle = getStyleForSpace(curated.id);

          return (
            <div
              key={curated.id}
              className={cn(
                "p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 bg-card",
                isIncluded
                  ? "border-[#503C2C]/50 shadow-xs ring-1 ring-[#503C2C]/10"
                  : "border-border/70 opacity-65 hover:opacity-90"
              )}
            >
              {/* Top Row: Photo Thumbnail + Details */}
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-border bg-muted shadow-2xs">
                  <Image
                    src={curated.imageSrc}
                    alt={curated.defaultName}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1 text-start">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-[#1C1917] text-sm font-medium leading-snug">
                      {(t(curated.nameKey) !== curated.nameKey && t(curated.nameKey)) || curated.defaultName}
                    </h4>
                    {assignedStyle && isIncluded && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full bg-[#EAE2D7] text-[#503C2C] shrink-0 border border-[#D8C8B4]",
                          isRTL ? "text-[10px] font-normal" : "font-mono text-[9px]"
                        )}
                      >
                        {assignedStyle}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#78716C] font-normal leading-relaxed mt-1">
                    {isRTL ? curated.descAr : curated.desc}
                  </p>
                </div>
              </div>

              {/* Bottom Controls Row: Counter (-/+) and Toggle Switch */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2" dir="ltr">
                  {isIncluded ? (
                    <div
                      className="flex items-center gap-1.5 bg-[#FAF6F0] border border-[#E2D8CC] rounded-full px-2.5 py-1 shadow-2xs select-none"
                      dir="ltr"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(curated.id, -1);
                        }}
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[#78716C] hover:bg-[#EFE8DD] hover:text-[#1C1917] transition-colors cursor-pointer"
                        title={isRTL ? "تقليل العدد" : "Decrease count"}
                      >
                        <Minus size={11} weight="bold" />
                      </button>
                      <span className="font-mono text-xs font-medium w-5 text-center text-[#1C1917]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(curated.id, 1);
                        }}
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[#78716C] hover:bg-[#EFE8DD] hover:text-[#1C1917] transition-colors cursor-pointer"
                        title={isRTL ? "زيادة العدد" : "Increase count"}
                      >
                        <Plus size={11} weight="bold" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono text-[#A8A29E] px-1 select-none">
                      {isRTL ? "مش مضافة" : "Qty: 0"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#78716C] font-normal select-none">
                    {isIncluded ? (isRTL ? "مضافة للتشطيب" : "Included") : (isRTL ? "مش مضافة" : "Excluded")}
                  </span>
                  <Switch
                    checked={isIncluded}
                    onCheckedChange={() => toggleSpace(curated.id, isIncluded)}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Custom Spaces Added by User */}
        {spaces
          .filter((s) => s.spaceType === "custom")
          .map((custom) => (
            <div
              key={custom.id}
              className="p-4 rounded-2xl border border-[#503C2C]/50 bg-card flex flex-col justify-between gap-4 shadow-xs ring-1 ring-[#503C2C]/10"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-16 h-16 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 text-[#503C2C] shadow-2xs">
                  <HouseLine size={24} weight="regular" />
                </div>
                <div className="text-start min-w-0 flex-1">
                  <h4 className="text-[#1C1917] text-sm font-medium">
                    {custom.customName}
                  </h4>
                  <span className="text-[#78716C] text-[11px] font-normal mt-0.5 block">
                    {isRTL ? "غرفة خاصة" : "Bespoke Space"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2" dir="ltr">
                  {custom.included ? (
                    <div
                      className="flex items-center gap-1.5 bg-[#FAF6F0] border border-[#E2D8CC] rounded-full px-2.5 py-1 shadow-2xs select-none"
                      dir="ltr"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(custom.id, -1);
                        }}
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[#78716C] hover:bg-[#EFE8DD] hover:text-[#1C1917] transition-colors cursor-pointer"
                        title={isRTL ? "تقليل العدد" : "Decrease count"}
                      >
                        <Minus size={11} weight="bold" />
                      </button>
                      <span className="font-mono text-xs font-medium w-5 text-center text-[#1C1917]">
                        {custom.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(custom.id, 1);
                        }}
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[#78716C] hover:bg-[#EFE8DD] hover:text-[#1C1917] transition-colors cursor-pointer"
                        title={isRTL ? "زيادة العدد" : "Increase count"}
                      >
                        <Plus size={11} weight="bold" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono text-[#A8A29E] px-1 select-none">
                      {isRTL ? "مش مضافة" : "Qty: 0"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#78716C] font-normal select-none">
                    {custom.included ? (isRTL ? "مضافة للتشطيب" : "Included") : (isRTL ? "مش مضافة" : "Excluded")}
                  </span>
                  <Switch
                    checked={custom.included}
                    onCheckedChange={() => toggleSpace(custom.id, custom.included)}
                  />
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Add Custom Space input */}
      <div className="flex flex-col sm:flex-row gap-2.5 p-3.5 rounded-2xl bg-card border border-dashed border-border mt-2">
        <input
          type="text"
          value={customSpaceName}
          onChange={(e) => setCustomSpaceName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddCustomSpace();
            }
          }}
          placeholder={
            isRTL
              ? "عاوز تضيف غرفة تانية؟ (مثلاً: غرفة سينما، جيم، دريسنج إضافي، أوفيس، غرفة مربية)..."
              : "Add custom space (e.g. Home Cinema, Private Spa, Library Study, Gym)..."
          }
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#B88460] text-xs font-normal"
        />
        <button
          type="button"
          onClick={handleAddCustomSpace}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#503C2C] text-[#FAF7F2] hover:bg-[#3D2E22] transition-colors cursor-pointer shrink-0 shadow-2xs text-xs font-normal"
        >
          <Plus size={14} weight="bold" />
          <span>{isRTL ? "إضافة الغرفة" : "Add Space to Scope"}</span>
        </button>
      </div>
    </div>
  );
}
