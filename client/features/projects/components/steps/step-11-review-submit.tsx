"use client";

import * as React from "react";
import Image from "next/image";
import {
  PencilSimple,
  CheckCircle,
  Sparkle,
  HouseLine,
  Globe,
  UserCheck,
  Hammer,
  Coins,
  CalendarCheck,
  FilePdf,
  Images,
  ChatCircleDots,
} from "@phosphor-icons/react";
import type {
  PropertyType,
  PropertyEntity,
  SpaceEntity,
  PendingStyleSelection,
  CustomerLocation,
  AuthorizedRepresentative,
  ProjectScope,
  ProjectBudget,
  TargetCompletion,
  ProjectDocument,
} from "../../types";
import { PROPERTY_TYPOLOGIES } from "./step-01-property-type";
import { AESTHETIC_DIRECTIONS } from "../aesthetic-direction";
import { CURATED_SPACES } from "../spaces-architecture";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface StepReviewSubmitProps {
  propertyType: PropertyType;
  primaryStyleId: string;
  pendingStyles: PendingStyleSelection[];
  spaces: SpaceEntity[];
  property: PropertyEntity;
  customerLocation: CustomerLocation;
  representative: AuthorizedRepresentative;
  scope: ProjectScope;
  budget: ProjectBudget;
  timeline: TargetCompletion;
  documents: ProjectDocument[];
  onJumpToStep: (stepNumber: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function StepReviewSubmit({
  propertyType,
  primaryStyleId,
  pendingStyles,
  spaces,
  property,
  customerLocation,
  representative,
  scope,
  budget,
  timeline,
  documents,
  onJumpToStep,
  onSubmit,
  isSubmitting,
}: StepReviewSubmitProps) {
  const { t, isRTL } = useLanguage();

  const selectedSpaces = spaces.filter(
    (s) => s.included && (s.quantity ?? s.count ?? 1) > 0
  );

  const selectedRoomsCount = selectedSpaces.reduce(
    (acc, curr) => acc + (curr.quantity ?? curr.count ?? 1),
    0
  );

  // Look up property type info
  const propertyTypology =
    PROPERTY_TYPOLOGIES.find((p) => p.id === propertyType) || PROPERTY_TYPOLOGIES[0];

  // Look up primary style direction
  const primaryStyle =
    AESTHETIC_DIRECTIONS.find((d) => d.id === primaryStyleId) ||
    AESTHETIC_DIRECTIONS[1]; // fallback to Japandi

  // Collect inspiration gallery images
  const inspirationImages = React.useMemo(() => {
    const list: string[] = [];
    if (primaryStyle.galleryImages && primaryStyle.galleryImages.length > 0) {
      list.push(...primaryStyle.galleryImages);
    } else if (primaryStyle.heroImage) {
      list.push(primaryStyle.heroImage);
    }
    // Also include reference images from pending styles if any
    pendingStyles.forEach((p) => {
      p.referenceImages?.forEach((img) => {
        if (!list.includes(img)) list.push(img);
      });
    });
    return list.slice(0, 8);
  }, [primaryStyle, pendingStyles]);

  // Per-space style assignments
  const perSpaceStyles = pendingStyles.filter(
    (p) => p.targetSpaceKey !== "general" && p.targetSpaceKey !== "designer_curated"
  );

  // Client notes
  const clientNotes =
    pendingStyles.find((p) => p.notes && p.notes.trim().length > 0)?.notes ||
    "";

  // Helper for space image lookup
  const getSpaceImage = (space: SpaceEntity) => {
    const curated = CURATED_SPACES.find(
      (c) => c.id === space.id || c.id === space.spaceType
    );
    if (curated) return curated.imageSrc;
    return "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=300&q=80";
  };

  // Helper for space style name lookup
  const getSpaceStyleName = (spaceId: string) => {
    const specific = pendingStyles.find((p) => p.targetSpaceKey === spaceId);
    if (specific) return specific.styleName;
    return undefined;
  };

  const getBudgetText = () => {
    if (budget.budgetType === "exact" && budget.exactAmount) {
      return `${budget.exactAmount.toLocaleString()} ${budget.currency || "EGP"}`;
    }
    if (budget.budgetType === "range" && budget.minAmount && budget.maxAmount) {
      return `${budget.minAmount.toLocaleString()} - ${budget.maxAmount.toLocaleString()} ${
        budget.currency || "EGP"
      }`;
    }
    return isRTL
      ? "مفتوح لدراسة التكلفة وجدول الكميات"
      : "Open for Preliminary BOQ Study";
  };

  const getTimelineText = () => {
    if (timeline.deadlineType === "specific_date" && timeline.targetDate) {
      return timeline.targetDate;
    }
    if (timeline.deadlineType === "duration" && timeline.durationDescription) {
      return timeline.durationDescription;
    }
    return isRTL ? "جدول زمني مرن يركز على الجودة" : "Flexible Quality Horizon";
  };

  const getConditionName = (condId?: string) => {
    if (condId === "core_and_shell") return isRTL ? "هيكل خرساني / على المحارة" : "Core & Shell";
    if (condId === "semi_finished") return isRTL ? "نصف تشطيب" : "Semi-Finished";
    if (condId === "fully_finished") return isRTL ? "تشطيب كامل" : "Fully Finished";
    if (condId === "renovation") return isRTL ? "تجديد وتأهيل" : "Renovation & Remodel";
    return isRTL ? "هيكل خرساني" : "Core & Shell";
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-300">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER (Screen 5 Reference Lockup)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/80 pb-6">
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
              {isRTL
                ? "٠٦ — ٠٦ • ملخص التكليف والتصميم المعماري"
                : "06 — 06 YOUR DESIGN BRIEF"}
            </span>
          </div>
          <h2 className="mt-2 text-[#1C1917] font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight">
            {isRTL ? "ملخص التصميم المعماري والتكليف" : "Here is your design brief"}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#78716C] font-normal leading-relaxed max-w-xl">
            {isRTL
              ? "ملخص شامل لكافة اختياراتك ومواصفاتك المعمارية. يمكنك مراجعة وتعديل أي تفصيلة مباشرة قبل إرسال التكليف."
              : "A summary of your selections. You can edit any section before we commission the atelier."}
          </p>
        </div>

        {/* Edit Selections shortcut button */}
        <button
          type="button"
          onClick={() => onJumpToStep(1)}
          className="self-start inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground shadow-2xs hover:bg-secondary active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <PencilSimple size={14} weight="bold" className="text-[#B88460]" />
          <span>{isRTL ? "تعديل الاختيارات" : "Edit Selections"}</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TOP ROW CARDS: Property Type, Specs & Style Direction
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Property Typology (Step 1) */}
        <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <span
                className={cn(
                  "text-[10px] uppercase font-medium text-[#78716C]",
                  isRTL ? "font-sans text-[11px]" : "font-mono tracking-[0.16em]"
                )}
              >
                {isRTL ? "نمط العقار المعماري" : "PROPERTY TYPOLOGY"}
              </span>
              <button
                type="button"
                onClick={() => onJumpToStep(1)}
                className="flex items-center gap-1 text-[11px] font-medium text-[#B88460] hover:text-[#503C2C] cursor-pointer"
              >
                <PencilSimple size={13} weight="bold" />
                <span>{isRTL ? "تعديل" : "Edit"}</span>
              </button>
            </div>

            <div className="flex gap-3.5 items-center mt-2">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-border bg-muted">
                <Image
                  src={propertyTypology.imageSrc}
                  alt={propertyTypology.defaultTitle}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="80px"
                />
              </div>
              <div className="text-start min-w-0">
                <h3 className="text-[#1C1917] capitalize truncate font-serif text-xl sm:text-2xl font-normal">
                  {propertyTypology.defaultTitle}
                </h3>
                <p className="text-xs text-[#78716C] mt-1 line-clamp-2 font-normal">
                  {t(propertyTypology.descKey) || propertyTypology.defaultDesc}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-[#78716C]">
            <span className="font-normal">{isRTL ? "الخطوة ٠١" : "Step 01"}</span>
            <span className="font-mono text-[#503C2C] font-medium">{propertyTypology.volume}</span>
          </div>
        </div>

        {/* Card 2: Property Specs & Location (Step 2) */}
        <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <span
                className={cn(
                  "text-[10px] uppercase font-medium text-[#78716C]",
                  isRTL ? "font-sans text-[11px]" : "font-mono tracking-[0.16em]"
                )}
              >
                {isRTL ? "مواصفات وموقع العقار" : "PROPERTY SPECS & SITE"}
              </span>
              <button
                type="button"
                onClick={() => onJumpToStep(2)}
                className="flex items-center gap-1 text-[11px] font-medium text-[#B88460] hover:text-[#503C2C] cursor-pointer"
              >
                <PencilSimple size={13} weight="bold" />
                <span>{isRTL ? "تعديل" : "Edit"}</span>
              </button>
            </div>

            <div className="text-start mt-2 flex flex-col gap-2">
              <h3 className="text-[#1C1917] truncate font-serif text-xl sm:text-2xl font-normal">
                {property.compound || (isRTL ? "مشروع سكني خاص" : "Private Residence")}
              </h3>
              <p className="text-xs text-[#78716C] font-normal">
                {property.city || (isRTL ? "القاهرة الجديدة" : "New Cairo")}
              </p>

              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center rounded-full bg-secondary/80 border border-border px-2.5 py-0.5 text-[11px] font-mono font-medium text-[#503C2C]">
                  {property.areaSqm || 480} {isRTL ? "م²" : "m²"}
                </span>
                <span className="inline-flex items-center rounded-full bg-secondary/80 border border-border px-2.5 py-0.5 text-[11px] font-mono font-medium text-[#503C2C]">
                  {property.floors || 2} {isRTL ? "طوابق" : "Levels"}
                </span>
                <span className="inline-flex items-center rounded-full bg-[#EAE2D7] border border-[#D8C8B4] px-2.5 py-0.5 text-[10px] font-normal text-[#503C2C]">
                  {getConditionName(property.condition)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-[#78716C]">
            <span className="font-normal">{isRTL ? "الخطوة ٠٢" : "Step 02"}</span>
            <span className="font-mono text-[#B88460] font-medium">CAD / BIM READY</span>
          </div>
        </div>

        {/* Card 3: Aesthetic & Material Direction (Step 4) */}
        <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <span
                className={cn(
                  "text-[10px] uppercase font-medium text-[#78716C]",
                  isRTL ? "font-sans text-[11px]" : "font-mono tracking-[0.16em]"
                )}
              >
                {isRTL ? "التوجه الجمالي والخامات" : "STYLE & MATERIALS"}
              </span>
              <button
                type="button"
                onClick={() => onJumpToStep(4)}
                className="flex items-center gap-1 text-[11px] font-medium text-[#B88460] hover:text-[#503C2C] cursor-pointer"
              >
                <PencilSimple size={13} weight="bold" />
                <span>{isRTL ? "تعديل" : "Edit"}</span>
              </button>
            </div>

            <div className="flex gap-3.5 items-center mt-2">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-border bg-muted">
                <Image
                  src={primaryStyle.heroImage}
                  alt={primaryStyle.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="80px"
                />
              </div>
              <div className="text-start min-w-0">
                <h3 className="text-[#1C1917] truncate font-serif text-xl sm:text-2xl font-normal">
                  {isRTL ? primaryStyle.nameAr : primaryStyle.name}
                </h3>
                <p className="text-xs text-[#78716C] mt-1 line-clamp-1 font-normal">
                  {isRTL ? primaryStyle.subtitleAr : primaryStyle.subtitle}
                </p>

                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  {perSpaceStyles.length > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#B88460]/15 border border-[#B88460]/30 px-2 py-0.5 text-[10px] font-medium text-[#503C2C]">
                      <Sparkle size={10} weight="fill" className="text-[#B88460]" />
                      <span>
                        {perSpaceStyles.length} {isRTL ? "فراغات مخصصة" : "custom zones"}
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/80 border border-border px-2 py-0.5 text-[10px] font-normal text-[#503C2C]">
                      <span>{isRTL ? "طراز موحد للمسكن" : "Unified Residence"}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-[#78716C]">
            <span className="font-normal">{isRTL ? "الخطوة ٠٤" : "Step 04"}</span>
            <span className="font-mono text-[#503C2C] font-medium">{primaryStyle.matchScore}</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. INCLUDED SPACES (Circular Avatars matching Screen 5)
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <HouseLine size={18} weight="bold" className="text-[#B88460]" />
            <span
              className={cn(
                "text-xs uppercase font-medium text-[#1C1917]",
                isRTL ? "font-sans text-xs text-[#503C2C]" : "font-mono tracking-[0.16em]"
              )}
            >
              {isRTL ? "الفراغات المعمارية المعتمدة" : "INCLUDED SPACES"}
            </span>
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-mono font-medium text-[#503C2C]">
              {selectedRoomsCount} {isRTL ? "غرفة ومنطقة" : "zones"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onJumpToStep(3)}
            className="flex items-center gap-1 text-[11px] font-medium text-[#B88460] hover:text-[#503C2C] cursor-pointer"
          >
            <PencilSimple size={13} weight="bold" />
            <span>{isRTL ? "تعديل الفراغات" : "Edit Spaces"}</span>
          </button>
        </div>

        {/* Circular Space Avatars Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {selectedSpaces.map((space) => {
            const spaceImg = getSpaceImage(space);
            const count = space.quantity ?? space.count ?? 1;
            const customStyle = getSpaceStyleName(space.id);

            return (
              <div
                key={space.id}
                className="group flex flex-col items-center text-center p-3 rounded-2xl border border-border/70 bg-background/50 hover:bg-secondary/40 transition-colors"
              >
                {/* Circular photo avatar */}
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-[#B88460] overflow-hidden shadow-2xs group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src={spaceImg}
                    alt={space.customName || space.spaceType || "Space"}
                    fill
                    className="object-cover"
                    sizes="72px"
                  />
                  {/* Count badge */}
                  {count > 1 && (
                    <span className="absolute bottom-0 right-0 bg-[#503C2C] text-[#FAF7F2] text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-full border border-white">
                      x{count}
                    </span>
                  )}
                </div>

                {/* Space Title */}
                <span className="mt-2.5 text-xs text-[#1C1917] truncate max-w-full font-medium">
                  {space.customName || space.spaceType}
                </span>

                {/* Subtitle / Style tag */}
                {customStyle ? (
                  <span className="text-[9px] text-[#B88460] font-medium truncate max-w-full mt-0.5">
                    {customStyle}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#78716C] font-mono mt-0.5">
                    {count} {isRTL ? "غرفة" : count === 1 ? "space" : "spaces"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. INSPIRATION GALLERY & YOUR NOTES (Screen 5 Reference)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Inspiration Gallery Strip */}
        <div className="lg:col-span-7 rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Images size={17} weight="bold" className="text-[#B88460]" />
                <span
                  className={cn(
                    "text-[10px] uppercase font-medium text-[#1C1917]",
                    isRTL ? "font-sans text-[11px] text-[#503C2C]" : "font-mono tracking-[0.16em]"
                  )}
                >
                  {isRTL ? "معرض الإلهام والمواد" : "INSPIRATION GALLERY"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(4)}
                className="flex items-center gap-1 text-[11px] font-medium text-[#B88460] hover:text-[#503C2C] cursor-pointer"
              >
                <PencilSimple size={13} weight="bold" />
                <span>{isRTL ? "استعراض المزيد" : "Explore"}</span>
              </button>
            </div>

            <p className="text-xs text-[#78716C] mb-3 text-start font-normal">
              {isRTL
                ? "لقطات منتقاة لطرازك المعماري تعبر عن المواد، تدرجات الألوان، وتوزيع الإضاءة."
                : "Curated architectural renders reflecting the palette, textures, and spatial light."}
            </p>

            {/* Horizontal Scrollable Reel */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {inspirationImages.map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="relative w-36 sm:w-44 h-28 sm:h-32 rounded-2xl overflow-hidden shrink-0 border border-border/80 group"
                >
                  <Image
                    src={imgSrc}
                    alt={`Inspiration ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="176px"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Your Notes Card */}
        <div className="lg:col-span-5 rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <ChatCircleDots size={17} weight="bold" className="text-[#B88460]" />
                <span
                  className={cn(
                    "text-[10px] uppercase font-medium text-[#1C1917]",
                    isRTL ? "font-sans text-[11px] text-[#503C2C]" : "font-mono tracking-[0.16em]"
                  )}
                >
                  {isRTL ? "ملاحظاتك المعمارية" : "YOUR NOTES & VISION"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(4)}
                className="flex items-center gap-1 text-[11px] font-medium text-[#B88460] hover:text-[#503C2C] cursor-pointer"
              >
                <PencilSimple size={13} weight="bold" />
                <span>{isRTL ? "تعديل" : "Edit"}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/60 border border-border/80 text-start text-xs leading-relaxed text-[#1C1917]">
              {clientNotes ? (
                <p className="italic font-normal">
                  &ldquo;{clientNotes}&rdquo;
                </p>
              ) : (
                <p className="text-[#78716C] italic font-normal">
                  {isRTL
                    ? "«أرغب في تصميم دافئ وحديث يعتمد على المواد الطبيعية ووفرة الإضاءة النهارية، مع تدرجات لونية هادئة وتفاصيل خشبية مدمجة.»"
                    : "“I want a warm, modern design with natural materials and a lot of light. I prefer neutral colors with integrated wooden elements and refined stone surfaces.”"}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-[#78716C]">
            <span className="font-normal">{isRTL ? "مرفقة مع ملف التكليف" : "Attached to atelier brief"}</span>
            <span className="font-mono text-[#B88460] font-medium">VALENTIA ATELIER</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. TECHNICAL SPECIFICATIONS & OPERATIONAL REVIEW
      ───────────────────────────────────────────────────────────── */}
      <div>
        <div className="pb-3 text-start">
          <span
            className={cn(
              "text-[10px] uppercase font-medium text-[#78716C]",
              isRTL ? "font-sans text-[11px] text-[#503C2C]" : "font-mono tracking-[0.16em]"
            )}
          >
            {isRTL ? "المعايير التشغيلية والهندسية" : "TECHNICAL & OPERATIONAL PARAMETERS"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Location & Timezone */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-[#503C2C]">
                <Globe size={16} className="text-[#B88460]" />
                <span>
                  {isRTL ? "بلد الإقامة" : "Client Base & Timezone"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(5)}
                className="text-[#B88460] hover:text-[#503C2C] text-[11px] font-medium cursor-pointer"
              >
                <PencilSimple size={13} weight="bold" />
              </button>
            </div>
            <div className="text-start">
              <div className="text-xs font-normal text-[#1C1917]">
                {customerLocation.city}, {customerLocation.country}
              </div>
              <span className={cn("block text-[#78716C] text-[10px] mt-0.5", isRTL ? "font-sans" : "font-mono")}>
                {customerLocation.timezone}
              </span>
            </div>
          </div>

          {/* Representative in Egypt */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-[#503C2C]">
                <UserCheck size={16} className="text-[#B88460]" />
                <span>
                  {isRTL ? "الممثل في مصر" : "Representation in Egypt"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(6)}
                className="text-[#B88460] hover:text-[#503C2C] text-[11px] font-medium cursor-pointer"
              >
                <PencilSimple size={13} weight="bold" />
              </button>
            </div>
            <div className="text-start text-xs font-normal text-[#1C1917]">
              {representative.hasRepresentative
                ? `${representative.name || "Authorized Contact"} (${representative.phone || ""})`
                : isRTL
                ? "إشراف وإدارة مباشرة من استوديو فالنتيا"
                : "Valentia Direct Atelier Management"}
            </div>
          </div>

          {/* Scope of Work */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-[#503C2C]">
                <Hammer size={16} className="text-[#B88460]" />
                <span>
                  {isRTL ? "نطاق العمل" : "Scope"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(7)}
                className="text-[#B88460] hover:text-[#503C2C] text-[11px] font-medium cursor-pointer"
              >
                <PencilSimple size={13} weight="bold" />
              </button>
            </div>
            <div className="text-start text-xs font-normal text-[#1C1917] capitalize">
              {(scope.scopeType || "full_fitout").replace("_", " ")}
            </div>
          </div>

          {/* Target Budget */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-[#503C2C]">
                <Coins size={16} className="text-[#B88460]" />
                <span>
                  {isRTL ? "الميزانية المقدرة" : "Target Budget"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(8)}
                className="text-[#B88460] hover:text-[#503C2C] text-[11px] font-medium cursor-pointer"
              >
                <PencilSimple size={13} weight="bold" />
              </button>
            </div>
            <div className="text-start text-xs font-semibold text-[#1C1917]">
              {getBudgetText()}
            </div>
          </div>

          {/* Timeline */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-[#503C2C]">
                <CalendarCheck size={16} className="text-[#B88460]" />
                <span>
                  {isRTL ? "الجدول الزمني" : "Target Timeline"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(9)}
                className="text-[#B88460] hover:text-[#503C2C] text-[11px] font-medium cursor-pointer"
              >
                <PencilSimple size={13} weight="bold" />
              </button>
            </div>
            <div className="text-start text-xs font-normal text-[#1C1917]">
              {getTimelineText()}
            </div>
          </div>

          {/* Drawings & Site Survey */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-[#503C2C]">
                <FilePdf size={16} className="text-[#B88460]" />
                <span>
                  {isRTL ? "المخططات الهندسية" : "Drawings & CAD"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(10)}
                className="text-[#B88460] hover:text-[#503C2C] text-[11px] font-medium cursor-pointer"
              >
                <PencilSimple size={13} weight="bold" />
              </button>
            </div>
            <div className="text-start text-xs font-normal text-[#1C1917]">
              {documents.length > 0
                ? `${documents.length} ${isRTL ? "ملفات مرفوعة" : "files attached"}`
                : isRTL
                ? "سيتم المسح الليزري ثلاثي الأبعاد في الموقع"
                : "Valentia 3D Site Survey scheduled"}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. SUBMISSION BANNER (Commission Valentia Atelier)
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#503C2C] text-[#FAF7F2] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#B88460]/30">
        <div className="text-start">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B88460] animate-ping" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#E5D7C7] font-medium">
              {isRTL ? "المرحلة النهائية • اعتماد التكليف" : "FINAL STAGE · COMMISSIONING"}
            </span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-tight text-white">
            {isRTL ? "جاهز لاعتماد وإرسال طلب مشروعك؟" : "Ready to commission your atelier?"}
          </h3>
          <p className="mt-2 max-w-xl leading-relaxed text-xs text-[#E5D7C7] font-normal">
            {isRTL
              ? "بمجرد الإرسال، سيتولى فريق فالنتيا مراجعة المواصفات وإتاحة حجز الاستشارة المباشرة وتنسيق زيارة المعاينة الميدانية والمسح الليزري."
              : "Submitting creates your digital project hub. Our lead architects review specifications and open direct video consultation scheduling."}
          </p>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={cn(
            "shrink-0 px-8 py-4 rounded-full bg-[#B88460] text-white hover:bg-[#A37250] active:scale-95 transition-all shadow-md disabled:opacity-50 flex items-center gap-2.5 cursor-pointer font-medium",
            isRTL ? "text-xs font-sans tracking-normal" : "text-xs tracking-wider uppercase"
          )}
        >
          {isSubmitting ? (
            <>
              <Spinner className="w-4 h-4 text-white" />
              <span>{isRTL ? "جاري الاعتماد..." : "Submitting Commission..."}</span>
            </>
          ) : (
            <>
              <CheckCircle weight="fill" size={17} />
              <span>{isRTL ? "إرسال واعتماد المشروع ←" : "Submit & Commission Atelier →"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
