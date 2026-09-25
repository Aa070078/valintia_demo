"use client";

import * as React from "react";
import type { PropertyType } from "../../types";
import { VolumeCard } from "../volume-card";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface StepPropertyTypeProps {
  selectedType: PropertyType;
  onSelectType: (type: PropertyType) => void;
}

export const PROPERTY_TYPOLOGIES: Array<{
  id: PropertyType;
  volume: string;
  titleKey: string;
  descKey: string;
  defaultTitle: string;
  defaultDesc: string;
  tag: string;
  tagAr: string;
  imageSrc: string;
}> = [
  {
    id: "villa",
    volume: "VOLUME 01",
    titleKey: "property.villa",
    descKey: "property.villa_desc",
    defaultTitle: "Villa",
    defaultDesc: "Freestanding luxury residences, twin houses & estates.",
    tag: "Primary Typology",
    tagAr: "النمط الأساسي",
    imageSrc:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "apartment",
    volume: "VOLUME 02",
    titleKey: "property.apartment",
    descKey: "property.apartment_desc",
    defaultTitle: "Apartment",
    defaultDesc: "Urban residences, penthouses & mid-rise flats.",
    tag: "High-rise & mid-rise",
    tagAr: "أبراج سكنية وشقق",
    imageSrc:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "duplex",
    volume: "VOLUME 03",
    titleKey: "property.duplex",
    descKey: "property.duplex_desc",
    defaultTitle: "Duplex",
    defaultDesc: "Multi-tier architectural volumes with dual floor levels.",
    tag: "Dual floor levels",
    tagAr: "مستويين متصلين",
    imageSrc:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "penthouse",
    volume: "VOLUME 04",
    titleKey: "property.penthouse",
    descKey: "property.penthouse_desc",
    defaultTitle: "Penthouse",
    defaultDesc: "Skyline residences with private rooftop terraces.",
    tag: "Private rooftop access",
    tagAr: "رووف وتراس بانورامي",
    imageSrc:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "commercial",
    volume: "VOLUME 05",
    titleKey: "property.commercial",
    descKey: "property.commercial_desc",
    defaultTitle: "Commercial",
    defaultDesc: "Bespoke executive suites, creative studios & showrooms.",
    tag: "Executive suites",
    tagAr: "أجنحة تنفيذية راقية",
    imageSrc:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "other",
    volume: "VOLUME 06",
    titleKey: "property.other",
    descKey: "property.other_desc",
    defaultTitle: "Other",
    defaultDesc: "Bespoke architectural pavilions & coastal vacation chalets.",
    tag: "Custom scope",
    tagAr: "نطاق تصميم مخصص",
    imageSrc:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
  },
];

export function StepPropertyType({
  selectedType,
  onSelectType,
}: StepPropertyTypeProps) {
  const { t, isRTL } = useLanguage();

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-start">
        <div className="flex items-center gap-2">
          <span className="h-px w-6 bg-foreground/50" />
          <span className={cn(
            "text-[#78716C]",
            isRTL ? "font-sans text-[11px] font-normal tracking-normal text-[#78716C]" : "font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
          )}>
            {isRTL ? "٠١ — ٠٦ • النمط المعماري" : "01 — 06 PROPERTY TYPOLOGY"}
          </span>
        </div>
        <h2 className="mt-2 text-[#1C1917] dark:text-[#FAF7F2] font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight">
          {t("step1.headline") || (isRTL ? "ما هو النمط المعماري لمسكنك؟" : "What are we creating?")}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-normal leading-relaxed max-w-xl">
          {t("step1.subheadline") ||
            (isRTL
              ? "حدد الكتلة المعمارية الأساسية لمسكنك أو وحدتك التجارية لبدء دراسة الفراغات والمواصفات."
              : "Select the foundational architectural volume for your residence or commercial commission.")}
        </p>
      </div>

      {/* Typology Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
        {PROPERTY_TYPOLOGIES.map((typology) => (
          <VolumeCard
            key={typology.id}
            volume={typology.volume}
            title={t(typology.titleKey) || typology.defaultTitle}
            description={t(typology.descKey) || typology.defaultDesc}
            tag={isRTL ? typology.tagAr : typology.tag}
            imageSrc={typology.imageSrc}
            selected={selectedType === typology.id}
            onClick={() => onSelectType(typology.id)}
          />
        ))}
      </div>
    </div>
  );
}
