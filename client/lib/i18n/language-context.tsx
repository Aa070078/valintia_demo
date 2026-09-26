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
    "wizard.step_2": "Property Specs",
    "wizard.step_3": "Spatial Program",
    "wizard.step_4": "Style Discovery",
    "wizard.step_5": "Client Location",
    "wizard.step_6": "Local Representative",
    "wizard.step_7": "Scope of Work",
    "wizard.step_8": "Target Budget",
    "wizard.step_9": "Timeline",
    "wizard.step_10": "Drawings & CAD",
    "wizard.step_11": "Review & Brief",
    "lifecycle.title": "PROJECT LIFECYCLE",
    "lifecycle.dashboard": "Projects Dashboard",
    "lifecycle.step_property": "Typology",
    "lifecycle.step_property_info": "Property Specs",
    "lifecycle.step_spaces": "Spatial Program",
    "lifecycle.step_style": "Style Discovery",
    "lifecycle.step_location": "Client Location",
    "lifecycle.step_representative": "Representative",
    "lifecycle.step_scope": "Scope of Work",
    "lifecycle.step_budget": "Target Budget",
    "lifecycle.step_timeline": "Timeline",
    "lifecycle.step_drawings": "Drawings & CAD",
    "lifecycle.step_review": "Review & Brief",
    "nav.fitout_commission": "FIT-OUT COMMISSION • SPECIFICATION FLOW",

    // Style Strategy & Multi-Mode
    "style_strategy.title": "Aesthetic Strategy",
    "style_strategy.subtitle": "Choose how you would like to curate the interior architecture of your residence.",
    "style_strategy.unified_title": "Single Style for All",
    "style_strategy.unified_desc": "One coherent aesthetic language applied seamlessly across all spaces.",
    "style_strategy.per_space_title": "Curate Per Space",
    "style_strategy.per_space_desc": "Assign bespoke styles and materials to individual rooms and zones.",
    "style_strategy.designer_title": "Let Designer Curate",
    "style_strategy.designer_desc": "Valentia Atelier leads curate based on lighting, volumes and orientation.",
    "style_gallery.title": "Curated Gallery",
    "style_gallery.view_btn": "Explore Style & Rooms",
    "style_gallery.confirm_unified": "Confirm & Apply to Entire Residence",
    "style_gallery.confirm_per_space": "Apply to Selected Spaces",
    "style_gallery.select_spaces_label": "Assign this style to spaces:",
    "style_gallery.select_all": "Select All",
    "style_gallery.clear_all": "Clear",
    "style_gallery.applied_spaces": "Applied to",
    "style_gallery.no_spaces_selected": "Please select at least one space",
    "brief.title": "Here is your design brief",
    "brief.eyebrow": "05 — 06 YOUR DESIGN BRIEF",
    "brief.subtitle": "A summary of your selections. You can edit anything before we continue.",
    "brief.edit_selections": "Edit Selections",
    "brief.property_type": "Property Type",
    "brief.primary_style": "Primary Style",
    "brief.per_space_styles": "Per-Space Direction",
    "brief.included_spaces": "Included Spaces",
    "brief.inspiration_gallery": "Inspiration Gallery",
    "brief.your_notes": "Your Notes",
    "brief.notes_placeholder": "I want a warm, modern design with natural materials and a lot of light...",

    // Step 1: Welcome & Property Typology
    "step1.eyebrow": "01 — 06 • WELCOME / INITIATION",
    "step1.headline": "What are we creating?",
    "step1.subheadline":
      "Select the foundational architectural volume for your residence or commercial commission in Egypt.",
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

    // Spaces
    "space.living": "Living Room",
    "space.dining": "Dining Room",
    "space.kitchen": "Kitchen & Pantry",
    "space.master_bedroom": "Master Suite",
    "space.bedroom": "Guest Bedrooms",
    "space.bathrooms": "Bathrooms & Spa",
    "space.terrace": "Terrace & Loggia",
    "space.office": "Home Office",

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
    "brand.tagline": "تصميم وتشطيبات معمارية متكاملة",
    "nav.portfolio": "مشاريعي",
    "nav.start_project": "ابدأ مشروع جديد",
    "nav.new_project": "مشروع جديد",

    // Hero Section
    "hero.eyebrow": "رحلة تشطيب بيتك تبدأ هنا",
    "hero.title_1": "من مجرد مكان",
    "hero.title_2": "لأسلوب حياة راقي",
    "hero.description":
      "بنصمم ونشطب بيتك في مصر بأعلى معايير الجودة الفندقية، وتقدر تتابع كل خطوة في الموقع وأنت في مكانك.",
    "hero.cta_start": "ابدأ تشطيب بيتك الآن",
    "hero.cta_watch": "شوف بنشتغل إزاي",
    "hero.cta_watch_duration": "دقيقتين",
    "hero.floating_title_1": "بيت يعبّر",
    "hero.floating_title_2": "عن ذوقك وشخصيتك",
    "hero.phase_concept": "الفكرة",
    "hero.phase_design": "التصميم",
    "hero.phase_execution": "التنفيذ بالموقع",
    "hero.phase_handover": "التسليم على المفتاح",

    // Portfolio Section
    "portfolio.eyebrow": "مشاريع فالنتيا",
    "portfolio.title": "مشاريعك الحالية",
    "portfolio.description":
      "تابع تفاصيل تشطيب وتصميم بيتك من أول الرسومات المبدئية لحد ما تستلم المفتاح في مصر.",
    "portfolio.tab_all": "كل المشاريع",
    "portfolio.tab_active": "شغالين في الموقع",
    "portfolio.tab_review": "تحت المراجعة",
    "portfolio.tab_draft": "مسودات",
    "portfolio.showing": "عرض",
    "portfolio.of_properties": "من الوحدات",
    "portfolio.view_project": "تفاصيل المشروع",
    "portfolio.spaces_configured": "غرف ومساحات محددة",
    "portfolio.empty_title": "لسه مفيش مشاريع مسجلة",
    "portfolio.empty_desc":
      "ابدأ رحلة تشطيب بيتك الراقي مع فالنتيا وسجل أول مشروع ليك دلوقتي.",

    // Wizard Common
    "wizard.back": "رجوع",
    "wizard.next": "اللي بعده",
    "wizard.skip": "تخطي الخطوة دي دلوقتي",
    "wizard.step_prefix": "الخطوة",
    "wizard.step_of": "من",
    "wizard.completed": "اتأكدت خلاص",
    "wizard.edit_selections": "تعديل الاختيارات",
    "wizard.step_1": "نوع العقار",
    "wizard.step_2": "بيانات وموقع العقار",
    "wizard.step_3": "الغرف والمساحات",
    "wizard.step_4": "الستايل والخامات",
    "wizard.step_5": "مكان إقامتك",
    "wizard.step_6": "مين هينوب عنك في مصر",
    "wizard.step_7": "حجم ونوع التشطيب",
    "wizard.step_8": "الميزانية التقديرية",
    "wizard.step_9": "ميعاد التسليم المستهدف",
    "wizard.step_10": "الرسومات والمخططات",
    "wizard.step_11": "مراجعة وتأكيد الطلب",
    "lifecycle.title": "مراحل تجهيز المشروع",
    "lifecycle.dashboard": "لوحة مشاريعي",
    "lifecycle.step_property": "نوع العقار",
    "lifecycle.step_property_info": "بيانات وموقع العقار",
    "lifecycle.step_spaces": "الغرف والمساحات",
    "lifecycle.step_style": "الستايل والخامات",
    "lifecycle.step_location": "مكان إقامتك",
    "lifecycle.step_representative": "النائب بمصر",
    "lifecycle.step_scope": "حجم التشطيب",
    "lifecycle.step_budget": "الميزانية",
    "lifecycle.step_timeline": "ميعاد التسليم",
    "lifecycle.step_drawings": "الرسومات",
    "lifecycle.step_review": "مراجعة وتأكيد",
    "nav.fitout_commission": "طلب تشطيب وتصميم معماري • تحديد المواصفات",

    // Style Strategy & Multi-Mode
    "style_strategy.title": "طريقة اختيار الستايل",
    "style_strategy.subtitle": "تحب تختار ستايل ديكور موحد لكل البيت، ولا ستايل مختلف لكل غرفة؟",
    "style_strategy.unified_title": "ستايل واحد للبيت كله",
    "style_strategy.unified_desc": "نفس روح التصميم والألوان والخامات متناسقة في كل الفراغات والغرف.",
    "style_strategy.per_space_title": "ستايل مخصص لكل غرفة",
    "style_strategy.per_space_desc": "تحدد لكل غرفة وجناح الستايل والخامات اللي تليق بيه.",
    "style_strategy.designer_title": "سيب الاختيار لمهندس الديكور",
    "style_strategy.designer_desc": "فريق مهندسي فالنتيا هيختار الستايل الأنسب حسب الإضاءة ومساحات الغرف.",
    "style_gallery.title": "معرض الستايلات والخامات",
    "style_gallery.view_btn": "شوف تفاصيل وغرف الستايل",
    "style_gallery.confirm_unified": "تأكيد واختيار الستايل ده للبيت كله",
    "style_gallery.confirm_per_space": "تطبيق الستايل على الغرف المختارة",
    "style_gallery.select_spaces_label": "اختار الغرف اللي عاوز تطبق عليها الستايل ده:",
    "style_gallery.select_all": "تحديد الكل",
    "style_gallery.clear_all": "مسح التحديد",
    "style_gallery.applied_spaces": "مطبق على",
    "style_gallery.no_spaces_selected": "من فضلك اختار غرفة واحدة على الأقل",
    "brief.title": "ملخص طلب تشطيب بيتك",
    "brief.eyebrow": "الخطوة ١١ • مراجعة وتأكيد الطلب",
    "brief.subtitle": "مراجعة سريعة لكل التفاصيل اللي اخترتها قبل ما تبعت. تقدر تعدل أي حاجة بضغطة زرار.",
    "brief.edit_selections": "تعديل الاختيارات",
    "brief.property_type": "نوع العقار",
    "brief.primary_style": "الستايل الأساسي",
    "brief.per_space_styles": "توزيع الستايلات على الغرف",
    "brief.included_spaces": "الغرف المضافة للتشطيب",
    "brief.inspiration_gallery": "معرض الإلهام والخامات",
    "brief.your_notes": "ملاحظاتك ورغباتك الخاصة",
    "brief.notes_placeholder": "حابب تصميم دافئ ومودرن يعتمد على الخامات الطبيعية وإضاءة شمس كويسة، مع أخشاب ورخام بألوان هادية...",

    // Step 1: Welcome & Property Typology
    "step1.eyebrow": "الخطوة الأولى • نوع العقار",
    "step1.headline": "إيه نوع عقارك؟",
    "step1.subheadline":
      "اختار نوع وحدتك عشان نبدأ نحدد تفاصيل التشطيب والتصميم المناسبة ليك في مصر.",
    "step1.title": "من مجرد مكان لأسلوب حياة راقي",
    "step1.desc":
      "بنصمم ونشطب بيتك في مصر بأعلى معايير الجودة، وتقدر تتابع كل خطوة في الموقع وأنت في مكانك.",
    "step1.cta": "ابدأ تجهيز مشروعك",
    "step1.back": "لوحة المشاريع",

    // Step 2: Property Type
    "step2.eyebrow": "الخطوة الثانية • بيانات وموقع العقار",
    "step2.title": "عقارك موجود فين؟ وبيانات المشروع",
    "step2.desc":
      "اختار نوع ومواصفات المكان اللي حابب تشطبه عشان نبدأ نجهز التصميم والفرق الهندسية المناسبة.",
    "step2.params_title": "مواصفات وبيانات العقار",
    "step2.param_scope": "موقع العقار ومساحته",
    "step2.adaptive_calc": "حساب المساحة التقريبية",
    "step2.field_name": "اسم المشروع / اسم العقار",
    "step2.field_area": "المساحة الإجمالية (م²)",
    "step2.switch_sqft": "التحويل للقدم المربع",
    "step2.switch_sqm": "التحويل للمتر المربع",
    "step2.field_region": "المدينة أو المنطقة في مصر",
    "step2.field_district": "اسم الكمبوند أو الحي",
    "step2.index_caption": "كود المشروع الداخلي في فالنتيا",
    "step2.logistics_caption": "بيحدد أقرب فريق مهندسين وتوريدات للموقع",
    "step2.district_caption": "اسم الكمبوند أو رقم القطعة",
    "step2.envelope_label": "المساحة المتوقعة للتشطيب",
    "step2.confidence_label": "دقة البيانات المدخلة",
    "step2.confidence_value": "اكتمال مبدئي (٨٥٪)",

    // Property Types
    "property.villa": "فيلا مستقلة",
    "property.villa_desc": "فيلات مستقلة، توين هاوس وتاون هاوس في كمبوندات مصر.",
    "property.apartment": "شقة سكنية",
    "property.apartment_desc": "شقق راقية، عمارات فاخرة، ومساحات معيشة عصرية.",
    "property.duplex": "دوبلكس",
    "property.duplex_desc": "شقة دورين بسلالم داخلية وأسقف دبل هايت.",
    "property.penthouse": "بنتهاوس",
    "property.penthouse_desc": "شقة بأعلى دور مع رووف وتراس خارجي بإطلالة مفتوحة.",
    "property.commercial": "مكتب إداري أو عيادة",
    "property.commercial_desc": "مقرات شركات راقية، مكاتب تنفيذية، واستوديوهات.",
    "property.other": "شاليه ساحلي أو تصميم خاص",
    "property.other_desc": "شاليهات في الساحل والجونة أو أي مساحة محتاجة تصميم مخصوص.",

    // Step 3: Spaces
    "step3.eyebrow": "الخطوة الثالثة • الغرف والمساحات",
    "step3.title": "إيه الغرف والمساحات اللي حابب تضيفها؟",
    "step3.desc":
      "حدد الغرف والمساحات اللي عاوز تشطبها في بيتك، وتقدر تزود أو تقلل عدد الغرف، أو تضيف أي غرفة تانية على ذوقك.",
    "step3.zones_active": "غرف محددة ومساحة تقريبية",
    "step3.tab_3d": "منظور ثلاثي الأبعاد",
    "step3.tab_2d": "مخطط ثنائي الأبعاد",
    "step3.pin_master": "غرفة النوم الماستر",
    "step3.pin_baths": "الحمامات",
    "step3.pin_kitchen": "المطبخ والسفرة",
    "step3.legend_included": "مضافة للتشطيب",
    "step3.legend_excluded": "مش مضافة",
    "step3.metric_footprint": "المساحة الإجمالية",
    "step3.metric_height": "ارتفاع السقف الصافي",
    "step3.metric_trajectory": "مرحلة الشغل",
    "step3.inventory_title": "قائمة الغرف والمساحات",
    "step3.inventory_zones": "غرف مختارة",
    "step3.add_custom_btn": "+ إضافة غرفة تانية مخصصة",

    // Spaces
    "space.living": "الريسبشن وصالون الاستقبال",
    "space.dining": "غرفة السفرة الرسمية",
    "space.kitchen": "المطبخ ومخزن المؤن",
    "space.master_bedroom": "غرفة نوم ماستر مع دريسنج",
    "space.bedroom": "غرف نوم إضافية للأولاد والضيوف",
    "space.bathrooms": "حمامات ماستر وحمام ضيوف",
    "space.terrace": "تراس وبلكونة خارجية",
    "space.office": "مكتب منزلي معزول وركن شغل",
    "space.dressing": "دريسنج روم بدواليب زجاجية",

    // Step 4: Your Style
    "step4.eyebrow": "الخطوة الرابعة • الستايل والخامات",
    "step4.title": "إيه الستايل الأقرب لذوقك؟",
    "step4.desc":
      "اتفرج على الستايلات المناسبة لبيتك، واختار الجو والألوان اللي ترتاح فيها أو سيب المهندس ينسقلك ميكس راقي.",
    "step4.allow_blend": "السماح بميكس متناسق بين ستايلين",
    "step4.blend_desc": "دمج ستايلين متناسقين بشكل احترافي",
    "step4.primary_selection": "الستايل الأساسي المختار",
    "step4.palette_directions": "استكشف الخامات (اضغط لمعاينة صور وتفاصيل كل ستايل)",
    "step4.variations": "ستايلات متاحة ومختارة",
    "step4.fine_tune": "تظبيط الخامات والألوان",
    "step4.add_btn": "إضافة",
    "step4.cancel_btn": "إلغاء",

    // Step 5: Brief Review
    "step5.eyebrow": "الخطوة الخامسة • مكان إقامتك وبيانات الاتصال",
    "step5.title": "مكان إقامتك حالياً فين؟",
    "step5.desc":
      "حدد بلدك ومدينتك ورقم تليفونك عشان ننسق معاك مكالمات الفيديو وتقارير الموقع في الوقت اللي يناسبك.",
    "step5.property_type": "نوع العقار",
    "step5.primary_style": "الستايل الأساسي",
    "step5.secondary_style": "الستايل المكمل",
    "step5.included_spaces": "الغرف المحددة",
    "step5.modify": "تعديل",
    "step5.inspiration": "معرض الإلهام والخامات",
    "step5.notes_title": "ملاحظاتك ورغباتك الخاصة",
    "step5.notes_placeholder":
      "حابب تصميم دافئ ومودرن يعتمد على الخامات الطبيعية وإضاءة شمس كويسة، مع أخشاب ورخام بألوان هادية...",
    "step5.cta_confirm": "تأكيد وإرسال كراسة المواصفات",
    "step5.cta_creating": "جاري إرسال طلبك...",

    // Step 6: Confirmation
    "step6.confirmed_badge": "تم تسجيل طلبك بنجاح",
    "step6.title": "استلمنا بيانات مشروعك!",
    "step6.desc":
      "فريق مهندسي فالنتيا في القاهرة استلم تفاصيل بيتك، وبنجهزلك دلوقتي التصور المبدئي وعينات الخامات المناسبة.",
    "step6.cta_workspace": "افتح صفحة متابعة المشروع",
    "step6.cta_portfolio": "الرجوع لقائمة المشاريع",

    // Status Chips
    "status.draft": "مسودة",
    "status.concept_selected": "تم اختيار الستايل",
    "status.drawing_uploaded": "اترفعت الرسومات",
    "status.under_engineer_review": "تحت المراجعة الهندسية",
    "status.meeting_scheduled": "اتحدد ميعاد ميتنج",
    "status.site_visit_scheduled": "اتحدد ميعاد معاينة الموقع",
    "status.site_visit_paid": "تم دفع رسوم المعاينة",
    "status.design_in_progress": "شغالين في التصميم الـ 3D",
    "status.design_delivered": "تم تسليم التصميم",
    "status.boq_confirmed": "تم اعتماد المقايسة (BOQ)",
    "status.execution": "شغالين في التنفيذ بالموقع",
    "status.completed": "جاهز للاستلام على المفتاح",

    // Styles
    "style.modern": "مودرن معاصر",
    "style.modern_tagline": "خطوط هندسية راقية وإضاءة طبيعية وافرة",
    "style.modern_desc": "خطوط واضحة، مساحات مفتوحة، تناغم بين الرخام والأخشاب الدافئة، وإضاءة شمس بتملى المكان.",
    "style.mediterranean": "طراز متوسطي وساحلي",
    "style.mediterranean_tagline": "أجواء صيفية راقية مستوحاة من الساحل والجونة",
    "style.mediterranean_desc": "أقواس ناعمة، حجر جيري طبيعي، ترافرتين، وألوان ترابية دافئة تناسب أجواء الساحل والفلل المفتوحة.",
    "style.minimal": "مينيمال دافئ",
    "style.minimal_tagline": "بساطة وأناقة مريحة للأعصاب بدون زحمة",
    "style.minimal_desc": "شياكة هادية بدون أي كركبة بصرية، إضاءات ليد مخفية ناعمة، أبواب فلاش مخفية، وأقمشة بوكليه راقية.",
    "style.neo_classic": "نيو كلاسيك فرنسي",
    "style.neo_classic_tagline": "بانوهات جدارية باريسية ورخام فاخر",
    "style.neo_classic_desc": "بانوهات جدارية رفيعة ومرتبة، أرضيات باركيه، رخام إيطالي فاخر، ونجف مودرن بلمسات نحاس راقية.",
    "style.scandinavian": "إسكندنافي هادئ",
    "style.scandinavian_tagline": "أخشاب فاتحة وإضاءة طبيعية دافئة",
    "style.scandinavian_desc": "أخشاب دردار فاتحة، قعدات مريحة بتصميم أوروبي، وألوان فاتحة بتوسع المساحة وتدي إحساس بالراحة.",
    "style.islamic_heritage": "إسلامي معاصر",
    "style.islamic_heritage_tagline": "أصالة بيوت القاهرة التاريخية بروح عصرية",
    "style.islamic_heritage_desc": "صياغة عصرية للمشربيات، حجر طبيعي منحوت يدوي، وأفنية داخلية تناسب بيوت وفلل القاهرة الراقية.",
    "style.industrial_luxury": "إندستريال فاخر",
    "style.industrial_luxury_tagline": "برونز معتق وحديد ناعم مع لمسة مودرن جريئة",
    "style.industrial_luxury_desc": "فواصل زجاج مضلع مع فريمات حديد أسود، لمسات برونز معتق، وخرسانة معمارية ناعمة مع أقمشة مخملية فخمة.",
    "style.japandi": "جاباندي (ميكس ياباني وإسكندنافي)",
    "style.japandi_tagline": "سكينة ودفء عملي مع أخشاب طبيعية",
    "style.japandi_desc": "أخشاب أرز طبيعية، فخار يدوي هادي، وتصميم أفقي مريح بيخلي البيت واحة هدوء وسكينة حقيقية.",

    // Footer
    "footer.title": "فالنتيا",
    "footer.tagline": "تصميم وتنفيذ معماري وتشطيبات فاخرة",
    "footer.locations":
      "الشيخ زايد · القاهرة الجديدة · الساحل الشمالي · الجونة · القاهرة، مصر",
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
