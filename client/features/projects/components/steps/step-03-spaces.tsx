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
          <span
            className={cn(
              "text-[#78716C]",
              isRTL
                ? "font-sans text-xs font-bold tracking-normal text-[#503C2C]"
                : "font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
            )}
          >
            {isRTL ? "الخطوة ٠٣ · الفراغات المعمارية" : "STEP 03 · SPATIAL PROGRAM"}
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
          {isRTL ? "ما الفراغات التي تود إدراجها؟" : "Which spaces shall we shape?"}
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
            ? "حدد الغرف والأجنحة التي يشملها المشروع. يتم ربط الطراز المختار مسبقاً بكل فراغ بشكل تلقائي."
            : "Select the architectural zones to be designed. Styles selected previously are automatically aligned to their respective zones."}
        </p>
      </div>

      {/* Spatial Summary Metrics Card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div>
          <span
            className={cn(
              "text-[#78716C]",
              isRTL
                ? "font-sans text-xs font-bold tracking-normal text-[#503C2C]"
                : "font-mono text-[9px] uppercase tracking-wider"
            )}
          >
            {isRTL ? "إجمالي الفراغات المعتمدة" : "Active Spatial Zones"}
          </span>
          <div
            className={cn(
              "text-[#1C1917] mt-0.5",
              isRTL
                ? "font-sans text-xl sm:text-2xl font-bold"
                : "font-serif text-xl sm:text-2xl"
            )}
          >
            {totalSelectedRooms} {isRTL ? "غرف / أجنحة" : "Zones"}
          </div>
        </div>
        <div>
          <span
            className={cn(
              "text-[#78716C]",
              isRTL
                ? "font-sans text-xs font-bold tracking-normal text-[#503C2C]"
                : "font-mono text-[9px] uppercase tracking-wider"
            )}
          >
            {isRTL ? "المساحة التقريبية" : "Est. Surface Area"}
          </span>
          <div
            className={cn(
              "text-[#1C1917] mt-0.5",
              isRTL
                ? "font-sans text-xl sm:text-2xl font-bold"
                : "font-serif text-xl sm:text-2xl"
            )}
          >
            {areaSqm || 450} {isRTL ? "م²" : "m²"}
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span
            className={cn(
              "text-[#78716C]",
              isRTL
                ? "font-sans text-xs font-bold tracking-normal text-[#503C2C]"
                : "font-mono text-[9px] uppercase tracking-wider"
            )}
          >
            {isRTL ? "حالة التوزيع" : "Spatial Density"}
          </span>
          <div
            className={cn(
              "text-xs sm:text-sm text-[#B88460] mt-1 flex items-center gap-1.5",
              isRTL ? "font-bold" : "font-medium"
            )}
          >
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
                "p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 bg-card",
                isIncluded
                  ? "border-[#503C2C]/50 shadow-sm"
                  : "border-border/70 opacity-75 hover:opacity-100"
              )}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border">
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
                          "px-2 py-0.5 rounded bg-[#EAE2D7] text-[#503C2C] shrink-0",
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
                        ? "text-xs font-medium text-[#503C2C]"
                        : "text-[11px] text-[#78716C]"
                    )}
                  >
                    {isRTL ? curated.descAr : curated.desc}
                  </p>
                </div>
              </div>

              {/* Actions: Counter or Switch */}
              <div className="flex items-center gap-2.5 shrink-0">
                {curated.hasCounter ? (
                  <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-2 py-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(curated.id, -1)}
                      className="p-1 text-[#78716C] hover:text-[#1C1917] transition-colors"
                      disabled={quantity <= 0}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold w-4 text-center text-[#1C1917]">
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
              className="p-4 rounded-2xl border border-[#503C2C]/50 bg-card flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
                  <HouseLine className="w-5 h-5 text-[#503C2C]" />
                </div>
                <div>
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
                <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-2 py-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(custom.id, -1)}
                    className="p-1 text-[#78716C] hover:text-[#1C1917]"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono text-xs font-bold w-4 text-center">
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
      <div className="flex gap-2 p-3 rounded-2xl bg-card border border-dashed border-border">
        <input
          type="text"
          value={customSpaceName}
          onChange={(e) => setCustomSpaceName(e.target.value)}
          placeholder={
            isRTL
              ? "إضافة فراغ مخصص (مثل: غرفة سينما، سبا، غرفة ملابس إضافية)..."
              : "Add bespoke room (e.g. Cinema Room, Private Spa, Cigar Lounge)..."
          }
          className={cn(
            "flex-1 px-3.5 py-2 rounded-xl border border-border bg-background text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#B88460]",
            isRTL ? "text-xs font-medium" : "text-xs"
          )}
        />
        <button
          type="button"
          onClick={handleAddCustomSpace}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#503C2C] text-[#FAF7F2] hover:bg-[#3D2E22] transition-colors cursor-pointer",
            isRTL ? "text-xs font-bold tracking-normal" : "text-xs font-medium"
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isRTL ? "إضافة فراغ" : "Add Space"}</span>
        </button>
      </div>
    </div>
  );
}
