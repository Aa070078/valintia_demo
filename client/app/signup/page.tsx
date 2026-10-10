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
  EnvelopeSimple,
  ShieldCheck,
  CheckCircle,
  Buildings,
  CircleNotch,
  FileText,
  Sparkle,
  Compass,
} from "@phosphor-icons/react"
import { useAuth } from "@/features/auth/context/auth-context"
import { useLanguage } from "@/lib/i18n/language-context"
import { PhoneInputWithCountry } from "@/features/projects/components/phone-input-with-country"
import { TiltCard } from "@/components/motion/tilt-card"
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll"
import { cn, getErrorMessage } from "@/lib/utils"
import { authApi } from "@/features/auth/api/auth.api"
import { RegistrationVerification } from "@/features/auth/components/registration-verification"
import type { ProposedSignupDto } from "@/features/auth/types"

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get("redirect")
  const { signup, isLoading } = useAuth()
  const { language, toggleLanguage, isRTL } = useLanguage()

  const [pendingSignup, setPendingSignup] = React.useState<
    (Omit<ProposedSignupDto, "verificationToken"> & { cooldown: number }) | null
  >(null)
  const [name, setName] = React.useState("")
  const [username, setUsername] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [countryCode, setCountryCode] = React.useState("+20")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [agreeTerms, setAgreeTerms] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Live password strength calculation
  const passwordStrength = React.useMemo(() => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    return score // 0 to 4
  }, [password])

  const strengthLabel = React.useMemo(() => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return {
          text: isRTL ? "ضعيفة" : "Weak",
          color: "text-red-600 bg-red-100",
        }
      case 2:
        return {
          text: isRTL ? "متوسطة" : "Fair",
          color: "text-amber-600 bg-amber-100",
        }
      case 3:
        return {
          text: isRTL ? "كويسة" : "Good",
          color: "text-blue-600 bg-blue-100",
        }
      case 4:
      default:
        return {
          text: isRTL ? "قوية جداً ومحمية" : "Ultra Secure",
          color: "text-emerald-700 bg-emerald-100",
        }
    }
  }, [passwordStrength, isRTL])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError(
        isRTL
          ? "من فضلك املأ كل البيانات المطلوبة."
          : "Please complete all required credentials."
      )
      return
    }

    if (password !== confirmPassword) {
      setError(
        isRTL
          ? "كلمتي السر مش متطابقتين. اتأكد من كتابتهم صح."
          : "Passwords do not match. Please re-enter."
      )
      return
    }

    if (password.length < 8) {
      setError(
        isRTL
          ? "كلمة السر لازم تكون ٨ حروف أو أرقام على الأقل."
          : "Password must be at least 8 characters long."
      )
      return
    }

    if (!agreeTerms) {
      setError(
        isRTL
          ? "من فضلك وافق على شروط الخدمة وسياسة الخصوصية للمتابعة."
          : "Please agree to the terms and privacy policy to continue."
      )
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const email = username.trim().toLowerCase()
      const response = await authApi.requestRegistrationCode(email)
      setPendingSignup({
        username: email,
        password,
        name: name.trim(),
        phone: phone ? `${countryCode} ${phone}` : undefined,
        cooldown: response.cooldownSeconds ?? 60,
      })
    } catch (err: unknown) {
      const apiMsg = getErrorMessage(err, isRTL)
      setError(
        apiMsg ||
          (isRTL
            ? "مقدرناش نرسل رمز التحقق دلوقتي. اتأكد من صحة البريد الإلكتروني وجرب تاني."
            : "Could not dispatch verification code. Please check your email and try again.")
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function finishSignup(verificationToken: string) {
    if (!pendingSignup) return
    await signup({ ...pendingSignup, verificationToken })
    setPendingSignup(null)
    setPassword("")
    setConfirmPassword("")
    const destination =
      redirectParam?.startsWith("/") && !redirectParam.startsWith("//")
        ? redirectParam
        : "/projects/new"
    router.replace(destination)
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#ECE3D5] text-[#1C1917] md:flex-row">
      {pendingSignup && (
        <RegistrationVerification
          email={pendingSignup.username}
          initialCooldown={pendingSignup.cooldown}
          onVerified={finishSignup}
          onCancel={() => setPendingSignup(null)}
        />
      )}
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

      {/* LEFT PANEL: Privileges Showcase & Editorial Story */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#241F1B] p-12 text-[#FAF7F2] lg:flex lg:w-1/2 xl:p-16">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center opacity-40 mix-blend-luminosity transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85')`,
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

        {/* Centerpiece 3D Card with Bespoke Client Privileges */}
        <div className="relative z-10 my-auto py-8">
          <TiltCard
            maxRotation={6}
            className="rounded-2xl border border-white/15 bg-white/[0.06] p-8 text-[#FAF7F2] shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2 font-mono text-xs tracking-widest text-[#B88460] uppercase">
              <Sparkle className="h-3.5 w-3.5" weight="fill" />
              <span>{isRTL ? "مميزات حسابك معانا" : "ATELIER PRIVILEGES"}</span>
            </div>

            <h3 className="mb-6 font-serif text-2xl font-normal text-[#FAF7F2]">
              {isRTL
                ? "تجربة تشطيب راقية ومريحة تليق ببيتك"
                : "A Bespoke Fit-Out Experience Crafted Around You"}
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#B88460]/40 bg-[#B88460]/20">
                  <Compass className="h-4 w-4 text-[#FAF7F2]" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-[#FAF7F2]">
                    {isRTL
                      ? "رسومات ومخططات أيزومترية تفاعلية لكل فراغ"
                      : "Interactive 3D Axonometrics"}
                  </span>
                  <span className="block text-[11px] leading-relaxed text-[#FAF7F2]/60">
                    {isRTL
                      ? "هتشوف كل ركن في بيتك مجسم وموضح عليه كل خامة وتشطيب بالتفصيل."
                      : "Explore room layouts with pinpoint material callouts and finish specifications."}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#B88460]/40 bg-[#B88460]/20">
                  <FileText className="h-4 w-4 text-[#FAF7F2]" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-[#FAF7F2]">
                    {isRTL
                      ? "شفافية كاملة في المقايسة والبنود (BOQ)"
                      : "100% Itemized BOQ Transparency"}
                  </span>
                  <span className="block text-[11px] leading-relaxed text-[#FAF7F2]/60">
                    {isRTL
                      ? "تسعير واضح ومفصل لكل بند ومتر في شقتك أو فيلتك من غير أي مصاريف مستخبية."
                      : "Fixed-rate pricing and itemized breakdown with zero hidden surprises."}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#B88460]/40 bg-[#B88460]/20">
                  <CheckCircle className="h-4 w-4 text-[#FAF7F2]" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-[#FAF7F2]">
                    {isRTL
                      ? "متابعة أسبوعية مباشرة مع مهندس الموقع"
                      : "Weekly Site Architect Reports"}
                  </span>
                  <span className="block text-[11px] leading-relaxed text-[#FAF7F2]/60">
                    {isRTL
                      ? "صور وتقارير حية أول بأول توضح نسبة إنجاز كل مرحلة لحد الاستلام على المفتاح."
                      : "Direct photo updates and milestone telemetry directly on your dashboard."}
                  </span>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Security Assurance */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-[#FAF7F2]/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" weight="fill" />
            <span>
              {isRTL
                ? "بياناتك وتفاصيل بيتك في أمان تام وبأعلى درجات الخصوصية."
                : "100% Privacy Guaranteed & NDA Protected"}
            </span>
          </div>
          <span className="font-mono text-[11px]">VALENTIA ATELIER</span>
        </div>
      </div>

      {/* RIGHT PANEL: Registration Form */}
      <div className="relative z-10 flex flex-1 flex-col justify-center overflow-y-auto px-6 py-20 sm:px-12 md:px-16 lg:px-20 xl:px-24">
        <RevealOnScroll
          direction="up"
          delayMs={100}
          className="mx-auto w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D8C8B4] bg-[#DFD3C1]/50 px-3 py-1 font-mono text-xs tracking-widest text-[#503C2C] uppercase">
              <Sparkle className="h-3 w-3 text-[#B88460]" />
              <span>
                {isRTL ? "حساب عميل جديد" : "COMMISSION REGISTRATION"}
              </span>
            </div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1C1917] sm:text-4xl">
              {isRTL ? "اعمل حسابك في فالنتيا" : "Create Atelier Account"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B635B]">
              {isRTL
                ? "سجل بياناتك عشان تبدأ تخطط وتشطب بيتك الجديد بأرقى مستوى."
                : "Register to begin your bespoke residential fit-out commission."}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex animate-in items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 duration-200 fade-in slide-in-from-top-2">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullname"
                className="mb-1.5 block text-xs font-medium tracking-wider text-[#503C2C] uppercase"
              >
                {isRTL ? "الاسم بالكامل" : "Full Name"}
              </label>
              <div className="relative">
                <input
                  id="fullname"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isRTL ? "طارق منصور" : "Tarek Mansour"}
                  className="h-12 w-full rounded-xl border border-[#D8C8B4] bg-white/90 px-4 ps-11 text-sm text-[#1C1917] transition-all outline-none placeholder:text-[#6B635B]/50 focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917]"
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-[#6B635B]">
                  <User className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Email / Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-xs font-medium tracking-wider text-[#503C2C] uppercase"
              >
                {isRTL ? "الإيميل أو اسم المستخدم" : "Email Address"}
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="email"
                  required
                  autoComplete="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="tarek.mansour@example.com"
                  className="h-12 w-full rounded-xl border border-[#D8C8B4] bg-white/90 px-4 ps-11 text-sm text-[#1C1917] transition-all outline-none placeholder:text-[#6B635B]/50 focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917]"
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-[#6B635B]">
                  <EnvelopeSimple className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Phone with Country Dial Code */}
            <div>
              <label className="mb-1.5 block text-xs font-medium tracking-wider text-[#503C2C] uppercase">
                {isRTL ? "رقم الموبايل (واتساب / اتصال)" : "Phone Number"}
              </label>
              <PhoneInputWithCountry
                phone={phone}
                countryCode={countryCode}
                onChangePhone={setPhone}
                onChangeCountryCode={setCountryCode}
                placeholder="100 123 4567"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium tracking-wider text-[#503C2C] uppercase"
                >
                  {isRTL ? "كلمة السر" : "Password"}
                </label>
                {password && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-mono text-[10px] font-medium transition-colors",
                      strengthLabel.color
                    )}
                  >
                    {strengthLabel.text}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
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

              {/* Password Strength Meter Bars */}
              {password && (
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        passwordStrength >= step
                          ? passwordStrength <= 2
                            ? "bg-amber-500"
                            : "bg-emerald-600"
                          : "bg-[#D8C8B4]/60"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1.5 block text-xs font-medium tracking-wider text-[#503C2C] uppercase"
              >
                {isRTL ? "أكّد كلمة السر" : "Confirm Password"}
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-12 w-full rounded-xl border border-[#D8C8B4] bg-white/90 px-4 ps-11 text-sm text-[#1C1917] transition-all outline-none placeholder:text-[#6B635B]/50 focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917]"
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-[#6B635B]">
                  <Lock className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="pt-1">
              <label className="flex cursor-pointer items-start gap-2.5 select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#D8C8B4] text-[#1C1917] focus:ring-[#1C1917]"
                />
                <span className="text-xs leading-relaxed text-[#6B635B]">
                  {isRTL ? (
                    <>
                      موافق على{" "}
                      <span className="text-[#1C1917] underline">
                        شروط الخدمة
                      </span>{" "}
                      و
                      <span className="text-[#1C1917] underline">
                        {" "}
                        سياسة الخصوصية وسرية التصميمات الهندسية
                      </span>
                      .
                    </>
                  ) : (
                    <>
                      I agree to the{" "}
                      <span className="text-[#1C1917] underline">
                        Terms of Service
                      </span>{" "}
                      and{" "}
                      <span className="text-[#1C1917] underline">
                        Privacy & Design NDA
                      </span>
                      .
                    </>
                  )}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D8C8B4] text-sm font-semibold text-[#1C1917] border border-[#C5B49E] shadow-sm transition-all duration-200 hover:bg-[#C9B7A0] active:scale-98 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting || isLoading ? (
                <>
                  <CircleNotch className="h-4 w-4 animate-spin" />
                  <span>
                    {isRTL ? "ثواني بنسجل حسابك..." : "Creating Account..."}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {isRTL
                      ? "إنشاء الحساب وبدء تشطيب بيتي ←"
                      : "Create Account & Start Commission"}
                  </span>
                  {isRTL ? (
                    <ArrowLeft className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-8 border-t border-[#D8C8B4] pt-6 text-center">
            <p className="text-xs text-[#6B635B]">
              {isRTL
                ? "عندك حساب بالفعل في فالنتيا؟"
                : "Already an Atelier client?"}{" "}
              <Link
                href={
                  redirectParam
                    ? `/login?redirect=${encodeURIComponent(redirectParam)}`
                    : "/login"
                }
                className="font-medium text-[#1C1917] underline underline-offset-4 transition-colors hover:text-[#B88460]"
              >
                {isRTL ? "سجل دخولك هنا" : "Sign in here"}
              </Link>
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-[#ECE3D5] text-[#503C2C]">
          <div className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase">
            <CircleNotch className="h-4 w-4 animate-spin" />
            <span>Loading Atelier Registration...</span>
          </div>
        </div>
      }
    >
      <SignupForm />
    </React.Suspense>
  )
}
