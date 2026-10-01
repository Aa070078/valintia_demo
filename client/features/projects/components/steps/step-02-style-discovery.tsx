"use client";

import * as React from "react";
import Image from "next/image";
import {
  Check,
  X,
  Heart,
  Eye,
  Compass,
  WarningCircle,
} from "@phosphor-icons/react";
import { AESTHETIC_DIRECTIONS, StyleDirection } from "../aesthetic-direction";
import type { SpaceEntity, PendingStyleSelection } from "../../types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";
import { getSpaceDisplayName } from "../../lib/space-names";

interface StepStyleDiscoveryProps {
  pendingStyles: PendingStyleSelection[];
  onChangePendingStyles: (styles: PendingStyleSelection[]) => void;
  primaryStyleId: string;
  onChangePrimaryStyleId: (id: string) => void;
  spaces?: SpaceEntity[];
}

type StyleStrategy = "unified" | "per_space" | "designer";

export function StepStyleDiscovery({
  pendingStyles,
  onChangePendingStyles,
  primaryStyleId,
  onChangePrimaryStyleId,
  spaces = [],
}: StepStyleDiscoveryProps) {
  const { t, isRTL } = useLanguage();

  // Determine initial strategy based on current pendingStyles
  const [strategy, setStrategy] = React.useState<StyleStrategy>(() => {
    const hasPerSpace = pendingStyles.some(
      (s) => s.targetSpaceKey !== "general" && s.targetSpaceKey !== "designer_curated"
    );
    if (hasPerSpace) return "per_space";
    const hasDesigner = pendingStyles.some((s) => s.targetSpaceKey === "designer_curated");
    if (hasDesigner) return "designer";
    return "unified";
  });

  // State for active gallery modal
  const [activeGalleryDirection, setActiveGalleryDirection] =
    React.useState<StyleDirection | null>(null);

  // Gallery active preview image
  const [selectedGalleryImgIndex, setSelectedGalleryImgIndex] = React.useState<number>(0);

  const [tempAssignedSpaceIds, setTempAssignedSpaceIds] = React.useState<string[]>([]);

  // Designer notes state
  const [designerNotes, setDesignerNotes] = React.useState<string>(() => {
    const found = pendingStyles.find((s) => s.targetSpaceKey === "designer_curated");
    return found?.notes || "";
  });

  // Filter only included spaces for assignment (checking count/quantity > 0 as well)
  const activeSpaces = spaces.filter(
    (s) => s.included !== false && (Number(s.quantity ?? s.count ?? 0) > 0 || s.included === true)
  );

  // Real-time space coverage analysis for per_space mode
  const assignedPerSpaceCount = activeSpaces.filter((space) =>
    pendingStyles.some(
      (p) =>
        p.targetSpaceKey === space.id &&
        p.targetSpaceKey !== "general" &&
        p.targetSpaceKey !== "designer_curated" &&
        Boolean(p.styleId && p.styleId.trim().length > 0)
    )
  ).length;

  const unassignedSpaces = activeSpaces.filter(
    (space) =>
      !pendingStyles.some(
        (p) =>
          p.targetSpaceKey === space.id &&
          p.targetSpaceKey !== "general" &&
          p.targetSpaceKey !== "designer_curated" &&
          Boolean(p.styleId && p.styleId.trim().length > 0)
      )
  );

  const unassignedSpaceIds = unassignedSpaces.map((s) => s.id);

  const coveragePercent =
    activeSpaces.length > 0
      ? Math.min(100, Math.round((assignedPerSpaceCount / activeSpaces.length) * 100))
      : 0;

  const isPerSpaceFullyCovered = activeSpaces.length > 0 && unassignedSpaces.length === 0;

  // Open modal and pre-populate selected spaces for this style
  const handleOpenGallery = (direction: StyleDirection) => {
    setActiveGalleryDirection(direction);
    setSelectedGalleryImgIndex(0);

    if (strategy === "per_space") {
      // Find all spaces currently assigned to this style
      const currentlyAssigned = pendingStyles
        .filter(
          (s) =>
            s.styleId === direction.id &&
            s.targetSpaceKey !== "general" &&
            s.targetSpaceKey !== "designer_curated"
        )
        .map((s) => s.targetSpaceKey);
      setTempAssignedSpaceIds(currentlyAssigned);
    }
  };

  // Confirm Unified Style for All
  const handleConfirmUnified = (direction: StyleDirection) => {
    onChangePrimaryStyleId(direction.id);
    onChangePendingStyles([
      {
        targetSpaceKey: "general",
        styleId: direction.id,
        styleName: isRTL ? direction.nameAr : direction.name,
        referenceImages: direction.galleryImages || [direction.heroImage],
        notes: "",
      },
    ]);
    setActiveGalleryDirection(null);
  };

  // Strategy switcher helper
  const handleSelectStrategy = (newStrategy: StyleStrategy) => {
    setStrategy(newStrategy);
    if (newStrategy === "unified") {
      const selectedDir =
        AESTHETIC_DIRECTIONS.find((d) => d.id === primaryStyleId) || AESTHETIC_DIRECTIONS[0];
      onChangePrimaryStyleId(selectedDir.id);
      onChangePendingStyles([
        {
          targetSpaceKey: "general",
          styleId: selectedDir.id,
          styleName: isRTL ? selectedDir.nameAr : selectedDir.name,
          referenceImages: selectedDir.galleryImages || [selectedDir.heroImage],
          notes: "",
        },
      ]);
    } else if (newStrategy === "per_space") {
      // Remove 'general' or 'designer_curated' so per-space mode enforces real per-space coverage
      const existingPerSpace = pendingStyles.filter(
        (s) => s.targetSpaceKey !== "general" && s.targetSpaceKey !== "designer_curated"
      );
      onChangePendingStyles(existingPerSpace);
    } else if (newStrategy === "designer") {
      handleSaveDesignerMode(designerNotes);
    }
  };

  // Toggle space in per-space modal
  const handleToggleSpaceAssignment = (spaceId: string) => {
    setTempAssignedSpaceIds((prev) =>
      prev.includes(spaceId) ? prev.filter((id) => id !== spaceId) : [...prev, spaceId]
    );
  };

  // Confirm Per-Space Assignment
  const handleConfirmPerSpace = (direction: StyleDirection) => {
    // Keep pending styles that:
    // 1) are not general or designer_curated
    // 2) do NOT target any space in tempAssignedSpaceIds (as those are being assigned to this style)
    // 3) were NOT previously assigned to this direction.id (if they are unchecked in tempAssignedSpaceIds now, they should be cleared!)
    const remainingStyles = pendingStyles.filter(
      (s) =>
        s.targetSpaceKey !== "general" &&
        s.targetSpaceKey !== "designer_curated" &&
        !tempAssignedSpaceIds.includes(s.targetSpaceKey) &&
        s.styleId !== direction.id
    );

    // Create new assignments for this style
    const newAssignments: PendingStyleSelection[] = tempAssignedSpaceIds.map((spaceId) => {
      const spaceObj = spaces.find((s) => s.id === spaceId);
      const spaceName = getSpaceDisplayName(spaceObj || spaceId, isRTL);
      return {
        targetSpaceKey: spaceId,
        styleId: direction.id,
        styleName: isRTL ? direction.nameAr : direction.name,
        referenceImages: direction.galleryImages || [direction.heroImage],
        notes: spaceName,
      };
    });

    onChangePrimaryStyleId(direction.id);
    onChangePendingStyles([...remainingStyles, ...newAssignments]);
    setActiveGalleryDirection(null);
  };

  // Save Designer Notes
  const handleSaveDesignerMode = (notes: string) => {
    setDesignerNotes(notes);
    onChangePendingStyles([
      {
        targetSpaceKey: "designer_curated",
        styleId: "designer_curated",
        styleName: isRTL ? "باختيار مهندسي فالنتيا" : "Atelier Curated",
        referenceImages: [],
        notes,
      },
    ]);
  };

  // Get spaces assigned to a specific style
  const getAssignedSpacesForStyle = (styleId: string): string[] => {
    return pendingStyles
      .filter((s) => s.styleId === styleId && s.targetSpaceKey !== "general")
      .map((s) => {
        const space = spaces.find((sp) => sp.id === s.targetSpaceKey);
        return getSpaceDisplayName(space || s.targetSpaceKey, isRTL);
      });
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Header matching Reference */}
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
            {isRTL ? "الخطوة الثانية • الستايل والخامات" : "04 — 06 YOUR STYLE"}
          </span>
        </div>
        <h2 className="mt-2 text-[#1C1917] font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight">
          {isRTL ? "اختار الستايل اللي يليق ببيتك" : "Discover your style"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#78716C] font-normal leading-relaxed max-w-xl">
          {isRTL
            ? "اختار الستايل الأقرب لذوقك، وتقدر تتفرج على صور ومساحات كل ستايل وتطبقه على البيت كله أو تختار ستايل مختلف لكل غرفة."
            : "Explore architectural styles that match your taste. Browse galleries and apply across your residence or per space."}
        </p>
      </div>

      {/* Strategy Selector (3 Options) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Option 1: Unified */}
        <button
          type="button"
          onClick={() => handleSelectStrategy("unified")}
          className={cn(
            "p-4 rounded-2xl border text-start transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 select-none",
            strategy === "unified"
              ? "border-primary bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20"
              : "border-border bg-card text-foreground hover:bg-secondary/70 hover:border-foreground/30"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">
              {t("style_strategy.unified_title") || (isRTL ? "ستايل موحد للبيت كله" : "Single Style for All")}
            </span>
            <div
              className={cn(
                "h-4 w-4 rounded-full border flex items-center justify-center",
                strategy === "unified"
                  ? "border-primary-foreground bg-primary-foreground text-primary"
                  : "border-border"
              )}
            >
              {strategy === "unified" && <div className="h-2 w-2 rounded-full bg-primary" />}
            </div>
          </div>
          <p
            className={cn(
              "text-[11px] leading-relaxed font-normal",
              strategy === "unified" ? "text-primary-foreground/90 font-normal" : "text-[#78716C]"
            )}
          >
            {t("style_strategy.unified_desc") ||
              (isRTL
                ? "ستايل واحد متناسق يمشي بسلاسة في كل غرف ومساحات بيتك."
                : "One coherent aesthetic language applied seamlessly across all spaces.")}
          </p>
        </button>

        {/* Option 2: Per Space */}
        <button
          type="button"
          onClick={() => handleSelectStrategy("per_space")}
          className={cn(
            "p-4 rounded-2xl border text-start transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 select-none",
            strategy === "per_space"
              ? "border-primary bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20"
              : "border-border bg-card text-foreground hover:bg-secondary/70 hover:border-foreground/30"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">
              {t("style_strategy.per_space_title") || (isRTL ? "ستايل مختلف لكل غرفة" : "Curate Per Space")}
            </span>
            <div
              className={cn(
                "h-4 w-4 rounded-full border flex items-center justify-center",
                strategy === "per_space"
                  ? "border-primary-foreground bg-primary-foreground text-primary"
                  : "border-border"
              )}
            >
              {strategy === "per_space" && <div className="h-2 w-2 rounded-full bg-primary" />}
            </div>
          </div>
          <p
            className={cn(
              "text-[11px] leading-relaxed font-normal",
              strategy === "per_space" ? "text-primary-foreground/90 font-normal" : "text-[#78716C]"
            )}
          >
            {t("style_strategy.per_space_desc") ||
              (isRTL
                ? "تختار ستايل وخامات مستقلة لكل غرفة أو جناح حسب طبيعة استخدامها."
                : "Assign bespoke styles and materials to individual rooms and zones.")}
          </p>
        </button>

        {/* Option 3: Designer Choice */}
        <button
          type="button"
          onClick={() => handleSelectStrategy("designer")}
          className={cn(
            "p-4 rounded-2xl border text-start transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 select-none",
            strategy === "designer"
              ? "border-primary bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20"
              : "border-border bg-card text-foreground hover:bg-secondary/70 hover:border-foreground/30"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">
              {t("style_strategy.designer_title") || (isRTL ? "سيب الاختيار لمهندسينا" : "Let Designer Curate")}
            </span>
            <div
              className={cn(
                "h-4 w-4 rounded-full border flex items-center justify-center",
                strategy === "designer"
                  ? "border-primary-foreground bg-primary-foreground text-primary"
                  : "border-border"
              )}
            >
              {strategy === "designer" && <div className="h-2 w-2 rounded-full bg-primary" />}
            </div>
          </div>
          <p
            className={cn(
              "text-[11px] leading-relaxed font-normal",
              strategy === "designer" ? "text-primary-foreground/90 font-normal" : "text-[#78716C]"
            )}
          >
            {t("style_strategy.designer_desc") ||
              (isRTL
                ? "مهندسي فالنتيا هيقترحوا الستايل الأنسب لمساحة بيتك وتوزيع الإضاءة الطبيعية."
                : "Valentia Atelier leads curate based on lighting, volumes and orientation.")}
          </p>
        </button>
      </div>

      {/* Real-time Spaces Coverage & Allocation Tracker (When Per-Space Mode is Active) */}
      {strategy === "per_space" && (
        <div className="p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs flex flex-col gap-4 text-start">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <h3 className="text-base sm:text-lg font-serif font-medium text-[#1C1917]">
                  {isRTL ? "مؤشر تغطية ستايل الغرف والمساحات" : "Spaces Style Allocation Progress"}
                </h3>
              </div>
              <p className="text-xs text-[#78716C] mt-0.5 font-normal">
                {isRTL
                  ? "يجب اختيار ستايل لكل غرفة من الغرف المحددة قبل الانتقال للخطوة التالية."
                  : "Every active space must have an assigned aesthetic direction before moving forward."}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold",
                  isPerSpaceFullyCovered
                    ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30"
                )}
              >
                {assignedPerSpaceCount} / {activeSpaces.length} {isRTL ? "غرف مكتملة" : "spaces styled"} ({coveragePercent}%)
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                isPerSpaceFullyCovered ? "bg-emerald-600" : "bg-primary"
              )}
              style={{ width: `${coveragePercent}%` }}
            />
          </div>

          {/* Spaces Pill Grid showing each space and its current allocation */}
          <div className="flex flex-wrap gap-2 pt-1">
            {activeSpaces.map((space) => {
              const spaceName = getSpaceDisplayName(space, isRTL);
              const assignedStyle = pendingStyles.find(
                (p) =>
                  p.targetSpaceKey === space.id &&
                  p.targetSpaceKey !== "general" &&
                  p.targetSpaceKey !== "designer_curated" &&
                  Boolean(p.styleId && p.styleId.trim().length > 0)
              );
              const styleDir = assignedStyle
                ? AESTHETIC_DIRECTIONS.find((d) => d.id === assignedStyle.styleId)
                : undefined;
              const styleDisplayName = styleDir
                ? isRTL
                  ? styleDir.nameAr
                  : styleDir.name
                : assignedStyle?.styleName;

              return (
                <div
                  key={space.id}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all",
                    assignedStyle
                      ? "bg-[#F7F2EB] dark:bg-stone-900 border-[#D8C8B4] text-[#503C2C] dark:text-stone-200 font-medium"
                      : "bg-amber-500/10 border-amber-400/50 text-amber-900 dark:text-amber-200"
                  )}
                >
                  <span className="font-medium">{spaceName}:</span>
                  {assignedStyle ? (
                    <span className="font-semibold text-primary underline decoration-primary/30">
                      {styleDisplayName}
                    </span>
                  ) : (
                    <span className="font-normal text-amber-800 dark:text-amber-300 italic flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      {isRTL ? "يحتاج ستايل" : "Needs style"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Alert if incomplete */}
          {!isPerSpaceFullyCovered && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <WarningCircle size={17} weight="bold" className="shrink-0 text-amber-700 dark:text-amber-400" />
              <span>
                {isRTL
                  ? `متبقي (${unassignedSpaces.length}) غرف بدون ستايل. افتح أي ستايل بالأسفل وخصصه للغرف المتبقية لتتمكن من المتابعة.`
                  : `There are ${unassignedSpaces.length} unassigned spaces remaining. Open any style card below to assign them before proceeding.`}
              </span>
            </div>
          )}

          {/* Success if 100% complete */}
          {isPerSpaceFullyCovered && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <Check size={16} weight="bold" className="text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span className="font-medium">
                {isRTL
                  ? "تم تحديد الستايل لجميع الغرف بنجاح (جاهز للمتابعة للخطوة التالية)!"
                  : "All spaces have an assigned style direction (Ready to proceed to next step)!"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* STRATEGY 1 & 2: Style Cards Grid */}
      {(strategy === "unified" || strategy === "per_space") && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AESTHETIC_DIRECTIONS.map((direction) => {
            const isSelectedPrimary = primaryStyleId === direction.id;
            const assignedSpaces = getAssignedSpacesForStyle(direction.id);
            const hasAssignedSpaces = assignedSpaces.length > 0;

            const isCardActive =
              strategy === "unified" ? isSelectedPrimary : hasAssignedSpaces;

            return (
              <div
                key={direction.id}
                onClick={() => handleOpenGallery(direction)}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-3xl border bg-card transition-all duration-300 cursor-pointer shadow-xs hover:shadow-editorial hover:-translate-y-1 select-none text-start",
                  isCardActive
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-foreground/40"
                )}
              >
                {/* Hero Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <Image
                    src={direction.heroImage}
                    alt={isRTL ? direction.nameAr : direction.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                  {/* Top Right Save / Heart Badge */}
                  <div className="absolute top-3.5 right-3.5 z-10">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#1C1917] backdrop-blur-md shadow-xs transition-transform group-hover:scale-110">
                      <Heart size={15} weight={isCardActive ? "fill" : "regular"} className={isCardActive ? "text-rose-600" : ""} />
                    </div>
                  </div>

                  {/* Top Left Match Chip */}
                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-mono text-white backdrop-blur-md">
                      {direction.matchScore}
                    </span>
                  </div>

                  {/* Bottom Image Subtitle */}
                  <div className="absolute bottom-3 inset-x-3.5 z-10">
                    <span className="text-[11px] font-normal text-white/90 drop-shadow-sm">
                      {isRTL ? direction.subtitleAr : direction.subtitle}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-col justify-between flex-1 p-5 gap-4">
                  <div>
                    <h3 className="text-[#1C1917] font-serif text-xl sm:text-2xl font-normal transition-colors group-hover:text-primary">
                      {isRTL ? direction.nameAr : direction.name}
                    </h3>

                    {/* Assigned Spaces Badges (Per-space mode) */}
                    {strategy === "per_space" && hasAssignedSpaces && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-medium text-[#503C2C]">
                          {isRTL ? "مختار لـ:" : "Applied to:"}
                        </span>
                        {assignedSpaces.map((sp, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-full bg-[#EAE2D7] px-2.5 py-0.5 text-[10px] font-medium text-[#503C2C] border border-[#D8C8B4]"
                          >
                            <Check size={10} weight="bold" />
                            <span>{sp}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Materials Swatches */}
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      {direction.materials.map((mat, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 rounded-full border border-border/80 bg-background/80 px-2 py-0.5 text-[9px] font-normal text-[#78716C]"
                        >
                          <span
                            className="h-2 w-2 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: mat.color }}
                          />
                          <span>{isRTL ? mat.nameAr : mat.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Open Gallery Trigger Button */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#503C2C] group-hover:underline">
                      <Eye size={14} weight="bold" />
                      <span>{t("style_gallery.view_btn") || (isRTL ? "تصفح صور وستايل الغرف" : "Explore Style & Rooms")}</span>
                    </span>
                    <span className="text-[11px] font-mono text-[#78716C]">
                      {direction.galleryImages?.length || 4} {isRTL ? "صور" : "Photos"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STRATEGY 3: Designer Choice Concierge Card */}
      {strategy === "designer" && (
        <div className="p-8 sm:p-12 rounded-3xl border border-border bg-card shadow-xs flex flex-col gap-6 text-start">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-[#503C2C]">
              <Compass size={28} weight="bold" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-normal text-[#1C1917]">
                {isRTL ? "رؤية وتصميم خاص بإشراف مهندسي الأتيليه" : "Bespoke Atelier Lead Curation"}
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5 font-normal">
                {isRTL
                  ? "فريق مهندسي فالنتيا هيقترح الستايل والخامات المناسبة بعد دراسة مساحات بيتك وتوزيع الإضاءة على الطبيعة."
                  : "Valentia's architectural team will propose the optimum design direction after site & spatial study."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#1C1917]">
              {isRTL ? "عندك أي ملاحظات أو تفضيلات معينة تحب تقولها للمهندس؟" : "Any aesthetic preferences or notes for our designers?"}
            </label>
            <textarea
              rows={4}
              value={designerNotes}
              onChange={(e) => handleSaveDesignerMode(e.target.value)}
              placeholder={
                isRTL
                  ? "مثال: بحب الأجواء الهادية والمودرن، خشب أرو طبيعي مع رخام فاتح وكتان، وإضاءة طبيعية دافية في النهار..."
                  : "e.g., I love warm organic textures, light oak slats, unbleached linen, and serene morning illumination..."
              }
              className="w-full rounded-2xl border border-border bg-background p-4 text-xs font-normal text-[#1C1917] focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      )}

      {/* DEDICATED STYLE GALLERY MODAL */}
      {activeGalleryDirection && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl text-start scrollbar-none">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveGalleryDirection(null)}
              className={cn(
                "absolute top-5 flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-[#1C1917] hover:bg-secondary/80 cursor-pointer transition-colors z-20",
                isRTL ? "left-5" : "right-5"
              )}
            >
              <X size={16} weight="bold" />
            </button>

            {/* Modal Title & Style Header */}
            <div className="pr-12 pl-2">
              <div className="flex items-center gap-2">
                <span className="h-px w-6 bg-foreground/50" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#78716C]">
                  {isRTL ? "معرض صور الستايل" : "CURATED STYLE GALLERY"}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#1C1917] mt-1">
                {isRTL ? activeGalleryDirection.nameAr : activeGalleryDirection.name}
              </h2>
              <p className="text-xs text-[#78716C] mt-1 max-w-2xl leading-relaxed font-normal">
                {isRTL ? activeGalleryDirection.descriptionAr : activeGalleryDirection.description}
              </p>
            </div>

            {/* Main Active Image Display */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted mt-5 border border-border shadow-xs">
              <Image
                src={
                  activeGalleryDirection.galleryImages?.[selectedGalleryImgIndex] ||
                  activeGalleryDirection.heroImage
                }
                alt="Style Room Gallery Preview"
                fill
                className="object-cover transition-all duration-300"
                sizes="(max-width: 1024px) 100vw, 850px"
              />
            </div>

            {/* Gallery Thumbnail Strip */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 mt-3">
              {(activeGalleryDirection.galleryImages || [activeGalleryDirection.heroImage]).map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedGalleryImgIndex(idx)}
                  className={cn(
                    "relative aspect-[4/3] overflow-hidden rounded-xl border transition-all cursor-pointer",
                    selectedGalleryImgIndex === idx
                      ? "border-primary ring-2 ring-primary/20 scale-[1.02]"
                      : "border-border/70 opacity-70 hover:opacity-100"
                  )}
                >
                  <Image src={img} alt="Thumbnail preview" fill className="object-cover" sizes="120px" />
                </button>
              ))}
            </div>

            {/* Action Bar based on Strategy Mode */}
            <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* If Unified Mode: Simple Confirm button */}
              {strategy === "unified" && (
                <div className="w-full flex items-center justify-between gap-4">
                  <span className="text-xs font-normal text-[#78716C]">
                    {isRTL
                      ? "الستايل ده هيتطبق على كل غرف ومساحات بيتك تلقائياً."
                      : "This style will be applied across all rooms in your commission."}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleConfirmUnified(activeGalleryDirection)}
                    className="px-7 py-3 rounded-full bg-primary text-primary-foreground font-medium text-xs shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {t("style_gallery.confirm_unified") ||
                      (isRTL ? "تأكيد واعتماد الستايل ده للبيت كله" : "Confirm & Apply to Entire Residence")}
                  </button>
                </div>
              )}

              {/* If Per-Space Mode: Dropdown Menu to assign spaces */}
              {strategy === "per_space" && (
                <div className="w-full flex flex-col gap-4">
                  {/* Spaces Dropdown Trigger & Popover */}
                  <div className="w-full flex flex-col gap-3">
                    {(() => {
                      const selectableSpaces = activeSpaces.filter((space) => {
                        const isSelectedForThis = tempAssignedSpaceIds.includes(space.id);
                        const isAssignedToOther = pendingStyles.some(
                          (p) =>
                            p.targetSpaceKey === space.id &&
                            p.styleId !== activeGalleryDirection.id &&
                            p.targetSpaceKey !== "general" &&
                            p.targetSpaceKey !== "designer_curated"
                        );
                        return isSelectedForThis || !isAssignedToOther;
                      });

                      const alreadyAssignedToOtherSpaces = activeSpaces.filter((space) => {
                        const isSelectedForThis = tempAssignedSpaceIds.includes(space.id);
                        const isAssignedToOther = pendingStyles.some(
                          (p) =>
                            p.targetSpaceKey === space.id &&
                            p.styleId !== activeGalleryDirection.id &&
                            p.targetSpaceKey !== "general" &&
                            p.targetSpaceKey !== "designer_curated"
                        );
                        return !isSelectedForThis && isAssignedToOther;
                      });

                      return (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="text-xs font-semibold text-[#1C1917]">
                                {isRTL
                                  ? "الغرف المتاحة للتطبيق على هذا الستايل:"
                                  : "Available Spaces for this Style:"}
                              </span>
                              <p className="text-[11px] text-[#78716C] mt-0.5">
                                {isRTL
                                  ? "حدد الغرف التي ترغب في تطبيق هذا الستايل عليها."
                                  : "Select which spaces you want to apply this aesthetic direction to."}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                              {unassignedSpaceIds.length > 0 && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTempAssignedSpaceIds((prev) =>
                                        Array.from(new Set([...prev, ...unassignedSpaceIds]))
                                      );
                                    }}
                                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20"
                                  >
                                    {isRTL
                                      ? `تحديد المتبقي فقط (${unassignedSpaceIds.length})`
                                      : `Select Remaining (${unassignedSpaceIds.length})`}
                                  </button>
                                  <span className="text-border">|</span>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => setTempAssignedSpaceIds(selectableSpaces.map((s) => s.id))}
                                className="text-[11px] font-medium text-[#B88460] hover:underline cursor-pointer"
                              >
                                {isRTL ? "تحديد كل المتاح" : "Select Available"}
                              </button>
                              <span className="text-border">|</span>
                              <button
                                type="button"
                                onClick={() => setTempAssignedSpaceIds([])}
                                className="text-[11px] font-medium text-[#78716C] hover:underline cursor-pointer"
                              >
                                {t("style_gallery.clear_all") || (isRTL ? "إلغاء التحديد" : "Clear")}
                              </button>
                            </div>
                          </div>

                          {/* Primary: Selectable Spaces (Unassigned + Selected for this) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 p-3 rounded-2xl border border-border bg-background max-h-56 overflow-y-auto">
                            {selectableSpaces.length === 0 ? (
                              <div className="col-span-full py-4 text-center flex flex-col items-center justify-center gap-1.5">
                                <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                                  {isRTL
                                    ? "جميع الغرف محددة لستايلات أخرى بالفعل (انظر بالأسفل)."
                                    : "All spaces are already assigned to other styles (see below)."}
                                </span>
                                <span className="text-[11px] text-[#78716C]">
                                  {isRTL
                                    ? "إذا أردت تطبيق هذا الستايل على أي غرفة، يمكنك نقلها من القائمة بالأسفل."
                                    : "You can transfer any space to this style from the list below."}
                                </span>
                              </div>
                            ) : (
                              selectableSpaces.map((space) => {
                                const spaceName = getSpaceDisplayName(space, isRTL);
                                const spaceQty = space.quantity ?? space.count ?? 1;
                                const isSelectedForThis = tempAssignedSpaceIds.includes(space.id);

                                return (
                                  <button
                                    key={space.id}
                                    type="button"
                                    onClick={() => handleToggleSpaceAssignment(space.id)}
                                    className={cn(
                                      "flex flex-col gap-1.5 p-3 rounded-2xl border text-start transition-all cursor-pointer select-none text-xs relative",
                                      isSelectedForThis
                                        ? "border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary/30 shadow-2xs"
                                        : "border-amber-400/50 bg-amber-500/5 text-foreground hover:border-amber-500 hover:bg-amber-500/10"
                                    )}
                                  >
                                    <div className="flex items-center justify-between w-full gap-2">
                                      <span className="font-medium truncate text-foreground">
                                        {spaceName} {spaceQty > 1 && <span className="text-[10px] text-[#78716C]">({spaceQty}×)</span>}
                                      </span>
                                      <div
                                        className={cn(
                                          "h-4 w-4 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                                          isSelectedForThis
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border bg-background"
                                        )}
                                      >
                                        {isSelectedForThis && <Check size={11} weight="bold" />}
                                      </div>
                                    </div>

                                    {/* Status Badges */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {isSelectedForThis ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-semibold text-primary">
                                          <Check size={9} weight="bold" />
                                          <span>{isRTL ? "محدد لهذا الستايل" : "Selected for this style"}</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-medium text-amber-800 dark:text-amber-300">
                                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                          <span>{isRTL ? "متبقي (يحتاج ستايل)" : "Needs style"}</span>
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>

                          {/* Secondary: Already assigned to other styles (Clean completed display) */}
                          {alreadyAssignedToOtherSpaces.length > 0 && (
                            <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-[#503C2C]">
                                  {isRTL
                                    ? `غرف تم اختيار ستايل لها بالفعل (${alreadyAssignedToOtherSpaces.length} غرف مكتملة):`
                                    : `Spaces Already Styled (${alreadyAssignedToOtherSpaces.length} completed):`}
                                </span>
                                <span className="text-[10px] text-[#78716C]">
                                  {isRTL ? "محجوزة لستايلات أخرى" : "Assigned elsewhere"}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-2.5 rounded-2xl bg-secondary/50 border border-border/70 max-h-36 overflow-y-auto">
                                {alreadyAssignedToOtherSpaces.map((space) => {
                                  const spaceName = getSpaceDisplayName(space, isRTL);
                                  const spaceQty = space.quantity ?? space.count ?? 1;

                                  const otherAssignment = pendingStyles.find(
                                    (p) =>
                                      p.targetSpaceKey === space.id &&
                                      p.styleId !== activeGalleryDirection.id &&
                                      p.targetSpaceKey !== "general" &&
                                      p.targetSpaceKey !== "designer_curated"
                                  );
                                  const otherStyleDir = otherAssignment
                                    ? AESTHETIC_DIRECTIONS.find((d) => d.id === otherAssignment.styleId)
                                    : undefined;
                                  const otherStyleName = otherStyleDir
                                    ? isRTL
                                      ? otherStyleDir.nameAr
                                      : otherStyleDir.name
                                    : otherAssignment?.styleName;

                                  return (
                                    <div
                                      key={space.id}
                                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-background border border-border text-xs"
                                    >
                                      <div className="min-w-0">
                                        <div className="font-medium text-[#1C1917] truncate">
                                          {spaceName} {spaceQty > 1 && <span className="text-[10px] text-[#78716C]">({spaceQty}×)</span>}
                                        </div>
                                        <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium truncate flex items-center gap-1 mt-0.5">
                                          <Check size={9} weight="bold" />
                                          <span>{otherStyleName}</span>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleToggleSpaceAssignment(space.id)}
                                        className="text-[10px] font-semibold text-primary hover:underline shrink-0 bg-primary/10 px-2 py-1 rounded-md"
                                      >
                                        {isRTL ? "نقل لهنا" : "Transfer"}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Confirm Button & Reassignment Notice */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-[#1C1917] font-semibold">
                        {tempAssignedSpaceIds.length} {isRTL ? "غرف محددة لهذا الستايل" : "spaces assigned to this style"}
                      </span>
                      {tempAssignedSpaceIds.some((id) =>
                        pendingStyles.some(
                          (p) =>
                            p.targetSpaceKey === id &&
                            p.styleId !== activeGalleryDirection.id &&
                            p.targetSpaceKey !== "general" &&
                            p.targetSpaceKey !== "designer_curated"
                        )
                      ) && (
                        <span className="text-[10px] text-amber-800 dark:text-amber-400 font-normal mt-0.5">
                          {isRTL
                            ? "تنبيه: سيتم نقل الغرف التي كانت مخصصة لستايلات أخرى إلى هذا الستايل عند التأكيد."
                            : "Note: Reassigned spaces will be transferred to this style upon confirming."}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConfirmPerSpace(activeGalleryDirection)}
                      className="px-7 py-3 rounded-full bg-primary text-primary-foreground font-medium text-xs shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer whitespace-nowrap self-end sm:self-auto"
                    >
                      {t("style_gallery.confirm_per_space") ||
                        (isRTL
                          ? `تطبيق الستايل على الغرف المختارة (${tempAssignedSpaceIds.length})`
                          : `Apply to Selected Spaces (${tempAssignedSpaceIds.length})`)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
