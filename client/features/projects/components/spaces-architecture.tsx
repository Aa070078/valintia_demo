"use client";

import * as React from "react";
import { Plus, Minus, MagnifyingGlassPlus, MagnifyingGlassMinus, CornersOut } from "@phosphor-icons/react";
import type { SpaceItem } from "../types";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export interface CuratedSpaceItem {
  id: string;
  nameKey: string;
  defaultName: string;
  category: "living" | "suites" | "culinary" | "outdoor";
  desc: string;
  descAr: string;
  imageSrc: string;
  hasCounter: boolean;
  defaultCount: number;
}

export const CURATED_SPACES: CuratedSpaceItem[] = [
  {
    id: "living",
    nameKey: "space.living",
    defaultName: "Living Room",
    category: "living",
    desc: "Formal lounge & conversation salon",
    descAr: "صالون استقبال رسمي ومساحة محادثة مفتوحة",
    imageSrc: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
    hasCounter: false,
    defaultCount: 1,
  },
  {
    id: "dining",
    nameKey: "space.dining",
    defaultName: "Dining Room",
    category: "living",
    desc: "10-seat banqueting area",
    descAr: "منطقة طعام تتسع لـ ١٠ أشخاص بتشطيب راقٍ",
    imageSrc: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
    hasCounter: false,
    defaultCount: 1,
  },
  {
    id: "kitchen",
    nameKey: "space.kitchen",
    defaultName: "Kitchen & Pantry",
    category: "culinary",
    desc: "Chef prep island & concealed pantry",
    descAr: "جزيرة طهي رخامية ومخزن مؤن مخفي",
    imageSrc: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
    hasCounter: false,
    defaultCount: 1,
  },
  {
    id: "master_bedroom",
    nameKey: "space.master_bedroom",
    defaultName: "Master Bedroom Suite",
    category: "suites",
    desc: "Private retreat, walk-in dressing room",
    descAr: "جناح نوم رئيسي وغرفة ملابس فندقية",
    imageSrc: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80",
    hasCounter: false,
    defaultCount: 1,
  },
  {
    id: "guest_bedrooms",
    nameKey: "space.bedroom",
    defaultName: "Guest Bedrooms",
    category: "suites",
    desc: "Family & hospitality quarters",
    descAr: "غرف نوم إضافية للعائلة والضيوف",
    imageSrc: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=600&q=80",
    hasCounter: true,
    defaultCount: 3,
  },
  {
    id: "bathrooms",
    nameKey: "space.bathrooms",
    defaultName: "Bathrooms & Spa",
    category: "suites",
    desc: "En-suites and powder vanity",
    descAr: "حمامات ماستر ملحقة ووحدة ضيوف فاخرة",
    imageSrc: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
    hasCounter: true,
    defaultCount: 4,
  },
  {
    id: "terrace",
    nameKey: "space.terrace",
    defaultName: "Private Terrace & Loggia",
    category: "outdoor",
    desc: "Lounge deck & landscaping",
    descAr: "تراس خارجي بإطلالة ومساحات خضراء",
    imageSrc: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=600&q=80",
    hasCounter: true,
    defaultCount: 2,
  },
  {
    id: "office",
    nameKey: "space.office",
    defaultName: "Home Office / Library",
    category: "living",
    desc: "Acoustic paneling & custom joinery",
    descAr: "مكتب منزلي معزول مع تجاليد خشبية مدمجة",
    imageSrc: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80",
    hasCounter: false,
    defaultCount: 0,
  },
  {
    id: "dressing",
    nameKey: "space.dressing",
    defaultName: "Walk-in Dressing Room",
    category: "suites",
    desc: "Illuminated glass wardrobes & vanity",
    descAr: "غرفة ملابس واسعة بخزائن زجاجية مضيئة",
    imageSrc: "https://images.unsplash.com/photo-1558997519-83ea9252def8?auto=format&fit=crop&w=600&q=80",
    hasCounter: false,
    defaultCount: 0,
  },
];

interface SpacesArchitectureProps {
  spaces: SpaceItem[];
  onChange: (spaces: SpaceItem[]) => void;
  areaSqm: number;
}

export function SpacesArchitecture({
  spaces,
  onChange,
  areaSqm,
}: SpacesArchitectureProps) {
  const { t, isRTL } = useLanguage();
  const [viewTab, setViewTab] = React.useState<"3d" | "2d">("3d");
  const [zoomLevel, setZoomLevel] = React.useState<number>(1);
  const [showAddCustom, setShowAddCustom] = React.useState(false);
  const [customName, setCustomName] = React.useState("");

  const getSpace = (id: string) => {
    return spaces.find((s) => s.id === id);
  };

  const handleToggle = (id: string, name?: string, defaultCount = 1) => {
    const existing = spaces.find((s) => s.id === id);
    if (existing) {
      onChange(
        spaces.map((s) => (s.id === id ? { ...s, included: !s.included } : s))
      );
    } else {
      onChange([...spaces, { id, name: name || id, spaceType: id, quantity: defaultCount, count: defaultCount, included: true }]);
    }
  };

  const handleCountChange = (id: string, name?: string, delta = 1) => {
    const existing = spaces.find((s) => s.id === id);
    if (existing) {
      const nextCount = Math.max(1, (existing.count || existing.quantity || 1) + delta);
      onChange(
        spaces.map((s) => (s.id === id ? { ...s, count: nextCount, quantity: nextCount, included: true } : s))
      );
    } else {
      const nextCount = Math.max(1, 1 + delta);
      onChange([...spaces, { id, name: name || id, spaceType: id, quantity: nextCount, count: nextCount, included: true }]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const newId = `custom_${Date.now()}`;
    onChange([
      ...spaces,
      {
        id: newId,
        name: customName.trim(),
        customName: customName.trim(),
        spaceType: "custom",
        included: true,
        count: 1,
        quantity: 1,
      },
    ]);
    setCustomName("");
    setShowAddCustom(false);
  };

  const activeTotalCount = spaces.reduce(
    (sum, s) => (s.included ? sum + (s.count || 1) : sum),
    0
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header Stat Pill in top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78716C] dark:text-[#989692]">
            {t("step3.inventory_title") || "ARCHITECTURAL INVENTORY"}
          </span>
          <span className="text-xs text-[#8C847B]">·</span>
          <span className="text-xs font-medium text-[#78716C] dark:text-[#989692]">
            {t("step3.inventory_zones") || "8 Curated Zones"}
          </span>
        </div>

        {/* 13 ZONES ACTIVE badge from Image 3 */}
        <div className="inline-flex items-center gap-2 rounded-xl border border-[#E2D7C8] bg-[#FAF7F2] px-3.5 py-1.5 text-xs font-semibold text-[#1C1917] shadow-2xs dark:border-[#2C2C32] dark:bg-[#1A1A1E] dark:text-[#FAF7F2]">
          <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-[#1C1917] text-white text-[9px] dark:bg-white dark:text-[#1C1917]">
            ✓
          </div>
          <span>
            {activeTotalCount} {isRTL ? "مساحة مفعلة" : "ZONES ACTIVE"}
          </span>
          <span className="text-[#DFD6C7]">|</span>
          <span className="font-mono text-[11px] text-[#78716C] dark:text-[#989692]">
            Est. {areaSqm} m²
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: 3D Axonometric Blueprint Cutaway & Metrics */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          <div className="relative overflow-hidden rounded-3xl border border-[#E2D7C8] bg-[#FAF7F2] p-4 shadow-sm dark:border-[#2C2C32] dark:bg-[#1A1A1E]">
            {/* View Tabs */}
            <div className="flex items-center justify-between pb-3">
              <div className="inline-flex items-center rounded-full border border-[#DFD6C7] bg-[#F4EEE5] p-1 shadow-2xs dark:border-[#2C2C32] dark:bg-[#24242A]">
                <button
                  type="button"
                  onClick={() => setViewTab("3d")}
                  className={cn(
                    "rounded-full px-3.5 py-1 text-xs font-medium transition-all cursor-pointer",
                    viewTab === "3d"
                      ? "bg-[#1C1917] text-[#FAF7F2] shadow-xs"
                      : "text-[#78716C] hover:text-[#1C1917] dark:text-[#989692]"
                  )}
                >
                  {t("step3.tab_3d") || "Axonometric 3D"}
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab("2d")}
                  className={cn(
                    "rounded-full px-3.5 py-1 text-xs font-medium transition-all cursor-pointer",
                    viewTab === "2d"
                      ? "bg-[#1C1917] text-[#FAF7F2] shadow-xs"
                      : "text-[#78716C] hover:text-[#1C1917] dark:text-[#989692]"
                  )}
                >
                  {t("step3.tab_2d") || "2D Blueprint"}
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#DFD6C7] bg-[#F4EEE5] text-[#1C1917] shadow-2xs hover:bg-[#EAE2D5] active:scale-95 transition-all cursor-pointer dark:border-[#2C2C32] dark:bg-[#24242A] dark:text-[#FAF7F2]"
                  title="Zoom In"
                >
                  <MagnifyingGlassPlus size={13} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#DFD6C7] bg-[#F4EEE5] text-[#1C1917] shadow-2xs hover:bg-[#EAE2D5] active:scale-95 transition-all cursor-pointer dark:border-[#2C2C32] dark:bg-[#24242A] dark:text-[#FAF7F2]"
                  title="Zoom Out"
                >
                  <MagnifyingGlassMinus size={13} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#DFD6C7] bg-[#F4EEE5] text-[#1C1917] shadow-2xs hover:bg-[#EAE2D5] active:scale-95 transition-all cursor-pointer dark:border-[#2C2C32] dark:bg-[#24242A] dark:text-[#FAF7F2]"
                  title="Reset Zoom"
                >
                  <CornersOut size={13} weight="bold" />
                </button>
              </div>
            </div>

            {/* Model Canvas */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#EDE6DC]/40 border border-[#E8DFD3] dark:border-[#2C2C32] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
                alt="Architectural Spatial Layout"
                className="h-full w-full object-cover transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel})` }}
              />

              {/* Hotspot Pin 1: Master Suite */}
              <div
                className="absolute top-[28%] left-[32%] z-20 flex items-center gap-1.5 rounded-full bg-[#1C1917]/90 px-2.5 py-1 text-[10px] font-medium text-[#FAF7F2] shadow-md backdrop-blur-xs ring-2 ring-white/60 transition-transform hover:scale-105"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{t("step3.pin_master") || "Master Suite"}</span>
                <span className="text-white/70">✓</span>
              </div>

              {/* Hotspot Pin 2: Sanctuary Baths */}
              <div
                className="absolute top-[38%] left-[42%] z-20 flex items-center gap-1.5 rounded-full bg-[#1C1917]/90 px-2.5 py-1 text-[10px] font-medium text-[#FAF7F2] shadow-md backdrop-blur-xs ring-2 ring-white/60 transition-transform hover:scale-105"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{t("step3.pin_baths") || "Sanctuary Baths"}</span>
                <span className="text-white/70">✓</span>
              </div>

              {/* Hotspot Pin 3: Kitchen & Dining */}
              <div
                className="absolute bottom-[32%] left-[44%] z-20 flex items-center gap-1.5 rounded-full bg-[#1C1917]/90 px-2.5 py-1 text-[10px] font-medium text-[#FAF7F2] shadow-md backdrop-blur-xs ring-2 ring-white/60 transition-transform hover:scale-105"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{t("step3.pin_kitchen") || "Kitchen & Dining"}</span>
                <span className="text-white/70">✓</span>
              </div>

              {/* Bottom Legend on image */}
              <div className="absolute bottom-3 start-3 z-10 flex items-center gap-4 rounded-xl bg-[#FAF7F2]/90 px-3.5 py-1.5 backdrop-blur-md border border-[#E2D7C8] shadow-2xs text-[10px] font-medium text-[#1C1917] dark:border-[#2C2C32] dark:bg-[#1A1A1E]/90 dark:text-[#FAF7F2]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#1C1917] dark:bg-white" />
                  <span>{t("step3.legend_included") || "Included in Fit-Out"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#DFD6C7]" />
                  <span className="text-[#78716C] dark:text-[#989692]">{t("step3.legend_excluded") || "Excluded"}</span>
                </div>
              </div>
            </div>

            {/* Metrics Row (3 architectural metrics from Image 3) */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#E8DFD3] pt-4 dark:border-[#2C2C32]">
              <div className="flex flex-col">
                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#78716C] dark:text-[#989692]">
                  {t("step3.metric_footprint") || "SPATIAL FOOTPRINT"}
                </span>
                <span className="mt-1 font-serif text-xl font-medium text-[#1C1917] dark:text-[#FAF7F2]">
                  {areaSqm} m²
                </span>
                <span className="text-[10px] text-[#8C847B] dark:text-[#989692]">
                  {isRTL ? "مستوى داخلي + تراس" : "Bi-level interior + terrace"}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#78716C] dark:text-[#989692]">
                  {t("step3.metric_height") || "CEILING CLEAR HEIGHT"}
                </span>
                <span className="mt-1 font-serif text-xl font-medium text-[#1C1917] dark:text-[#FAF7F2]">
                  3.85 m
                </span>
                <span className="text-[10px] text-[#8C847B] dark:text-[#989692]">
                  {isRTL ? "صالة معيشة بارتفاع مضاعف" : "Double-volume living zone"}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#78716C] dark:text-[#989692]">
                  {t("step3.metric_trajectory") || "PROJECT TRAJECTORY"}
                </span>
                <span className="mt-1 font-serif text-xl font-medium text-[#1C1917] dark:text-[#FAF7F2]">
                  Phase 01
                </span>
                <span className="text-[10px] text-[#8C847B] dark:text-[#989692]">
                  {isRTL ? "التشطيبات المعمارية التأسيسية" : "Core structural finishes"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Architectural Inventory List */}
        <div className="flex flex-col gap-2.5 lg:col-span-5">
          {CURATED_SPACES.map((spaceDef) => {
            const activeSpace = getSpace(spaceDef.id);
            const isIncluded = activeSpace ? activeSpace.included : spaceDef.defaultCount > 0;
            const count = activeSpace ? activeSpace.count : spaceDef.defaultCount;
            const localizedName = t(spaceDef.nameKey) || spaceDef.defaultName;
            const localizedDesc = isRTL ? spaceDef.descAr : spaceDef.desc;

            return (
              <div
                key={spaceDef.id}
                onClick={() => handleToggle(spaceDef.id, localizedName, spaceDef.defaultCount)}
                className={cn(
                  "group flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 transition-all duration-200 cursor-pointer select-none",
                  isIncluded
                    ? "border-[#1C1917]/70 bg-[#FAF7F2] shadow-xs dark:border-[#FAF7F2]/50 dark:bg-[#1A1A1E]"
                    : "border-[#E2D7C8] bg-[#F4EEE5]/70 opacity-75 hover:opacity-100 hover:border-[#1C1917]/30 dark:border-[#2C2C32] dark:bg-[#222226]"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#EDE6DC]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={spaceDef.imageSrc}
                      alt={localizedName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="text-start">
                    <h4
                      className={cn(
                        "text-xs font-semibold tracking-tight transition-colors",
                        isIncluded ? "text-[#1C1917] dark:text-[#FAF7F2]" : "text-[#78716C] dark:text-[#989692]"
                      )}
                    >
                      {localizedName}
                    </h4>
                    <p className="text-[10px] text-[#8C847B] line-clamp-1 dark:text-[#989692]">
                      {localizedDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Quantity Counter or indicator */}
                  {spaceDef.hasCounter && isIncluded ? (
                    <div className="flex items-center gap-1.5 rounded-full border border-[#DFD6C7] bg-[#F4EEE5] px-2 py-0.5 shadow-2xs dark:border-[#2C2C32] dark:bg-[#24242A]">
                      <button
                        type="button"
                        onClick={() => handleCountChange(spaceDef.id, localizedName, -1)}
                        className="text-[#78716C] hover:text-[#1C1917] p-0.5 cursor-pointer dark:hover:text-[#FAF7F2]"
                        aria-label="Decrease count"
                      >
                        <Minus size={10} weight="bold" />
                      </button>
                      <span className="font-mono text-[11px] font-bold text-[#1C1917] dark:text-[#FAF7F2] min-w-[14px] text-center">
                        {count}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCountChange(spaceDef.id, localizedName, 1)}
                        className="text-[#78716C] hover:text-[#1C1917] p-0.5 cursor-pointer dark:hover:text-[#FAF7F2]"
                        aria-label="Increase count"
                      >
                        <Plus size={10} weight="bold" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-mono text-[10px] text-[#8C847B] dark:text-[#989692]">
                      Qty: {isIncluded ? count : 0}
                    </span>
                  )}

                  {/* Toggle Switch */}
                  <Switch
                    checked={isIncluded}
                    onCheckedChange={() => handleToggle(spaceDef.id, localizedName, spaceDef.defaultCount)}
                    aria-label={`Toggle ${localizedName}`}
                  />
                </div>
              </div>
            );
          })}

          {/* Custom user spaces */}
          {spaces
            .filter((s) => s.id.startsWith("custom_"))
            .map((customSpace) => (
              <div
                key={customSpace.id}
                onClick={() => handleToggle(customSpace.id, customSpace.name)}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-[#1C1917]/70 bg-[#FAF7F2] px-3.5 py-2.5 shadow-xs cursor-pointer dark:border-[#FAF7F2]/50 dark:bg-[#1A1A1E]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDE6DC] text-[#1C1917] dark:bg-[#2C2C32] dark:text-[#FAF7F2]">
                    <span className="font-serif text-xs font-bold">Custom</span>
                  </div>
                  <div className="text-start">
                    <h4 className="text-xs font-semibold text-[#1C1917] dark:text-[#FAF7F2]">
                      {customSpace.name}
                    </h4>
                    <span className="text-[10px] text-[#8C847B]">{isRTL ? "مساحة مخصصة" : "Bespoke zone"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={customSpace.included}
                    onCheckedChange={() => handleToggle(customSpace.id, customSpace.name)}
                    aria-label={`Toggle ${customSpace.name}`}
                  />
                </div>
              </div>
            ))}

          {/* Add Custom Architectural Space Button */}
          {showAddCustom ? (
            <form
              onSubmit={handleAddCustom}
              className="flex items-center gap-2 rounded-2xl border border-[#1C1917] bg-[#FAF7F2] p-2.5 shadow-xs animate-in fade-in duration-200 dark:border-[#FAF7F2] dark:bg-[#1A1A1E]"
            >
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={isRTL ? "مثال: غرفة سينما منزلية" : "e.g. Private Cinema, Library"}
                autoFocus
                className="flex-1 rounded-xl border border-[#DFD6C7] bg-[#F4EEE5] px-3 py-1.5 text-xs text-[#1C1917] outline-none dark:border-[#2C2C32] dark:bg-[#24242A] dark:text-[#FAF7F2]"
              />
              <button
                type="submit"
                className="rounded-full bg-[#1C1917] px-3.5 py-1.5 text-xs font-semibold text-[#FAF7F2] shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer dark:bg-[#FAF7F2] dark:text-[#1C1917]"
              >
                {t("step4.add_btn") || "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCustom(false);
                  setCustomName("");
                }}
                className="text-xs text-[#78716C] hover:text-[#1C1917] px-2 transition-colors cursor-pointer"
              >
                {t("step4.cancel_btn") || "Cancel"}
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddCustom(true)}
              className="group mt-1 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#DFD6C7] bg-[#F4EEE5]/60 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#78716C] transition-all duration-200 hover:border-[#1C1917]/50 hover:bg-[#FAF7F2] hover:text-[#1C1917] active:scale-[0.99] cursor-pointer dark:border-[#2C2C32] dark:bg-[#222226] dark:hover:text-[#FAF7F2]"
            >
              <Plus
                size={13}
                weight="bold"
                className="transition-transform duration-300 group-hover:rotate-90 text-[#1C1917] dark:text-[#FAF7F2]"
              />
              <span>{t("step3.add_custom_btn") || "+ Add Custom Architectural Space"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
