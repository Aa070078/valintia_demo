"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeSlash,
  Lock,
  User,
  ShieldCheck,
  Buildings,
  CircleNotch,
  Sparkle,
} from "@phosphor-icons/react";
import { useAuth } from "@/features/auth/context/auth-context";
import { DEMO_PERSONAS } from "@/features/auth/api/auth.api";
import type { UserRole } from "@/features/auth/types";
import { useLanguage } from "@/lib/i18n/language-context";
import { TiltCard } from "@/components/motion/tilt-card";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const { login, isLoading } = useAuth();
  const { language, toggleLanguage, isRTL } = useLanguage();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Quick fill helper for demonstration personas
  const handleSelectDemoPersona = (role: UserRole | "FIRST_LOGIN_STAFF") => {
    if (role === "FIRST_LOGIN_STAFF") {
      setUsername("tarek.ramzy@valentia.com");
      setPassword("Temp@2026");
      setError(null);
      return;
    }
    const persona = DEMO_PERSONAS[role];
    if (persona) {
      setUsername(persona.username || persona.email || "");
      setPassword("Valentia@2026");
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError(
        isRTL
          ? "من فضلك اكتب اسم المستخدم أو الإيميل وكلمة السر."
          : "Please enter your username/email and password."
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login({
        username: username.trim(),
        password,
        rememberMe,
      });

      if (res?.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        const destination =
          redirectParam && redirectParam.startsWith("/")
            ? redirectParam
            : "/projects";
        router.push(destination);
      }
    } catch (err: unknown) {
      console.error("Login failed:", err);
      setError(
        isRTL
          ? "بيانات الدخول مش صحيحة. اتأكد من اسم المستخدم وكلمة السر وجرب تاني."
          : "Invalid credentials. Please verify your username and password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#ECE3D5] text-[#1C1917] flex flex-col md:flex-row relative overflow-hidden">
      {/* Top Floating Language & Home Link */}
      <div className="absolute top-6 left-6 right-6 z-30 flex items-center justify-between pointer-events-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#503C2C] hover:text-[#1C1917] font-medium transition-colors bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D8C8B4]/60 shadow-sm"
        >
          {isRTL ? (
            <>
              <ArrowRight className="h-3.5 w-3.5" />
              <span>الرئيسية</span>
            </>
          ) : (
            <>
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Atelier Home</span>
            </>
          )}
        </Link>

        <button
          onClick={toggleLanguage}
          type="button"
          className="text-xs font-medium tracking-wider text-[#503C2C] hover:text-[#1C1917] transition-colors bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D8C8B4]/60 shadow-sm"
        >
          {language === "en" ? "العربية" : "English"}
        </button>
      </div>

      {/* LEFT PANEL: Architectural Brand & Depth Storytelling */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-[#241F1B] text-[#FAF7F2]">
        {/* Architectural Background Photography with Vignette */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/70 to-[#1C1917]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(184,132,96,0.25),transparent_70%)]" />

        {/* Brand Lockup */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#FAF7F2]/30 flex items-center justify-center bg-white/10 backdrop-blur-md">
              <Buildings className="w-5 h-5 text-[#FAF7F2]" weight="light" />
            </div>
            <div>
              <span className="block text-sm tracking-[0.25em] font-light uppercase text-[#FAF7F2]">
                VALENTIA
              </span>
              <span className="block text-[10px] tracking-[0.2em] text-[#FAF7F2]/60 uppercase">
                {isRTL ? "أتيليه التصميم والتشطيب المتكامل" : "Design & Build Atelier"}
              </span>
            </div>
          </div>
        </div>

        {/* Centerpiece 3D Tilt Quote Card */}
        <div className="relative z-10 my-auto py-12">
          <TiltCard
            maxRotation={8}
            className="p-8 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/15 shadow-2xl text-[#FAF7F2]"
          >
            <div className="flex items-center gap-2 mb-4 text-[#B88460] text-xs uppercase tracking-widest font-mono">
              <Sparkle className="w-3.5 h-3.5" weight="fill" />
              <span>{isRTL ? "فلسفتنا في التصميم" : "ATELIER PHILOSOPHY"}</span>
            </div>

            <p className="font-serif text-2xl xl:text-3xl leading-relaxed font-normal text-[#FAF7F2]/95 italic">
              {isRTL
                ? "«التصميم مش مجرد رص حيطان ومساحات، ده أسلوب حياة بيجمع بين الراحة والجمال الراقي الخالد.»"
                : "“Architecture is not merely the organization of space, but the physical embodiment of timeless serenity and bespoke living.”"}
            </p>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="block text-sm font-medium text-[#FAF7F2]">
                  {isRTL ? "أتيليه فالنتيا المعماري" : "Valentia Design & Build"}
                </span>
                <span className="block text-xs text-[#FAF7F2]/60">
                  {isRTL ? "الشيخ زايد · التجمع · الساحل · الجونة" : "Cairo · Dubai · Riyadh"}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] text-[#FAF7F2]/80 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isRTL ? "شغالين على مشاريع حالية" : "Active Commissions"}</span>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Security & Cryptography Assurance Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-[#FAF7F2]/60 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" weight="fill" />
            <span>
              {isRTL
                ? "تشفير بنكي آمن 256-bit · حماية كاملة لبياناتك"
                : "256-bit AES Encryption · Bearer JWT Authentication"}
            </span>
          </div>
          <span className="font-mono text-[11px]">ISO 27001 COMPLIANT</span>
        </div>
      </div>

      {/* RIGHT PANEL: Authentication Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-20 sm:px-12 md:px-16 lg:px-20 xl:px-24 relative z-10 overflow-y-auto">
        <RevealOnScroll direction="up" delayMs={100} className="w-full max-w-md mx-auto">
          {/* Header Lockup */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFD3C1]/50 border border-[#D8C8B4] text-xs font-mono uppercase tracking-widest text-[#503C2C] mb-3">
              <Lock className="w-3 h-3" />
              <span>{isRTL ? "تسجيل دخول آمن" : "SECURE ATELIER PORTAL"}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
              {isRTL ? "تسجيل الدخول" : "Sign In to Atelier"}
            </h1>
            <p className="mt-2 text-sm text-[#6B635B] leading-relaxed">
              {isRTL
                ? "سجل دخولك عشان تتابع تفاصيل تشطيب بيتك، المقايسة والمواصفات خطوة بخطوة."
                : "Access your architectural blueprints, itemized BOQ, and turnkey milestone updates."}
            </p>
          </div>

          {/* Demonstration Personas Selector (Quick Dev / Preview Access) */}
          <div className="mb-6 p-4 rounded-xl bg-white/70 border border-[#D8C8B4] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B635B]">
                {isRTL ? "تجربة سريعة للأدوار" : "DEMO ACCESS PERSONAS"}
              </span>
              <span className="text-[10px] text-[#B88460] font-medium">
                {isRTL ? "دوس للتعبئة السريعة" : "Click to Autofill"}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(
                [
                  "CUSTOMER",
                  "ENGINEER",
                  "PROJECT_MANAGER",
                  "COMPANY_OWNER",
                  "ADMINISTRATOR",
                ] as UserRole[]
              ).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleSelectDemoPersona(role)}
                  className="px-2 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#1C1917] hover:text-[#FAF7F2] border border-[#D8C8B4]/60 text-[10px] font-medium text-[#503C2C] transition-all text-center truncate cursor-pointer"
                  title={role}
                >
                  {role === "CUSTOMER"
                    ? isRTL ? "عميل" : "Client"
                    : role === "ENGINEER"
                    ? isRTL ? "مهندس" : "Engineer"
                    : role === "PROJECT_MANAGER"
                    ? isRTL ? "مدير مشروع" : "PM"
                    : role === "COMPANY_OWNER"
                    ? isRTL ? "صاحب الشركة" : "Owner"
                    : isRTL ? "الأدمن" : "Admin"}
                </button>
              ))}
            </div>

            {/* Quick First-Login Demo Button */}
            <div className="mt-2.5 pt-2.5 border-t border-[#D8C8B4]/60">
              <button
                type="button"
                onClick={() => handleSelectDemoPersona("FIRST_LOGIN_STAFF")}
                className="w-full py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                title="Test First-Login Pop-Up Flow"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="font-semibold">
                    {isRTL ? "🔑 تجربة بوب أب أول دخول (مهندس جديد)" : "🔑 Test First-Login Pop-Up (New Engineer)"}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded">
                  Temp@2026
                </span>
              </button>
            </div>
          </div>

          {/* Redirect Notice */}
          {redirectParam && (
            <div className="mb-6 p-3.5 rounded-xl bg-[#EFE7DC] border border-[#D8C8B4] text-[#503C2C] text-xs flex items-center gap-2.5 shadow-sm">
              <Lock className="w-4 h-4 text-[#B88460] shrink-0" />
              <span>
                {isRTL
                  ? "سجل دخولك الأول عشان تقدر تفتح وتتابع مشاريعك الخاصة."
                  : "Please authenticate to access your atelier projects and commission workspace."}
              </span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs uppercase tracking-wider font-medium text-[#503C2C] mb-1.5"
              >
                {isRTL ? "اسم المستخدم أو الإيميل" : "Username or Email"}
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    isRTL ? "tarek.mansour@example.com" : "tarek.mansour@example.com"
                  }
                  className="w-full h-12 px-4 ps-11 rounded-xl bg-white/90 border border-[#D8C8B4] focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] text-sm text-[#1C1917] placeholder:text-[#6B635B]/50 transition-all outline-none"
                />
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-[#6B635B]">
                  <User className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs uppercase tracking-wider font-medium text-[#503C2C]"
                >
                  {isRTL ? "كلمة السر" : "Password"}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#B88460] hover:text-[#503C2C] transition-colors"
                >
                  {isRTL ? "نسيت كلمة السر؟" : "Forgot Password?"}
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-12 px-4 ps-11 pe-11 rounded-xl bg-white/90 border border-[#D8C8B4] focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] text-sm text-[#1C1917] placeholder:text-[#6B635B]/50 transition-all outline-none"
                />
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-[#6B635B]">
                  <Lock className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-[#6B635B] hover:text-[#1C1917] transition-colors"
                >
                  {showPassword ? (
                    <EyeSlash className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D8C8B4] text-[#1C1917] focus:ring-[#1C1917]"
                />
                <span className="text-xs text-[#6B635B]">
                  {isRTL ? "افتكرني على الجهاز ده" : "Remember this workstation"}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full h-12 mt-2 rounded-xl bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting || isLoading ? (
                <>
                  <CircleNotch className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? "ثواني بنسجل دخولك..." : "Authenticating..."}</span>
                </>
              ) : (
                <>
                  <span>{isRTL ? "دخول لحسابي" : "Sign In to Atelier"}</span>
                  {isRTL ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </>
              )}
            </button>
          </form>

          {/* Switch to Signup */}
          <div className="mt-8 text-center border-t border-[#D8C8B4] pt-6">
            <p className="text-xs text-[#6B635B]">
              {isRTL ? "أول مرة تشطب معانا في فالنتيا؟" : "New client commissioning a project?"}{" "}
              <Link
                href={
                  redirectParam
                    ? `/signup?redirect=${encodeURIComponent(redirectParam)}`
                    : "/signup"
                }
                className="font-medium text-[#1C1917] hover:text-[#B88460] underline underline-offset-4 transition-colors"
              >
                {isRTL ? "اعمل حساب جديد وابدأ تشطيب بيتك ←" : "Create an account & start commission"}
              </Link>
            </p>
          </div>

          {/* Security & Confidentiality */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#6B635B]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {isRTL
                  ? "بيانات ومواصفات تشطيب بيتك محمية ومشفرة بأعلى معايير الأمان."
                  : "Encrypted atelier portal protecting architectural and engineering confidentiality"}
              </span>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#ECE3D5] flex items-center justify-center text-[#503C2C]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
            <CircleNotch className="w-4 h-4 animate-spin" />
            <span>Loading Atelier Login...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
