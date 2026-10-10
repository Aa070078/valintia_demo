"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
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
} from "@phosphor-icons/react"
import { useAuth } from "@/features/auth/context/auth-context"
import { useLanguage } from "@/lib/i18n/language-context"
import { getErrorMessage } from "@/lib/utils"
import { TiltCard } from "@/components/motion/tilt-card"
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll"
import { StaffOnboardingModal } from "@/features/auth/components/staff-onboarding-modal"
import type { User as AuthUser } from "@/features/auth/types"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get("redirect")
  const {
    login,
    logout,
    isLoading,
    onboardingSession: restoredOnboarding,
  } = useAuth()
  const { language, toggleLanguage, isRTL } = useLanguage()

  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [rememberMe, setRememberMe] = React.useState(true)
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [onboardingSession, setOnboardingSession] = React.useState<{
    token: string
    user: AuthUser | null
  } | null>(null)
  const activeOnboarding = onboardingSession || restoredOnboarding

  const handleOnboardingSuccess = (targetRedirectUrl?: string) => {
    setOnboardingSession(null)
    if (targetRedirectUrl) {
      window.location.href = targetRedirectUrl
    } else {
      const destination =
        redirectParam && redirectParam.startsWith("/")
          ? redirectParam
          : "/projects"
      router.push(destination)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError(
        isRTL
          ? "من فضلك اكتب اسم المستخدم أو الإيميل وكلمة السر."
          : "Please enter your username/email and password."
      )
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const res = await login({
        username: username.trim(),
        password,
        rememberMe,
      })

      if (res?.onboardingRequired && res.onboardingToken) {
        setOnboardingSession({
          token: res.onboardingToken,
          user: res.user || null,
        })
        return
      }

      if (res?.redirectUrl) {
        window.location.href = res.redirectUrl
      } else {
        const destination =
          redirectParam && redirectParam.startsWith("/")
            ? redirectParam
            : "/projects"
        router.push(destination)
      }
    } catch (err: unknown) {
      const apiMsg = getErrorMessage(err)

      let displayError = apiMsg
      if (
        isRTL &&
        (!displayError ||
          displayError.toLowerCase().includes("invalid credentials"))
      ) {
        displayError =
          "بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور والمحاولة مرة أخرى."
      }

      setError(
        displayError ||
          (isRTL
            ? "بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور والمحاولة مرة أخرى."
            : "Invalid credentials. Please verify your username and password.")
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#ECE3D5] text-[#1C1917] md:flex-row">
      {/* Top Floating Language & Home Link */}
      <div className="pointer-events-auto absolute top-6 right-6 left-6 z-30 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[#D8C8B4]/60 bg-white/70 px-3.5 py-1.5 text-xs font-medium tracking-widest text-[#503C2C] uppercase shadow-sm backdrop-blur-md transition-colors hover:text-[#1C1917]"
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
          className="rounded-full border border-[#D8C8B4]/60 bg-white/70 px-3.5 py-1.5 text-xs font-medium tracking-wider text-[#503C2C] shadow-sm backdrop-blur-md transition-colors hover:text-[#1C1917]"
        >
          {language === "en" ? "العربية" : "English"}
        </button>
      </div>

      {/* LEFT PANEL: Architectural Brand & Depth Storytelling */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#241F1B] p-12 text-[#FAF7F2] lg:flex lg:w-1/2 xl:p-16">
        {/* Architectural Background Photography with Vignette */}
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center opacity-45 mix-blend-luminosity transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/70 to-[#1C1917]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(184,132,96,0.25),transparent_70%)]" />

        {/* Brand Lockup */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FAF7F2]/30 bg-white/10 backdrop-blur-md">
              <Buildings className="h-5 w-5 text-[#FAF7F2]" weight="light" />
            </div>
            <div>
              <span className="block text-sm font-light tracking-[0.25em] text-[#FAF7F2] uppercase">
                VALENTIA
              </span>
              <span className="block text-[10px] tracking-[0.2em] text-[#FAF7F2]/60 uppercase">
                {isRTL
                  ? "أتيليه التصميم والتشطيب المتكامل"
                  : "Design & Build Atelier"}
              </span>
            </div>
          </div>
        </div>

        {/* Centerpiece 3D Tilt Quote Card */}
        <div className="relative z-10 my-auto py-12">
          <TiltCard
            maxRotation={8}
            className="rounded-2xl border border-white/15 bg-white/[0.06] p-8 text-[#FAF7F2] shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2 font-mono text-xs tracking-widest text-[#B88460] uppercase">
              <Sparkle className="h-3.5 w-3.5" weight="fill" />
              <span>{isRTL ? "فلسفتنا في التصميم" : "ATELIER PHILOSOPHY"}</span>
            </div>

            <p className="font-serif text-2xl leading-relaxed font-normal text-[#FAF7F2]/95 italic xl:text-3xl">
              {isRTL
                ? "«التصميم مش مجرد رص حيطان ومساحات، ده أسلوب حياة بيجمع بين الراحة والجمال الراقي الخالد.»"
                : "“Architecture is not merely the organization of space, but the physical embodiment of timeless serenity and bespoke living.”"}
            </p>

            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
              <div>
                <span className="block text-sm font-medium text-[#FAF7F2]">
                  {isRTL
                    ? "أتيليه فالنتيا المعماري"
                    : "Valentia Design & Build"}
                </span>
                <span className="block text-xs text-[#FAF7F2]/60">
                  {isRTL
                    ? "الشيخ زايد · التجمع · الساحل · الجونة"
                    : "Cairo · Dubai · Riyadh"}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-[11px] text-[#FAF7F2]/80">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span>
                  {isRTL ? "شغالين على مشاريع حالية" : "Active Commissions"}
                </span>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Security & Cryptography Assurance Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-[#FAF7F2]/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" weight="fill" />
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
      <div className="relative z-10 flex flex-1 flex-col justify-center overflow-y-auto px-6 py-20 sm:px-12 md:px-16 lg:px-20 xl:px-24">
        <RevealOnScroll
          direction="up"
          delayMs={100}
          className="mx-auto w-full max-w-md"
        >
          {/* Header Lockup */}
          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D8C8B4] bg-[#DFD3C1]/50 px-3 py-1 font-mono text-xs tracking-widest text-[#503C2C] uppercase">
              <Lock className="h-3 w-3" />
              <span>{isRTL ? "تسجيل دخول آمن" : "SECURE ATELIER PORTAL"}</span>
            </div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1C1917] sm:text-4xl">
              {isRTL ? "تسجيل الدخول" : "Sign In to Atelier"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B635B]">
              {isRTL
                ? "سجل دخولك عشان تتابع تفاصيل تشطيب بيتك، المقايسة والمواصفات خطوة بخطوة."
                : "Access your architectural blueprints, itemized BOQ, and turnkey milestone updates."}
            </p>
          </div>

          {/* Redirect Notice */}
          {redirectParam && (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-[#D8C8B4] bg-[#EFE7DC] p-3.5 text-xs text-[#503C2C] shadow-sm">
              <Lock className="h-4 w-4 shrink-0 text-[#B88460]" />
              <span>
                {isRTL
                  ? "سجل دخولك الأول عشان تقدر تفتح وتتابع مشاريعك الخاصة."
                  : "Please authenticate to access your atelier projects and commission workspace."}
              </span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex animate-in items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 duration-200 fade-in slide-in-from-top-2">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email Field */}
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-xs font-medium tracking-wider text-[#503C2C] uppercase"
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
                    isRTL
                      ? "tarek.mansour@example.com"
                      : "tarek.mansour@example.com"
                  }
                  className="h-12 w-full rounded-xl border border-[#D8C8B4] bg-white/90 px-4 ps-11 text-sm text-[#1C1917] transition-all outline-none placeholder:text-[#6B635B]/50 focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917]"
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-[#6B635B]">
                  <User className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium tracking-wider text-[#503C2C] uppercase"
                >
                  {isRTL ? "كلمة السر" : "Password"}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#B88460] transition-colors hover:text-[#503C2C]"
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
                  className="h-12 w-full rounded-xl border border-[#D8C8B4] bg-white/90 px-4 ps-11 pe-11 text-sm text-[#1C1917] transition-all outline-none placeholder:text-[#6B635B]/50 focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917]"
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-[#6B635B]">
                  <Lock className="h-4 w-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-[#6B635B] transition-colors hover:text-[#1C1917]"
                >
                  {showPassword ? (
                    <EyeSlash className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#D8C8B4] text-[#1C1917] focus:ring-[#1C1917]"
                />
                <span className="text-xs text-[#6B635B]">
                  {isRTL
                    ? "افتكرني على الجهاز ده"
                    : "Remember this workstation"}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="mt-2 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D8C8B4] text-sm font-semibold text-[#1C1917] border border-[#C5B49E] shadow-sm transition-all duration-200 hover:bg-[#C9B7A0] active:scale-98 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting || isLoading ? (
                <>
                  <CircleNotch className="h-4 w-4 animate-spin" />
                  <span>
                    {isRTL ? "ثواني بنسجل دخولك..." : "Authenticating..."}
                  </span>
                </>
              ) : (
                <>
                  <span>{isRTL ? "دخول لحسابي" : "Sign In to Atelier"}</span>
                  {isRTL ? (
                    <ArrowLeft className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </>
              )}
            </button>
          </form>

          {/* Switch to Signup */}
          <div className="mt-8 border-t border-[#D8C8B4] pt-6 text-center">
            <p className="text-xs text-[#6B635B]">
              {isRTL
                ? "أول مرة تشطب معانا في فالنتيا؟"
                : "New client commissioning a project?"}{" "}
              <Link
                href={
                  redirectParam
                    ? `/signup?redirect=${encodeURIComponent(redirectParam)}`
                    : "/signup"
                }
                className="font-medium text-[#1C1917] underline underline-offset-4 transition-colors hover:text-[#B88460]"
              >
                {isRTL
                  ? "اعمل حساب جديد وابدأ تشطيب بيتك ←"
                  : "Create an account & start commission"}
              </Link>
            </p>
          </div>

          {/* Security & Confidentiality */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#6B635B]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>
                {isRTL
                  ? "بيانات ومواصفات تشطيب بيتك محمية ومشفرة بأعلى معايير الأمان."
                  : "Encrypted atelier portal protecting architectural and engineering confidentiality"}
              </span>
            </div>
          </div>
        </RevealOnScroll>
      </div>

      {activeOnboarding && (
        <StaffOnboardingModal
          open={Boolean(activeOnboarding)}
          onboardingToken={activeOnboarding.token}
          user={activeOnboarding.user}
          currentPassword={password || undefined}
          onSuccess={handleOnboardingSuccess}
          onCancel={() => {
            setOnboardingSession(null)
            void logout()
          }}
        />
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-[#ECE3D5] text-[#503C2C]">
          <div className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase">
            <CircleNotch className="h-4 w-4 animate-spin" />
            <span>Loading Atelier Login...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  )
}
