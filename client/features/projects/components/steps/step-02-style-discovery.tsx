"use client";

import * as React from "react";
import Image from "next/image";
import { Sparkle, Check, Plus, Trash } from "@phosphor-icons/react";
import { AESTHETIC_DIRECTIONS, StyleDirection } from "../aesthetic-direction";
import type { PendingStyleSelection } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface StepStyleDiscoveryProps {
  pendingStyles: PendingStyleSelection[];
  onChangePendingStyles: (styles: PendingStyleSelection[]) => void;
  primaryStyleId: string;
  onChangePrimaryStyleId: (id: string) => void;
}

const SPACE_CATEGORIES = [
  { key: "general", labelEn: "Overall Atmosphere", labelAr: "الجو العام للمشروع" },
  { key: "living", labelEn: "Living & Salon", labelAr: "غرفة المعيشة والصالون" },
  { key: "dining", labelEn: "Dining & Hospitality", labelAr: "غرفة السفرة والاستقبال" },
  { key: "master_bedroom", labelEn: "Master Bedroom Suite", labelAr: "جناح النوم الرئيسي" },
  { key: "kitchen", labelEn: "Kitchen & Bar", labelAr: "المطبخ وركن المشروبات" },
  { key: "terrace", labelEn: "Terrace & Outdoor", labelAr: "التراس والمساحة الخارجية" },
];

export function StepStyleDiscovery({
  pendingStyles,
  onChangePendingStyles,
  primaryStyleId,
  onChangePrimaryStyleId,
}: StepStyleDiscoveryProps) {
  const { isRTL } = useLanguage();
  const [activeCategory, setActiveCategory] = React.useState<string>("general");
  const [referenceUrlInput, setReferenceUrlInput] = React.useState("");

  const activeCategorySelection = pendingStyles.find(
    (s) => s.targetSpaceKey === activeCategory
  );

  const selectedDirectionId =
    activeCategorySelection?.styleId || primaryStyleId || "japandi";

  const selectedDirection =
    AESTHETIC_DIRECTIONS.find((d) => d.id === selectedDirectionId) ||
    AESTHETIC_DIRECTIONS[0];

  const handleSelectStyle = (direction: StyleDirection) => {
    if (activeCategory === "general") {
      onChangePrimaryStyleId(direction.id);
      // Update general entry or add it
      const existing = pendingStyles.filter((s) => s.targetSpaceKey !== "general");
      onChangePendingStyles([
        ...existing,
        {
          targetSpaceKey: "general",
          styleId: direction.id,
          styleName: direction.name,
          referenceImages: activeCategorySelection?.referenceImages || [direction.heroImage],
          notes: activeCategorySelection?.notes || "",
        },
      ]);
    } else {
      const existing = pendingStyles.filter((s) => s.targetSpaceKey !== activeCategory);
      onChangePendingStyles([
        ...existing,
        {
          targetSpaceKey: activeCategory,
          styleId: direction.id,
          styleName: direction.name,
          referenceImages: activeCategorySelection?.referenceImages || [direction.heroImage],
          notes: activeCategorySelection?.notes || "",
        },
      ]);
    }
  };

  const handleAddReferenceImage = () => {
    if (!referenceUrlInput.trim()) return;
    const current = activeCategorySelection || {
      targetSpaceKey: activeCategory,
      styleId: selectedDirectionId,
      styleName: selectedDirection.name,
      referenceImages: [],
      notes: "",
    };

    const updated = {
      ...current,
      referenceImages: [...(current.referenceImages || []), referenceUrlInput.trim()],
    };

    const rest = pendingStyles.filter((s) => s.targetSpaceKey !== activeCategory);
    onChangePendingStyles([...rest, updated]);
    setReferenceUrlInput("");
  };

  const handleRemoveReferenceImage = (imgUrl: string) => {
    if (!activeCategorySelection) return;
    const updated = {
      ...activeCategorySelection,
      referenceImages: activeCategorySelection.referenceImages.filter((u) => u !== imgUrl),
    };
    const rest = pendingStyles.filter((s) => s.targetSpaceKey !== activeCategory);
    onChangePendingStyles([...rest, updated]);
  };

  const handleNotesChange = (notes: string) => {
    const current = activeCategorySelection || {
      targetSpaceKey: activeCategory,
      styleId: selectedDirectionId,
      styleName: selectedDirection.name,
      referenceImages: [selectedDirection.heroImage],
      notes: "",
    };
    const updated = { ...current, notes };
    const rest = pendingStyles.filter((s) => s.targetSpaceKey !== activeCategory);
    onChangePendingStyles([...rest, updated]);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78716C] dark:text-[#989692]">
            {isRTL ? "الخطوة ٠٢ · استكشاف الطراز والمواد" : "STEP 02 · STYLE DISCOVERY"}
          </span>
        </div>
        <h2 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#1C1917] dark:text-[#FAF7F2]">
          {isRTL ? "ما هو الطراز الذي يشبهك؟" : "What feels like you?"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#78716C] dark:text-[#989692] leading-relaxed max-w-xl">
          {isRTL
            ? "اختر التوجه الجمالي العام لمشروعك، أو حدد طابعاً خاصاً لكل فراغ معماري رئيسي مع رفع صور الإلهام المفضلة لديك."
            : "Define the overarching aesthetic spirit or tailor individual moods per space, paired with curated materials and reference photography."}
        </p>
      </div>

      {/* Space Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E6DDD2]/60 dark:border-[#38332E]">
        {SPACE_CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.key;
          const hasCustom = pendingStyles.some((s) => s.targetSpaceKey === cat.key);
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                isSelected
                  ? "bg-[#503C2C] text-[#FAF7F2] shadow-sm"
                  : "bg-[#F4EEE5] dark:bg-[#25221F] text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] hover:bg-[#EAE2D7]"
              )}
            >
              <span>{isRTL ? cat.labelAr : cat.labelEn}</span>
              {hasCustom && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#B88460]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Aesthetic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {AESTHETIC_DIRECTIONS.map((direction) => {
          const isSelected = selectedDirectionId === direction.id;
          return (
            <div
              key={direction.id}
              onClick={() => handleSelectStyle(direction)}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 bg-[#FAF7F2] dark:bg-[#1E1B18]",
                isSelected
                  ? "border-[#503C2C] dark:border-[#B88460] shadow-md ring-1 ring-[#503C2C]/20"
                  : "border-[#E6DDD2]/80 dark:border-[#2E2A27] hover:border-[#B88460]/60 hover:shadow-sm"
              )}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={direction.heroImage}
                  alt={isRTL ? direction.nameAr : direction.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Active check pill */}
                {isSelected && (
                  <div className="absolute top-3 end-3 flex items-center gap-1 bg-[#503C2C] text-[#FAF7F2] text-[11px] font-medium px-2.5 py-1 rounded-full shadow-md">
                    <Check weight="bold" className="w-3.5 h-3.5 text-[#B88460]" />
                    <span>{isRTL ? "محدد" : "Selected"}</span>
                  </div>
                )}

                <div className="absolute bottom-3 start-4 end-4 text-white">
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#E0CFB8]">
                    {isRTL ? direction.subtitleAr : direction.subtitle}
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-normal leading-tight mt-0.5">
                    {isRTL ? direction.nameAr : direction.name}
                  </h3>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex flex-col gap-3">
                <p className="text-xs text-[#78716C] dark:text-[#A8A29E] leading-relaxed">
                  {isRTL ? direction.descriptionAr : direction.description}
                </p>

                {/* Material Palette Swatches */}
                <div className="pt-2 border-t border-[#E6DDD2]/50 dark:border-[#2E2A27] flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#78716C] dark:text-[#8C827A]">
                    {isRTL ? "الخامات الرئيسية" : "Signature Materials"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {direction.materials.map((mat, i) => (
                      <div
                        key={i}
                        title={isRTL ? mat.nameAr : mat.name}
                        className="w-4 h-4 rounded-full border border-black/10 shadow-inner"
                        style={{ backgroundColor: mat.color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reference Images & Space Notes Box */}
      <div className="rounded-2xl border border-[#E6DDD2] dark:border-[#2E2A27] bg-[#FAF7F2] dark:bg-[#1E1B18] p-5 sm:p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkle className="w-4 h-4 text-[#B88460]" />
            <h4 className="font-serif text-base sm:text-lg text-[#1C1917] dark:text-[#FAF7F2]">
              {isRTL
                ? `تخصيص صور وإلهام لـ (${SPACE_CATEGORIES.find((c) => c.key === activeCategory)?.labelAr})`
                : `Custom Moodboard for ${SPACE_CATEGORIES.find((c) => c.key === activeCategory)?.labelEn}`}
            </h4>
          </div>
          <span className="text-[11px] font-mono text-[#78716C]">
            {isRTL ? "اختياري" : "Optional"}
          </span>
        </div>

        {/* Reference Image Gallery */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-medium text-[#503C2C] dark:text-[#D4C3B3]">
            {isRTL ? "صور مرجعية وروابط إلهام (Pinterest / Instagram / Unsplash)" : "Reference photos & moodboard links"}
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={referenceUrlInput}
              onChange={(e) => setReferenceUrlInput(e.target.value)}
              placeholder={isRTL ? "أدخل رابط صورة للإلهام..." : "Paste reference image URL (https://...)"}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-[#E6DDD2] dark:border-[#38332E] bg-white dark:bg-[#141210] text-[#1C1917] dark:text-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#B88460]"
            />
            <button
              type="button"
              onClick={handleAddReferenceImage}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#503C2C] text-[#FAF7F2] text-xs font-medium hover:bg-[#3D2E22] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isRTL ? "إضافة" : "Add"}</span>
            </button>
          </div>

          {activeCategorySelection?.referenceImages && activeCategorySelection.referenceImages.length > 0 && (
            <div className="flex flex-wrap gap-2.5 pt-2">
              {activeCategorySelection.referenceImages.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative w-20 h-20 rounded-xl overflow-hidden border border-[#E6DDD2] dark:border-[#38332E]"
                >
                  <Image
                    src={img}
                    alt="Reference"
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="80px"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveReferenceImage(img)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  >
                    <Trash className="w-4 h-4 text-rose-300" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Space notes */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#503C2C] dark:text-[#D4C3B3]">
            {isRTL ? "ملاحظات وتفضيلات خاصة لهذا الفراغ" : "Specific preferences or wishes for this space"}
          </label>
          <textarea
            rows={2}
            value={activeCategorySelection?.notes || ""}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder={
              isRTL
                ? "مثال: أريد خشب داكن مع إضاءة خافتة، ونوافذ ممتدة تسمح بمرور أكبر قدر من الضوء..."
                : "e.g., Prefers fluted oak paneling, indirect warm cove lighting, and open layout connecting to terrace..."
            }
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E6DDD2] dark:border-[#38332E] bg-white dark:bg-[#141210] text-[#1C1917] dark:text-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#B88460] resize-none"
          />
        </div>
      </div>
    </div>
  );
}
