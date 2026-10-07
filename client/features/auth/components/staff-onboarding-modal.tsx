"use client";

import * as React from "react";
import {
  EnvelopeSimple,
  Key,
  Lock,
  ShieldCheck,
  CheckCircle,
  Eye,
  EyeSlash,
  ArrowRight,
  ArrowLeft,
  CircleNotch,
  Sparkle,
  WarningCircle,
  Buildings,
} from "@phosphor-icons/react";
import { authApi } from "../api/auth.api";
import { useAuth } from "../context/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn, getErrorMessage } from "@/lib/utils";
import type { User } from "../types";

interface StaffOnboardingModalProps {
  open: boolean;
  onboardingToken: string;
  user: User | null;
  onSuccess: (targetRedirectUrl?: string) => void;
  onCancel?: () => void;
}

type OnboardingStep = "EMAIL" | "OTP" | "PASSWORD" | "SUCCESS";

export function StaffOnboardingModal({
  open,
  onboardingToken,
  user,
  onSuccess,
  onCancel,
}: StaffOnboardingModalProps) {
  const { isRTL } = useLanguage();
  const { login } = useAuth();

  const [currentStep, setCurrentStep] = React.useState<OnboardingStep>("EMAIL");
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const [devOtpHint, setDevOtpHint] = React.useState<string | null>(null);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  const otpInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!open) return null;

  // STEP 1: Request Email OTP
  const handleRequestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError(
        isRTL
          ? "يرجى كتابة بريد إلكتروني صحيح ومعتمد."
          : "Please enter a valid official email address."
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const res = await authApi.requestOnboardingEmail({
        email: email.trim().toLowerCase(),
        onboardingToken,
      });

      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
      setCooldown(res.cooldownSeconds || 60);
      setCurrentStep("OTP");
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(
        msg ||
          (isRTL
            ? "تعذر إرسال رمز التحقق. يرجى التأكد من البريد والمحاولة ثانية."
            : "Failed to send verification code. Please check email and try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await authApi.requestOnboardingEmail({
        email: email.trim().toLowerCase(),
        onboardingToken,
      });
      if (res.devOtp) setDevOtpHint(res.devOtp);
      setCooldown(res.cooldownSeconds || 60);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to resend code");
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("").trim();
    if (otpCode.length !== 6) {
      setError(
        isRTL
          ? "يرجى إدخال رمز التحقق كاملاً المكون من 6 أرقام."
          : "Please enter the complete 6-digit verification code."
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.verifyOnboardingEmail({
        email: email.trim().toLowerCase(),
        otp: otpCode,
        onboardingToken,
      });
      setCurrentStep("PASSWORD");
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(
        msg ||
          (isRTL
            ? "رمز التحقق غير صحيح أو انتهت صلاحيته."
            : "Invalid or expired verification code.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (/^\d+$/.test(pasteData)) {
      const digits = pasteData.split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      otpInputRefs.current[Math.min(digits.length, 5)]?.focus();
    }
  };

  // STEP 3: Change Password and Auto-login
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError(
        isRTL
          ? "كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام."
          : "Password must be at least 6 characters."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(
        isRTL
          ? "كلمتا المرور غير متطابقتين."
          : "Passwords do not match."
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.changePassword({
        newPassword,
        onboardingToken,
      });

      setCurrentStep("SUCCESS");

      // Auto-authenticate with the new permanent credentials
      setTimeout(async () => {
        try {
          const loginRes = await login({
            email: email.trim().toLowerCase(),
            password: newPassword,
            rememberMe: true,
          });
          onSuccess(loginRes.redirectUrl);
        } catch {
          // If auto login fails for any reason, redirect smoothly
          onSuccess();
        }
      }, 1500);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(
        msg ||
          (isRTL
            ? "تعذر حفظ كلمة المرور. يرجى المحاولة ثانية."
            : "Failed to update password. Please try again.")
      );
      setIsSubmitting(false);
    }
  };

  const roleLabel = React.useMemo(() => {
    switch (user?.role) {
      case "ENGINEER":
        return isRTL ? "مهندس معماري / تنفيذي" : "Site Architect";
      case "PROJECT_MANAGER":
        return isRTL ? "مدير مشاريع (PM)" : "Project Manager";
      case "COMPANY_OWNER":
        return isRTL ? "شريك ومؤسس" : "Company Owner";
      case "ADMINISTRATOR":
        return isRTL ? "مسؤول النظام" : "System Administrator";
      default:
        return isRTL ? "عضو الفريق الداخلي" : "Atelier Staff";
    }
  }, [user?.role, isRTL]);

  const stepNumber =
    currentStep === "EMAIL"
      ? 1
      : currentStep === "OTP"
      ? 2
      : currentStep === "PASSWORD"
      ? 3
      : 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={cn(
          "w-full max-w-lg rounded-3xl bg-[#FAF7F2] border border-[#D8C8B4] p-6 sm:p-8 shadow-2xl relative text-[#1C1917] overflow-hidden",
          isRTL ? "text-right" : "text-left"
        )}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B88460]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Stepper Indicator */}
        <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B88460] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] font-semibold">
              {isRTL ? "بروتوكول تفعيل حساب العمل" : "STAFF ONBOARDING PROTOCOL"}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-[#503C2C] font-medium">
            <span className="text-[#B88460] font-bold">0{stepNumber}</span>
            <span className="text-[#A8A29E]">/</span>
            <span>03</span>
          </div>
        </div>

        {/* Step Progress Line */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              stepNumber >= 1 ? "bg-[#B88460]" : "bg-[#E8DEC8]"
            )}
          />
          <div
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              stepNumber >= 2 ? "bg-[#B88460]" : "bg-[#E8DEC8]"
            )}
          />
          <div
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              stepNumber >= 3 ? "bg-[#B88460]" : "bg-[#E8DEC8]"
            )}
          />
        </div>

        {/* Title Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#503C2C] text-[#FAF7F2] flex items-center justify-center shrink-0 shadow-md">
            {currentStep === "EMAIL" && <EnvelopeSimple className="w-6 h-6 text-[#FAF7F2]" />}
            {currentStep === "OTP" && <Key className="w-6 h-6 text-[#B88460]" />}
            {currentStep === "PASSWORD" && <Lock className="w-6 h-6 text-[#FAF7F2]" />}
            {currentStep === "SUCCESS" && <CheckCircle className="w-6 h-6 text-emerald-400" />}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-[#503C2C]/10 text-[#503C2C] text-[10px] font-semibold uppercase tracking-wider">
                {roleLabel}
              </span>
              <span className="text-xs text-[#78716C] font-mono">
                {user?.username}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1C1917] leading-snug">
              {currentStep === "EMAIL" &&
                (isRTL ? "أدخل بريدك الإلكتروني المعتمد" : "Enter Your Official Work Email")}
              {currentStep === "OTP" &&
                (isRTL ? "تأكيد البريد برمز التحقق (OTP)" : "Verify With 6-Digit Code")}
              {currentStep === "PASSWORD" &&
                (isRTL ? "تعيين كلمة المرور الدائمة" : "Set Your Permanent Password")}
              {currentStep === "SUCCESS" &&
                (isRTL ? "تم تفعيل حسابك بنجاح!" : "Account Activated Successfully!")}
            </h2>

            <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
              {currentStep === "EMAIL" &&
                (isRTL
                  ? "دخلت بحساب مؤقت. يرجى إدخال إيميلك الحقيقي الذي ستعتمد عليه لاستلام التنبيهات والدخول المستقبلي."
                  : "You signed in with temporary credentials. Provide your permanent email to receive your verification code.")}
              {currentStep === "OTP" &&
                (isRTL
                  ? `أرسلنا رمز تحقق مكون من 6 أرقام إلى: ${email}`
                  : `We sent a 6-digit verification code to: ${email}`)}
              {currentStep === "PASSWORD" &&
                (isRTL
                  ? "اختر كلمة مرور قوية لتسجيل الدخول بها لاحقاً بدلاً من كلمة المرور المؤقتة."
                  : "Choose a strong permanent password to replace the temporary one.")}
              {currentStep === "SUCCESS" &&
                (isRTL
                  ? "جاري توجيهك الآن إلى لوحة التحكم ومساحة العمل الخاصة بك..."
                  : "Redirecting you to your atelier workspace...")}
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
            <WarningCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* STEP 1: EMAIL INPUT */}
        {currentStep === "EMAIL" && (
          <form onSubmit={handleRequestEmail} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#503C2C] mb-2 uppercase tracking-wider">
                {isRTL ? "البريد الإلكتروني المعتمد" : "Permanent Email Address"}
              </label>
              <div className="relative">
                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@valentia.design / name@example.com"
                  required
                  autoFocus
                  className="w-full h-12 px-4 rounded-xl bg-white border border-[#D8C8B4] text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#B88460] focus:border-transparent transition-all shadow-inner font-mono"
                />
                <EnvelopeSimple className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-xs text-[#78716C] hover:text-[#1C1917] transition-colors"
                >
                  {isRTL ? "إلغاء وتسجيل الخروج" : "Cancel & Sign Out"}
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className={cn(
                  "ml-auto h-12 px-6 rounded-full bg-[#503C2C] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider shadow-md hover:bg-[#3D2E22] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer",
                  isRTL && "tracking-normal font-sans"
                )}
              >
                {isSubmitting ? (
                  <>
                    <CircleNotch className="w-4 h-4 animate-spin" />
                    <span>{isRTL ? "جاري الإرسال..." : "Sending Code..."}</span>
                  </>
                ) : (
                  <>
                    <span>{isRTL ? "إرسال رمز التحقق ←" : "Send Verification Code →"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: 6-DIGIT OTP */}
        {currentStep === "OTP" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {/* Dev helper chip for instant testing */}
            {devOtpHint && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center justify-between font-mono">
                <span className="flex items-center gap-1.5">
                  <Sparkle className="w-3.5 h-3.5 text-amber-600" />
                  {isRTL ? "رمز تجريبي سريع:" : "Dev Quick OTP:"}{" "}
                  <strong className="tracking-widest">{devOtpHint}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const digits = devOtpHint.split("");
                    setOtp(digits);
                    otpInputRefs.current[5]?.focus();
                  }}
                  className="px-2 py-0.5 rounded bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold transition-colors cursor-pointer text-[10px]"
                >
                  {isRTL ? "تعبئة تلقائية" : "Auto-Fill"}
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#503C2C] mb-3 text-center uppercase tracking-wider">
                {isRTL ? "أدخل الرمز المكون من 6 أرقام" : "Enter 6-Digit Code"}
              </label>

              <div className="flex items-center justify-center gap-2 sm:gap-2.5" dir="ltr" onPaste={handlePasteOtp}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={cn(
                      "w-11 h-14 sm:w-12 sm:h-14 rounded-xl text-center font-mono text-xl font-bold bg-white border border-[#D8C8B4] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#B88460] focus:border-transparent transition-all shadow-inner",
                      digit ? "border-[#B88460] bg-[#FAF7F2]" : ""
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#78716C]">
              <button
                type="button"
                onClick={() => setCurrentStep("EMAIL")}
                className="hover:text-[#1C1917] transition-colors underline underline-offset-4"
              >
                {isRTL ? "تغيير الإيميل" : "Change Email"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || isSubmitting}
                className={cn(
                  "hover:text-[#503C2C] transition-colors font-medium",
                  cooldown > 0 && "opacity-50 cursor-not-allowed"
                )}
              >
                {cooldown > 0
                  ? isRTL
                    ? `إعادة الإرسال بعد ${cooldown} ثانية`
                    : `Resend code in ${cooldown}s`
                  : isRTL
                  ? "إعادة إرسال الرمز الآن"
                  : "Resend Code Now"}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.join("").length !== 6}
              className={cn(
                "w-full h-12 rounded-full bg-[#503C2C] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider shadow-md hover:bg-[#3D2E22] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer",
                isRTL && "tracking-normal font-sans"
              )}
            >
              {isSubmitting ? (
                <>
                  <CircleNotch className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? "جاري التحقق..." : "Verifying Code..."}</span>
                </>
              ) : (
                <>
                  <span>{isRTL ? "تأكيد الرمز والمتابعة ←" : "Confirm Code & Continue →"}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: SET PERMANENT PASSWORD */}
        {currentStep === "PASSWORD" && (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#503C2C] mb-1.5 uppercase tracking-wider">
                {isRTL ? "كلمة المرور الدائمة الجديدة" : "New Permanent Password"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoFocus
                  minLength={6}
                  className="w-full h-12 px-4 pr-11 rounded-xl bg-white border border-[#D8C8B4] text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#B88460] focus:border-transparent transition-all shadow-inner font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] p-1 cursor-pointer"
                >
                  {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#503C2C] mb-1.5 uppercase tracking-wider">
                {isRTL ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                  className="w-full h-12 px-4 pr-11 rounded-xl bg-white border border-[#D8C8B4] text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#B88460] focus:border-transparent transition-all shadow-inner font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !newPassword || newPassword !== confirmPassword}
                className={cn(
                  "w-full h-12 rounded-full bg-[#B88460] text-white text-xs font-semibold uppercase tracking-wider shadow-md hover:bg-[#A37250] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer",
                  isRTL && "tracking-normal font-sans"
                )}
              >
                {isSubmitting ? (
                  <>
                    <CircleNotch className="w-4 h-4 animate-spin" />
                    <span>{isRTL ? "جاري تفعيل الحساب..." : "Activating Account..."}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {isRTL
                        ? "حفظ كلمة المرور وتفعيل الحساب الآن ✓"
                        : "Save Password & Activate Account ✓"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {currentStep === "SUCCESS" && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 shadow-lg animate-bounce">
              <CheckCircle className="w-10 h-10" weight="fill" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-serif font-bold text-[#1C1917]">
                {isRTL ? "أهلاً بك في فالنتيا!" : "Welcome to Valentia!"}
              </h3>
              <p className="text-xs text-[#78716C] max-w-sm">
                {isRTL
                  ? "تم ربط بريدك الإلكتروني بنجاح وتعيين كلمة المرور. جاري فتح مساحة عملك الهندسية..."
                  : "Your official email is verified and your password is active. Launching your workspace..."}
              </p>
            </div>

            <div className="pt-2">
              <CircleNotch className="w-5 h-5 animate-spin text-[#B88460]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
