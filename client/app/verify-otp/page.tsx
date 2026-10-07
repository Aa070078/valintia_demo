"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Buildings,
  CircleNotch,
  ArrowCounterClockwise,
  Key,
  CheckCircle,
} from "@phosphor-icons/react";
import { authApi } from "@/features/auth/api/auth.api";
import { useAuth } from "@/features/auth/context/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { getErrorMessage, cn } from "@/lib/utils";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isRTL, language, toggleLanguage } = useLanguage();
  const { refreshUser } = useAuth();

  const emailParam = searchParams.get("email") || "";
  const rawPurpose = (searchParams.get("purpose") || "EMAIL_VERIFICATION").toUpperCase();
  const redirectParam = searchParams.get("redirect");

  const purpose: "EMAIL_VERIFICATION" | "LOGIN" | "PASSWORD_RESET" =
    rawPurpose === "LOGIN"
      ? "LOGIN"
      : rawPurpose === "PASSWORD_RESET"
      ? "PASSWORD_RESET"
      : "EMAIL_VERIFICATION";

  const [email] = React.useState(emailParam);
  const [digits, setDigits] = React.useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = React.useState<string | null>(null);
  const [infoMessage, setInfoMessage] = React.useState<string | null>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [cooldown, setCooldown] = React.useState<number>(60);

  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  React.useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Cooldown countdown timer
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleDigitChange = (index: number, value: string) => {
    setError(null);
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    const char = cleaned.slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    if (index < 5 && char) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = [...digits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || "";
    }
    setDigits(next);

    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const otpCode = digits.join("");
  const isComplete = otpCode.length === 6;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isComplete || isVerifying) return;

    if (!email) {
      setError(
        isRTL
          ? "لم يتم تحديد البريد الإلكتروني. من فضلك ارجع للخطوة السابقة."
          : "No email address specified. Please return to the previous screen."
      );
      return;
    }

    setError(null);
    setInfoMessage(null);
    setIsVerifying(true);

    try {
      if (purpose === "EMAIL_VERIFICATION") {
        // 1. Verify OTP with backend to get verificationToken
        const verifyRes = await authApi.verifyRegistrationOtp(email, otpCode);

        if (!verifyRes.verificationToken) {
          throw new Error(
            isRTL
              ? "لم يتم استلام رمز التأكيد من الخادم."
              : "Verification token was not granted by the server."
          );
        }

        // 2. Retrieve cached signup payload
        const cached = sessionStorage.getItem("valentia_pending_signup");
        let signupPayload: {
          username: string;
          password?: string;
          name?: string;
          phone?: string;
        } | null = null;

        if (cached) {
          try {
            signupPayload = JSON.parse(cached);
          } catch {
            // ignore
          }
        }

        if (!signupPayload || !signupPayload.password) {
          // If session expired or missing password, navigate to signup with email prefilled
          router.push(`/signup?email=${encodeURIComponent(email)}`);
          return;
        }

        // 3. Complete customer registration with the verificationToken
        await authApi.signup({
          username: email,
          password: signupPayload.password,
          verificationToken: verifyRes.verificationToken,
          name: signupPayload.name,
          phone: signupPayload.phone,
          role: "CUSTOMER",
        });

        sessionStorage.removeItem("valentia_pending_signup");
        await refreshUser();

        // 4. Redirect to destination
        const destination =
          redirectParam && redirectParam.startsWith("/")
            ? redirectParam
            : "/projects";
        window.location.href = destination;
      } else if (purpose === "LOGIN") {
        // Direct login via OTP
        await authApi.verifyLoginOtp(email, otpCode);
        await refreshUser();

        const destination =
          redirectParam && redirectParam.startsWith("/")
            ? redirectParam
            : "/projects";
        window.location.href = destination;
      } else if (purpose === "PASSWORD_RESET") {
        // Verify reset OTP and obtain passwordResetToken
        const verifyRes = await authApi.verifyPasswordResetOtp(email, otpCode);
        if (!verifyRes.passwordResetToken) {
          throw new Error(
            isRTL
              ? "لم يتم استلام رمز استعادة كلمة السر."
              : "Password reset token was not granted by the server."
          );
        }

        // Navigate to reset password page with the proof token
        router.push(
          `/reset-password?token=${encodeURIComponent(
            verifyRes.passwordResetToken
          )}&email=${encodeURIComponent(email)}`
        );
      }
    } catch (err: unknown) {
      console.error("OTP verification error:", err);
      const apiMsg = getErrorMessage(err, isRTL);
      setError(
        apiMsg ||
          (isRTL
            ? "رمز التحقق غير صحيح أو انتهت صلاحيته. يرجى التأكد وإعادة المحاولة."
            : "The verification code is invalid or has expired. Please check and try again.")
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending || !email) return;

    setError(null);
    setIsResending(true);

    try {
      if (purpose === "EMAIL_VERIFICATION") {
        const res = await authApi.sendRegistrationOtp(email);
        setCooldown(res.cooldownSeconds || 60);
      } else if (purpose === "LOGIN") {
        await authApi.requestLoginOtp(email);
        setCooldown(60);
      } else if (purpose === "PASSWORD_RESET") {
        await authApi.requestForgotPassword(email);
        setCooldown(60);
      }

      setInfoMessage(
        isRTL
          ? "تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني بنجاح."
          : "A new verification code has been dispatched to your email."
      );
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      console.error("Failed to resend OTP:", err);
      const apiMsg = getErrorMessage(err, isRTL);
      setError(
        apiMsg ||
          (isRTL
            ? "تعذر إرسال الرمز حالياً. يرجى الانتظار والمحاولة مرة أخرى."
            : "Unable to resend code right now. Please wait and try again.")
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#ECE3D5] text-[#1C1917] flex flex-col md:flex-row relative overflow-hidden">
      {/* Top Floating Navigation & Language Switcher */}
      <div className="absolute top-6 left-6 right-6 z-30 flex items-center justify-between pointer-events-auto">
        <Link
          href={purpose === "EMAIL_VERIFICATION" ? "/signup" : "/login"}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#503C2C] hover:text-[#1C1917] font-medium transition-colors bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D8C8B4]/60 shadow-sm"
        >
          {isRTL ? (
            <>
              <ArrowRight className="h-3.5 w-3.5" />
              <span>{purpose === "EMAIL_VERIFICATION" ? "رجوع للتسجيل" : "رجوع للدخول"}</span>
            </>
          ) : (
            <>
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{purpose === "EMAIL_VERIFICATION" ? "Back to Signup" : "Back to Login"}</span>
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
            <Key className="w-3.5 h-3.5 text-[#B88460]" />
            <span>{isRTL ? "تأكيد فوري آمن" : "SECURE CHALLENGE"}</span>
          </div>

          <h2 className="font-serif text-3xl xl:text-4xl text-[#FAF7F2] font-normal tracking-tight leading-tight">
            {purpose === "EMAIL_VERIFICATION"
              ? isRTL
                ? "تأكيد بريدك الإلكتروني لبدء تجربة فالنتيا المعمارية."
                : "Confirm your email to enter your Valentia commission workspace."
              : purpose === "LOGIN"
              ? isRTL
                ? "تسجيل دخول آمن وسريع عبر رمز التحقق المباشر."
                : "Fast and secure sign-in via dedicated verification code."
              : isRTL
              ? "استعادة الوصول الآمن إلى حسابك ومشاريعك السكنية."
              : "Securely recover access to your atelier projects."}
          </h2>

          <p className="text-sm text-[#FAF7F2]/70 leading-relaxed">
            {isRTL
              ? "نحرص على سرية وتأمين بيانات مشاريعك المعمارية ومستندات التعاقد عبر التحقق الثنائي المباشر."
              : "We safeguard your architectural dossiers, CAD files, and itemized contracts with secure two-step authentication."}
          </p>

          <div className="pt-4 flex items-center gap-6 border-t border-white/10 text-xs text-[#FAF7F2]/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "تشفير كامل للبيانات" : "End-to-End Encrypted"}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#B88460]" />
              <span>{isRTL ? "صلاحية محددة للرمز" : "Time-Bound OTP"}</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-[#FAF7F2]/50 tracking-wider">
          © {new Date().getFullYear()} VALENTIA DESIGN & BUILD. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* RIGHT PANEL: Verification Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-20 sm:px-12 md:px-16 lg:px-20 xl:px-24 relative z-10 overflow-y-auto">
        <RevealOnScroll direction="up" delayMs={100} className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFD3C1]/50 border border-[#D8C8B4] text-xs font-mono uppercase tracking-widest text-[#503C2C] mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B88460]" />
              <span>{isRTL ? "التحقق من الهوية" : "IDENTITY VERIFICATION"}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
              {purpose === "EMAIL_VERIFICATION"
                ? isRTL
                  ? "تأكيد البريد الإلكتروني"
                  : "Verify Your Email"
                : purpose === "LOGIN"
                ? isRTL
                  ? "رمز تسجيل الدخول"
                  : "Sign In with Code"
                : isRTL
                ? "رمز استعادة كلمة السر"
                : "Reset Password Code"}
            </h1>

            <p className="mt-2 text-sm text-[#6B635B] leading-relaxed">
              {isRTL ? (
                <>
                  أدخل رمز التحقق المكون من 6 أرقام المرسل إلى{" "}
                  <strong className="text-[#1C1917] font-medium">{email || "بريدك الإلكتروني"}</strong>
                </>
              ) : (
                <>
                  Enter the 6-digit verification code sent to{" "}
                  <strong className="text-[#1C1917] font-medium">{email || "your email inbox"}</strong>
                </>
              )}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Banner */}
          {infoMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            {/* 6 Digit Input Group */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-[#503C2C] mb-3 text-center">
                {isRTL ? "رمز التحقق (٦ أرقام)" : "Enter 6-Digit Code"}
              </label>

              <div
                className="flex items-center justify-center gap-2 sm:gap-3"
                dir="ltr"
                onPaste={handlePaste}
              >
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    autoComplete={idx === 0 ? "one-time-code" : "off"}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    disabled={isVerifying}
                    className={cn(
                      "w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-mono font-semibold rounded-xl transition-all outline-none",
                      "bg-white/90 border border-[#D8C8B4] text-[#1C1917]",
                      "focus:border-[#503C2C] focus:ring-2 focus:ring-[#503C2C]/20 shadow-sm",
                      digit ? "border-[#503C2C] bg-white font-bold" : ""
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={!isComplete || isVerifying}
              className={cn(
                "w-full h-12 rounded-xl text-sm font-medium tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm",
                isComplete && !isVerifying
                  ? "bg-[#503C2C] text-[#FAF7F2] hover:bg-[#3E2F22] active:scale-[0.99] cursor-pointer"
                  : "bg-[#503C2C]/40 text-[#FAF7F2]/70 cursor-not-allowed"
              )}
            >
              {isVerifying ? (
                <>
                  <CircleNotch className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? "جارٍ التحقق..." : "Verifying Code..."}</span>
                </>
              ) : (
                <>
                  <span>
                    {purpose === "EMAIL_VERIFICATION"
                      ? isRTL
                        ? "تأكيد والمتابعة"
                        : "Confirm & Continue"
                      : purpose === "LOGIN"
                      ? isRTL
                        ? "دخول الأتيليه"
                        : "Sign In to Atelier"
                      : isRTL
                      ? "متابعة تعيين كلمة السر"
                      : "Proceed to New Password"}
                  </span>
                  {isRTL ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </>
              )}
            </button>

            {/* Resend Cooldown and Actions */}
            <div className="pt-2 flex flex-col items-center gap-3 text-center">
              <div className="text-xs text-[#6B635B]">
                {cooldown > 0 ? (
                  <span>
                    {isRTL
                      ? `يمكنك طلب رمز جديد بعد (${cooldown} ثانية)`
                      : `You can request a new code in (${cooldown}s)`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B88460] hover:text-[#503C2C] transition-colors cursor-pointer"
                  >
                    {isResending ? (
                      <>
                        <CircleNotch className="w-3.5 h-3.5 animate-spin" />
                        <span>{isRTL ? "جارٍ الإرسال..." : "Sending..."}</span>
                      </>
                    ) : (
                      <>
                        <ArrowCounterClockwise className="w-3.5 h-3.5" />
                        <span>
                          {isRTL
                            ? "لم يصلك الرمز؟ إعادة إرسال الرمز"
                            : "Didn't receive the code? Resend code"}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="text-xs text-[#6B635B]">
                <Link
                  href={purpose === "EMAIL_VERIFICATION" ? "/signup" : "/login"}
                  className="hover:text-[#1C1917] underline underline-offset-4 transition-colors"
                >
                  {isRTL ? "تغيير البريد الإلكتروني" : "Edit email address"}
                </Link>
              </div>
            </div>
          </form>
        </RevealOnScroll>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#ECE3D5] flex items-center justify-center">
          <CircleNotch className="w-8 h-8 text-[#503C2C] animate-spin" />
        </div>
      }
    >
      <VerifyOtpContent />
    </React.Suspense>
  );
}
