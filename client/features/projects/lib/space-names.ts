export interface SpaceLike {
  id?: string;
  spaceType?: string;
  customName?: string;
}

const SPACE_DICTIONARY: Record<string, { ar: string; en: string }> = {
  living: {
    ar: "غرفة المعيشة وصالون الاستقبال",
    en: "Formal Living & Reception",
  },
  reception: {
    ar: "ريسبشن وصالون الاستقبال",
    en: "Formal Reception Salon",
  },
  reception_living: {
    ar: "ريسبشن وصالون الاستقبال والمعيشة",
    en: "Reception & Living Room",
  },
  dining: {
    ar: "غرفة السفرة وتناول الطعام",
    en: "Dining Hall",
  },
  kitchen: {
    ar: "المطبخ وجزيرة التحضير",
    en: "Kitchen & Prep Island",
  },
  open_kitchen: {
    ar: "مطبخ أمريكي مفتوح مع جزيرة",
    en: "Open Kitchen Island",
  },
  open_kitchen_island: {
    ar: "مطبخ أمريكي مفتوح مع جزيرة",
    en: "Open Kitchen Island",
  },
  master: {
    ar: "جناح النوم الرئيسي (ماستر ودريسنج)",
    en: "Master Bedroom Suite",
  },
  master_bedroom: {
    ar: "جناح النوم الرئيسي (ماستر ودريسنج)",
    en: "Master Bedroom Suite",
  },
  guest_bedrooms: {
    ar: "غرف النوم العائلية والضيوف",
    en: "Family & Guest Bedrooms",
  },
  guest_bedroom: {
    ar: "غرفة نوم الضيوف",
    en: "Guest Bedroom",
  },
  bedroom: {
    ar: "غرفة نوم إضافية",
    en: "Additional Bedroom",
  },
  bathrooms: {
    ar: "الحمامات والسبا الفندقي",
    en: "Bathrooms & Hotel Spa",
  },
  bathroom: {
    ar: "حمام خاص / ضيوف",
    en: "Guest / En-suite Bathroom",
  },
  terrace: {
    ar: "التراس الخارجي والفراندة",
    en: "Private Terrace & Loggia",
  },
  office: {
    ar: "المكتب وغرفة القراءة والعمل",
    en: "Home Office & Study",
  },
  dressing: {
    ar: "غرفة الملابس (دريسنج روم)",
    en: "Dressing Room & Wardrobe",
  },
  garden: {
    ar: "الحديقة واللاندسكيب الخارجي",
    en: "Landscape & Private Garden",
  },
  roof: {
    ar: "الرووف والتراس العلوي",
    en: "Rooftop Terrace & Pergola",
  },
  lounge: {
    ar: "لاونج واستراحة عائلية",
    en: "Family Living Lounge",
  },
  maid_room: {
    ar: "غرفة المساعدة والخدمات",
    en: "Housekeeper Suite",
  },
};

const STYLE_DICTIONARY: Record<string, { ar: string; en: string }> = {
  modern: {
    ar: "مودرن معاصر",
    en: "Contemporary Modern",
  },
  contemporary: {
    ar: "مودرن معاصر",
    en: "Contemporary Modern",
  },
  contemporary_modern: {
    ar: "مودرن معاصر",
    en: "Contemporary Modern",
  },
  mediterranean: {
    ar: "طراز متوسطي وساحلي",
    en: "Mediterranean Coastal",
  },
  mediterranean_coastal: {
    ar: "طراز متوسطي وساحلي",
    en: "Mediterranean Coastal",
  },
  minimal: {
    ar: "مينيمال دافئ",
    en: "Warm Minimalist",
  },
  minimalist: {
    ar: "مينيمال دافئ",
    en: "Warm Minimalist",
  },
  warm_minimalist: {
    ar: "مينيمال دافئ",
    en: "Warm Minimalist",
  },
  modern_minimalist: {
    ar: "مينيمال دافئ",
    en: "Warm Minimalist",
  },
  neo_classic: {
    ar: "نيو كلاسيك فرنسي",
    en: "French Neo-Classic",
  },
  neoclassic: {
    ar: "نيو كلاسيك فرنسي",
    en: "French Neo-Classic",
  },
  french_neo_classic: {
    ar: "نيو كلاسيك فرنسي",
    en: "French Neo-Classic",
  },
  scandinavian: {
    ar: "إسكندنافي هادئ",
    en: "Warm Scandinavian",
  },
  scandinavian_luxury: {
    ar: "إسكندنافي هادئ",
    en: "Warm Scandinavian",
  },
  warm_scandinavian: {
    ar: "إسكندنافي هادئ",
    en: "Warm Scandinavian",
  },
  islamic_heritage: {
    ar: "إسلامي معاصر",
    en: "Contemporary Islamic Heritage",
  },
};

const hasArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .replace(/^space\./, "")
    .replace(/^style\./, "")
    .replace(/[&]/g, " ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Returns a clean, human-readable display name for any spatial zone.
 * Never outputs raw technical identifiers like 'master_bedroom' or 'space.living'.
 */
export function getSpaceDisplayName(space: SpaceLike | string | null | undefined, isRTL: boolean = true): string {
  if (!space) return isRTL ? "مساحة غير محددة" : "Unspecified Space";

  if (typeof space === "string") {
    const norm = normalizeKey(space);
    if (SPACE_DICTIONARY[norm]) {
      return isRTL ? SPACE_DICTIONARY[norm].ar : SPACE_DICTIONARY[norm].en;
    }
    return isRTL
      ? space.replace(/[_-]/g, " ")
      : space.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // 1. If user typed an explicit custom name in the current language, respect it
  const custom = space.customName?.trim();
  if (custom && !custom.startsWith("custom_")) {
    if (isRTL && hasArabic(custom)) {
      return custom;
    }
    if (!isRTL && !hasArabic(custom)) {
      return custom;
    }
  }

  // 2. Lookup by normalized customName, spaceType, or id
  const keysToTry = [
    space.spaceType ? normalizeKey(space.spaceType) : "",
    custom ? normalizeKey(custom) : "",
    space.id ? normalizeKey(space.id) : "",
  ].filter(Boolean);

  for (const k of keysToTry) {
    if (SPACE_DICTIONARY[k]) {
      return isRTL ? SPACE_DICTIONARY[k].ar : SPACE_DICTIONARY[k].en;
    }
  }

  // 3. Fallback to custom name if available
  if (custom && !custom.startsWith("custom_")) {
    return custom;
  }

  return isRTL ? "غرفة مخصصة" : "Custom Interior Space";
}

/**
 * Returns a localized human-readable style title.
 */
export function getStyleDisplayName(styleIdOrName: string | undefined | null, isRTL: boolean = true): string {
  if (!styleIdOrName) return isRTL ? "الستايل العام للبيت" : "Harmonized Residence Palette";

  if (isRTL && hasArabic(styleIdOrName)) {
    return styleIdOrName;
  }

  const norm = normalizeKey(styleIdOrName);
  if (STYLE_DICTIONARY[norm]) {
    return isRTL ? STYLE_DICTIONARY[norm].ar : STYLE_DICTIONARY[norm].en;
  }

  // Check partial key matches
  for (const [key, value] of Object.entries(STYLE_DICTIONARY)) {
    if (norm.includes(key) || key.includes(norm)) {
      return isRTL ? value.ar : value.en;
    }
  }

  return isRTL
    ? styleIdOrName.replace(/[_-]/g, " ")
    : styleIdOrName.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
