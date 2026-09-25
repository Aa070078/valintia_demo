"use client";

import * as React from "react";
import Image from "next/image";
import { Plus, Minus, HouseLine } from "@phosphor-icons/react";
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

  // Map pending styles to spaces if not already assigned
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
          return {
            ...s,
            included: nextIncluded,
            quantity: nextIncluded && s.quantity === 0 ? 1 : s.quantity,
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
          const newQty = Math.max(0, (s.quantity ?? s.count ?? 1) + delta);
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
    .filter((s) => s.included)
    .reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78716C] dark:text-[#989692]">
            {isRTL ? "الخطوة ٠٣ · الفراغات المعمارية" : "STEP 03 · SPATIAL PROGRAM"}
          </span>
        </div>
        <h2 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#1C1917] dark:text-[#FAF7F2]">
          {isRTL ? "ما الفراغات التي تود إدراجها؟" : "Which spaces shall we shape?"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#78716C] dark:text-[#989692] leading-relaxed max-w-xl">
          {isRTL
            ? "حدد الغرف والأجنحة التي يشملها المشروع. يتم ربط الطراز المختار مسبقاً بكل فراغ بشكل تلقائي."
            : "Select the architectural zones to be designed. Styles selected previously are automatically aligned to their respective zones."}
        </p>
      </div>

      {/* Spatial Summary Metrics Card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD2] dark:border-[#2E2A27]">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#78716C] dark:text-[#8C827A]">
            {isRTL ? "إجمالي الفراغات المعتمدة" : "Active Spatial Zones"}
          </span>
          <div className="text-xl sm:text-2xl font-serif text-[#1C1917] dark:text-[#FAF7F2] mt-0.5">
            {totalSelectedRooms} {isRTL ? "غرف / أجنحة" : "Zones"}
          </div>
        </div>
        <div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#78716C] dark:text-[#8C827A]">
            {isRTL ? "المساحة التقريبية" : "Est. Surface Area"}
          </span>
          <div className="text-xl sm:text-2xl font-serif text-[#1C1917] dark:text-[#FAF7F2] mt-0.5">
            {areaSqm || 450} m²
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#78716C] dark:text-[#8C827A]">
            {isRTL ? "حالة التوزيع" : "Spatial Density"}
          </span>
          <div className="text-xs sm:text-sm font-medium text-[#B88460] mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B88460]" />
            <span>{isRTL ? "توزيع هندسي متوازن" : "Optimum Volumetric Flow"}</span>
          </div>
        </div>
      </div>

      {/* Spaces List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {CURATED_SPACES.map((curated) => {
          const existing = spaces.find((s) => s.id === curated.id);
          const isIncluded = existing ? existing.included : false;
          const quantity = existing?.quantity ?? existing?.count ?? curated.defaultCount;
          const assignedStyle = getStyleForSpace(curated.id);

          return (
            <div
              key={curated.id}
              className={cn(
                "p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 bg-[#FAF7F2] dark:bg-[#1E1B18]",
                isIncluded
                  ? "border-[#503C2C]/50 dark:border-[#B88460]/60 shadow-sm"
                  : "border-[#E6DDD2]/60 dark:border-[#2E2A27] opacity-70 hover:opacity-100"
              )}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#E6DDD2]/80 dark:border-[#38332E]">
                  <Image
                    src={curated.imageSrc}
                    alt={curated.defaultName}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-[#1C1917] dark:text-[#FAF7F2] truncate">
                      {t(curated.nameKey) || curated.defaultName}
                    </h4>
                    {assignedStyle && isIncluded && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#EAE2D7] dark:bg-[#2C2723] text-[#503C2C] dark:text-[#D4C3B3] shrink-0">
                        {assignedStyle}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#78716C] dark:text-[#989692] truncate mt-0.5">
                    {isRTL ? curated.descAr : curated.desc}
                  </p>
                </div>
              </div>

              {/* Actions: Counter or Switch */}
              <div className="flex items-center gap-2.5 shrink-0">
                {curated.hasCounter ? (
                  <div className="flex items-center gap-2 bg-white dark:bg-[#141210] border border-[#E6DDD2] dark:border-[#38332E] rounded-xl px-2 py-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(curated.id, -1)}
                      className="p-1 text-[#78716C] hover:text-[#1C1917] transition-colors"
                      disabled={quantity <= 0}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-semibold w-4 text-center text-[#1C1917] dark:text-[#FAF7F2]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(curated.id, 1)}
                      className="p-1 text-[#78716C] hover:text-[#1C1917] transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <Switch
                    checked={isIncluded}
                    onCheckedChange={() => toggleSpace(curated.id, isIncluded)}
                  />
                )}
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
              className="p-4 rounded-2xl border border-[#503C2C]/50 dark:border-[#B88460]/60 bg-[#FAF7F2] dark:bg-[#1E1B18] flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F4EEE5] dark:bg-[#25221F] border border-[#E6DDD2] dark:border-[#38332E] flex items-center justify-center shrink-0">
                  <HouseLine className="w-5 h-5 text-[#503C2C] dark:text-[#B88460]" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#1C1917] dark:text-[#FAF7F2]">
                    {custom.customName}
                  </h4>
                  <span className="font-mono text-[10px] text-[#78716C]">
                    {isRTL ? "فراغ معماري مخصص" : "Bespoke Space"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white dark:bg-[#141210] border border-[#E6DDD2] dark:border-[#38332E] rounded-xl px-2 py-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(custom.id, -1)}
                    className="p-1 text-[#78716C] hover:text-[#1C1917]"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono text-xs font-semibold w-4 text-center">
                    {custom.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(custom.id, 1)}
                    className="p-1 text-[#78716C] hover:text-[#1C1917]"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Add Custom Space input */}
      <div className="flex gap-2 p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-dashed border-[#E6DDD2] dark:border-[#38332E]">
        <input
          type="text"
          value={customSpaceName}
          onChange={(e) => setCustomSpaceName(e.target.value)}
          placeholder={
            isRTL
              ? "إضافة فراغ مخصص (مثل: غرفة سينما، سبا، غرفة ملابس إضافية)..."
              : "Add bespoke room (e.g. Cinema Room, Private Spa, Cigar Lounge)..."
          }
          className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-[#E6DDD2] dark:border-[#38332E] bg-white dark:bg-[#141210] text-[#1C1917] dark:text-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#B88460]"
        />
        <button
          type="button"
          onClick={handleAddCustomSpace}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#503C2C] text-[#FAF7F2] text-xs font-medium hover:bg-[#3D2E22] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isRTL ? "إضافة فراغ" : "Add Space"}</span>
        </button>
      </div>
    </div>
  );
}
