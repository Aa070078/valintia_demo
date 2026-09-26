"use client";

import * as React from "react";
import { Heart, Check, Sparkle } from "@phosphor-icons/react";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export interface StyleDirection {
  id: string;
  name: string;
  nameAr: string;
  subtitle: string;
  subtitleAr: string;
  description: string;
  descriptionAr: string;
  heroImage: string;
  thumbnail: string;
  galleryImages: string[];
  matchScore: string;
  materials: { name: string; nameAr: string; color: string }[];
}

export const AESTHETIC_DIRECTIONS: StyleDirection[] = [
  {
    id: "modern_architectural",
    name: "Modern Architectural",
    nameAr: "مودرن معاصر",
    subtitle: "Clean lines, open, calm spaces and a refined balance of materials.",
    subtitleAr: "خطوط نقية، مساحات مفتوحة، وتناغم بين الرخام والأخشاب الدافئة.",
    description:
      "Full-height architectural glazing, monolithic travertine fireplaces, cantilevered joinery, and concealed recessed cove lighting celebrating volume and clarity.",
    descriptionAr:
      "واجهات زجاجية واسعة، دفاية رخام فخمة، تجاليد خشبية راقية، وإضاءات ليد مخفية بتوسع الفراغ وتدي إحساس بالهدوء.",
    heroImage:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
    thumbnail:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80",
    ],
    matchScore: "95% Aesthetic Match",
    materials: [
      { name: "Calacatta Quartz", nameAr: "كوارتز كلكتا", color: "#F2EFEB" },
      { name: "Smoked Ash", nameAr: "دردار مدخن", color: "#4E4843" },
      { name: "Brushed Bronze", nameAr: "برونز مصقول", color: "#9E8266" },
      { name: "Cast Plaster", nameAr: "جبس معمارى ناعم", color: "#ECE4DA" },
    ],
  },
  {
    id: "japandi",
    name: "Japandi & Warm Minimal",
    nameAr: "جاباندي ومينيمال دافئ",
    subtitle: "Warm wood, crafted stillness & unbleached linens",
    subtitleAr: "أخشاب دافئة وهدوء بصري مع كتان طبيعي",
    description:
      "Natural vertical oak slats, raw travertine stone plinths, organic washed linen upholstery, and contemplative spatial geometry that invites diffused morning radiance.",
    descriptionAr:
      "بانوهات خشب أرو طبيعي، حجر ترافرتين، أقمشة كتان ناعمة، وتصميم مريح بيخلي ضوء الشمس يتوزع بنعومة في كل زاوية.",
    heroImage:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
    thumbnail:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
    ],
    matchScore: "94% Aesthetic Match",
    materials: [
      { name: "White Oak", nameAr: "بلوط أبيض", color: "#E0CFB8" },
      { name: "Honed Travertine", nameAr: "ترافرتين مصقول", color: "#DFD5C4" },
      { name: "Unbleached Linen", nameAr: "كتان طبيعي", color: "#EDE6DA" },
      { name: "Paper Clay", nameAr: "خزف معجون", color: "#CFC5B8" },
    ],
  },
  {
    id: "mediterranean",
    name: "Mediterranean Coastal",
    nameAr: "طراز متوسطي وساحلي",
    subtitle: "Arches, rustic timber & sunlit limestone",
    subtitleAr: "أقواس ناعمة وأخشاب طبيعية مع لمسات الساحل",
    description:
      "Soft curvilinear arches, hand-finished lime plaster walls, natural limestone flooring, and sun-bleached driftwood inspired by the North Coast riviera.",
    descriptionAr:
      "أقواس معمارية انسيابية، بياض جيري ناعم، حجر جيري وأخشاب طبيعية مستوحاة من أجواء وفلل الساحل الشمالي والجونة.",
    heroImage:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
    thumbnail:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80",
    ],
    matchScore: "91% Aesthetic Match",
    materials: [
      { name: "Lime Plaster", nameAr: "بياض جيري", color: "#F0EAE1" },
      { name: "Terracotta", nameAr: "طين التيراكوتا", color: "#C68262" },
      { name: "North Coast Stone", nameAr: "حجر ساحلي", color: "#D9CDBF" },
      { name: "Weathered Teak", nameAr: "خشب تيك معتق", color: "#8E7259" },
    ],
  },
  {
    id: "classic_european",
    name: "Classic European",
    nameAr: "نيو كلاسيك فرنسي",
    subtitle: "Herringbone, boiserie & sculpted Statuario",
    subtitleAr: "باركيه فرنسي وبانوهات جدارية ورخام إيطالي",
    description:
      "Delicate wall boiserie, French oak chevron parquetry, Statuario marble fireplace mantelpieces, and timeless sculpted crown moldings.",
    descriptionAr:
      "بانوهات حوائط رفيعة ومظبوطة، أرضيات باركيه خشب أرو، مدافئ رخام ستاتوريو إيطالي، وكرانيش سقفية كلاسيكية هادية.",
    heroImage:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85",
    thumbnail:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80",
    ],
    matchScore: "86% Aesthetic Match",
    materials: [
      { name: "Chevron Oak", nameAr: "بلوط شيفرون", color: "#CDB397" },
      { name: "Statuario Marble", nameAr: "رخام ستاتوريو", color: "#F6F5F2" },
      { name: "Antiqued Brass", nameAr: "نحاس عتيق", color: "#B89E62" },
      { name: "Moulded Gypsum", nameAr: "بانوهات جصية", color: "#EDE7DE" },
    ],
  },
  {
    id: "scandinavian_organic",
    name: "Scandinavian Organic",
    nameAr: "إسكندنافي هادئ",
    subtitle: "Light timber, wool textiles & daylight",
    subtitleAr: "أخشاب فاتحة وأقمشة بوكليه ونور طبيعي مريح",
    description:
      "Soft bleached ash joinery, bouclé wool textures, natural morning daylight maximization, and functional minimalism promoting restful living.",
    descriptionAr:
      "أخشاب دردار فاتحة، قماش بوكليه دافئ، استغلال ذكي للضوء الطبيعي، وديكور عملي بيساعد على الاسترخاء والراحة النفسية.",
    heroImage:
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=85",
    thumbnail:
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=400&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
    ],
    matchScore: "88% Aesthetic Match",
    materials: [
      { name: "Bleached Ash", nameAr: "دردار فاتح", color: "#E8DDD0" },
      { name: "Bouclé Wool", nameAr: "صوف بوكليه", color: "#F4EFE6" },
      { name: "Brushed Aluminum", nameAr: "ألومنيوم مصقول", color: "#CFD0D2" },
    ],
  },
  {
    id: "monolithic_stone",
    name: "Monolithic Stone & Bronze",
    nameAr: "أحجار طبيعية وبرونز داكن",
    subtitle: "Dark travertine, blackened steel & depth",
    subtitleAr: "ترافرتين داكن وفولاذ أسود وعمق وفخامة",
    description:
      "Deep tactile charcoal travertine, patinated blackened metal joinery, integrated architectural micro-cement, and warm accent wash lights.",
    descriptionAr:
      "كتل حجرية فحمية فخمة، تفاصيل معدنية سوداء معتقة، ميكروسيمنت، وإضاءات مسلطة بتبرز قوة وفخامة الخامات.",
    heroImage:
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=85",
    thumbnail:
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=80",
    ],
    matchScore: "85% Aesthetic Match",
    materials: [
      { name: "Blackened Steel", nameAr: "صلب معالج", color: "#2B2A29" },
      { name: "Charcoal Stone", nameAr: "حجر فحمي", color: "#3B3835" },
      { name: "Dark Walnut", nameAr: "خشب جوز داكن", color: "#544337" },
      { name: "Brushed Graphite", nameAr: "جرافيت مصقول", color: "#575654" },
    ],
  },
];

interface AestheticDirectionProps {
  selectedStyleId: string;
  onSelectStyle: (id: string) => void;
  allowBlend: boolean;
  onToggleBlend: (val: boolean) => void;
}

export function AestheticDirection({
  selectedStyleId,
  onSelectStyle,
  allowBlend,
  onToggleBlend,
}: AestheticDirectionProps) {
  const { t, isRTL } = useLanguage();
  const [favorites, setFavorites] = React.useState<Record<string, boolean>>({
    japandi: true,
  });

  const activeStyle =
    AESTHETIC_DIRECTIONS.find((s) => s.id === selectedStyleId) ||
    AESTHETIC_DIRECTIONS[0];

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Controls: Allow Atelier Blend toggle */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3 rounded-2xl border border-[#E2D7C8] bg-[#FAF7F2] px-4 py-2.5 shadow-2xs dark:border-[#2C2C32] dark:bg-[#1A1A1E]">
          <div className="flex flex-col text-start">
            <span className="text-xs font-semibold text-[#1C1917] dark:text-[#FAF7F2]">
              {t("step4.allow_blend") || "Allow Atelier Blend"}
            </span>
            <span className="text-[10px] text-[#78716C] dark:text-[#989692]">
              {t("step4.blend_desc") || "Harmonize 2–3 complimentary moods"}
            </span>
          </div>
          <Switch
            checked={allowBlend}
            onCheckedChange={onToggleBlend}
            aria-label="Allow Atelier Blend"
          />
        </div>
      </div>

      {/* Featured Moodboard Showcase (Hero Render from Image 4) */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-[#E2D7C8] bg-[#FAF7F2] shadow-editorial group dark:border-[#2C2C32] dark:bg-[#1A1A1E]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeStyle.heroImage}
          alt={isRTL ? activeStyle.nameAr : activeStyle.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
        />

        {/* Top Badges */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {/* Curated Primary Selection Badge */}
          <div className="flex items-center gap-1.5 rounded-full border border-white/60 bg-[#FAF7F2]/90 px-3 py-1 text-[10px] font-semibold text-[#1C1917] shadow-xs backdrop-blur-md dark:border-[#2C2C32] dark:bg-[#1A1A1E]/90 dark:text-[#FAF7F2]">
            <Sparkle size={11} weight="fill" className="text-[#1C1917] dark:text-[#FAF7F2]" />
            <span>{t("step4.primary_selection") || "CURATED PRIMARY SELECTION"}</span>
          </div>

          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={(e) => toggleFavorite(e, activeStyle.id)}
            aria-label="Save mood to favorites"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1C1917] shadow-sm backdrop-blur-md transition-transform hover:scale-110 active:scale-95 cursor-pointer dark:bg-[#1A1A1E]/90 dark:text-[#FAF7F2]"
          >
            <Heart
              size={16}
              weight={favorites[activeStyle.id] ? "fill" : "regular"}
              className={favorites[activeStyle.id] ? "text-rose-600 fill-rose-600" : ""}
            />
          </button>
        </div>

        {/* Floating Card over bottom-left of image (Matching Image 4) */}
        <div
          className={cn(
            "absolute bottom-4 z-20 w-[92%] max-w-xl rounded-2xl border border-white/70 bg-[#FAF7F2]/95 p-5 shadow-xl backdrop-blur-xl dark:border-[#2C2C32] dark:bg-[#1A1A1E]/95",
            isRTL ? "right-4" : "left-4"
          )}
        >
          {/* Overline & Match Score */}
          <div className="flex items-center justify-between pb-1.5">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#78716C] dark:text-[#989692]">
              DIRECTION 01 — PRIMARY FOCUS
            </span>
            <span className="rounded-full bg-[#EBE3D7] px-2.5 py-0.5 font-mono text-[9px] font-bold text-[#1C1917] dark:bg-[#2C2C32] dark:text-[#FAF7F2]">
              {activeStyle.matchScore}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-2xl font-medium tracking-tight text-[#1C1917] dark:text-[#FAF7F2]">
            {isRTL ? activeStyle.nameAr : activeStyle.name}
          </h3>

          {/* Description */}
          <p className="mt-1 text-xs text-[#78716C] leading-relaxed dark:text-[#989692]">
            {isRTL ? activeStyle.descriptionAr : activeStyle.description}
          </p>

          {/* Material Swatch Chips (from Image 4) */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-[#E8DFD3] pt-3 dark:border-[#2C2C32]">
            {activeStyle.materials.map((mat, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 rounded-full border border-[#DFD6C7] bg-[#F4EEE5] px-2.5 py-1 text-[10px] font-medium text-[#1C1917] shadow-2xs dark:border-[#2C2C32] dark:bg-[#24242A] dark:text-[#FAF7F2]"
              >
                <span
                  className="h-2 w-2 rounded-full border border-black/10"
                  style={{ backgroundColor: mat.color }}
                />
                <span>{isRTL ? mat.nameAr : mat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Palette Strip (Explore Palette Directions - 6 Cards) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78716C] dark:text-[#989692]">
            {t("step4.palette_directions") || "Explore Palette Directions (Select to preview full architectural narrative)"}
          </span>
          <span className="font-mono text-[10px] text-[#78716C] dark:text-[#989692]">
            {t("step4.variations") || "06 VARIATIONS AVAILABLE"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {AESTHETIC_DIRECTIONS.map((dir) => {
            const isSelected = selectedStyleId === dir.id;
            const name = isRTL ? dir.nameAr : dir.name;
            const sub = isRTL ? dir.subtitleAr : dir.subtitle;

            return (
              <div
                key={dir.id}
                onClick={() => onSelectStyle(dir.id)}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-2xl border text-start transition-all duration-200 cursor-pointer select-none bg-[#FAF7F2] dark:bg-[#1A1A1E]",
                  isSelected
                    ? "border-[#1C1917] ring-2 ring-[#1C1917]/20 shadow-md -translate-y-0.5"
                    : "border-[#E2D7C8] hover:border-[#1C1917]/40 hover:-translate-y-0.5 dark:border-[#2C2C32]"
                )}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EDE6DC]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dir.thumbnail}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Selected Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-2 end-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#1C1917] shadow-xs">
                      <Check size={11} weight="bold" />
                    </div>
                  )}

                  {/* Favorite Heart */}
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(e, dir.id)}
                    className="absolute bottom-2 end-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-[#1C1917] backdrop-blur-xs shadow-2xs hover:scale-110 active:scale-90 transition-transform"
                    aria-label="Favorite"
                  >
                    <Heart
                      size={12}
                      weight={favorites[dir.id] ? "fill" : "regular"}
                      className={favorites[dir.id] ? "text-rose-600 fill-rose-600" : ""}
                    />
                  </button>
                </div>

                {/* Details */}
                <div className="p-2.5">
                  <h4 className="font-serif text-xs font-semibold text-[#1C1917] dark:text-[#FAF7F2] truncate">
                    {name}
                  </h4>
                  <p className="mt-0.5 text-[10px] text-[#78716C] dark:text-[#989692] truncate">
                    {sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
