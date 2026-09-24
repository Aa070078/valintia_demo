"use client";

import * as React from "react";

export type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const DICTIONARY: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Top Header
    "brand.name": "VALENTIA",
    "brand.tagline": "Fit-Out & Interior Solutions",
    "nav.portfolio": "Portfolio",
    "nav.start_project": "Start Project",
    "nav.new_project": "New Project",

    // Hero Section
    "hero.eyebrow": "Your Journey Starts Here",
    "hero.title_1": "From a place",
    "hero.title_2": "to a lifestyle",
    "hero.description":
      "We design and build exceptional spaces in Egypt, while you stay connected from anywhere.",
    "hero.cta_start": "Start Your Project",
    "hero.cta_watch": "Watch how it works",
    "hero.cta_watch_duration": "2 min",
    "hero.floating_title_1": "A home",
    "hero.floating_title_2": "that feels like you",
    "hero.phase_concept": "Concept",
    "hero.phase_design": "Design",
    "hero.phase_execution": "Execution",
    "hero.phase_handover": "Handover",

    // Portfolio Section
    "portfolio.eyebrow": "Architectural Portfolio",
    "portfolio.title": "Your Projects",
    "portfolio.description":
      "Manage and track your interior architecture developments from initial concept to turnkey handover in Egypt.",
    "portfolio.tab_all": "All Projects",
    "portfolio.tab_active": "In Execution",
    "portfolio.tab_review": "In Review",
    "portfolio.tab_draft": "Drafts",
    "portfolio.showing": "Showing",
    "portfolio.of_properties": "of properties",
    "portfolio.view_project": "View Project",
    "portfolio.spaces_configured": "spaces configured",
    "portfolio.empty_title": "No Projects Yet",
    "portfolio.empty_desc":
      "Begin your luxury interior fit-out journey with Valentia by creating your first residential project.",

    // Wizard Common
    "wizard.back": "Back",
    "wizard.next": "Next",
    "wizard.skip": "Skip for now",
    "wizard.step_prefix": "Step",
    "wizard.step_of": "of",
    "wizard.edit_selections": "Edit Selections",
    "wizard.step_1": "Welcome",
    "wizard.step_2": "Project Type",
    "wizard.step_3": "Your Style",
    "wizard.step_4": "Spaces",
    "wizard.step_5": "Your Brief",
    "wizard.step_6": "Review",

    // Step 1: Welcome
    "step1.eyebrow": "01 / 06 · WELCOME & INTENT",
    "step1.title": "Turnkey Fit-Out, Reimagined",
    "step1.desc":
      "Welcome to Valentia Design & Build. Over the next 5 streamlined steps, we will capture your residence typology, aesthetic inclinations, and spatial requirements to prepare your custom architectural design brief.",
    "step1.card1_title": "01 · Property Typology",
    "step1.card1_desc":
      "Select your residence format (Villa, Apartment, Studio) and define square meters and location across Egypt.",
    "step1.card2_title": "02 · Style Discovery",
    "step1.card2_desc":
      "Explore curated material palettes and architectural archetypes in our interactive 3D perspective gallery.",
    "step1.card3_title": "03 · Spatial Blueprint",
    "step1.card3_desc":
      "Configure rooms and custom zones using an architectural isometric floorplan with instant scope visualization.",
    "step1.cta": "Begin Project Setup",
    "step1.back": "Return to Portfolio",

    // Step 2: Property Type
    "step2.eyebrow": "02 / 06 · PROJECT TYPE",
    "step2.title": "What are we creating?",
    "step2.desc": "Choose the type of property you want to design and fit out.",
    "step2.params_title": "Project Parameters",
    "step2.params_auto": "Auto-configured",
    "step2.field_name": "Project Name",
    "step2.field_area": "Area (m²)",
    "step2.field_location": "Location / Compound",

    // Property Types
    "property.villa": "Villa",
    "property.villa_desc":
      "Standalone luxury residences, twin houses, and townhouses.",
    "property.apartment": "Apartment",
    "property.apartment_desc":
      "Single-level contemporary residences, penthouses, and flats.",
    "property.commercial": "Office",
    "property.commercial_desc":
      "Executive workspaces, creative studios, and administrative suites.",
    "property.retail": "Retail Space",
    "property.retail_desc":
      "Luxury commercial boutiques, hospitality, and showrooms.",
    "property.other": "Other",
    "property.other_desc":
      "Chalets, coastal vacation retreats, and bespoke architectural builds.",

    // Step 3: Style Discovery
    "step3.eyebrow": "03 / 06 · YOUR STYLE",
    "step3.title": "Discover your style",
    "step3.desc":
      "Explore styles that match your taste. You can like, save, or let our designers recommend.",
    "step3.archetypes_title": "Aesthetic Archetypes",
    "step3.archetypes_sub": "Select one to feature",

    // Step 4: Spaces
    "step4.eyebrow": "04 / 06 · SELECT SPACES",
    "step4.title": "Which spaces would you like to include?",
    "step4.desc":
      "Select the spaces for your project. You can always add or remove later.",
    "step4.spatial_badge": "Spatial Architecture",
    "step4.selected_count": "Spaces Selected",
    "step4.add_custom": "Add Custom Space",
    "step4.add_btn": "Add",
    "step4.cancel_btn": "Cancel",
    "step4.custom_placeholder": "e.g. Home Cinema, Private Gym, Dressing Room",

    // Spaces Names
    "space.living": "Living Room",
    "space.dining": "Dining Room",
    "space.kitchen": "Kitchen",
    "space.master_bedroom": "Master Bedroom",
    "space.bedroom": "Bedroom",
    "space.bathrooms": "Bathrooms",
    "space.terrace": "Terrace",
    "space.outdoor": "Outdoor",

    // Step 5: Brief Review
    "step5.eyebrow": "05 / 06 · YOUR DESIGN BRIEF",
    "step5.title": "Here is your design brief",
    "step5.desc":
      "A summary of your selections. You can edit anything before we continue.",
    "step5.property_type": "Property Type",
    "step5.primary_style": "Primary Style",
    "step5.secondary_style": "Secondary Style",
    "step5.included_spaces": "Included Spaces",
    "step5.modify": "Modify",
    "step5.inspiration": "Inspiration",
    "step5.notes_title": "Your Notes",
    "step5.notes_placeholder":
      "I want a warm, modern design with natural materials and a lot of light. I prefer neutral colors with some wooden elements.",
    "step5.cta_confirm": "Confirm & Create Project",
    "step5.cta_creating": "Creating Project...",

    // Step 6: Confirmation
    "step6.confirmed_badge": "Design Brief Confirmed",
    "step6.title": "Your Project Is Initialized",
    "step6.desc":
      "Our lead architect and site engineers in Cairo have received your brief. Your preliminary spatial model and moodboard are ready for review.",
    "step6.cta_workspace": "View Project Workspace",
    "step6.cta_portfolio": "Go to Portfolio",

    // Status Chips
    "status.draft": "Draft",
    "status.concept_selected": "Concept Selected",
    "status.drawing_uploaded": "Drawing Uploaded",
    "status.under_engineer_review": "Under Review",
    "status.meeting_scheduled": "Meeting Scheduled",
    "status.site_visit_scheduled": "Site Visit Scheduled",
    "status.site_visit_paid": "Site Visit Paid",
    "status.design_in_progress": "Design in Progress",
    "status.design_delivered": "Design Delivered",
    "status.boq_confirmed": "BOQ Confirmed",
    "status.execution": "In Execution",
    "status.completed": "Completed",

    // Styles
    "style.modern": "Modern",
    "style.modern_tagline": "Clean lines & architectural balance",
    "style.modern_desc": "Clean lines, open, calm spaces and a refined balance of materials. Emphasizes natural light, neutral undertones, and warm oak carpentry.",
    "style.mediterranean": "Mediterranean",
    "style.mediterranean_tagline": "Sunlit coastal luxury & organic textures",
    "style.mediterranean_desc": "Arched thresholds, hand-finished lime plaster walls, natural travertine tiles, and organic terracotta tones inspired by the North Coast.",
    "style.minimal": "Warm Minimalist",
    "style.minimal_tagline": "Serenity through restrained materiality",
    "style.minimal_desc": "Subtle textural richness with zero visual clutter. Low-slung boucle furnishings, flush hidden doors, and indirect architectural cove lighting.",
    "style.neo_classic": "Neo Classic",
    "style.neo_classic_tagline": "Timeless Parisian moldings & marble",
    "style.neo_classic_desc": "Delicate wall boiserie, herringbone French oak parquetry, Calacatta marble fireplaces, and sculptural contemporary brass chandeliers.",
    "style.scandinavian": "Scandinavian",
    "style.scandinavian_tagline": "Airy ash wood, wool, and Nordic warmth",
    "style.scandinavian_desc": "Pale wood joinery, ergonomic designer seating, layered tactile textiles, and an abundance of serene ambient diffused daylight.",
    "style.islamic_heritage": "Contemporary Islamic",
    "style.islamic_heritage_tagline": "Historic Cairo geometry reinterpreted",
    "style.islamic_heritage_desc": "Sophisticated geometric mashrabiya screening, hand-chiseled limestone accents, and serene interior courtyards designed for modern Cairo.",
    "style.industrial_luxury": "Industrial Luxury",
    "style.industrial_luxury_tagline": "Patinated bronze & raw architectural elegance",
    "style.industrial_luxury_desc": "Blackened steel frames, patinated bronze accents, fluted glass partitions, and raw architectural concrete balanced with plush velvets.",
    "style.japandi": "Japandi",
    "style.japandi_tagline": "Japanese wabi-sabi meets Nordic functionality",
    "style.japandi_desc": "Natural cedar woodwork, handwoven paper cord elements, organic ceramic vessels, and low-profile horizontal planes emphasizing tranquility.",

    // Footer
    "footer.title": "VALENTIA",
    "footer.tagline": "Design & Build Architecture Studio",
    "footer.locations": "Sheikh Zayed · New Cairo · North Coast · Cairo, Egypt",
    "footer.rights": "Valentia Fit-Out. All rights reserved.",
  },
  ar: {
    // Brand & Top Header
    "brand.name": "فالنتيا",
    "brand.tagline": "حلول العمارة والتصميم الداخلي والتشطيبات",
    "nav.portfolio": "المشاريع",
    "nav.start_project": "ابدأ مشروعك",
    "nav.new_project": "مشروع جديد",

    // Hero Section
    "hero.eyebrow": "رحلتك المعمارية تبدأ هنا",
    "hero.title_1": "من مجرّد مساحة",
    "hero.title_2": "إلى أسلوب حياة",
    "hero.description":
      "نصمم وننفّذ مشاريع معمارية وتشطيبات متكاملة راقية في مصر، مع متابعة لحظية أينما كنت.",
    "hero.cta_start": "ابدأ مشروعك الآن",
    "hero.cta_watch": "شاهد كيف نعمل",
    "hero.cta_watch_duration": "دقيقتان",
    "hero.floating_title_1": "مسكن يعبّر",
    "hero.floating_title_2": "عن شخصيتك وتفاصيلك",
    "hero.phase_concept": "المفهوم",
    "hero.phase_design": "التصميم",
    "hero.phase_execution": "التنفيذ",
    "hero.phase_handover": "التسليم",

    // Portfolio Section
    "portfolio.eyebrow": "معرض الأعمال المعمارية",
    "portfolio.title": "مشاريعك السكنية",
    "portfolio.description":
      "إدارة ومتابعة مشاريع التشطيب والتصميم الداخلي من الفكرة المعمارية الأولية وحتى الاستلام المفتاح في مصر.",
    "portfolio.tab_all": "جميع المشاريع",
    "portfolio.tab_active": "قيد التنفيذ",
    "portfolio.tab_review": "قيد المراجعة",
    "portfolio.tab_draft": "مسودات",
    "portfolio.showing": "عرض",
    "portfolio.of_properties": "من العقارات",
    "portfolio.view_project": "تفاصيل المشروع",
    "portfolio.spaces_configured": "مساحات محددة",
    "portfolio.empty_title": "لا توجد مشاريع حتى الآن",
    "portfolio.empty_desc":
      "ابدأ رحلة التشطيب الفاخر مع فالنتيا من خلال إنشاء أول مشروع سكني لك.",

    // Wizard Common
    "wizard.back": "السابق",
    "wizard.next": "التالي",
    "wizard.skip": "تخطي الآن",
    "wizard.step_prefix": "الخطوة",
    "wizard.step_of": "من",
    "wizard.edit_selections": "تعديل الاختيارات",
    "wizard.step_1": "البداية",
    "wizard.step_2": "نوع العقار",
    "wizard.step_3": "أسلوبك",
    "wizard.step_4": "المساحات",
    "wizard.step_5": "ملخص المواصفات",
    "wizard.step_6": "المراجعة",

    // Step 1: Welcome
    "step1.eyebrow": "٠١ / ٠٦ · مرحباً بك في فالنتيا",
    "step1.title": "تشطيبات معمارية متكاملة برؤية جديدة",
    "step1.desc":
      "مرحباً بك في فالنتيا للتصميم والبناء. خلال ٥ خطوات بسيطة ومنظمة، سنحدد معاً نوع مسكنك، وذوقك المعماري، والمساحات المطلوبة لإعداد كراسة المواصفات الخاصة بك.",
    "step1.card1_title": "٠١ · نوع العقار والبيانات",
    "step1.card1_desc":
      "حدد نوع الوحدة (فيلا، شقة، استوديو) والمساحة بالمتر المربع وموقع العقار داخل مصر.",
    "step1.card2_title": "٠٢ · استكشاف الطراز المعماري",
    "step1.card2_desc":
      "تصفح باليتات الخامات الطبيعية والأنماط المعمارية في معرضنا التفاعلي ثلاثي الأبعاد.",
    "step1.card3_title": "٠٣ · المخطط المكاني للغرف",
    "step1.card3_desc":
      "اختر غرفك ومساحاتك الخاصة عبر ماكيت أيزومتري معماري مع حصر فوري للاحتياجات.",
    "step1.cta": "ابدأ تجهيز مشروعك",
    "step1.back": "العودة للمشاريع",

    // Step 2: Property Type
    "step2.eyebrow": "٠٢ / ٠٦ · نوع العقار",
    "step2.title": "ماذا سنبتكر معاً؟",
    "step2.desc": "اختر نوع العقار الذي ترغب في تصميمه وتشطيبه.",
    "step2.params_title": "بيانات المشروع المعماري",
    "step2.params_auto": "تم الضبط تلقائياً",
    "step2.field_name": "اسم المشروع / المسكن",
    "step2.field_area": "المساحة (م²)",
    "step2.field_location": "الموقع / الكمبوند",

    // Property Types
    "property.villa": "فيلا مستقلة",
    "property.villa_desc":
      "فيلات مستقلة فاخرة، تاون هاوس، وتوين هاوس بتصميم حصري.",
    "property.apartment": "شقة سكنية",
    "property.apartment_desc":
      "شقق فاخرة ذات طابق واحد، بنتهاوس، ومساحات معيشة معاصرة.",
    "property.commercial": "مكتب إداري",
    "property.commercial_desc":
      "مساحات عمل تنفيذية، استوديوهات إبداعية، وأجنحة إدارية.",
    "property.retail": "مساحة تجارية",
    "property.retail_desc":
      "بوتيكات تجارية راقية، ضيافة، وصالات عرض ومطاعم فاخرة.",
    "property.other": "نمط خاص",
    "property.other_desc":
      "شاليهات، مساكن ساحلية واستراحات خاصة مصممة حسب الطلب.",

    // Step 3: Style Discovery
    "step3.eyebrow": "٠٣ / ٠٦ · أسلوبك المعماري",
    "step3.title": "اكتشف أسلوبك المعماري",
    "step3.desc":
      "تصفح الأنماط التي تلائم ذوقك. يمكنك الإعجاب بالنمط أو الحفظ أو طلب توصية مهندسينا.",
    "step3.archetypes_title": "الأنماط المعمارية المعتمدة",
    "step3.archetypes_sub": "اختر نمطاً لتمييزه",

    // Step 4: Spaces
    "step4.eyebrow": "٠٤ / ٠٦ · تحديد المساحات",
    "step4.title": "ما هي المساحات التي ترغب بإضافتها؟",
    "step4.desc":
      "حدد غرف ومرافق مسكنك. يمكنك دائماً التعديل والإضافة لاحقاً.",
    "step4.spatial_badge": "الهيكلة المكانية",
    "step4.selected_count": "مساحات محددة",
    "step4.add_custom": "إضافة مساحة خاصة",
    "step4.add_btn": "إضافة",
    "step4.cancel_btn": "إلغاء",
    "step4.custom_placeholder": "مثال: سينما منزلية، جيم خاص، غرفة ملابس مستقلة",

    // Spaces Names
    "space.living": "غرفة المعيشة",
    "space.dining": "غرفة الطعام",
    "space.kitchen": "المطبخ",
    "space.master_bedroom": "غرفة النوم الرئيسية",
    "space.bedroom": "غرفة نوم إضافية",
    "space.bathrooms": "الحمامات",
    "space.terrace": "التراس المعلق",
    "space.outdoor": "الحديقة والمساحات الخارجية",

    // Step 5: Brief Review
    "step5.eyebrow": "٠٥ / ٠٦ · ملخص المواصفات",
    "step5.title": "ملخص كراسة المواصفات المعمارية",
    "step5.desc":
      "مراجعة شاملة لاختياراتك وتفضيلاتك. يمكنك تعديل أي قسم قبل التأكيد.",
    "step5.property_type": "نوع العقار",
    "step5.primary_style": "الطراز الأساسي",
    "step5.secondary_style": "الطراز المكمل",
    "step5.included_spaces": "المساحات المحددة",
    "step5.modify": "تعديل",
    "step5.inspiration": "معرض الإلهام والخامات",
    "step5.notes_title": "ملاحظاتك ورؤيتك المعمارية",
    "step5.notes_placeholder":
      "أفضل تصميماً دافئاً ومودرن يعتمد على الخامات الطبيعية ووفرة الإضاءة النهارية، مع استخدام الألوان المحايدة وعناصر الخشب والرخام.",
    "step5.cta_confirm": "تأكيد وإنشاء المشروع",
    "step5.cta_creating": "جاري إنشاء المشروع...",

    // Step 6: Confirmation
    "step6.confirmed_badge": "تم تأكيد كراسة المواصفات بنجاح",
    "step6.title": "تم تسجيل مواصفات مشروعك",
    "step6.desc":
      "استلم فريقنا المعماري ومهندسو التنفيذ في القاهرة تفاصيل مشروعك. يتم الآن تجهيز المخطط الأيزومتري المبدئي ولوحة الخامات الخاصة بك.",
    "step6.cta_workspace": "عرض مساحة عمل المشروع",
    "step6.cta_portfolio": "الانتقال لمعرض المشاريع",

    // Status Chips
    "status.draft": "مسودة",
    "status.concept_selected": "تم اختيار المفهوم",
    "status.drawing_uploaded": "تم رفع المخطط",
    "status.under_engineer_review": "قيد المراجعة الهندسية",
    "status.meeting_scheduled": "تم تحديد موعد اجتماع",
    "status.site_visit_scheduled": "معاينة موقع مجدولة",
    "status.site_visit_paid": "تم سداد المعاينة",
    "status.design_in_progress": "التصميم قيد الإعداد",
    "status.design_delivered": "تم تسليم التصميم",
    "status.boq_confirmed": "تم اعتماد المقايسة (BOQ)",
    "status.execution": "قيد التنفيذ بالموقع",
    "status.completed": "مكتمل وجاهز للتسليم",

    // Styles
    "style.modern": "مودرن معاصر",
    "style.modern_tagline": "خطوط هندسية نقية وتوازن معماري",
    "style.modern_desc": "خطوط نقية ومساحات مفتوحة مع توازن راقٍ بين الخامات الطبيعية، ووفرة الإضاءة الطبيعية والأخشاب الدافئة.",
    "style.mediterranean": "طراز متوسطي ساحلي",
    "style.mediterranean_tagline": "فخامة ساحلية مشمسة وخامات حجرية",
    "style.mediterranean_desc": "أقواس ناعمة، بياض جيري طبيعي، حجر الترافرتين، ودفء الألوان الترابية المستوحاة من الساحل الشمالي.",
    "style.minimal": "مينيمال دافئ",
    "style.minimal_tagline": "سكينة وأناقة بتفاصيل مختارة بعناية",
    "style.minimal_desc": "بساطة راقية خالية من أي تشويش بصري، مع إضاءات معمارية مخفية وأقمشة بوكليه ناعمة وأبواب فلاش مخفية.",
    "style.neo_classic": "نيو كلاسيك فرنسي",
    "style.neo_classic_tagline": "بانوهات جدارية باريسية ورخام فاخر",
    "style.neo_classic_desc": "بانوهات جدارية رفيعة، أرضيات باركيه فرنسي، رخام كلكتا نخب أول، وثريات نحاسية نحتية معاصرة.",
    "style.scandinavian": "طراز إسكندنافي هادئ",
    "style.scandinavian_tagline": "أخشاب دردار فاتحة ودفء نورديك",
    "style.scandinavian_desc": "أخشاب الدردار الفاتحة، جلسات مريحة ذات تصميم عالمي، خامات طبيعية ووفرة في الضوء الطبيعي الموزع بعناية.",
    "style.islamic_heritage": "إسلامي معاصر",
    "style.islamic_heritage_tagline": "إعادة صياغة لهندسة القاهرة التاريخية",
    "style.islamic_heritage_desc": "إعادة صياغة هندسية مبتكرة للمشربيات التراثية، حجر جيري منحوت يدوياً، وأفنية داخلية تناسب القاهرة العصرية.",
    "style.industrial_luxury": "إندستريال فاخر",
    "style.industrial_luxury_tagline": "برونز معتق وأناقة معمارية جريئة",
    "style.industrial_luxury_desc": "إطارات حديدية ناعمة، لمسات برونزية معتقة، فواصل زجاجية مضلعة، وخرسانة معمارية مصقولة مع مخمل فاخر.",
    "style.japandi": "جاباندي (ياباني - إسكندنافي)",
    "style.japandi_tagline": "فلسفة وابي-سابي مع الوظيفة العملية",
    "style.japandi_desc": "أخشاب الأرز الطبيعية، فخار يدوي عضوي، وتنسيق أفقي مريح يعزز السكينة والهدوء الوظيفي.",

    // Footer
    "footer.title": "فالنتيا",
    "footer.tagline": "استوديو العمارة والتصميم الداخلي المتكامل",
    "footer.locations":
      "الشيخ زايد · القاهرة الجديدة · الساحل الشمالي · القاهرة، مصر",
    "footer.rights": "فالنتيا فيت أوت. جميع الحقوق محفوظة.",
  },
};

const LanguageContext = React.createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  isRTL: false,
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("valentia_lang") as Language;
        if (saved === "en" || saved === "ar") {
          return saved;
        }
      } catch {
        // ignore
      }
    }
    return "en";
  });

  React.useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("valentia_lang", lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const t = (key: string): string => {
    const table = DICTIONARY[language] || DICTIONARY.en;
    return table[key] || DICTIONARY.en[key] || key;
  };

  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isRTL,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return React.useContext(LanguageContext);
}
