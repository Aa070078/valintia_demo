"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  EnvelopeSimple,
  Lock,
  Buildings,
  CircleNotch,
  ShieldCheck,
} from "@phosphor-icons/react";
import { authApi } from "@/features/auth/api/auth.api";
import { useLanguage } from "@/lib/i18n/language-context";
import { getErrorMessage, cn } from "@/lib/utils";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isRTL, language, toggleLanguage } = useLanguage();

  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(
        isRTL
          ? "من فضلك اكتب بريدك الإلكتروني المسجل."
          : "Please enter your registered email address."
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      // Dispatch password reset request to backend
      await authApi.requestForgotPassword(normalizedEmail);

      // Navigate to OTP verification for PASSWORD_RESET
      router.push(
        `/verify-otp?email=${encodeURIComponent(
          normalizedEmail
        )}&purpose=PASSWORD_RESET`
      );
    } catch (err: unknown) {
      console.error("Forgot password request failed:", err);
      const apiMsg = getErrorMessage(err, isRTL);
      setError(
        apiMsg ||
          (isRTL
            ? "تعذر إرسال رمز الاستعادة حالياً. يرجى التأكد من البريد والمحاولة مرة أخرى."
            : "Could not send password reset code. Please check your email and try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#ECE3D5] text-[#1C1917] flex flex-col md:flex-row relative overflow-hidden">
      {/* Top Floating Navigation & Language Switcher */}
      <div className="absolute top-6 left-6 right-6 z-30 flex items-center justify-between pointer-events-auto">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#503C2C] hover:text-[#1C1917] font-medium transition-colors bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D8C8B4]/60 shadow-sm"
        >
          {isRTL ? (
            <>
              <ArrowRight className="h-3.5 w-3.5" />
              <span>رجوع للدخول</span>
            </>
          ) : (
            <>
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
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
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/70 to-[#1C1917]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(184,132,96,0.25),transparent_70%)]" />

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

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FAF7F2] text-xs font-mono uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5 text-[#B88460]" />
            <span>{isRTL ? "استعادة آمنة" : "ACCOUNT RECOVERY"}</span>
          </div>

          <h2 className="font-serif text-3xl xl:text-4xl text-[#FAF7F2] font-normal tracking-tight leading-tight">
            {isRTL
              ? "استعادة كلمة المرور وحماية حسابك المعماري."
              : "Recover your password and protect your atelier portfolio."}
          </h2>

          <p className="text-sm text-[#FAF7F2]/70 leading-relaxed">
            {isRTL
              ? "سنرسل لك رمز تحقق مؤمن عبر البريد الإلكتروني لتتمكن من إعادة تعيين كلمة المرور بكل سهولة."
              : "We will dispatch a secure one-time verification code to your registered email to reset your credentials."}
          </p>
        </div>

        <div className="relative z-10 text-xs text-[#FAF7F2]/50 tracking-wider">
          © {new Date().getFullYear()} VALENTIA DESIGN & BUILD. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* RIGHT PANEL: Forgot Password Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-20 sm:px-12 md:px-16 lg:px-20 xl:px-24 relative z-10 overflow-y-auto">
        <RevealOnScroll direction="up" delayMs={100} className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFD3C1]/50 border border-[#D8C8B4] text-xs font-mono uppercase tracking-widest text-[#503C2C] mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B88460]" />
              <span>{isRTL ? "استعادة الحساب" : "PASSWORD ASSISTANCE"}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
              {isRTL ? "نسيت كلمة المرور؟" : "Forgot Password"}
            </h1>

            <p className="mt-2 text-sm text-[#6B635B] leading-relaxed">
              {isRTL
                ? "أدخل بريدك الإلكتروني المسجل وسنرسل لك رمز تحقق لتغيير كلمة المرور."
                : "Enter your registered email address and we'll dispatch a 6-digit verification code."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-wider font-medium text-[#503C2C] mb-1.5"
              >
                {isRTL ? "البريد الإلكتروني" : "Email Address"}
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tarek.mansour@example.com"
                  className="w-full h-12 px-4 ps-11 rounded-xl bg-white/90 border border-[#D8C8B4] focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] text-sm text-[#1C1917] placeholder:text-[#6B635B]/50 transition-all outline-none"
                />
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-[#6B635B]">
                  <EnvelopeSimple className="w-4 h-4" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className={cn(
                "w-full h-12 rounded-xl text-sm font-medium tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm mt-6",
                email.trim() && !isSubmitting
                  ? "bg-[#503C2C] text-[#FAF7F2] hover:bg-[#3E2F22] active:scale-[0.99] cursor-pointer"
                  : "bg-[#503C2C]/40 text-[#FAF7F2]/70 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <CircleNotch className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? "جارٍ الإرسال..." : "Sending Code..."}</span>
                </>
              ) : (
                <>
                  <span>{isRTL ? "إرسال رمز التحقق" : "Send Verification Code"}</span>
                  {isRTL ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </>
              )}
            </button>

            <div className="pt-4 text-center">
              <Link
                href="/login"
                className="text-xs text-[#6B635B] hover:text-[#1C1917] transition-colors underline underline-offset-4"
              >
                {isRTL ? "تذكرت كلمة المرور؟ تسجيل الدخول" : "Remember your password? Sign in"}
              </Link>
            </div>
          </form>
        </RevealOnScroll>
      </div>
    </div>
  );
}
