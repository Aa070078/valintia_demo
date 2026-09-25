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
    "wizard.completed": "Completed",
    "wizard.edit_selections": "Edit Selections",
    "wizard.step_1": "Typology",
    "wizard.step_2": "Style Discovery",
    "wizard.step_3": "Spatial Program",
    "wizard.step_4": "Property Specs",
    "wizard.step_5": "Client Location",
    "wizard.step_6": "Local Representative",
    "wizard.step_7": "Scope of Work",
    "wizard.step_8": "Target Budget",
    "wizard.step_9": "Timeline",
    "wizard.step_10": "Drawings & CAD",
    "wizard.step_11": "Review & Submit",
    "lifecycle.title": "PROJECT LIFECYCLE",
    "lifecycle.dashboard": "Projects Dashboard",
    "lifecycle.step_property": "Typology",
    "lifecycle.step_style": "Style Discovery",
    "lifecycle.step_spaces": "Spatial Program",
    "lifecycle.step_property_info": "Property Specs",
    "lifecycle.step_location": "Client Location",
    "lifecycle.step_representative": "Representative",
    "lifecycle.step_scope": "Scope of Work",
    "lifecycle.step_budget": "Target Budget",
    "lifecycle.step_timeline": "Timeline",
    "lifecycle.step_drawings": "Drawings & CAD",
    "lifecycle.step_review": "Review & Submit",
    "nav.fitout_commission": "FIT-OUT COMMISSION • SPECIFICATION FLOW",

    // Step 1: Welcome
    "step1.eyebrow": "01 — 06 • WELCOME / INITIATION",
    "step1.title": "From a place to a lifestyle",
    "step1.desc":
      "We design and build exceptional spaces in Egypt, while you stay connected from anywhere.",
    "step1.cta": "Start Your Project",
    "step1.back": "Projects Dashboard",

    // Step 2: Property Type
    "step2.eyebrow": "02 — 06 • PROJECT & PROPERTY TYPE",
    "step2.title": "Tell us about your project",
    "step2.desc":
      "Choose the architectural typology of the space you wish to commission. Each scheme is meticulously tailored to its structural volume and spatial rhythm.",
    "step2.params_title": "SPECIFICATION PARAMETERS",
    "step2.param_scope": "Property Attributes & Geographic Scope",
    "step2.adaptive_calc": "Adaptive volumetric estimation",
    "step2.field_name": "PROJECT TITLE",
    "step2.field_area": "GROSS AREA (SQM)",
    "step2.switch_sqft": "Switch to SQFT",
    "step2.switch_sqm": "Switch to SQM",
    "step2.field_region": "METROPOLITAN REGION",
    "step2.field_district": "MASTERPLAN / DISTRICT",
    "step2.index_caption": "Internal atelier project index",
    "step2.logistics_caption": "Determines logistics & supply ateliers",
    "step2.district_caption": "Gated enclave or plot identifier",
    "step2.envelope_label": "Estimated Architectural Envelope",
    "step2.confidence_label": "SPATIAL CONFIDENCE",
    "step2.confidence_value": "Preliminary Complete (85%)",

    // Property Types
    "property.villa": "Villa",
    "property.villa_desc": "Freestanding luxury residences, twin houses & estates.",
    "property.apartment": "Apartment",
    "property.apartment_desc": "Urban residences, penthouses & mid-rise flats.",
    "property.duplex": "Duplex",
    "property.duplex_desc": "Multi-tier architectural volumes with dual floor levels.",
    "property.penthouse": "Penthouse",
    "property.penthouse_desc": "Skyline residences with private rooftop terraces.",
    "property.commercial": "Commercial",
    "property.commercial_desc": "Bespoke executive suites, creative studios & showrooms.",
    "property.other": "Other",
    "property.other_desc": "Bespoke architectural pavilions & coastal vacation chalets.",

    // Step 3: Spaces
    "step3.eyebrow": "03 — 06 • SELECT SPACES",
    "step3.title": "Which spaces would you like us to include?",
    "step3.desc":
      "Select the spaces for your fit-out project. You can adjust quantities and customize individual architectural finishes later.",
    "step3.zones_active": "13 ZONES ACTIVE · Est. 480 m²",
    "step3.tab_3d": "Axonometric 3D",
    "step3.tab_2d": "2D Blueprint",
    "step3.pin_master": "Master Suite",
    "step3.pin_baths": "Sanctuary Baths",
    "step3.pin_kitchen": "Kitchen & Dining",
    "step3.legend_included": "Included in Fit-Out",
    "step3.legend_excluded": "Excluded",
    "step3.metric_footprint": "SPATIAL FOOTPRINT",
    "step3.metric_height": "CEILING CLEAR HEIGHT",
    "step3.metric_trajectory": "PROJECT TRAJECTORY",
    "step3.inventory_title": "ARCHITECTURAL INVENTORY",
    "step3.inventory_zones": "8 Curated Zones",
    "step3.add_custom_btn": "+ Add Custom Architectural Space",

    // Step 4: Your Style
    "step4.eyebrow": "04 — 06 • AESTHETIC DIRECTION",
    "step4.title": "What feels like you?",
    "step4.desc":
      "Explore aesthetic directions tailored to your architecture. Save favorite atmospheres or allow our design atelier to synthesize a harmonious blend.",
    "step4.allow_blend": "Allow Atelier Blend",
    "step4.blend_desc": "Harmonize 2–3 complimentary moods",
    "step4.primary_selection": "CURATED PRIMARY SELECTION",
    "step4.palette_directions": "Explore Palette Directions (Select to preview full architectural narrative)",
    "step4.variations": "06 VARIATIONS AVAILABLE",
    "step4.fine_tune": "Fine-Tune Palette",
    "step4.add_btn": "Add",
    "step4.cancel_btn": "Cancel",

    // Step 5: Brief Review
    "step5.eyebrow": "05 — 06 • YOUR DESIGN BRIEF",
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
    "step5.cta_confirm": "Confirm & Submit Brief",
    "step5.cta_creating": "Submitting Brief...",

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
    "wizard.completed": "تم الإنجاز",
    "wizard.edit_selections": "تعديل الاختيارات",
    "wizard.step_1": "النمط المعماري",
    "wizard.step_2": "استكشاف الطراز",
    "wizard.step_3": "الفراغات المعمارية",
    "wizard.step_4": "بيانات العقار",
    "wizard.step_5": "موقع الإقامة",
    "wizard.step_6": "الممثل بمصر",
    "wizard.step_7": "نطاق العمل",
    "wizard.step_8": "الميزانية المقدرة",
    "wizard.step_9": "الجدول الزمني",
    "wizard.step_10": "المخططات والكاد",
    "wizard.step_11": "المراجعة والاعتماد",
    "lifecycle.title": "دورة حياة المشروع",
    "lifecycle.dashboard": "لوحة تحكم المشاريع",
    "lifecycle.step_property": "النمط المعماري",
    "lifecycle.step_style": "استكشاف الطراز",
    "lifecycle.step_spaces": "الفراغات المعمارية",
    "lifecycle.step_property_info": "بيانات العقار",
    "lifecycle.step_location": "موقع الإقامة",
    "lifecycle.step_representative": "الممثل بمصر",
    "lifecycle.step_scope": "نطاق العمل",
    "lifecycle.step_budget": "الميزانية المقدرة",
    "lifecycle.step_timeline": "الجدول الزمني",
    "lifecycle.step_drawings": "المخططات والكاد",
    "lifecycle.step_review": "المراجعة والاعتماد",
    "nav.fitout_commission": "تكليف التشطيبات المعمارية • مسار المواصفات",

    // Step 1: Welcome
    "step1.eyebrow": "٠١ — ٠٦ • البداية والمقدمة",
    "step1.title": "من مجرّد مساحة إلى أسلوب حياة",
    "step1.desc":
      "نصمم وننفّذ مشاريع معمارية وتشطيبات متكاملة راقية في مصر، مع متابعة لحظية أينما كنت.",
    "step1.cta": "ابدأ تجهيز مشروعك",
    "step1.back": "لوحة المشاريع",

    // Step 2: Property Type
    "step2.eyebrow": "٠٢ — ٠٦ • نوع العقار والنمط المعماري",
    "step2.title": "أخبرنا عن تفاصيل مسكنك ومشروعك",
    "step2.desc":
      "اختر النمط المعماري للمساحة التي ترغب في تشطيبها. يتم تخصيص كل تصميم وفقاً لكتلته البنائية وإيقاعه المكاني.",
    "step2.params_title": "محددات المواصفات المعمارية",
    "step2.param_scope": "خصائص العقار والنطاق الجغرافي",
    "step2.adaptive_calc": "التقدير الحجمي التكيفي",
    "step2.field_name": "اسم المشروع / المسكن",
    "step2.field_area": "المساحة الإجمالية (م²)",
    "step2.switch_sqft": "التحويل للقدم المربع",
    "step2.switch_sqm": "التحويل للمتر المربع",
    "step2.field_region": "النطاق الجغرافي واللوجستي",
    "step2.field_district": "الموقع / الكمبوند السكني",
    "step2.index_caption": "المعرف الداخلي لمشروع الاستوديو",
    "step2.logistics_caption": "يحدد استوديوهات التوريد واللوجستيات",
    "step2.district_caption": "الكمبوند السكني أو رقم القطعة",
    "step2.envelope_label": "الغلاف المعماري المقدر",
    "step2.confidence_label": "مستوى الدقة المكانية",
    "step2.confidence_value": "اكتمال مبدئي (٨٥٪)",

    // Property Types
    "property.villa": "فيلا مستقلة",
    "property.villa_desc": "فيلات مستقلة فاخرة، تاون هاوس، وتوين هاوس بتصميم حصري.",
    "property.apartment": "شقة سكنية",
    "property.apartment_desc": "شقق فاخرة ذات طابق واحد، بنتهاوس، ومساحات معيشة معاصرة.",
    "property.duplex": "دوبلكس",
    "property.duplex_desc": "مساحات معمارية متعددة الطوابق بأسقف مزدوجة الارتفاع.",
    "property.penthouse": "بنتهاوس",
    "property.penthouse_desc": "مساحات سكنية علوية بإطلالة بانورامية وتراس خاص.",
    "property.commercial": "مكتب إداري",
    "property.commercial_desc": "مساحات عمل تنفيذية، استوديوهات إبداعية، وأجنحة إدارية.",
    "property.other": "نمط خاص",
    "property.other_desc": "أجنحة واستراحات خاصة مصممة حسب الطلب وشاليهات ساحلية.",

    // Step 3: Spaces
    "step3.eyebrow": "٠٣ — ٠٦ • تحديد المساحات",
    "step3.title": "ما هي المساحات التي ترغب بإضافتها؟",
    "step3.desc":
      "حدد غرف ومرافق مسكنك. يمكنك دائماً تعديل الكميات وتخصيص التشطيبات لاحقاً.",
    "step3.zones_active": "١٣ منطقة نشطة · تقديري ٤٨٠ م²",
    "step3.tab_3d": "أيزومتري ثلاثي الأبعاد",
    "step3.tab_2d": "مخطط ثنائي الأبعاد",
    "step3.pin_master": "الجناح الرئيسي",
    "step3.pin_baths": "حمامات السبا",
    "step3.pin_kitchen": "المطبخ وغرفة الطعام",
    "step3.legend_included": "مشمول في التشطيب",
    "step3.legend_excluded": "غير مشمول",
    "step3.metric_footprint": "البصمة المكانية",
    "step3.metric_height": "ارتفاع السقف الصافي",
    "step3.metric_trajectory": "المرحلة التنفيذية",
    "step3.inventory_title": "قائمة المساحات المعمارية",
    "step3.inventory_zones": "٨ مناطق منتقاة",
    "step3.add_custom_btn": "+ إضافة مساحة معمارية خاصة",

    // Step 4: Your Style
    "step4.eyebrow": "٠٤ — ٠٦ • أسلوبك المعماري",
    "step4.title": "ما هو الأسلوب الأقرب لذوقك؟",
    "step4.desc":
      "تصفح التوجهات الجمالية الملائمة لمعمارك. احفظ أجوائك المفضلة أو دع استوديو التصميم ينسق مزيجاً متناغماً.",
    "step4.allow_blend": "السماح بمزيج استوديو التصميم",
    "step4.blend_desc": "دمج ٢-٣ أنماط متناغمة ومتناسقة",
    "step4.primary_selection": "الاختيار الأساسي المعتمد",
    "step4.palette_directions": "استكشف خيارات لوحة الخامات (اختر لمعاينة السرد المعماري الكامل)",
    "step4.variations": "٠٦ خيارات متاحة",
    "step4.fine_tune": "تخصيص لوحة الخامات",
    "step4.add_btn": "إضافة",
    "step4.cancel_btn": "إلغاء",

    // Step 5: Brief Review
    "step5.eyebrow": "٠٥ — ٠٦ • كراسة المواصفات المعمارية",
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
    "step5.cta_confirm": "تأكيد وإرسال كراسة المواصفات",
    "step5.cta_creating": "جاري إرسال المواصفات...",

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
