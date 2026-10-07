"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeSlash,
  Lock,
  Buildings,
  CircleNotch,
  ShieldCheck,
  CheckCircle,
} from "@phosphor-icons/react";
import { authApi } from "@/features/auth/api/auth.api";
import { useLanguage } from "@/lib/i18n/language-context";
import { getErrorMessage, cn } from "@/lib/utils";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const { isRTL, language, toggleLanguage } = useLanguage();

  const tokenParam = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [passwordResetToken] = React.useState(tokenParam);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Live password strength calculation
  const passwordStrength = React.useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;
    return score;
  }, [newPassword]);

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
          text: isRTL ? "قوية ومحمية" : "Secure",
          color: "text-emerald-700 bg-emerald-100",
        };
    }
  }, [passwordStrength, isRTL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetToken) {
      setError(
        isRTL
          ? "رمز إعادة التعيين مفقود. يرجى طلب رمز جديد من صفحة استعادة كلمة السر."
          : "Password reset token is missing. Please request a new code."
      );
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError(
        isRTL
          ? "من فضلك اكتب كلمة المرور الجديدة وتأكيدها."
          : "Please enter and confirm your new password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        isRTL
          ? "كلمتا المرور غير متطابقتين. يرجى التأكد وإعادة المحاولة."
          : "Passwords do not match. Please re-enter."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        isRTL
          ? "يجب أن تتكون كلمة المرور من ٨ أحرف على الأقل."
          : "Password must be at least 8 characters long."
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await authApi.resetPassword({
        passwordResetToken,
        newPassword,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      console.error("Password reset failed:", err);
      const apiMsg = getErrorMessage(err, isRTL);
      setError(
        apiMsg ||
          (isRTL
            ? "تعذر إعادة تعيين كلمة المرور. قد يكون الرمز منتهي الصلاحية، يرجى طلب رمز جديد."
            : "Could not reset password. The reset token may be expired or invalid.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#ECE3D5] text-[#1C1917] flex flex-col md:flex-row relative overflow-hidden">
      {/* Top Floating Language Switcher */}
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
              <span>Back to Login</span>
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

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-[#241F1B] text-[#FAF7F2]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/70 to-[#1C1917]/40" />

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
            <ShieldCheck className="w-3.5 h-3.5 text-[#B88460]" />
            <span>{isRTL ? "تأمين الحساب" : "CREDENTIAL RENEWAL"}</span>
          </div>

          <h2 className="font-serif text-3xl xl:text-4xl text-[#FAF7F2] font-normal tracking-tight leading-tight">
            {isRTL
              ? "تعيين كلمة مرور جديدة لحسابك."
              : "Set a new, secure password for your account."}
          </h2>

          <p className="text-sm text-[#FAF7F2]/70 leading-relaxed">
            {isRTL
              ? "اختر كلمة مرور قوية تحتوي على أحرف كبيرة وأرقام لضمان حماية بيانات مشاريعك المعمارية."
              : "Choose a strong password containing uppercase characters, numbers, and symbols."}
          </p>
        </div>

        <div className="relative z-10 text-xs text-[#FAF7F2]/50 tracking-wider">
          © {new Date().getFullYear()} VALENTIA DESIGN & BUILD. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* RIGHT PANEL: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-20 sm:px-12 md:px-16 lg:px-20 xl:px-24 relative z-10 overflow-y-auto">
        <RevealOnScroll direction="up" delayMs={100} className="w-full max-w-md mx-auto">
          {isSuccess ? (
            <div className="p-8 rounded-2xl bg-[#FAF7F2] border border-[#D8C8B4] text-center space-y-6 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" weight="fill" />
              </div>

              <div>
                <h2 className="font-serif text-2xl text-[#1C1917]">
                  {isRTL ? "تم تغيير كلمة المرور بنجاح" : "Password Reset Successfully"}
                </h2>
                <p className="mt-2 text-sm text-[#6B635B]">
                  {isRTL
                    ? "يمكنك الآن تسجيل الدخول إلى حسابك بكلمة المرور الجديدة."
                    : "You can now sign in to your atelier account using your new credentials."}
                </p>
              </div>

              <Link
                href="/login"
                className="inline-flex w-full h-12 rounded-xl bg-[#503C2C] text-[#FAF7F2] hover:bg-[#3E2F22] text-sm font-medium tracking-wider items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>{isRTL ? "الانتقال لتسجيل الدخول" : "Proceed to Sign In"}</span>
                {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFD3C1]/50 border border-[#D8C8B4] text-xs font-mono uppercase tracking-widest text-[#503C2C] mb-3">
                  <Lock className="w-3.5 h-3.5 text-[#B88460]" />
                  <span>{isRTL ? "كلمة المرور الجديدة" : "NEW CREDENTIALS"}</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
                  {isRTL ? "إعادة تعيين كلمة المرور" : "Reset Your Password"}
                </h1>

                {emailParam && (
                  <p className="mt-2 text-sm text-[#6B635B]">
                    {isRTL ? "للحساب: " : "For account: "}
                    <strong className="text-[#1C1917] font-medium">{emailParam}</strong>
                  </p>
                )}
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password Field */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-xs uppercase tracking-wider font-medium text-[#503C2C] mb-1.5"
                  >
                    {isRTL ? "كلمة المرور الجديدة" : "New Password"}
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                      {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {newPassword && (
                    <div className="mt-2 space-y-1.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#6B635B]">
                          {isRTL ? "قوة كلمة المرور:" : "Strength:"}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded-full font-medium text-[10px]", strengthLabel.color)}>
                          {strengthLabel.text}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              "rounded-full transition-all duration-300",
                              passwordStrength >= level
                                ? passwordStrength <= 2
                                  ? "bg-amber-500"
                                  : "bg-emerald-600"
                                : "bg-[#D8C8B4]/40"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs uppercase tracking-wider font-medium text-[#503C2C] mb-1.5"
                  >
                    {isRTL ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
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

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting || !newPassword || !confirmPassword}
                  className={cn(
                    "w-full h-12 rounded-xl text-sm font-medium tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm mt-6",
                    newPassword && confirmPassword && !isSubmitting
                      ? "bg-[#503C2C] text-[#FAF7F2] hover:bg-[#3E2F22] active:scale-[0.99] cursor-pointer"
                      : "bg-[#503C2C]/40 text-[#FAF7F2]/70 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <CircleNotch className="w-4 h-4 animate-spin" />
                      <span>{isRTL ? "جارٍ الحفظ..." : "Saving..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{isRTL ? "تأكيد كلمة المرور" : "Save New Password"}</span>
                      {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </RevealOnScroll>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#ECE3D5] flex items-center justify-center">
          <CircleNotch className="w-8 h-8 text-[#503C2C] animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </React.Suspense>
  );
}
