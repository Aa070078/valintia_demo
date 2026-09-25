"use client";

import * as React from "react";
import Image from "next/image";
import { Plus, Minus, HouseLine, Cube } from "@phosphor-icons/react";
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

export function StepSpaces({
  spaces,
  onChangeSpaces,
  pendingStyles,
  areaSqm,
}: StepSpacesProps) {
  const { t, isRTL } = useLanguage();
  const [customSpaceName, setCustomSpaceName] = React.useState("");

  // Map pending styles to spaces if assigned
  const getStyleForSpace = (spaceId: string) => {
    const specific = pendingStyles.find((p) => p.targetSpaceKey === spaceId);
    if (specific) return specific.styleName;
    const general = pendingStyles.find((p) => p.targetSpaceKey === "general");
    return general ? general.styleName : undefined;
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

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Step Header matching Reference */}
      <div className="text-start">
        <div className="flex items-center gap-2">
          <span className="h-px w-6 bg-foreground/50" />
          <span
            className={cn(
              "text-[#78716C]",
              isRTL
                ? "font-sans text-xs font-bold tracking-normal text-[#503C2C]"
                : "font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
            )}
          >
            {isRTL ? "٠٢ — ٠٦ • الفراغات المعمارية" : "02 — 06 SELECT SPACES"}
          </span>
        </div>
        <h2
          className={cn(
            "mt-2 text-[#1C1917]",
            isRTL
              ? "font-sans text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.3] tracking-normal"
              : "font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight"
          )}
        >
          {isRTL ? "ما الفراغات التي تود إدراجها؟" : "Which spaces would you like to include?"}
        </h2>
        <p
          className={cn(
            "mt-2 leading-relaxed max-w-xl",
            isRTL
              ? "text-sm font-medium text-[#4A3E31]"
              : "text-xs sm:text-sm text-[#78716C]"
          )}
        >
          {isRTL
            ? "حدد الفراغات والغرف الخاصة بمشروعك، مع إمكانية تعديل أعداد الغرف أو إضافتها لاحقاً."
            : "Select the spaces for your project. You can always adjust counts, add or remove spaces later."}
        </p>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3D Isometric Architectural Floorplan Cutaway */}
        <div className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-24">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-editorial group transition-all duration-300 hover:shadow-xl">
            {/* Cutaway Image */}
            <div className="relative aspect-square w-full overflow-hidden bg-[#FAF6F0]">
              <Image
                src="/images/isometric-floorplan.jpg"
                alt="3D Isometric Architectural Floorplan"
                fill
                priority
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 420px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

              {/* Floating Top Badge */}
              <div className={cn("absolute top-3.5 z-10", isRTL ? "right-3.5" : "left-3.5")}>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/90 px-3 py-1 text-[10px] font-bold text-[#1C1917] backdrop-blur-md shadow-xs">
                  <Cube size={12} weight="bold" className="text-[#B88460]" />
                  <span>{isRTL ? "مخطط أيزومتري ثلاثي الأبعاد" : "3D Isometric Blueprint"}</span>
                </span>
              </div>

              {/* Bottom Metrics Overlay on Image */}
              <div className="absolute bottom-3 inset-x-3 rounded-2xl border border-white/40 bg-[#FAF7F2]/90 p-3 backdrop-blur-md shadow-xs flex items-center justify-between text-start">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#78716C]">
                    {isRTL ? "الفراغات النشطة" : "Active Zones"}
                  </span>
                  <div className="text-sm font-bold text-[#1C1917]">
                    {totalSelectedRooms} {isRTL ? "غرف / مناطق" : "Selected"}
                  </div>
                </div>
                <div className="h-6 w-px bg-border/80" />
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#78716C]">
                    {isRTL ? "المساحة الإجمالية" : "Est. Area"}
                  </span>
                  <div className="text-sm font-bold text-[#1C1917]">
                    {areaSqm || 480} {isRTL ? "م²" : "m²"}
                  </div>
                </div>
                <div className="h-6 w-px bg-border/80" />
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#B88460]">
                  <span className="h-2 w-2 rounded-full bg-[#B88460] animate-pulse" />
                  <span>{isRTL ? "توزيع مثالي" : "Optimized"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Spaces List with Switch AND Counter */}
        <div className="lg:col-span-7 flex flex-col gap-3.5">
          {CURATED_SPACES.map((curated) => {
            const existing = spaces.find((s) => s.id === curated.id);
            const isIncluded = existing ? existing.included : false;
            const quantity = existing ? (existing.quantity ?? existing.count ?? 1) : curated.defaultCount;
            const assignedStyle = getStyleForSpace(curated.id);

            return (
              <div
                key={curated.id}
                className={cn(
                  "p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 bg-card",
                  isIncluded
                    ? "border-[#503C2C]/50 shadow-xs ring-1 ring-[#503C2C]/10"
                    : "border-border/70 opacity-60 hover:opacity-90"
                )}
              >
                {/* Left space identity */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border bg-muted">
                    <Image
                      src={curated.imageSrc}
                      alt={curated.defaultName}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0 text-start">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={cn(
                          "text-[#1C1917] truncate",
                          isRTL ? "text-sm font-bold tracking-normal" : "text-sm font-medium"
                        )}
                      >
                        {t(curated.nameKey) || curated.defaultName}
                      </h4>
                      {assignedStyle && isIncluded && (
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full bg-[#EAE2D7] text-[#503C2C] shrink-0 border border-[#D8C8B4]",
                            isRTL ? "text-[10px] font-bold tracking-normal" : "font-mono text-[9px]"
                          )}
                        >
                          {assignedStyle}
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        "truncate mt-0.5",
                        isRTL
                          ? "text-xs font-medium text-[#78716C]"
                          : "text-[11px] text-[#78716C]"
                      )}
                    >
                      {isRTL ? curated.descAr : curated.desc}
                    </p>
                  </div>
                </div>

                {/* Right controls: Counter (-/+) AND Switch */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {/* Quantity Counter */}
                  {isIncluded && (
                    <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-2 py-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(curated.id, -1)}
                        className="flex h-5 w-5 items-center justify-center rounded-md text-[#78716C] hover:bg-secondary hover:text-[#1C1917] transition-colors cursor-pointer"
                        title={isRTL ? "تقليل العدد" : "Decrease count"}
                      >
                        <Minus size={11} weight="bold" />
                      </button>
                      <span className="font-mono text-xs font-bold w-4 text-center text-[#1C1917]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(curated.id, 1)}
                        className="flex h-5 w-5 items-center justify-center rounded-md text-[#78716C] hover:bg-secondary hover:text-[#1C1917] transition-colors cursor-pointer"
                        title={isRTL ? "زيادة العدد" : "Increase count"}
                      >
                        <Plus size={11} weight="bold" />
                      </button>
                    </div>
                  )}

                  {/* Toggle Switch */}
                  <Switch
                    checked={isIncluded}
                    onCheckedChange={() => toggleSpace(curated.id, isIncluded)}
                  />
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
                className="p-3.5 sm:p-4 rounded-2xl border border-[#503C2C]/50 bg-card flex items-center justify-between gap-3 shadow-xs ring-1 ring-[#503C2C]/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 text-[#503C2C]">
                    <HouseLine size={22} weight="bold" />
                  </div>
                  <div className="text-start">
                    <h4
                      className={cn(
                        "text-[#1C1917]",
                        isRTL ? "text-sm font-bold" : "text-sm font-medium"
                      )}
                    >
                      {custom.customName}
                    </h4>
                    <span
                      className={cn(
                        "text-[#78716C]",
                        isRTL
                          ? "text-xs font-semibold text-[#503C2C]"
                          : "font-mono text-[10px]"
                      )}
                    >
                      {isRTL ? "فراغ معماري مخصص" : "Bespoke Space"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-2 py-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => updateQuantity(custom.id, -1)}
                      className="flex h-5 w-5 items-center justify-center rounded-md text-[#78716C] hover:bg-secondary hover:text-[#1C1917] cursor-pointer"
                    >
                      <Minus size={11} weight="bold" />
                    </button>
                    <span className="font-mono text-xs font-bold w-4 text-center text-[#1C1917]">
                      {custom.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(custom.id, 1)}
                      className="flex h-5 w-5 items-center justify-center rounded-md text-[#78716C] hover:bg-secondary hover:text-[#1C1917] cursor-pointer"
                    >
                      <Plus size={11} weight="bold" />
                    </button>
                  </div>

                  <Switch
                    checked={custom.included}
                    onCheckedChange={() => toggleSpace(custom.id, custom.included)}
                  />
                </div>
              </div>
            ))}

          {/* Add Custom Space input */}
          <div className="flex gap-2 p-3 rounded-2xl bg-card border border-dashed border-border mt-2">
            <input
              type="text"
              value={customSpaceName}
              onChange={(e) => setCustomSpaceName(e.target.value)}
              placeholder={
                isRTL
                  ? "إضافة فراغ مخصص (مثل: غرفة سينما، سبا، مجلس عربي، ركن قراءة)..."
                  : "Add custom space (e.g. Cinema Room, Private Spa, Library Lounge)..."
              }
              className={cn(
                "flex-1 px-3.5 py-2 rounded-xl border border-border bg-background text-[#1C1917] focus:outline-none focus:border-primary text-xs",
                isRTL && "font-sans font-medium"
              )}
            />
            <button
              type="button"
              onClick={handleAddCustomSpace}
              className={cn(
                "flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#503C2C] text-[#FAF7F2] hover:bg-[#3D2E22] transition-colors cursor-pointer shrink-0 shadow-2xs",
                isRTL ? "text-xs font-bold font-sans" : "text-xs font-semibold"
              )}
            >
              <Plus size={14} weight="bold" />
              <span>{isRTL ? "إضافة فراغ" : "Add Space"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
