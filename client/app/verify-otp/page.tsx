"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  EnvelopeSimple,
  ShieldCheck,
  CheckCircle,
  Buildings,
  CircleNotch,
  PencilSimple,
  Clock,
  ArrowCounterClockwise,
  Key,
  LockKey,
} from "@phosphor-icons/react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { TiltCard } from "@/components/motion/tilt-card";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { cn, getErrorMessage } from "@/lib/utils";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/projects/new";
  const emailParam = searchParams.get("email") || "";

  const { confirmOtpAndLogin, resendOtp, getPendingOtp, isLoading } = useAuth();
  const { language, toggleLanguage, isRTL } = useLanguage();

  const [digits, setDigits] = React.useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [resendNotification, setResendNotification] = React.useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = React.useState(60);

  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Get current target email from pending registration or query param
  const pendingData = React.useMemo(() => {
    return getPendingOtp();
  }, [getPendingOtp]);

  const targetEmail = emailParam || pendingData?.username || "client@valentia.com";

  // Countdown timer for Resend button
  React.useEffect(() => {
    if (resendSeconds <= 0) return;
    const interval = setInterval(() => {
      setResendSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendSeconds]);

  // Focus first input on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric single digit
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned && value !== "") return;

    const newDigits = [...digits];
    newDigits[index] = cleaned.slice(-1);
    setDigits(newDigits);
    setError(null);

    // Auto-advance to next input if digit entered
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move to previous input and clear it
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const targetIndex = isRTL ? index + 1 : index - 1;
      if (targetIndex >= 0 && targetIndex < 6) {
        inputRefs.current[targetIndex]?.focus();
      }
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const targetIndex = isRTL ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < 6) {
        inputRefs.current[targetIndex]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasteData[i] || "";
    }
    setDigits(newDigits);
    setError(null);

    // Focus cell after pasted content or final cell
    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = async () => {
    if (resendSeconds > 0) return;
    setError(null);
    try {
      await resendOtp(targetEmail);
      setResendSeconds(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setResendNotification(
        isRTL
          ? "تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني بنجاح."
          : "A new 6-digit verification code has been sent to your email."
      );
      setTimeout(() => setResendNotification(null), 5000);
    } catch (err: unknown) {
      setError(
        getErrorMessage(err) ||
          (isRTL ? "حدث خطأ أثناء إعادة إرسال الرمز." : "Failed to resend code. Please try again.")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");

    if (code.length < 6) {
      setError(
        isRTL
          ? "من فضلك أدخل الـ 6 أرقام كاملة الخاصة برمز التحقق."
          : "Please enter all 6 digits of the verification code."
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await confirmOtpAndLogin(code, targetEmail);
      setIsSuccess(true);

      setTimeout(() => {
        if (res?.redirectUrl && res.redirectUrl !== "/projects") {
          window.location.href = res.redirectUrl;
        } else {
          const destination =
            redirectParam && redirectParam.startsWith("/")
              ? redirectParam
              : "/projects/new";
          router.push(destination);
        }
      }, 700);
    } catch (err: unknown) {
      console.error("OTP verification failed:", err);
      const apiMsg = getErrorMessage(err);
      setError(
        apiMsg ||
          (isRTL
            ? "رمز التحقق غير صحيح. يرجى التأكد من الرمز المدخل والمحاولة مجددًا."
            : "Invalid verification code. Please make sure you entered the correct 6-digit code.")
      );
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
          className="text-xs font-medium tracking-wider text-[#503C2C] hover:text-[#1C1917] transition-colors bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D8C8B4]/60 shadow-sm cursor-pointer"
        >
          {language === "en" ? "العربية" : "English"}
        </button>
      </div>

      {/* LEFT PANEL: Security Assurance & Brand Privileges */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-[#241F1B] text-[#FAF7F2]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85')`,
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

        {/* Centerpiece 3D Card with Security Brief */}
        <div className="relative z-10 my-auto py-8">
          <TiltCard
            maxRotation={6}
            className="p-8 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/15 shadow-2xl text-[#FAF7F2]"
          >
            <div className="flex items-center gap-2 mb-4 text-[#B88460] text-xs uppercase tracking-widest font-mono">
              <ShieldCheck className="w-4 h-4 text-[#B88460]" weight="fill" />
              <span>{isRTL ? "بروتوكول الأمان والخصوصية" : "SECURITY PROTOCOL"}</span>
            </div>

            <h3 className="font-serif text-2xl font-normal text-[#FAF7F2] mb-6">
              {isRTL
                ? "حماية وتوثيق تفاصيل مشروعك السكني"
                : "Protecting Your Bespoke Architectural Vision"}
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#B88460]/20 border border-[#B88460]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Key className="w-4 h-4 text-[#FAF7F2]" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-[#FAF7F2]">
                    {isRTL ? "توثيق هوية المالك والمفوضين" : "Verified Homeowner Identity"}
                  </span>
                  <span className="text-[11px] text-[#FAF7F2]/60 leading-relaxed block">
                    {isRTL
                      ? "المقايسات والتعاقدات وبنود الـ BOQ لا تتاح إلا للحساب الموثق رسميًا."
                      : "Itemized BOQ contracts and architectural specs are strictly tied to verified owners."}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#B88460]/20 border border-[#B88460]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <LockKey className="w-4 h-4 text-[#FAF7F2]" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-[#FAF7F2]">
                    {isRTL ? "مخططات وتصميمات محمية بالكامل" : "Encrypted Design Blueprints"}
                  </span>
                  <span className="text-[11px] text-[#FAF7F2]/60 leading-relaxed block">
                    {isRTL
                      ? "جميع رسومات الفراغات ثلاثية الأبعاد والتفاصيل الفنية مشفرة ومحمية باتفاقيات سرية."
                      : "All 3D axonometrics and interior documentation are protected under atelier NDA."}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#B88460]/20 border border-[#B88460]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-[#FAF7F2]" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-[#FAF7F2]">
                    {isRTL ? "تقارير الإشراف الميداني المباشر" : "Site Supervision Telemetry"}
                  </span>
                  <span className="text-[11px] text-[#FAF7F2]/60 leading-relaxed block">
                    {isRTL
                      ? "استلام فوري لصور مراحل التنفيذ واعتمادات المهندس المسؤول عن موقعك."
                      : "Real-time weekly milestone updates and engineer logs delivered straight to you."}
                  </span>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Security Assurance Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-[#FAF7F2]/60 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" weight="fill" />
            <span>
              {isRTL
                ? "اتصال مشفر 256-bit وحماية شاملة للبيانات."
                : "256-bit SSL Secure Verification · NDA Protected"}
            </span>
          </div>
          <span className="font-mono text-[11px]">VALENTIA ATELIER</span>
        </div>
      </div>

      {/* RIGHT PANEL: OTP Verification Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-20 sm:px-12 md:px-16 lg:px-20 xl:px-24 relative z-10 overflow-y-auto">
        <RevealOnScroll direction="up" delayMs={100} className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFD3C1]/50 border border-[#D8C8B4] text-xs font-mono uppercase tracking-widest text-[#503C2C] mb-3">
              <EnvelopeSimple className="w-3.5 h-3.5 text-[#B88460]" />
              <span>{isRTL ? "تأكيد الحساب" : "EMAIL CONFIRMATION"}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
              {isRTL ? "أدخل رمز التحقق" : "Verify Your Email"}
            </h1>
            <p className="mt-2 text-sm text-[#6B635B] leading-relaxed">
              {isRTL
                ? "أرسلنا رمز تحقق مكون من 6 أرقام إلى بريدك الإلكتروني لتأكيد حسابك."
                : "We sent a 6-digit confirmation code to your email to verify your atelier account."}
            </p>
          </div>

          {/* Target Email Badge & Edit Link */}
          <div className="mb-6 p-3.5 rounded-xl bg-white/70 border border-[#D8C8B4] flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#503C2C]/10 flex items-center justify-center shrink-0 text-[#503C2C]">
                <EnvelopeSimple className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="block text-[11px] uppercase tracking-wider text-[#6B635B] font-medium">
                  {isRTL ? "البريد الإلكتروني" : "Recipient Address"}
                </span>
                <span className="font-mono text-xs text-[#1C1917] font-medium truncate block">
                  {targetEmail}
                </span>
              </div>
            </div>

            <Link
              href={`/signup?email=${encodeURIComponent(targetEmail)}`}
              className="inline-flex items-center gap-1 text-xs text-[#B88460] hover:text-[#503C2C] font-medium underline underline-offset-4 shrink-0 transition-colors"
            >
              <PencilSimple className="w-3 h-3" />
              <span>{isRTL ? "تعديل" : "Edit"}</span>
            </Link>
          </div>


          {/* Resend Success Banner */}
          {resendNotification && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" weight="fill" />
              <span>{resendNotification}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success State Notification */}
          {isSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm flex items-center gap-3 animate-in fade-in duration-300">
              <CircleNotch className="w-5 h-5 text-emerald-600 animate-spin shrink-0" />
              <div className="font-medium">
                {isRTL
                  ? "تم تأكيد الرمز بنجاح! جاري تحضير مساحتك..."
                  : "Email verified successfully! Preparing your atelier space..."}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 6 OTP Cells */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-[#503C2C] mb-3 text-center">
                {isRTL ? "رمز التحقق المكون من 6 أرقام" : "6-Digit Security Code"}
              </label>

              <div
                className="flex items-center justify-between gap-2 sm:gap-3 direction-ltr"
                dir="ltr"
              >
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    aria-label={`Digit ${index + 1}`}
                    disabled={isSubmitting || isSuccess}
                    className={cn(
                      "w-11 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-mono font-semibold rounded-xl bg-white/90 border-2 transition-all outline-none",
                      digit
                        ? "border-[#1C1917] bg-white text-[#1C1917] shadow-sm"
                        : "border-[#D8C8B4] text-[#1C1917] focus:border-[#B88460] focus:ring-2 focus:ring-[#B88460]/20",
                      error && "border-red-400 bg-red-50/30"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Countdown / Resend Section */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5 text-[#6B635B]">
                <Clock className="w-4 h-4 text-[#B88460]" />
                {resendSeconds > 0 ? (
                  <span>
                    {isRTL ? "إعادة إرسال الرمز خلال" : "Resend in"}{" "}
                    <strong className="font-mono text-[#1C1917]">
                      0:{resendSeconds < 10 ? `0${resendSeconds}` : resendSeconds}
                    </strong>
                  </span>
                ) : (
                  <span>{isRTL ? "انتهى الوقت، يمكنك طلب رمز جديد" : "Code expired"}</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendSeconds > 0 || isSubmitting || isSuccess}
                className={cn(
                  "inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer",
                  resendSeconds > 0
                    ? "text-[#6B635B]/40 cursor-not-allowed"
                    : "text-[#B88460] hover:text-[#503C2C] underline underline-offset-4"
                )}
              >
                <ArrowCounterClockwise className="w-3.5 h-3.5" />
                <span>{isRTL ? "إعادة إرسال الرمز" : "Resend Code"}</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isSuccess || isLoading || digits.join("").length < 6}
              className="w-full h-12 rounded-xl bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting || isSuccess ? (
                <>
                  <CircleNotch className="w-4 h-4 animate-spin" />
                  <span>
                    {isRTL
                      ? "جاري التحقق وتجهيز حسابك..."
                      : "Verifying & Entering Atelier..."}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {isRTL ? "تأكيد الرمز والمتابعة ←" : "Confirm Code & Proceed"}
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

          {/* Need Assistance & Return Links */}
          <div className="mt-8 text-center border-t border-[#D8C8B4] pt-6 space-y-2">
            <p className="text-xs text-[#6B635B]">
              {isRTL
                ? "مش لاقي الإيميل؟ اتأكد من فولدر الـ Junk أو الـ Spam."
                : "Can't find the email? Check your Spam or Promotions folder."}
            </p>
            <p className="text-xs text-[#6B635B]">
              {isRTL ? "عايز ترجع لإنشاء الحساب؟" : "Need to restart registration?"}{" "}
              <Link
                href="/signup"
                className="font-medium text-[#1C1917] hover:text-[#B88460] underline underline-offset-4 transition-colors"
              >
                {isRTL ? "العودة لصفحة التسجيل" : "Return to Sign up"}
              </Link>
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#ECE3D5] flex items-center justify-center text-[#503C2C]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
            <CircleNotch className="w-4 h-4 animate-spin" />
            <span>Loading Verification Atelier...</span>
          </div>
        </div>
      }
    >
      <VerifyOtpContent />
    </React.Suspense>
  );
}
