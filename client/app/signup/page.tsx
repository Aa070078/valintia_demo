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
  EnvelopeSimple,
  ShieldCheck,
  CheckCircle,
  Buildings,
  CircleNotch,
  FileText,
  Sparkle,
  Compass,
} from "@phosphor-icons/react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { PhoneInputWithCountry } from "@/features/projects/components/phone-input-with-country";
import { TiltCard } from "@/components/motion/tilt-card";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { cn } from "@/lib/utils";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const { signup, isLoading } = useAuth();
  const { language, toggleLanguage, isRTL } = useLanguage();

  const [name, setName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("+20");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Live password strength calculation
  const passwordStrength = React.useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score; // 0 to 4
  }, [password]);

  const strengthLabel = React.useMemo(() => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return {
          text: isRTL ? "ضعيفة" : "Weak",
          color: "text-red-600 bg-red-100",
        };
      case 2:
        return {
          text: isRTL ? "متوسطة" : "Fair",
          color: "text-amber-600 bg-amber-100",
        };
      case 3:
        return {
          text: isRTL ? "جيدة" : "Good",
          color: "text-blue-600 bg-blue-100",
        };
      case 4:
      default:
        return {
          text: isRTL ? "قوية جداً" : "Ultra Secure",
          color: "text-emerald-700 bg-emerald-100",
        };
    }
  }, [passwordStrength, isRTL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError(
        isRTL
          ? "يرجى ملء جميع الحقول المطلوبة."
          : "Please complete all required credentials."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        isRTL
          ? "كلمتا المرور غير متطابقتين."
          : "Passwords do not match. Please re-enter."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        isRTL
          ? "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل."
          : "Password must be at least 8 characters long."
      );
      return;
    }

    if (!agreeTerms) {
      setError(
        isRTL
          ? "يرجى الموافقة على شروط الخدمة وسياسة الخصوصية."
          : "Please agree to the terms and privacy policy to continue."
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const fullPhone = phone ? `${countryCode} ${phone}` : undefined;
      const res = await signup({
        username: username.trim(),
        password,
        name: name.trim() || undefined,
        phone: fullPhone,
        role: "CUSTOMER",
      });

      if (res?.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        const destination =
          redirectParam && redirectParam.startsWith("/")
            ? redirectParam
            : "/projects/new";
        router.push(destination);
      }
    } catch (err: unknown) {
      console.error("Signup failed:", err);
      setError(
        isRTL
          ? "تعذر إنشاء الحساب. اسم المستخدم قد يكون مستخدماً بالفعل."
          : "Account registration could not be completed. The username may already exist."
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

      {/* LEFT PANEL: Privileges Showcase & Editorial Story */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-[#241F1B] text-[#FAF7F2]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85')`,
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
                {isRTL ? "أتيليه التصميم والتنفيذ" : "Design & Build Atelier"}
              </span>
            </div>
          </div>
        </div>

        {/* Centerpiece 3D Card with Bespoke Client Privileges */}
        <div className="relative z-10 my-auto py-8">
          <TiltCard
            maxRotation={6}
            className="p-8 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/15 shadow-2xl text-[#FAF7F2]"
          >
            <div className="flex items-center gap-2 mb-4 text-[#B88460] text-xs uppercase tracking-widest font-mono">
              <Sparkle className="w-3.5 h-3.5" weight="fill" />
              <span>{isRTL ? "مزايا حساب العميل" : "ATELIER PRIVILEGES"}</span>
            </div>

            <h3 className="font-serif text-2xl font-normal text-[#FAF7F2] mb-6">
              {isRTL
                ? "تجربة تنفيذ حصرية ترقى إلى تطلعاتك"
                : "A Bespoke Fit-Out Experience Crafted Around You"}
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#B88460]/20 border border-[#B88460]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-4 h-4 text-[#FAF7F2]" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-[#FAF7F2]">
                    {isRTL ? "مخططات وتصميمات أيزومترية تفاعلية" : "Interactive 3D Axonometrics"}
                  </span>
                  <span className="text-[11px] text-[#FAF7F2]/60 leading-relaxed block">
                    {isRTL
                      ? "رؤية ثلاثية الأبعاد لكل غرفة مع اختيار المواد والتشطيبات بدقة متناهية."
                      : "Explore room layouts with pinpoint material callouts and finish specifications."}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#B88460]/20 border border-[#B88460]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-[#FAF7F2]" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-[#FAF7F2]">
                    {isRTL ? "شفافية مطلقة في جدول الكميات (BOQ)" : "100% Itemized BOQ Transparency"}
                  </span>
                  <span className="text-[11px] text-[#FAF7F2]/60 leading-relaxed block">
                    {isRTL
                      ? "تسعير دقيق وواضح لكل بند ومتر تشطيب دون أي تكاليف خفية."
                      : "Fixed-rate pricing and itemized breakdown with zero hidden surprises."}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#B88460]/20 border border-[#B88460]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-[#FAF7F2]" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-[#FAF7F2]">
                    {isRTL ? "متابعة أسبوعية مباشرة من مهندس الموقع" : "Weekly Site Architect Reports"}
                  </span>
                  <span className="text-[11px] text-[#FAF7F2]/60 leading-relaxed block">
                    {isRTL
                      ? "تقارير صور فوتوغرافية ومخطط زمني حي لنسبة الإنجاز حتى التسليم."
                      : "Direct photo updates and milestone telemetry directly on your dashboard."}
                  </span>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Security Assurance */}
        <div className="relative z-10 flex items-center justify-between text-xs text-[#FAF7F2]/60 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" weight="fill" />
            <span>
              {isRTL
                ? "خصوصية بياناتك وسرية عقودك مضمونة بنسبة 100%"
                : "100% Privacy Guaranteed & NDA Protected"}
            </span>
          </div>
          <span className="font-mono text-[11px]">VALENTIA ATELIER</span>
        </div>
      </div>

      {/* RIGHT PANEL: Registration Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-20 sm:px-12 md:px-16 lg:px-20 xl:px-24 relative z-10 overflow-y-auto">
        <RevealOnScroll direction="up" delayMs={100} className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFD3C1]/50 border border-[#D8C8B4] text-xs font-mono uppercase tracking-widest text-[#503C2C] mb-3">
              <Sparkle className="w-3 h-3 text-[#B88460]" />
              <span>{isRTL ? "فتح ملف مشروع جديد" : "COMMISSION REGISTRATION"}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
              {isRTL ? "إنشاء حساب في فالنتيا" : "Create Atelier Account"}
            </h1>
            <p className="mt-2 text-sm text-[#6B635B] leading-relaxed">
              {isRTL
                ? "سجّل بياناتك لبدء تخطيط وتنفيذ مساحتك السكنية الفاخرة."
                : "Register to begin your bespoke residential fit-out commission."}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullname"
                className="block text-xs uppercase tracking-wider font-medium text-[#503C2C] mb-1.5"
              >
                {isRTL ? "الاسم الكامل" : "Full Name"}
              </label>
              <div className="relative">
                <input
                  id="fullname"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isRTL ? "طارق منصور" : "Tarek Mansour"}
                  className="w-full h-12 px-4 ps-11 rounded-xl bg-white/90 border border-[#D8C8B4] focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] text-sm text-[#1C1917] placeholder:text-[#6B635B]/50 transition-all outline-none"
                />
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-[#6B635B]">
                  <User className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Email / Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs uppercase tracking-wider font-medium text-[#503C2C] mb-1.5"
              >
                {isRTL ? "البريد الإلكتروني / اسم المستخدم" : "Email or Username"}
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="tarek.mansour@example.com"
                  className="w-full h-12 px-4 ps-11 rounded-xl bg-white/90 border border-[#D8C8B4] focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] text-sm text-[#1C1917] placeholder:text-[#6B635B]/50 transition-all outline-none"
                />
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-[#6B635B]">
                  <EnvelopeSimple className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Phone with Country Dial Code */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-[#503C2C] mb-1.5">
                {isRTL ? "رقم الهاتف للتواصل" : "Phone Number"}
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
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs uppercase tracking-wider font-medium text-[#503C2C]"
                >
                  {isRTL ? "كلمة المرور" : "Password"}
                </label>
                {password && (
                  <span
                    className={cn(
                      "text-[10px] font-mono px-2 py-0.5 rounded-full font-medium transition-colors",
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

              {/* Password Strength Meter Bars */}
              {password && (
                <div className="grid grid-cols-4 gap-1.5 mt-2">
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
                className="block text-xs uppercase tracking-wider font-medium text-[#503C2C] mb-1.5"
              >
                {isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}
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
                  className="w-full h-12 px-4 ps-11 rounded-xl bg-white/90 border border-[#D8C8B4] focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] text-sm text-[#1C1917] placeholder:text-[#6B635B]/50 transition-all outline-none"
                />
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-[#6B635B]">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-[#D8C8B4] text-[#1C1917] focus:ring-[#1C1917]"
                />
                <span className="text-xs text-[#6B635B] leading-relaxed">
                  {isRTL ? (
                    <>
                      أوافق على{" "}
                      <span className="text-[#1C1917] underline">شروط تقديم الخدمة</span> و
                      <span className="text-[#1C1917] underline"> سياسة الخصوصية وسرية التصاميم</span>.
                    </>
                  ) : (
                    <>
                      I agree to the{" "}
                      <span className="text-[#1C1917] underline">Terms of Service</span> and{" "}
                      <span className="text-[#1C1917] underline">Privacy & Design NDA</span>.
                    </>
                  )}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full h-12 mt-4 rounded-xl bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting || isLoading ? (
                <>
                  <CircleNotch className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? "جارٍ تسجيل الحساب..." : "Creating Account..."}</span>
                </>
              ) : (
                <>
                  <span>
                    {isRTL
                      ? "إنشاء الحساب وبدء المشروع"
                      : "Create Account & Start Commission"}
                  </span>
                  {isRTL ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-8 text-center border-t border-[#D8C8B4] pt-6">
            <p className="text-xs text-[#6B635B]">
              {isRTL ? "لديك حساب بالفعل في الأتيليه؟" : "Already an Atelier client?"}{" "}
              <Link
                href={
                  redirectParam
                    ? `/login?redirect=${encodeURIComponent(redirectParam)}`
                    : "/login"
                }
                className="font-medium text-[#1C1917] hover:text-[#B88460] underline underline-offset-4 transition-colors"
              >
                {isRTL ? "تسجيل الدخول" : "Sign in here"}
              </Link>
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#ECE3D5] flex items-center justify-center text-[#503C2C]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
            <CircleNotch className="w-4 h-4 animate-spin" />
            <span>Loading Atelier Registration...</span>
          </div>
        </div>
      }
    >
      <SignupForm />
    </React.Suspense>
  );
}
