"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowLeft,
  Sparkle,
  Buildings,
  Compass,
  CheckCircle,
  ShieldCheck,
  HouseLine,
  Ruler,
  ClockCountdown,
  SealCheck,
  User,
  Sliders,
  Check,
  X,
  Waveform,
  GlobeHemisphereWest,
  Sun,
  SunHorizon,
  Moon,
  Eye,
} from "@phosphor-icons/react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { TiltCard } from "@/components/motion/tilt-card";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { AtelierCursor } from "@/components/motion/atelier-cursor";
import { cn } from "@/lib/utils";

// Lighting mood presets for the 3D Hero Centerpiece Card
type LightingMood = "daylight" | "golden" | "twilight";

const LIGHTING_PRESETS: Record<
  LightingMood,
  {
    id: LightingMood;
    nameEn: string;
    nameAr: string;
    kelvin: string;
    image: string;
    glowColor: string;
  }
> = {
  daylight: {
    id: "daylight",
    nameEn: "5500K Studio Natural Light",
    nameAr: "ضوء النهار الطبيعي 5500K",
    kelvin: "5500K",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
    glowColor: "rgba(255, 255, 255, 0.25)",
  },
  golden: {
    id: "golden",
    nameEn: "3000K Golden Sun Horizon",
    nameAr: "الغروب الدافئ 3000K",
    kelvin: "3000K",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
    glowColor: "rgba(184, 132, 96, 0.4)",
  },
  twilight: {
    id: "twilight",
    nameEn: "2400K Evening Cove Ambience",
    nameAr: "الإضاءة الليلية الخافتة 2400K",
    kelvin: "2400K",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
    glowColor: "rgba(80, 60, 44, 0.5)",
  },
};

// Material Hotspots for the Interactive 3D Axonometric Section
interface MaterialHotspot {
  id: string;
  category: "stone" | "wood" | "glass" | "outdoor";
  x: number; // percentage
  y: number; // percentage
  titleEn: string;
  titleAr: string;
  materialEn: string;
  materialAr: string;
  specEn: string;
  specAr: string;
  acoustic: string;
  acousticScore: number; // 0 - 100 for bar viz
  originEn: string;
  originAr: string;
  fireRating: string;
  image: string;
}

const HOTSPOTS: MaterialHotspot[] = [
  {
    id: "travertine",
    category: "stone",
    x: 40,
    y: 78,
    titleEn: "Living Salon Flooring",
    titleAr: "أرضيات الصالون والمعيشة",
    materialEn: "Honed Navona Travertine",
    materialAr: "ترافرتين نافونا المطفي مع فواصل برونزية غائرة",
    specEn: "Large format 120×120cm slabs with micro-beveled edges, breathable sealer, and decoupled acoustic sub-mat.",
    specAr: "ألواح كبيرة قياس 120×120 سم مع حواف دقيقة وطبقة عازلة للصوت وفواصل تمدد مخفية.",
    acoustic: "NRC 0.45 · Impact Lw 48dB",
    acousticScore: 68,
    originEn: "Tivoli Quarries, Italy",
    originAr: "محاجر تيفولي، إيطاليا",
    fireRating: "Class A1 Non-Combustible",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "joinery",
    category: "wood",
    x: 75,
    y: 38,
    titleEn: "Architectural Wall Paneling",
    titleAr: "التجاليد الخشبية المعمارية",
    materialEn: "Rift-Cut White Oak & Brass Reveal",
    materialAr: "خشب السنديان الأبيض المشرح مع إضاءة دافئة 2700K",
    specEn: "Custom micro-perforated acoustic timber paneling with concealed soft-touch push latches and integrated LED wash.",
    specAr: "تجاليد خشبية دقيقة التثقيب ممتصة للصدى مع خزائن مخفية وإضاءة خطية مدمجة بالكامل.",
    acoustic: "NRC 0.75 · Class A Absorption",
    acousticScore: 92,
    originEn: "Black Forest, Germany",
    originAr: "الغابة السوداء، ألمانيا",
    fireRating: "Class B-s1,d0 Fire Retardant",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "glass",
    category: "glass",
    x: 24,
    y: 42,
    titleEn: "Architectural Glazing Curtain",
    titleAr: "الواجهات الزجاجية المعمارية",
    materialEn: "Low-E Double Glazed Curtain Wall",
    materialAr: "زجاج مزدوج منخفض الانبعاث مع عزل حراري وصوتي فائق",
    specEn: "Thermal-break aluminum slim frames with acoustic PVB interlayer, framing private courtyards and terraces.",
    specAr: "قطاعات ألمنيوم معزولة حرارياً مع طبقة PVB عازلة للصوت تفتح على الأفنية والحدائق الخاصة.",
    acoustic: "STC 44 dB Acoustic Isolation",
    acousticScore: 88,
    originEn: "Schüco Atelier, Germany",
    originAr: "أنظمة شيكو، ألمانيا",
    fireRating: "EI-30 Certified",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "terrace",
    category: "outdoor",
    x: 14,
    y: 34,
    titleEn: "Veranda Transition Portal",
    titleAr: "بوابة الامتداد الخارجي للتراس",
    materialEn: "Textured Basalt & Plantation Teak",
    materialAr: "حجر بازلت ملمس مع خشب تيك طبيعي مقاوم للعوامل الجوية",
    specEn: "Flush-sill concealed drainage transition system enabling continuous indoor-to-outdoor spatial harmony.",
    specAr: "عتبة غائرة مستوية بالكامل بنظام تصريف مخفي لربط الصالون بالتراس الخارجي دون أي عوائق.",
    acoustic: "Weatherproof · IP68 Drainage",
    acousticScore: 74,
    originEn: "Java & Sicily Sustainable Mills",
    originAr: "مقالع صقلية ومزارع التيك المستدامة",
    fireRating: "Weather & UV Resilient",
    image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=600&q=80",
  },
];

// Curated Typologies Data
const TYPOLOGIES = [
  {
    id: "villa",
    vol: "VOLUME 01",
    coords: "30.0131° N, 31.4913° E",
    titleEn: "Grand Private Villas",
    titleAr: "الفلل المستقلة والقصور",
    area: "450 – 1,200 m²",
    height: "3.8m – 7.2m Ceiling",
    locationEn: "New Cairo & Sheikh Zayed",
    locationAr: "القاهرة الجديدة والشيخ زايد",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    descEn: "Complete turnkey structural and interior fit-out, double-height light wells, private spa wellness suites, and master courtyards.",
    descAr: "تنفيذ معماري متكامل يشمل بهو الاستقبال المزدوج، أجنحة الاستجمام والسبا الخاصة، والحدائق الداخلية المتصلة.",
  },
  {
    id: "penthouse",
    vol: "VOLUME 02",
    coords: "25.1124° N, 55.1390° E",
    titleEn: "Sky Penthouses",
    titleAr: "بنتهاوس الأفق البانورامي",
    area: "320 – 680 m²",
    height: "3.4m Floor-to-Ceiling Glazing",
    locationEn: "Palm Jumeirah & Nile View",
    locationAr: "نخلة جميرا وإطلالات كورنيش النيل",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    descEn: "Panoramic acoustic curtain glazing, bespoke floating ceiling rafts, private plunge pools, and seamless indoor-outdoor horizon living.",
    descAr: "واجهات زجاجية بانورامية ممتدة، أسقف عازلة للصوت بنظام طافي، مسابح أفقية خاصة، وتراسات معلقة بإطلالات خلابة.",
  },
  {
    id: "duplex",
    vol: "VOLUME 03",
    coords: "30.0444° N, 31.2357° E",
    titleEn: "Urban Duplexes",
    titleAr: "الدوبلكس العصري الفاخر",
    area: "240 – 420 m²",
    height: "Double-Height Atrium",
    locationEn: "New Capital & Diplomatic Quarter",
    locationAr: "العاصمة الإدارية والحي الدبلوماسي",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
    descEn: "Sculptural floating cantilever staircases, mezzanine libraries, concealed acoustic joinery, and fully integrated building automation.",
    descAr: "سلالم معلقة ذات طابع نحتي، ميزانين مكتبات، دواليب خشبية مدمجة ممتصة للصدى، ونظم تحكم منزلي فندقية ذكية.",
  },
];

// 5-Stage Turnkey Methodology
const METHODOLOGY = [
  {
    step: "01",
    titleEn: "Laser Survey & Structural Audit",
    titleAr: "المسح الليزري والتدقيق الإنشائي",
    descEn: "Millimeter-precise 3D LiDAR point cloud scan of your property with acoustic calibration and MEP conduit tracing.",
    descAr: "مسح ثلاثي الأبعاد بالليزر (LiDAR) بدقة المليمتر لفحص الاستواء الإنشائي ومسارات التغذية والعزل.",
    badgeEn: "0.02mm Precision",
    badgeAr: "دقة 0.02 ملم",
  },
  {
    step: "02",
    titleEn: "3D Spatial Architecture & Moodboard",
    titleAr: "التصميم المكاني ثلاثي الأبعاد واللوحات",
    descEn: "Bespoke axonometric layout, lighting choreography (2700K circadian), and physical material tactile box delivered to your residence.",
    descAr: "تخطيط أيزومتري مفصل، دراسة الإضاءة البيولوجية، وصندوق عينات المواد الطبيعية الفاخرة واصل لمنزلك.",
    badgeEn: "Physical Samples",
    badgeAr: "عينات مواد فعلية",
  },
  {
    step: "03",
    titleEn: "100% Itemized BOQ & Pricing Lock",
    titleAr: "جدول الكميات والتسعير الثابت",
    descEn: "Legally locked contract pricing with zero variation order surprises. Direct quarry allocations from Italy and European mills.",
    descAr: "تسعير تعاقدي ثابت وملزم بدون أي بنود مستحدثة أو مفاجآت، مع حجز مباشر من مقالع الرخام الأوروبية.",
    badgeEn: "Zero Cost Creep",
    badgeAr: "ضمان ثبات التكلفة",
  },
  {
    step: "04",
    titleEn: "Atelier Joinery & On-Site Execution",
    titleAr: "التنفيذ المعماري وأعمال النجارة الحرفية",
    descEn: "Dedicated on-site lead architect managing precision MEP, custom stone cladding, acoustic walls, and weekly video walkthroughs.",
    descAr: "مهندس موقع أول مخصص يدير الأعمال الكهروميكانيكية، التكسيات الحجرية، والنجارة الفندقية مع تقرير أسبوعي مرئي.",
    badgeEn: "Dedicated Lead Architect",
    badgeAr: "إشراف هندسي متفرغ",
  },
  {
    step: "05",
    titleEn: "White-Glove Handover & 10-Yr Warranty",
    titleAr: "التسليم الفندقي والضمان العشري المعتمد",
    descEn: "Deep detailing, custom signature ambient scent curation, comprehensive O&M digital dossier, and our 10-year structural warranty.",
    descAr: "تعقيم فندقي دقيق، تعطير المكان برائحة فالنتيا الخاصة، تسليم ملف التشغيل الرقمي، وضمان معتمد لمدة 10 سنوات.",
    badgeEn: "10-Year Certificate",
    badgeAr: "شهادة ضمان 10 سنوات",
  },
];

// Comparison Matrix: Traditional vs Valentia Atelier
const COMPARISON_ROWS = [
  {
    featureEn: "Project Cost Certainty",
    featureAr: "ثبات تكلفة المشروع",
    traditionalEn: "Frequent 20% – 40% cost overruns via variation orders",
    traditionalAr: "زيادات متكررة بنسبة 20% إلى 40% عبر بنود مستحدثة",
    valentiaEn: "100% Fixed Itemized BOQ with zero surprise surcharges",
    valentiaAr: "جدول كميات تعاقدي ثابت 100% بدون أي زيادات مفاجئة",
  },
  {
    featureEn: "Site Measurements",
    featureAr: "دقة رفع المقاسات الموقعية",
    traditionalEn: "Manual tape measures prone to human error & misfits",
    traditionalAr: "أشرطة قياس يدوية عرضة لأخطاء بشرية وتفاوت في المقاسات",
    valentiaEn: "3D LiDAR Point Cloud Laser Scan accurate to 0.02 mm",
    valentiaAr: "مسح ليزري رقمي 3D LiDAR بدقة متناهية تصل إلى 0.02 ملم",
  },
  {
    featureEn: "Project Oversight",
    featureAr: "الإشراف والمسؤولية الموقعية",
    traditionalEn: "Fragmented sub-contractors blaming each other for defects",
    traditionalAr: "مقاولون بالباطن متفرقون يتبادلون إلقاء اللوم عند حدوث أخطاء",
    valentiaEn: "Single Atelier Lead Architect with full on-site accountability",
    valentiaAr: "مهندس معماري أول مخصص للأتيليه بمسؤولية كاملة وشاملة",
  },
  {
    featureEn: "Material Origin",
    featureAr: "مصدر وجودة الخامات",
    traditionalEn: "Local commercial grade stock with unverified durability",
    traditionalAr: "مواد تجارية محلية غير موثوقة المصدر أو درجات المقاومة",
    valentiaEn: "Direct European quarry stone & certified acoustic joinery",
    valentiaAr: "توريد مباشر من المقالع الإيطالية ومصانع الأخشاب الأوروبية المعتمدة",
  },
  {
    featureEn: "Post-Handover Support",
    featureAr: "خدمات ما بعد التسليم",
    traditionalEn: "Vanishing support once final payment is collected",
    traditionalAr: "صعوبة التواصل وانعدام الدعم فور استلام الدفعة الأخيرة",
    valentiaEn: "10-Year certified structural warranty & concierge maintenance",
    valentiaAr: "ضمان إنشائي وتشغيلي معتمد لمدة 10 سنوات مع صيانة فندقية",
  },
];

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const { language, toggleLanguage, isRTL } = useLanguage();

  const [activeHotspot, setActiveHotspot] = React.useState<MaterialHotspot>(HOTSPOTS[0]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [lightingMood, setLightingMood] = React.useState<LightingMood>("daylight");
  const [mouseSpotlight, setMouseSpotlight] = React.useState({ x: 50, y: 35 });

  // Dynamic Destination URL based on Auth State
  const commissionUrl = isAuthenticated ? "/projects/new" : "/login?redirect=/projects/new";
  const projectsUrl = isAuthenticated ? "/projects" : "/login?redirect=/projects";

  const filteredHotspots = React.useMemo(() => {
    if (selectedCategory === "all") return HOTSPOTS;
    return HOTSPOTS.filter((h) => h.category === selectedCategory);
  }, [selectedCategory]);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMouseSpotlight({ x, y });
  };

  const activePreset = LIGHTING_PRESETS[lightingMood];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] selection:bg-[#1C1917] selection:text-[#FAF7F2] relative overflow-x-hidden">
      {/* 0. BESPOKE ATELIER CUSTOM CURSOR */}
      <AtelierCursor />

      {/* 1. STICKY ATELIER NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#E6DDD2] shadow-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          {/* Brand Monogram */}
          <Link
            href="/"
            className="flex items-center gap-3.5 group"
            data-cursor="pointer"
            data-cursor-text="VALENTIA"
          >
            <div className="w-10 h-10 rounded-full bg-[#1C1917] text-[#FAF7F2] flex items-center justify-center border border-[#1C1917] shadow-sm group-hover:bg-[#503C2C] transition-colors">
              <Buildings className="w-5 h-5" weight="light" />
            </div>
            <div>
              <span className="block text-sm tracking-[0.25em] font-light uppercase text-[#1C1917]">
                VALENTIA
              </span>
              <span className="block text-[9px] tracking-[0.22em] text-[#707070] uppercase font-mono">
                {isRTL ? "أتيليه التصميم والتنفيذ المعماري" : "Design & Build Atelier"}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-widest text-[#503C2C] font-medium">
            <a
              href="#philosophy"
              data-cursor="pointer"
              className="hover:text-[#1C1917] transition-colors"
            >
              {isRTL ? "الفلسفة" : "Philosophy"}
            </a>
            <a
              href="#blueprints"
              data-cursor="pointer"
              className="hover:text-[#1C1917] transition-colors"
            >
              {isRTL ? "المخططات والمواد" : "Blueprints"}
            </a>
            <a
              href="#typologies"
              data-cursor="pointer"
              className="hover:text-[#1C1917] transition-colors"
            >
              {isRTL ? "المشاريع والنماذج" : "Typologies"}
            </a>
            <a
              href="#comparison"
              data-cursor="pointer"
              className="hover:text-[#1C1917] transition-colors"
            >
              {isRTL ? "معيار الأتيليه" : "Atelier Standard"}
            </a>
            <a
              href="#methodology"
              data-cursor="pointer"
              className="hover:text-[#1C1917] transition-colors"
            >
              {isRTL ? "منهجية التنفيذ" : "Methodology"}
            </a>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              type="button"
              data-cursor="pointer"
              data-cursor-text={language === "en" ? "AR" : "EN"}
              className="text-xs font-medium tracking-wider text-[#503C2C] hover:text-[#1C1917] transition-colors bg-white/70 hover:bg-white px-3.5 py-1.5 rounded-full border border-[#D8C8B4] shadow-xs cursor-pointer active:scale-95"
            >
              {language === "en" ? "العربية" : "English"}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href={projectsUrl}
                  data-cursor="pointer"
                  data-cursor-text="PROJECTS"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] text-xs font-medium tracking-wider uppercase transition-all shadow-sm cursor-pointer active:scale-98"
                >
                  <span>{isRTL ? "مشاريعي" : "My Projects"}</span>
                  {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </Link>
                <div
                  title={user?.name || user?.username || "Authenticated"}
                  className="w-8 h-8 rounded-full bg-[#DFD3C1] border border-[#D8C8B4] flex items-center justify-center text-xs font-medium text-[#1C1917] uppercase"
                >
                  {user?.name?.[0] || user?.username?.[0] || <User className="w-4 h-4" />}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/login"
                  data-cursor="pointer"
                  data-cursor-text="SIGN IN"
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#503C2C] hover:text-[#1C1917] hover:bg-white/60 transition-colors"
                >
                  {isRTL ? "تسجيل الدخول" : "Sign In"}
                </Link>
                <Link
                  href={commissionUrl}
                  data-cursor="pointer"
                  data-cursor-text="COMMISSION"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] text-xs font-medium tracking-wider uppercase transition-all shadow-sm cursor-pointer hover:shadow-md active:scale-98"
                >
                  <span>{isRTL ? "بدء مشروعك" : "Commission"}</span>
                  {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. FLAGSHIP HERO: INLINE-IMAGE TYPOGRAPHY, AMBIENT SPOTLIGHT & 3D TILT CENTERPIECE */}
      <section
        id="philosophy"
        onMouseMove={handleHeroMouseMove}
        className="pt-32 pb-20 md:pt-40 md:pb-28 max-w-7xl mx-auto px-6 sm:px-8 relative overflow-hidden"
      >
        {/* Dynamic Architectural Ambient Mouse Spotlight */}
        <div
          className="pointer-events-none absolute -inset-10 opacity-70 transition-all duration-300 ease-out -z-10"
          style={{
            background: `radial-gradient(circle 650px at ${mouseSpotlight.x}% ${mouseSpotlight.y}%, rgba(184, 132, 96, 0.14) 0%, rgba(250, 247, 242, 0) 70%)`,
          }}
        />

        {/* Blueprint Precision Crosshairs at Section Corners */}
        <div className="hidden sm:block absolute top-28 start-6 font-mono text-[10px] text-[#B88460]/60 select-none pointer-events-none">
          + [GRID_01 · NORTH]
        </div>
        <div className="hidden sm:block absolute top-28 end-6 font-mono text-[10px] text-[#B88460]/60 select-none pointer-events-none">
          + [RL +14.200m]
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Column with Taste-Design Inline Vignettes */}
          <RevealOnScroll direction="up" delayMs={100} className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#D8C8B4] text-xs font-mono tracking-widest text-[#503C2C] uppercase shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#B88460] animate-pulse" />
              <span>
                {isRTL
                  ? "أتيليه فالنتيا للتصميم والتنفيذ · القاهرة | دبي"
                  : "VALENTIA DESIGN & BUILD ATELIER · EST. 2026"}
              </span>
            </div>

            {/* Editorial Headline with Embedded Architectural Image Capsules */}
            <h1 className="font-serif text-4xl sm:text-5xl xl:text-6xl text-[#1C1917] font-normal tracking-tight leading-[1.18]">
              {isRTL ? (
                <>
                  من مجرد مساحة{" "}
                  <span
                    data-cursor="inspect"
                    data-cursor-text="VILLA"
                    className="inline-flex items-center align-middle mx-1.5 px-0.5 rounded-full bg-white border border-[#D8C8B4] shadow-xs overflow-hidden h-9 sm:h-12 w-16 sm:w-24 relative -top-1 group cursor-pointer hover:w-28 transition-all duration-300"
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80"
                      alt="Architectural space"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </span>
                  <br />
                  إلى أسلوب حياة{" "}
                  <span
                    data-cursor="inspect"
                    data-cursor-text="LIVING"
                    className="inline-flex items-center align-middle mx-1.5 px-0.5 rounded-full bg-white border border-[#D8C8B4] shadow-xs overflow-hidden h-9 sm:h-12 w-16 sm:w-24 relative -top-1 group cursor-pointer hover:w-28 transition-all duration-300"
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=300&q=80"
                      alt="Luxury lifestyle"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </span>
                  <span className="italic font-light text-[#503C2C]"> استثنائي.</span>
                </>
              ) : (
                <>
                  From a place{" "}
                  <span
                    data-cursor="inspect"
                    data-cursor-text="VILLA"
                    className="inline-flex items-center align-middle mx-2 px-0.5 rounded-full bg-white border border-[#D8C8B4] shadow-xs overflow-hidden h-9 sm:h-12 w-16 sm:w-24 relative -top-1 group cursor-pointer hover:w-28 transition-all duration-300"
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80"
                      alt="Architectural space"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </span>
                  <br />
                  to a bespoke lifestyle{" "}
                  <span
                    data-cursor="inspect"
                    data-cursor-text="ATELIER"
                    className="inline-flex items-center align-middle mx-2 px-0.5 rounded-full bg-white border border-[#D8C8B4] shadow-xs overflow-hidden h-9 sm:h-12 w-16 sm:w-24 relative -top-1 group cursor-pointer hover:w-28 transition-all duration-300"
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=300&q=80"
                      alt="Luxury lifestyle"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </span>
                  <span className="italic font-light text-[#503C2C]">.</span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-[#6B635B] leading-relaxed max-w-xl">
              {isRTL
                ? "نصمم وننفذ أرقى المساحات السكنية والقصور في مصر والخليج بأسلوب فندقي فاخر. نجمع بين الدقة الهندسية متناهية الصغر والحرفية الإيطالية الرفيعة، مع شفافية كاملة في جدول الكميات ومتابعة حية عبر منصتك الخاصة."
                : "We engineer and execute bespoke residential estates and sky penthouses across Egypt and the GCC. Combining millimeter laser precision with Italian artisanal finishes, absolute BOQ transparency, and live telemetry from anywhere in the world."}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href={commissionUrl}
                data-cursor="pointer"
                data-cursor-text="START"
                className="h-12 px-7 rounded-full bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] text-xs uppercase tracking-widest font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2.5 cursor-pointer group active:scale-98"
              >
                <span>{isRTL ? "ابدأ تصميم مسكنك الآن" : "Commission Your Estate"}</span>
                {isRTL ? (
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                ) : (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </Link>

              <a
                href="#blueprints"
                data-cursor="pointer"
                data-cursor-text="INSPECT"
                className="h-12 px-6 rounded-full bg-white/80 hover:bg-white border border-[#D8C8B4] text-[#1C1917] text-xs uppercase tracking-widest font-medium transition-colors shadow-xs flex items-center gap-2 active:scale-98"
              >
                <Compass className="w-4 h-4 text-[#B88460]" />
                <span>{isRTL ? "استعراض المخططات والمواد" : "Explore Blueprints"}</span>
              </a>
            </div>

            {/* Trust Metrics */}
            <div className="pt-6 border-t border-[#D8C8B4]/70 grid grid-cols-3 gap-4 text-start">
              <div>
                <span className="block font-serif text-2xl font-normal text-[#1C1917]">
                  380+
                </span>
                <span className="block text-[11px] text-[#6B635B] uppercase tracking-wider font-mono">
                  {isRTL ? "فيلا وبنتهاوس" : "Residences"}
                </span>
              </div>
              <div>
                <span className="block font-serif text-2xl font-normal text-[#1C1917]">
                  0.02 mm
                </span>
                <span className="block text-[11px] text-[#6B635B] uppercase tracking-wider font-mono">
                  {isRTL ? "دقة المسح الليزري" : "Laser Accuracy"}
                </span>
              </div>
              <div>
                <span className="block font-serif text-2xl font-normal text-[#1C1917]">
                  100%
                </span>
                <span className="block text-[11px] text-[#6B635B] uppercase tracking-wider font-mono">
                  {isRTL ? "شفافية BOQ" : "BOQ Integrity"}
                </span>
              </div>
            </div>
          </RevealOnScroll>

          {/* Right Column: 3D Perspective Tilt Card with Interactive Lighting Presets */}
          <div className="lg:col-span-6 relative">
            <RevealOnScroll direction="up" delayMs={250}>
              <TiltCard
                maxRotation={8}
                perspective={1200}
                data-cursor="view"
                data-cursor-text="ROTATE 3D"
                className="rounded-3xl p-3 sm:p-4 bg-white/80 backdrop-blur-xl border border-[#D8C8B4] shadow-2xl shadow-[#1C1917]/10"
              >
                {/* Visual Image Container with Dynamic Preset Illumination */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#241F1B]">
                  <Image
                    src={activePreset.image}
                    alt={activePreset.nameEn}
                    fill
                    priority
                    className="object-cover transition-all duration-700 hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div
                    className="absolute inset-0 transition-colors duration-700 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${activePreset.glowColor}, transparent 60%), linear-gradient(to top, rgba(28, 25, 23, 0.85), transparent 60%)`,
                    }}
                  />

                  {/* Floating Depth Badges */}
                  <div className="absolute top-4 start-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[#FAF7F2] text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isRTL ? "قيد التنفيذ · القاهرة الجديدة" : "Live Commission · Horizon Villa"}</span>
                  </div>

                  {/* Lighting Kelvin Badge */}
                  <div className="absolute top-4 end-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[#FAF7F2] text-[10px] font-mono">
                    <Eye className="w-3 h-3 text-[#B88460]" />
                    <span>{activePreset.kelvin}</span>
                  </div>

                  <div className="absolute bottom-4 start-4 end-4 flex items-end justify-between text-[#FAF7F2]">
                    <div>
                      <span className="block text-xs uppercase tracking-widest text-[#FAF7F2]/70 font-mono">
                        {isRTL ? "مساحة 520 م² · طابع معاصر دافئ" : "520 m² · Warm Minimalist"}
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#FAF7F2]">
                        {isRTL ? "قصر الباتيو · التجمع الخامس" : "The Patio Villa · New Cairo"}
                      </h3>
                    </div>

                    <div className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-xs font-medium">
                      {isRTL ? "المرحلة 04 / 05" : "Phase 04 / 05"}
                    </div>
                  </div>
                </div>

                {/* Lighting Atmosphere Selector Controls */}
                <div className="mt-3 px-1 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E6DDD2] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#503C2C] px-2">
                    <Sparkle className="w-3.5 h-3.5 text-[#B88460]" />
                    <span className="hidden sm:inline">
                      {isRTL ? "الإضاءة المعمارية:" : "Lighting Study:"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setLightingMood("daylight")}
                      data-cursor="pointer"
                      data-cursor-text="5500K"
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer",
                        lightingMood === "daylight"
                          ? "bg-[#1C1917] text-[#FAF7F2] shadow-xs"
                          : "text-[#6B635B] hover:text-[#1C1917]"
                      )}
                    >
                      <Sun className="w-3 h-3" />
                      <span>{isRTL ? "نهار" : "Daylight"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLightingMood("golden")}
                      data-cursor="pointer"
                      data-cursor-text="3000K"
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer",
                        lightingMood === "golden"
                          ? "bg-[#1C1917] text-[#FAF7F2] shadow-xs"
                          : "text-[#6B635B] hover:text-[#1C1917]"
                      )}
                    >
                      <SunHorizon className="w-3 h-3" />
                      <span>{isRTL ? "غروب" : "Sunset"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLightingMood("twilight")}
                      data-cursor="pointer"
                      data-cursor-text="2400K"
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer",
                        lightingMood === "twilight"
                          ? "bg-[#1C1917] text-[#FAF7F2] shadow-xs"
                          : "text-[#6B635B] hover:text-[#1C1917]"
                      )}
                    >
                      <Moon className="w-3 h-3" />
                      <span>{isRTL ? "ليل" : "Twilight"}</span>
                    </button>
                  </div>
                </div>

                {/* Card Lower Bar with Turnkey Progress Tracker */}
                <div className="mt-3 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#D8C8B4]/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-8 h-8 rounded-full bg-[#1C1917] text-[#FAF7F2] flex items-center justify-center shrink-0">
                      <Sparkle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-[#1C1917]">
                        {isRTL ? "منزل يعكس هويتك وتفردك" : "A home that feels like you"}
                      </span>
                      <span className="block text-[11px] text-[#6B635B]">
                        {isRTL ? "متابعة مباشرة لنسب الإنجاز وجودة التشطيب" : "Live telemetry & milestone quality audit"}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={commissionUrl}
                    data-cursor="pointer"
                    data-cursor-text="INTAKE"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B88460] hover:text-[#503C2C] underline underline-offset-4 shrink-0 transition-colors"
                  >
                    <span>{isRTL ? "ابدأ مواصفاتك" : "Configure Specifications"}</span>
                    {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </Link>
                </div>
              </TiltCard>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 3. ARCHITECTURAL BENCHMARK STRIP */}
      <section className="border-y border-[#E6DDD2] bg-[#FAF7F2]/60 py-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <RevealOnScroll direction="up" delayMs={50}>
              <div
                data-cursor="inspect"
                data-cursor-text="0.02MM"
                className="p-5 rounded-2xl bg-white/70 border border-[#D8C8B4]/50 shadow-xs hover:border-[#B88460]/40 transition-colors cursor-default"
              >
                <Ruler className="w-6 h-6 mx-auto mb-2 text-[#503C2C]" />
                <h4 className="font-serif text-2xl font-normal text-[#1C1917]">0.02 mm</h4>
                <p className="text-xs text-[#6B635B] mt-1">
                  {isRTL ? "دقة مسح السحب النقطية بالليزر" : "Laser Point Cloud Precision"}
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delayMs={100}>
              <div
                data-cursor="inspect"
                data-cursor-text="BOQ"
                className="p-5 rounded-2xl bg-white/70 border border-[#D8C8B4]/50 shadow-xs hover:border-[#B88460]/40 transition-colors cursor-default"
              >
                <SealCheck className="w-6 h-6 mx-auto mb-2 text-[#503C2C]" />
                <h4 className="font-serif text-2xl font-normal text-[#1C1917]">100%</h4>
                <p className="text-xs text-[#6B635B] mt-1">
                  {isRTL ? "شفافية مطلقة في تسعير BOQ" : "Fixed Itemized BOQ Rates"}
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delayMs={150}>
              <div
                data-cursor="inspect"
                data-cursor-text="10 YRS"
                className="p-5 rounded-2xl bg-white/70 border border-[#D8C8B4]/50 shadow-xs hover:border-[#B88460]/40 transition-colors cursor-default"
              >
                <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-[#503C2C]" />
                <h4 className="font-serif text-2xl font-normal text-[#1C1917]">10 Years</h4>
                <p className="text-xs text-[#6B635B] mt-1">
                  {isRTL ? "ضمان إنشائي وتشغيلي معتمد" : "Comprehensive Warranty"}
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delayMs={200}>
              <div
                data-cursor="inspect"
                data-cursor-text="SLA"
                className="p-5 rounded-2xl bg-white/70 border border-[#D8C8B4]/50 shadow-xs hover:border-[#B88460]/40 transition-colors cursor-default"
              >
                <ClockCountdown className="w-6 h-6 mx-auto mb-2 text-[#503C2C]" />
                <h4 className="font-serif text-2xl font-normal text-[#1C1917]">On-Time</h4>
                <p className="text-xs text-[#6B635B] mt-1">
                  {isRTL ? "التزام تعاقدي بمواعيد التسليم" : "Turnkey Handover SLA"}
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE 3D AXONOMETRIC & MATERIAL SPECIFICATION DOSSIER */}
      <section id="blueprints" className="py-24 max-w-7xl mx-auto px-6 sm:px-8">
        <RevealOnScroll direction="up" className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#D8C8B4] text-xs font-mono uppercase tracking-widest text-[#503C2C] mb-3">
            <Compass className="w-3.5 h-3.5 text-[#B88460]" />
            <span>{isRTL ? "الهندسة المعمارية التفاعلية" : "AXONOMETRIC SPECIFICATION"}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal">
            {isRTL
              ? "الدقة الهندسية تلتقي بالحرفية الفاخرة"
              : "Precision Engineering Meets Artisanal Finishes"}
          </h2>
          <p className="mt-3 text-sm text-[#6B635B] leading-relaxed">
            {isRTL
              ? "انقر على نقاط التحديد داخل المخطط ثلاثي الأبعاد لاكتشاف مواصفات المواد، معايير العزل الصوتي، وحلول التشطيب المخصصة."
              : "Interact with material pins across the axonometric model to inspect finish grades, acoustic ratings, and architectural joinery."}
          </p>

          {/* Category Filter Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "all", labelEn: "All Finishes", labelAr: "كافة المواد" },
              { id: "stone", labelEn: "Navona Travertine", labelAr: "ترافرتين إيطالي" },
              { id: "wood", labelEn: "Acoustic Oak", labelAr: "سنديان ألماني" },
              { id: "glass", labelEn: "Fluted Glazing", labelAr: "زجاج مضلع" },
              { id: "outdoor", labelEn: "Basalt Veranda", labelAr: "بازلت وتيك خارجي" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                data-cursor="pointer"
                data-cursor-text={tab.id.toUpperCase()}
                type="button"
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer",
                  selectedCategory === tab.id
                    ? "bg-[#1C1917] text-[#FAF7F2] shadow-sm"
                    : "bg-white/80 text-[#503C2C] hover:bg-white border border-[#D8C8B4]"
                )}
              >
                {isRTL ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left/Main Blueprint Viewer with Interactive Hotspot Pins */}
          <div className="lg:col-span-8 relative">
            <RevealOnScroll direction="up" delayMs={100}>
              <div
                data-cursor="view"
                data-cursor-text="INSPECT"
                className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-[#241F1B] border border-[#D8C8B4] shadow-xl group"
              >
                <Image
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85"
                  alt="Architectural Material & Spatial Explorer"
                  fill
                  className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Hotspot Pins */}
                {filteredHotspots.map((spot) => {
                  const isSelected = activeHotspot.id === spot.id;
                  return (
                    <button
                      key={spot.id}
                      onClick={() => setActiveHotspot(spot)}
                      style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                      type="button"
                      data-cursor="inspect"
                      data-cursor-text="MATERIAL"
                      aria-label={spot.titleEn}
                      className={cn(
                        "absolute -translate-x-1/2 -translate-y-1/2 z-20 group/pin cursor-pointer transition-all duration-300",
                        isSelected ? "scale-125" : "hover:scale-110"
                      )}
                    >
                      <span className="relative flex h-8 w-8 items-center justify-center">
                        <span
                          className={cn(
                            "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                            isSelected ? "bg-[#B88460]" : "bg-white"
                          )}
                        />
                        <span
                          className={cn(
                            "relative inline-flex rounded-full h-7 w-7 items-center justify-center text-[11px] font-mono font-medium shadow-md transition-colors",
                            isSelected
                              ? "bg-[#1C1917] text-[#FAF7F2] ring-2 ring-[#B88460]"
                              : "bg-[#FAF7F2] text-[#1C1917] ring-1 ring-black/20"
                          )}
                        >
                          <Sparkle className="w-3.5 h-3.5" weight="fill" />
                        </span>
                      </span>

                      {/* Tooltip on hover */}
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/pin:flex items-center px-2.5 py-1 rounded bg-[#1C1917] text-[#FAF7F2] text-[10px] whitespace-nowrap shadow-lg">
                        {isRTL ? spot.titleAr : spot.titleEn}
                      </span>
                    </button>
                  );
                })}

                {/* Floating Bottom Instructions */}
                <div className="absolute bottom-4 start-4 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#D8C8B4] text-xs text-[#503C2C] font-mono flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isRTL ? "انقر على النقاط لاكتشاف المواصفات" : "Click pins to inspect specifications"}</span>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Right/Inspector Sidebar Card with Acoustic Spectrum Bar */}
          <div className="lg:col-span-4">
            <RevealOnScroll direction="up" delayMs={200}>
              <TiltCard
                maxRotation={6}
                data-cursor="view"
                data-cursor-text="SPECS"
                className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-[#D8C8B4] shadow-lg"
              >
                <div className="flex items-center justify-between border-b border-[#D8C8B4]/60 pb-4 mb-4">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#B88460]">
                    <Sparkle className="w-3.5 h-3.5" />
                    <span>{isRTL ? "ملف المواصفات المعمارية" : "SPECIFICATION DOSSIER"}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DFD3C1]/50 text-[#503C2C]">
                    {activeHotspot.fireRating.split(" ")[0]}
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-normal text-[#1C1917] mb-1">
                  {isRTL ? activeHotspot.titleAr : activeHotspot.titleEn}
                </h3>

                <p className="text-sm font-medium text-[#B88460] mb-4">
                  {isRTL ? activeHotspot.materialAr : activeHotspot.materialEn}
                </p>

                <p className="text-xs text-[#6B635B] leading-relaxed mb-6">
                  {isRTL ? activeHotspot.specAr : activeHotspot.specEn}
                </p>

                {/* Acoustic & Sound Dampening Visualizer */}
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E6DDD2] mb-5">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="flex items-center gap-1.5 font-medium text-[#503C2C]">
                      <Waveform className="w-4 h-4 text-[#B88460]" />
                      <span>{isRTL ? "معامل امتصاص الصوت:" : "Acoustic Attenuation:"}</span>
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#1C1917]">
                      {activeHotspot.acousticScore}%
                    </span>
                  </div>
                  <div className="w-full bg-[#E6DDD2] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#B88460] to-[#503C2C] h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${activeHotspot.acousticScore}%` }}
                    />
                  </div>
                  <span className="block text-[10px] font-mono text-[#707070] mt-1.5">
                    {activeHotspot.acoustic}
                  </span>
                </div>

                {/* Technical Specifications List */}
                <div className="space-y-3 pt-3 border-t border-[#D8C8B4]/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B635B] flex items-center gap-1">
                      <GlobeHemisphereWest className="w-3.5 h-3.5 text-[#B88460]" />
                      <span>{isRTL ? "المصدر والمحجر:" : "Origin:"}</span>
                    </span>
                    <span className="font-medium text-[#1C1917]">
                      {isRTL ? activeHotspot.originAr : activeHotspot.originEn}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B635B]">{isRTL ? "مقاومة الحريق:" : "Fire Rating:"}</span>
                    <span className="font-medium text-[#1C1917]">{activeHotspot.fireRating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B635B]">{isRTL ? "الضمان الإنشائي:" : "Warranty:"}</span>
                    <span className="font-medium text-emerald-700">
                      {isRTL ? "10 سنوات شامل" : "10 Years Full Coverage"}
                    </span>
                  </div>
                </div>

                <Link
                  href={commissionUrl}
                  data-cursor="pointer"
                  data-cursor-text="ADD"
                  className="w-full mt-6 h-11 rounded-xl bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  <span>{isRTL ? "تضمين هذه المادة في مشروعي" : "Include in My Commission"}</span>
                  {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </Link>
              </TiltCard>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 5. BESPOKE TYPOLOGIES GALLERY WITH 3D PERSPECTIVE */}
      <section id="typologies" className="py-24 bg-[#FAF7F2]/50 border-t border-[#E6DDD2]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <RevealOnScroll direction="up" className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#D8C8B4] text-xs font-mono uppercase tracking-widest text-[#503C2C] mb-3">
                <HouseLine className="w-3.5 h-3.5" />
                <span>{isRTL ? "نماذج معمارية مخصصة" : "BESPOKE TYPOLOGIES"}</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal">
                {isRTL ? "مساحات مصممة لترتقي بتفاصيل حياتك" : "Curated Architectural Volumes"}
              </h2>
            </div>

            <Link
              href={commissionUrl}
              data-cursor="pointer"
              data-cursor-text="COMMISSION"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-[#1C1917] hover:text-[#B88460] underline underline-offset-4 transition-colors shrink-0"
            >
              <span>{isRTL ? "بدء تحديد نموذجك المعماري" : "Commission Your Custom Layout"}</span>
              {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TYPOLOGIES.map((typ, idx) => (
              <RevealOnScroll key={typ.id} direction="up" delayMs={idx * 100}>
                <TiltCard
                  maxRotation={6}
                  data-cursor="view"
                  data-cursor-text={typ.vol}
                  className="rounded-3xl overflow-hidden bg-white border border-[#D8C8B4] shadow-lg group hover:shadow-xl transition-all"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/11] overflow-hidden bg-[#241F1B]">
                    <Image
                      src={typ.image}
                      alt={typ.titleEn}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-4 start-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-[#FAF7F2] text-[10px] font-mono tracking-widest border border-white/20">
                      {typ.vol}
                    </div>
                    <div className="absolute bottom-3 end-3 px-2 py-0.5 rounded bg-black/40 backdrop-blur-md text-[9px] font-mono text-[#FAF7F2]/80">
                      {typ.coords}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-[#6B635B] font-mono mb-2">
                      <span>{typ.area}</span>
                      <span>{isRTL ? typ.locationAr : typ.locationEn}</span>
                    </div>

                    <h3 className="font-serif text-2xl font-normal text-[#1C1917] mb-2 group-hover:text-[#503C2C] transition-colors">
                      {isRTL ? typ.titleAr : typ.titleEn}
                    </h3>

                    <div className="text-[11px] font-mono text-[#B88460] mb-3">
                      {typ.height}
                    </div>

                    <p className="text-xs text-[#6B635B] leading-relaxed mb-6">
                      {isRTL ? typ.descAr : typ.descEn}
                    </p>

                    <Link
                      href={commissionUrl}
                      data-cursor="pointer"
                      data-cursor-text="COMMISSION"
                      className="inline-flex items-center justify-between w-full pt-4 border-t border-[#D8C8B4]/60 text-xs font-medium text-[#1C1917] group/link hover:text-[#B88460] transition-colors"
                    >
                      <span>{isRTL ? "مواصفات هذا النموذج" : "Commission This Volume"}</span>
                      {isRTL ? (
                        <ArrowLeft className="w-4 h-4 group-hover/link:-translate-x-1 transition-transform" />
                      ) : (
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      )}
                    </Link>
                  </div>
                </TiltCard>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* 6. COMPARISON MATRIX: VALENTIA ATELIER VS TRADITIONAL CONTRACTORS */}
      <section id="comparison" className="py-24 max-w-7xl mx-auto px-6 sm:px-8 border-t border-[#E6DDD2]">
        <RevealOnScroll direction="up" className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#D8C8B4] text-xs font-mono uppercase tracking-widest text-[#503C2C] mb-3">
            <Sliders className="w-3.5 h-3.5 text-[#B88460]" />
            <span>{isRTL ? "معيار فالنتيا المعماري" : "THE ATELIER STANDARD"}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal">
            {isRTL ? "لماذا يختار عملاء النخبة أتيليه فالنتيا؟" : "Why Discerning Clients Choose Valentia"}
          </h2>
          <p className="mt-3 text-sm text-[#6B635B] leading-relaxed">
            {isRTL
              ? "مقارنة دقيقة توضح الفارق الجذري بين المقاولات التقليدية ومنهجية الأتيليه الهندسية الصارمة."
              : "A transparent side-by-side comparison between conventional contractors and our architectural atelier protocol."}
          </p>
        </RevealOnScroll>

        <RevealOnScroll direction="up" delayMs={100}>
          <div className="rounded-3xl overflow-hidden border border-[#D8C8B4] bg-white shadow-xl">
            <div className="grid grid-cols-12 bg-[#FAF7F2] p-5 border-b border-[#E6DDD2] text-xs font-mono uppercase tracking-wider text-[#503C2C] font-semibold">
              <div className="col-span-4 sm:col-span-3">
                {isRTL ? "المعيار الهندسي" : "Evaluation Metric"}
              </div>
              <div className="col-span-4 sm:col-span-4 text-red-900/70">
                {isRTL ? "المقاولون التقليديون" : "Conventional Contractors"}
              </div>
              <div className="col-span-4 sm:col-span-5 text-[#1C1917] font-bold flex items-center gap-1.5">
                <Sparkle className="w-3.5 h-3.5 text-[#B88460]" />
                <span>{isRTL ? "أتيليه فالنتيا (المعيار المعتمد)" : "Valentia Atelier Standard"}</span>
              </div>
            </div>

            <div className="divide-y divide-[#E6DDD2]">
              {COMPARISON_ROWS.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 p-5 text-xs items-center hover:bg-[#FAF7F2]/40 transition-colors"
                >
                  <div className="col-span-4 sm:col-span-3 font-medium text-[#1C1917]">
                    {isRTL ? row.featureAr : row.featureEn}
                  </div>
                  <div className="col-span-4 sm:col-span-4 text-[#707070] flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{isRTL ? row.traditionalAr : row.traditionalEn}</span>
                  </div>
                  <div className="col-span-4 sm:col-span-5 text-[#1C1917] font-medium flex items-start gap-2 bg-[#F5EEE6]/50 p-2.5 rounded-xl border border-[#D8C8B4]/60">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{isRTL ? row.valentiaAr : row.valentiaEn}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* 7. 5-STAGE TURNKEY METHODOLOGY TIMELINE */}
      <section id="methodology" className="py-24 max-w-7xl mx-auto px-6 sm:px-8 border-t border-[#E6DDD2]">
        <RevealOnScroll direction="up" className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#D8C8B4] text-xs font-mono uppercase tracking-widest text-[#503C2C] mb-3">
            <Sparkle className="w-3.5 h-3.5 text-[#B88460]" />
            <span>{isRTL ? "منهجية العمل المتكاملة" : "TURNKEY METHODOLOGY"}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal">
            {isRTL ? "رحلة إنجاز متقنة من الفكرة حتى المفتاح" : "The 5-Stage Atelier Execution"}
          </h2>
          <p className="mt-3 text-sm text-[#6B635B] leading-relaxed">
            {isRTL
              ? "نلغي أي مجال للعشوائية من خلال منهجية هندسية منضبطة تضمن تنفيذ كل تفصيلة وفق أعلى المعايير العالمية."
              : "We eliminate execution ambiguity through an architectural workflow engineered for absolute precision and turnkey peace of mind."}
          </p>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {METHODOLOGY.map((m, idx) => (
            <RevealOnScroll key={m.step} direction="up" delayMs={idx * 80}>
              <div
                data-cursor="inspect"
                data-cursor-text={`STAGE ${m.step}`}
                className="p-6 rounded-2xl bg-white border border-[#D8C8B4] shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-3xl font-light text-[#B88460]">
                      {m.step}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#503C2C] border border-[#D8C8B4]">
                      {isRTL ? m.badgeAr : m.badgeEn}
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-normal text-[#1C1917] mb-2 leading-snug">
                    {isRTL ? m.titleAr : m.titleEn}
                  </h4>
                  <p className="text-xs text-[#6B635B] leading-relaxed">
                    {isRTL ? m.descAr : m.descEn}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#D8C8B4]/40 flex items-center gap-2 text-[10px] font-mono text-[#6B635B]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isRTL ? "بند تسليم تعاقدي معتمد" : "Verified Milestone Gate"}</span>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* 8. GRAND CLOSING COMMISSION CTA BANNER */}
      <section className="py-20 max-w-7xl mx-auto px-6 sm:px-8">
        <RevealOnScroll direction="up">
          <div className="relative rounded-3xl overflow-hidden bg-[#1C1917] text-[#FAF7F2] p-8 sm:p-14 lg:p-20 shadow-2xl">
            {/* Background Texture & Glow */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1C1917] via-[#1C1917]/90 to-[#1C1917]/70" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#B88460]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono uppercase tracking-widest text-[#FAF7F2]">
                <Sparkle className="w-3.5 h-3.5 text-[#B88460]" />
                <span>{isRTL ? "فتح باب الحجوزات المعمارية" : "EXCLUSIVE COMMISSIONS OPEN"}</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#FAF7F2] leading-tight">
                {isRTL
                  ? "هل أنت مستعد لبدء تصميم مسكن أحلامك؟"
                  : "Ready to Commission Your Bespoke Living Space?"}
              </h2>

              <p className="text-sm sm:text-base text-[#FAF7F2]/80 leading-relaxed">
                {isRTL
                  ? "ابدأ بتحديد متطلبات عقارك ومساحاتك المفضلة وسيقوم فريقنا المعماري بإعداد الدراسة الهندسية الأولية وعينات المواد الخاصة بك."
                  : "Specify your property dimensions, room distributions, and design direction. Our senior atelier architects will engineer your bespoke dossier."}
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href={commissionUrl}
                  data-cursor="pointer"
                  data-cursor-text="START"
                  className="h-12 px-8 rounded-full bg-[#FAF7F2] hover:bg-white text-[#1C1917] text-xs uppercase tracking-widest font-medium transition-all shadow-lg flex items-center gap-2 cursor-pointer group active:scale-98"
                >
                  <span>{isRTL ? "ابدأ مواصفات المشروع" : "Start Project Intake"}</span>
                  {isRTL ? (
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </Link>

                {!isAuthenticated && (
                  <Link
                    href="/signup"
                    data-cursor="pointer"
                    data-cursor-text="JOIN"
                    className="h-12 px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-[#FAF7F2] text-xs uppercase tracking-widest font-medium transition-colors flex items-center gap-2 cursor-pointer active:scale-98"
                  >
                    <User className="w-4 h-4" />
                    <span>{isRTL ? "تسجيل حساب عميل جديد" : "Create Client Account"}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* 9. ATELIER FOOTER */}
      <footer className="border-t border-[#E6DDD2] bg-[#FAF7F2] py-14 text-xs text-[#6B635B]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#1C1917] text-[#FAF7F2] flex items-center justify-center">
                <Buildings className="w-4 h-4" />
              </div>
              <span className="font-serif text-lg text-[#1C1917] font-normal tracking-wider uppercase">
                VALENTIA
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#6B635B] max-w-xs">
              {isRTL
                ? "أتيليه التصميم والتنفيذ المعماري الفاخر. متواجدون في القاهرة، دبي، والرياض."
                : "Bespoke interior architecture, turnkey fit-out, and artisanal joinery. Operating across Cairo, Dubai, and Riyadh."}
            </p>
          </div>

          <div>
            <span className="block font-mono text-[11px] uppercase tracking-wider text-[#1C1917] mb-3">
              {isRTL ? "المواقع والاستوديوهات" : "Atelier Studios"}
            </span>
            <ul className="space-y-2 text-xs">
              <li>{isRTL ? "الزمالك، القاهرة · مصر" : "Zamalek, Cairo · Egypt"}</li>
              <li>{isRTL ? "حي دبي للتصميم (d3) · الإمارات" : "Dubai Design District (d3) · UAE"}</li>
              <li>{isRTL ? "العليا، الرياض · المملكة العربية السعودية" : "Olaya, Riyadh · Saudi Arabia"}</li>
            </ul>
          </div>

          <div>
            <span className="block font-mono text-[11px] uppercase tracking-wider text-[#1C1917] mb-3">
              {isRTL ? "بوابة الأتيليه" : "Atelier Navigation"}
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href={commissionUrl}
                  data-cursor="pointer"
                  className="hover:text-[#1C1917] transition-colors"
                >
                  {isRTL ? "بدء مشروع جديد" : "Commission Project"}
                </Link>
              </li>
              <li>
                <Link
                  href={projectsUrl}
                  data-cursor="pointer"
                  className="hover:text-[#1C1917] transition-colors"
                >
                  {isRTL ? "لوحة مشاريعي" : "Projects Workspace"}
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  data-cursor="pointer"
                  className="hover:text-[#1C1917] transition-colors"
                >
                  {isRTL ? "تسجيل الدخول للأتيليه" : "Client Portal Sign In"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <span className="block font-mono text-[11px] uppercase tracking-wider text-[#1C1917] mb-3">
              {isRTL ? "الأمان والضمان" : "Compliance & Standards"}
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
                <span>{isRTL ? "تشفير 256-Bit SSL/TLS" : "256-Bit SSL/TLS Encrypted"}</span>
              </div>
              <p className="text-[11px] text-[#6B635B]">
                {isRTL
                  ? "جميع حقوق التصاميم والمخططات محمية بموجب اتفاقيات السرية والملكية الفكرية."
                  : "All architectural intellectual property protected under mutual non-disclosure."}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-12 pt-6 border-t border-[#E6DDD2] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <span>© {new Date().getFullYear()} Valentia Design & Build. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <span>ISO 9001 · ISO 27001 Certified</span>
            <button
              onClick={toggleLanguage}
              data-cursor="pointer"
              className="hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              {language === "en" ? "تبديل إلى العربية" : "Switch to English"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
