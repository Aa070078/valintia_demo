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
} from "@phosphor-icons/react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { TiltCard } from "@/components/motion/tilt-card";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { cn } from "@/lib/utils";

// Material Hotspots for the Interactive 3D Axonometric Section
interface MaterialHotspot {
  id: string;
  x: number; // percentage
  y: number; // percentage
  titleEn: string;
  titleAr: string;
  materialEn: string;
  materialAr: string;
  specEn: string;
  specAr: string;
  acoustic: string;
}

const HOTSPOTS: MaterialHotspot[] = [
  {
    id: "travertine",
    x: 38,
    y: 62,
    titleEn: "Living Salon Flooring",
    titleAr: "أرضيات الصالون والمعيشة",
    materialEn: "Honed Navona Travertine",
    materialAr: "ترافرتين نافونا المطفي مع فواصل نحاسية",
    specEn: "Large format 120×120cm slabs with micro-beveled edges and acoustic sub-mat.",
    specAr: "ألواح كبيرة قياس 120×120 سم مع حواف دقيقة وطبقة عازلة للصوت.",
    acoustic: "NRC 0.45 · Class A",
  },
  {
    id: "joinery",
    x: 68,
    y: 42,
    titleEn: "Architectural Millwork",
    titleAr: "التجاليد الخشبية المعمارية",
    materialEn: "Rift-Cut White Oak",
    materialAr: "خشب السنديان الأبيض مع إضاءة دافئة 2700K",
    specEn: "Custom acoustic wall panels with concealed soft-closing storage and brass shadow reveals.",
    specAr: "تجاليد جدارية مخصصة عازلة للصوت مع دواليب مخفية وظلال نحاسية غائرة.",
    acoustic: "NRC 0.65 · Class A",
  },
  {
    id: "glass",
    x: 48,
    y: 28,
    titleEn: "Dining Room Partition",
    titleAr: "قاطع غرفة الطعام",
    materialEn: "Fluted Low-Iron Glass",
    materialAr: "زجاج مضلع منخفض الحديد مع إطار برونزي",
    specEn: "Acoustic laminated fluted glass with anodized deep bronze aluminum profile.",
    specAr: "زجاج مصفح عازل للصوت بتضليعات ناعمة وإطار ألمنيوم مؤكسد باللون البرونزي.",
    acoustic: "STC 38dB",
  },
  {
    id: "terrace",
    x: 22,
    y: 35,
    titleEn: "Veranda Transition",
    titleAr: "الامتداد الخارجي للتراس",
    materialEn: "Textured Basalt & Teak",
    materialAr: "حجر بازلت ملمس وخشب تيك طبيعي",
    specEn: "Flush sill threshold transition for seamless indoor-outdoor living flow.",
    specAr: "عتبات متساوية السطح بالكامل لتحقيق انسيابية تامة بين الداخل والخارج.",
    acoustic: "Weatherproof · IP68",
  },
];

// Curated Typologies Data
const TYPOLOGIES = [
  {
    id: "villa",
    vol: "VOLUME 01",
    titleEn: "Grand Private Villas",
    titleAr: "الفلل المستقلة والقصور",
    area: "450 – 1,200 m²",
    locationEn: "New Cairo & Sheikh Zayed",
    locationAr: "القاهرة الجديدة والشيخ زايد",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    descEn: "Complete turnkey structural and interior fit-out, double-height volumes, and private wellness suites.",
    descAr: "تشطيب وتنفيذ معماري متكامل يشمل الأسقف المرتفعة ومساحات الاستجمام والحدائق الداخلية.",
  },
  {
    id: "penthouse",
    vol: "VOLUME 02",
    titleEn: "Sky Penthouses",
    titleAr: "بنتهاوس الأفق",
    area: "320 – 680 m²",
    locationEn: "Palm Jumeirah & Nile View",
    locationAr: "نخلة جميرا وإطلالات النيل",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    descEn: "Panoramic glazing, bespoke acoustic ceiling rafts, and infinity terrace indoor-outdoor living.",
    descAr: "واجهات زجاجية بانورامية، أسقف عازلة للصوت، وتراسات معلقة بإطلالات خلابة.",
  },
  {
    id: "duplex",
    vol: "VOLUME 03",
    titleEn: "Urban Duplexes",
    titleAr: "الدوبلكس العصري",
    area: "240 – 420 m²",
    locationEn: "New Capital & Maadi",
    locationAr: "العاصمة الإدارية والمعادي",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
    descEn: "Sculptural floating staircases, mezzanine libraries, and integrated smart living automation.",
    descAr: "سلالم معلقة ذات طابع نحتي، ميزانين مفتوح، ونظم منزلية ذكية مدمجة بالكامل.",
  },
];

// 5-Stage Turnkey Methodology
const METHODOLOGY = [
  {
    step: "01",
    titleEn: "Laser Survey & Structural Audit",
    titleAr: "المسح الليزري والتدقيق الإنشائي",
    descEn: "Millimeter-precise 3D point cloud scan of your property with acoustic and structural load verification.",
    descAr: "مسح ثلاثي الأبعاد بالليزر بدقة المليمتر وفحص الأحمال الإنشائية والعزل.",
  },
  {
    step: "02",
    titleEn: "Bespoke 3D Spatial Architecture",
    titleAr: "التصميم المكاني ثلاثي الأبعاد",
    descEn: "Tailored axonometric layout, curated moodboards, lighting choreography, and material samples at your door.",
    descAr: "تخطيط أيزومتري مفصل، لوحات إلهام مخصصة، دراسة الإضاءة، وتوصيل عينات المواد لمنزلك.",
  },
  {
    step: "03",
    titleEn: "100% Itemized BOQ & Procurement",
    titleAr: "جدول الكميات والتوريدات بشفافية",
    descEn: "Fixed contract pricing with zero unexpected variation orders. Direct sourcing from European quarries and mills.",
    descAr: "تسعير تعاقدي ثابت بدون مفاجآت، واستيراد مباشر من المقالع والمصانع الأوروبية المعتمدة.",
  },
  {
    step: "04",
    titleEn: "Atelier Joinery & Fit-Out Execution",
    titleAr: "التنفيذ المعماري وأعمال النجارة الفاخرة",
    descEn: "Dedicated on-site lead architect managing precision MEP, custom joinery, stone cladding, and acoustic rafts.",
    descAr: "مهندس موقع مخصص يدير الأعمال الكهروميكانيكية، التكسيات الحجرية، والنجارة الفندقية.",
  },
  {
    step: "05",
    titleEn: "White-Glove Handover & Warranty",
    titleAr: "التسليم الفندقي والضمان الشامل",
    descEn: "Deep detailing, custom fragrance curation, comprehensive O&M manual, and our 10-year structural warranty.",
    descAr: "تنظيف وتعقيم فندقي شامل، تسليم كتيب الصيانة والتشغيل، وضمان معتمد لمدة 10 سنوات.",
  },
];

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const { language, toggleLanguage, isRTL } = useLanguage();

  const [activeHotspot, setActiveHotspot] = React.useState<MaterialHotspot>(HOTSPOTS[0]);

  return (
    <div className="min-h-screen bg-[#ECE3D5] text-[#1C1917] selection:bg-[#1C1917] selection:text-[#FAF7F2] relative overflow-x-hidden">
      {/* 1. STICKY ATELIER NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#FAF7F2]/85 backdrop-blur-xl border-b border-[#D8C8B4]/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          {/* Brand Monogram */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-full bg-[#1C1917] text-[#FAF7F2] flex items-center justify-center border border-[#1C1917] shadow-sm group-hover:bg-[#503C2C] transition-colors">
              <Buildings className="w-5 h-5" weight="light" />
            </div>
            <div>
              <span className="block text-sm tracking-[0.25em] font-light uppercase text-[#1C1917]">
                VALENTIA
              </span>
              <span className="block text-[9px] tracking-[0.22em] text-[#6B635B] uppercase font-mono">
                {isRTL ? "أتيليه التصميم والتنفيذ" : "Design & Build Atelier"}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-[#503C2C] font-medium">
            <a href="#philosophy" className="hover:text-[#1C1917] transition-colors">
              {isRTL ? "الفلسفة" : "Philosophy"}
            </a>
            <a href="#blueprints" className="hover:text-[#1C1917] transition-colors">
              {isRTL ? "المخططات والمواد" : "Blueprints"}
            </a>
            <a href="#typologies" className="hover:text-[#1C1917] transition-colors">
              {isRTL ? "المشاريع والنماذج" : "Typologies"}
            </a>
            <a href="#methodology" className="hover:text-[#1C1917] transition-colors">
              {isRTL ? "منهجية التنفيذ" : "Methodology"}
            </a>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="text-xs font-medium tracking-wider text-[#503C2C] hover:text-[#1C1917] transition-colors bg-white/60 hover:bg-white/90 px-3 py-1.5 rounded-full border border-[#D8C8B4] shadow-xs cursor-pointer"
            >
              {language === "en" ? "العربية" : "English"}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] text-xs font-medium tracking-wider uppercase transition-all shadow-sm cursor-pointer"
                >
                  <span>{isRTL ? "مشاريعي" : "My Projects"}</span>
                  {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </Link>
                <div className="w-8 h-8 rounded-full bg-[#DFD3C1] border border-[#D8C8B4] flex items-center justify-center text-xs font-medium text-[#1C1917]">
                  {user?.name?.[0] || <User className="w-4 h-4" />}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#503C2C] hover:text-[#1C1917] hover:bg-white/60 transition-colors"
                >
                  {isRTL ? "تسجيل الدخول" : "Sign In"}
                </Link>
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] text-xs font-medium tracking-wider uppercase transition-all shadow-sm cursor-pointer hover:shadow-md"
                >
                  <span>{isRTL ? "بدء مشروعك" : "Commission"}</span>
                  {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. FLAGSHIP HERO: BESPOKE 3D TILT & PARALLAX SHOWCASE */}
      <section
        id="philosophy"
        className="pt-32 pb-20 md:pt-40 md:pb-28 max-w-7xl mx-auto px-6 sm:px-8 relative overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Column */}
          <RevealOnScroll direction="up" delayMs={100} className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-white/70 border border-[#D8C8B4] text-xs font-mono tracking-widest text-[#503C2C] uppercase shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#B88460] animate-pulse" />
              <span>
                {isRTL
                  ? "أتيليه فالنتيا للتصميم والتنفيذ المعماري"
                  : "VALENTIA DESIGN & BUILD ATELIER"}
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl xl:text-6xl text-[#1C1917] font-normal tracking-tight leading-[1.12]">
              {isRTL ? (
                <>
                  من مجرد مساحة
                  <br />
                  <span className="italic font-light text-[#503C2C]">
                    إلى أسلوب حياة استثنائي.
                  </span>
                </>
              ) : (
                <>
                  From a place
                  <br />
                  <span className="italic font-light text-[#503C2C]">
                    to a bespoke lifestyle.
                  </span>
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
                href="/projects/new"
                className="h-12 px-7 rounded-full bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] text-xs uppercase tracking-widest font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2.5 cursor-pointer group"
              >
                <span>{isRTL ? "ابدأ تصميم مشروعك الآن" : "Commission Your Estate"}</span>
                {isRTL ? (
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                ) : (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </Link>

              <a
                href="#blueprints"
                className="h-12 px-6 rounded-full bg-white/80 hover:bg-white border border-[#D8C8B4] text-[#1C1917] text-xs uppercase tracking-widest font-medium transition-colors shadow-xs flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#B88460]" />
                <span>{isRTL ? "استعراض المخططات والمواد" : "Explore Blueprints"}</span>
              </a>
            </div>

            {/* Trust Badges */}
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

          {/* Right Column: 3D Perspective Tilt Card */}
          <div className="lg:col-span-6 relative">
            <RevealOnScroll direction="up" delayMs={250}>
              <TiltCard
                maxRotation={10}
                perspective={1200}
                className="rounded-3xl p-3 sm:p-4 bg-white/80 backdrop-blur-xl border border-[#D8C8B4] shadow-2xl shadow-[#1C1917]/10"
              >
                {/* Visual Image Container */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#241F1B]">
                  <Image
                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85"
                    alt="Valentia Luxury Residence Interior"
                    fill
                    priority
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/80 via-transparent to-black/20" />

                  {/* Floating Depth Badges */}
                  <div className="absolute top-4 start-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[#FAF7F2] text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isRTL ? "قيد التنفيذ · القاهرة الجديدة" : "Commission · Horizon Villa"}</span>
                  </div>

                  <div className="absolute bottom-4 start-4 end-4 flex items-end justify-between text-[#FAF7F2]">
                    <div>
                      <span className="block text-xs uppercase tracking-widest text-[#FAF7F2]/70 font-mono">
                        {isRTL ? "مساحة 520 م² · تصميم معاصر" : "520 m² · Warm Minimalist"}
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

                {/* Card Lower Bar with Turnkey Progress Tracker */}
                <div className="mt-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#D8C8B4]/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-9 h-9 rounded-full bg-[#1C1917] text-[#FAF7F2] flex items-center justify-center shrink-0">
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
                    href="/projects/new"
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
      <section className="border-y border-[#D8C8B4] bg-[#FAF7F2]/60 py-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <RevealOnScroll direction="up" delayMs={50}>
              <div className="p-4 rounded-2xl bg-white/60 border border-[#D8C8B4]/50 shadow-xs">
                <Ruler className="w-6 h-6 mx-auto mb-2 text-[#503C2C]" />
                <h4 className="font-serif text-2xl font-normal text-[#1C1917]">0.02 mm</h4>
                <p className="text-xs text-[#6B635B] mt-1">
                  {isRTL ? "دقة مسح السحب النقطية بالليزر" : "Laser Point Cloud Precision"}
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delayMs={100}>
              <div className="p-4 rounded-2xl bg-white/60 border border-[#D8C8B4]/50 shadow-xs">
                <SealCheck className="w-6 h-6 mx-auto mb-2 text-[#503C2C]" />
                <h4 className="font-serif text-2xl font-normal text-[#1C1917]">100%</h4>
                <p className="text-xs text-[#6B635B] mt-1">
                  {isRTL ? "شفافية مطلقة في تسعير BOQ" : "Fixed Itemized BOQ Rates"}
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delayMs={150}>
              <div className="p-4 rounded-2xl bg-white/60 border border-[#D8C8B4]/50 shadow-xs">
                <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-[#503C2C]" />
                <h4 className="font-serif text-2xl font-normal text-[#1C1917]">10 Years</h4>
                <p className="text-xs text-[#6B635B] mt-1">
                  {isRTL ? "ضمان إنشائي وتشغيلي معتمد" : "Comprehensive Warranty"}
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delayMs={200}>
              <div className="p-4 rounded-2xl bg-white/60 border border-[#D8C8B4]/50 shadow-xs">
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

      {/* 4. INTERACTIVE 3D AXONOMETRIC & MATERIAL SPECIFICATION SECTION */}
      <section id="blueprints" className="py-24 max-w-7xl mx-auto px-6 sm:px-8">
        <RevealOnScroll direction="up" className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-[#D8C8B4] text-xs font-mono uppercase tracking-widest text-[#503C2C] mb-3">
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
        </RevealOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left/Main Blueprint Viewer with Interactive Hotspot Pins */}
          <div className="lg:col-span-8 relative">
            <RevealOnScroll direction="up" delayMs={100}>
              <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-[#241F1B] border border-[#D8C8B4] shadow-xl group">
                <Image
                  src="/images/isometric-floorplan.jpg"
                  alt="3D Axonometric Blueprint Model"
                  fill
                  className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Hotspot Pins */}
                {HOTSPOTS.map((spot) => {
                  const isSelected = activeHotspot.id === spot.id;
                  return (
                    <button
                      key={spot.id}
                      onClick={() => setActiveHotspot(spot)}
                      style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                      type="button"
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
                <div className="absolute bottom-4 start-4 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#D8C8B4] text-xs text-[#503C2C] font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isRTL ? "انقر على النقاط لاكتشاف المواد" : "Click pins to inspect specifications"}</span>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Right/Inspector Sidebar Card */}
          <div className="lg:col-span-4">
            <RevealOnScroll direction="up" delayMs={200}>
              <TiltCard
                maxRotation={6}
                className="p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-[#D8C8B4] shadow-lg"
              >
                <div className="flex items-center justify-between border-b border-[#D8C8B4]/60 pb-4 mb-4">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#B88460]">
                    <Sparkle className="w-3.5 h-3.5" />
                    <span>{isRTL ? "تفاصيل المواصفات" : "SPECIFICATION DOSSIER"}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DFD3C1]/50 text-[#503C2C]">
                    {activeHotspot.acoustic}
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

                <div className="space-y-3 pt-4 border-t border-[#D8C8B4]/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B635B]">{isRTL ? "طريقة التوريد:" : "Procurement:"}</span>
                    <span className="font-medium text-[#1C1917]">
                      {isRTL ? "استيراد مباشر من إيطاليا" : "Direct European Quarry Import"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B635B]">{isRTL ? "العزل الصوتي:" : "Acoustic Rating:"}</span>
                    <span className="font-medium text-[#1C1917]">{activeHotspot.acoustic}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B635B]">{isRTL ? "الضمان:" : "Warranty:"}</span>
                    <span className="font-medium text-emerald-700">
                      {isRTL ? "10 سنوات شامل" : "10 Years Full Coverage"}
                    </span>
                  </div>
                </div>

                <Link
                  href="/projects/new"
                  className="w-full mt-6 h-11 rounded-xl bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <span>{isRTL ? "تضمين هذه المادة في مشروعي" : "Include in My Commission"}</span>
                  {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </Link>
              </TiltCard>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 5. BESPOKE TYPOLOGIES GALLERY */}
      <section id="typologies" className="py-24 bg-[#FAF7F2]/50 border-t border-[#D8C8B4]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <RevealOnScroll direction="up" className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-[#D8C8B4] text-xs font-mono uppercase tracking-widest text-[#503C2C] mb-3">
                <HouseLine className="w-3.5 h-3.5" />
                <span>{isRTL ? "نماذج معمارية مخصصة" : "BESPOKE TYPOLOGIES"}</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal">
                {isRTL ? "مساحات مصممة لترتقي بتفاصيل حياتك" : "Curated Architectural Volumes"}
              </h2>
            </div>

            <Link
              href="/projects/new"
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
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-[#6B635B] font-mono mb-2">
                      <span>{typ.area}</span>
                      <span>{isRTL ? typ.locationAr : typ.locationEn}</span>
                    </div>

                    <h3 className="font-serif text-2xl font-normal text-[#1C1917] mb-3 group-hover:text-[#503C2C] transition-colors">
                      {isRTL ? typ.titleAr : typ.titleEn}
                    </h3>

                    <p className="text-xs text-[#6B635B] leading-relaxed mb-6">
                      {isRTL ? typ.descAr : typ.descEn}
                    </p>

                    <Link
                      href="/projects/new"
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

      {/* 6. 5-STAGE TURNKEY METHODOLOGY TIMELINE */}
      <section id="methodology" className="py-24 max-w-7xl mx-auto px-6 sm:px-8">
        <RevealOnScroll direction="up" className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-[#D8C8B4] text-xs font-mono uppercase tracking-widest text-[#503C2C] mb-3">
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
              <div className="p-6 rounded-2xl bg-white/80 border border-[#D8C8B4] shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between">
                <div>
                  <span className="block font-mono text-3xl font-light text-[#B88460] mb-4">
                    {m.step}
                  </span>
                  <h4 className="font-serif text-lg font-normal text-[#1C1917] mb-2 leading-snug">
                    {isRTL ? m.titleAr : m.titleEn}
                  </h4>
                  <p className="text-xs text-[#6B635B] leading-relaxed">
                    {isRTL ? m.descAr : m.descEn}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#D8C8B4]/40 flex items-center gap-2 text-[10px] font-mono text-[#6B635B]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isRTL ? "بند تسليم معتمد" : "Milestone Gate"}</span>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* 7. GRAND CLOSING COMMISSION CTA BANNER */}
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
                  href="/projects/new"
                  className="h-12 px-8 rounded-full bg-[#FAF7F2] hover:bg-white text-[#1C1917] text-xs uppercase tracking-widest font-medium transition-all shadow-lg flex items-center gap-2 cursor-pointer group"
                >
                  <span>{isRTL ? "ابدأ مواصفات المشروع" : "Start Project Intake"}</span>
                  {isRTL ? (
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </Link>

                <Link
                  href="/signup"
                  className="h-12 px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-[#FAF7F2] text-xs uppercase tracking-widest font-medium transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>{isRTL ? "تسجيل حساب عميل جديد" : "Create Client Account"}</span>
                </Link>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* 8. ATELIER FOOTER */}
      <footer className="border-t border-[#D8C8B4] bg-[#FAF7F2] py-14 text-xs text-[#6B635B]">
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
                <Link href="/projects/new" className="hover:text-[#1C1917] transition-colors">
                  {isRTL ? "بدء مشروع جديد" : "Commission Project"}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#1C1917] transition-colors">
                  {isRTL ? "تسجيل الدخول للأتيليه" : "Client Portal Sign In"}
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-[#1C1917] transition-colors">
                  {isRTL ? "إنشاء حساب عميل" : "Register Client Account"}
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

        <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-12 pt-6 border-t border-[#D8C8B4]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <span>© {new Date().getFullYear()} Valentia Design & Build. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <span>ISO 9001 · ISO 27001 Certified</span>
            <button onClick={toggleLanguage} className="hover:text-[#1C1917] transition-colors">
              {language === "en" ? "تبديل إلى العربية" : "Switch to English"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
