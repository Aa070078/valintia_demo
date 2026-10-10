"use client"

import * as React from "react"
import {
  EnvelopeSimple,
  Key,
  Lock,
  ShieldCheck,
  CheckCircle,
  Eye,
  EyeSlash,
  CircleNotch,
  WarningCircle,
} from "@phosphor-icons/react"
import { authApi } from "../api/auth.api"
import { useAuth } from "../context/auth-context"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn, getErrorMessage } from "@/lib/utils"
import type { User } from "../types"

interface StaffOnboardingModalProps {
  open: boolean
  onboardingToken: string
  user: User | null
  onSuccess: (targetRedirectUrl?: string) => void
  onCancel?: () => void
  currentPassword?: string
}

type OnboardingStep = "EMAIL" | "OTP" | "PASSWORD" | "SUCCESS"

export function StaffOnboardingModal({
  open,
  onboardingToken,
  user,
  onSuccess,
  onCancel,
  currentPassword,
}: StaffOnboardingModalProps) {
  const { isRTL } = useLanguage()
  const { login, logout } = useAuth()

  const [currentStep, setCurrentStep] = React.useState<OnboardingStep>(
    user?.emailVerified ? "PASSWORD" : "EMAIL"
  )
  const [email, setEmail] = React.useState(user?.email || "")
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""])
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [cooldown, setCooldown] = React.useState(0)

  const otpInputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  // Cooldown countdown
  React.useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  if (!open) return null

  // STEP 1: Request Email OTP
  const handleRequestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes("@")) {
      setError(
        isRTL
          ? "يرجى كتابة بريد إلكتروني صحيح ومعتمد."
          : "Please enter a valid official email address."
      )
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const res = await authApi.requestOnboardingEmail({
        email: email.trim().toLowerCase(),
        onboardingToken,
      })

      setCooldown(res.cooldownSeconds || 60)
      setCurrentStep("OTP")
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150)
    } catch (err: unknown) {
      const msg = getErrorMessage(err)
      setError(
        msg ||
          (isRTL
            ? "تعذر إرسال رمز التحقق. يرجى التأكد من البريد والمحاولة ثانية."
            : "Failed to send verification code. Please check email and try again.")
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || isSubmitting) return
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await authApi.requestOnboardingEmail({
        email: email.trim().toLowerCase(),
        onboardingToken,
      })
      setCooldown(res.cooldownSeconds || 60)
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to resend code")
    } finally {
      setIsSubmitting(false)
    }
  }

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join("").trim()
    if (otpCode.length !== 6) {
      setError(
        isRTL
          ? "يرجى إدخال رمز التحقق كاملاً المكون من 6 أرقام."
          : "Please enter the complete 6-digit verification code."
      )
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const result = await authApi.verifyOnboardingEmail({
        email: email.trim().toLowerCase(),
        otp: otpCode,
        onboardingToken,
      })
      if (result.onboardingComplete) await completeSignIn(currentPassword)
      else setCurrentStep("PASSWORD")
    } catch (err: unknown) {
      const msg = getErrorMessage(err)
      setError(
        msg ||
          (isRTL
            ? "رمز التحقق غير صحيح أو انتهت صلاحيته."
            : "Invalid or expired verification code.")
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handlePasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData("text").trim().slice(0, 6)
    if (/^\d+$/.test(pasteData)) {
      const digits = pasteData.split("")
      const newOtp = [...otp]
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d
      })
      setOtp(newOtp)
      otpInputRefs.current[Math.min(digits.length, 5)]?.focus()
    }
  }

  // STEP 3: Change Password and Auto-login
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      setError(
        isRTL
          ? "كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام."
          : "Password must be at least 6 characters."
      )
      return
    }
    if (newPassword !== confirmPassword) {
      setError(
        isRTL ? "كلمتا المرور غير متطابقتين." : "Passwords do not match."
      )
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      await authApi.changePassword({
        newPassword,
        onboardingToken,
      })

      await completeSignIn(newPassword)
    } catch (err: unknown) {
      const msg = getErrorMessage(err)
      setError(
        msg ||
          (isRTL
            ? "تعذر حفظ كلمة المرور. يرجى المحاولة ثانية."
            : "Failed to update password. Please try again.")
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function completeSignIn(password?: string) {
    setCurrentStep("SUCCESS")
    if (!password) {
      await logout()
      onSuccess("/login")
      return
    }
    try {
      const result = await login({
        email: email.trim().toLowerCase(),
        password,
        rememberMe: true,
      })
      if (result.onboardingRequired)
        throw new Error("Please finish account setup before continuing.")
      onSuccess(result.redirectUrl)
    } catch {
      await logout()
      onSuccess("/login")
    }
  }

  const roleLabel = (() => {
    switch (user?.role) {
      case "ENGINEER":
        return isRTL ? "مهندس معماري / تنفيذي" : "Site Architect"
      case "PROJECT_MANAGER":
        return isRTL ? "مدير مشاريع (PM)" : "Project Manager"
      case "COMPANY_OWNER":
        return isRTL ? "شريك ومؤسس" : "Company Owner"
      case "ADMINISTRATOR":
        return isRTL ? "مسؤول النظام" : "System Administrator"
      default:
        return isRTL ? "عضو الفريق الداخلي" : "Atelier Staff"
    }
  })()

  const stepNumber =
    currentStep === "EMAIL"
      ? 1
      : currentStep === "OTP"
        ? 2
        : currentStep === "PASSWORD"
          ? 3
          : 4

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="staff-onboarding-title"
      className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/75 p-4 backdrop-blur-md duration-200 fade-in"
    >
      <div
        className={cn(
          "relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#D8C8B4] bg-[#FAF7F2] p-6 text-[#1C1917] shadow-2xl sm:p-8",
          isRTL ? "text-right" : "text-left"
        )}
      >
        {/* Subtle Ambient Glow */}
        <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-[#B88460]/15 blur-3xl" />

        {/* Top Stepper Indicator */}
        <div className="mb-6 flex items-center justify-between border-b border-[#E8DEC8] pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#B88460]" />
            <span className="font-mono text-[10px] font-semibold tracking-widest text-[#78716C] uppercase">
              {isRTL
                ? "بروتوكول تفعيل حساب العمل"
                : "STAFF ONBOARDING PROTOCOL"}
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px] font-medium text-[#503C2C]">
            <span className="font-bold text-[#B88460]">0{stepNumber}</span>
            <span className="text-[#A8A29E]">/</span>
            <span>03</span>
          </div>
        </div>

        {/* Step Progress Line */}
        <div className="mb-6 grid grid-cols-3 gap-2">
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
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#503C2C] text-[#FAF7F2] shadow-md">
            {currentStep === "EMAIL" && (
              <EnvelopeSimple className="h-6 w-6 text-[#FAF7F2]" />
            )}
            {currentStep === "OTP" && (
              <Key className="h-6 w-6 text-[#B88460]" />
            )}
            {currentStep === "PASSWORD" && (
              <Lock className="h-6 w-6 text-[#FAF7F2]" />
            )}
            {currentStep === "SUCCESS" && (
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            )}
          </div>

          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-md bg-[#503C2C]/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[#503C2C] uppercase">
                {roleLabel}
              </span>
              <span className="font-mono text-xs text-[#78716C]">
                {user?.username}
              </span>
            </div>

            <h2
              id="staff-onboarding-title"
              className="font-serif text-lg leading-snug font-bold text-[#1C1917] sm:text-xl"
            >
              {currentStep === "EMAIL" &&
                (isRTL
                  ? "أدخل بريدك الإلكتروني المعتمد"
                  : "Enter Your Official Work Email")}
              {currentStep === "OTP" &&
                (isRTL
                  ? "تأكيد البريد برمز التحقق (OTP)"
                  : "Verify With 6-Digit Code")}
              {currentStep === "PASSWORD" &&
                (isRTL
                  ? "تعيين كلمة المرور الدائمة"
                  : "Set Your Permanent Password")}
              {currentStep === "SUCCESS" &&
                (isRTL
                  ? "تم تفعيل حسابك بنجاح!"
                  : "Account Activated Successfully!")}
            </h2>

            <p className="mt-1 text-xs leading-relaxed text-[#78716C]">
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
          <div
            role="alert"
            className="mb-5 flex animate-in items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 duration-150 fade-in"
          >
            <WarningCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* STEP 1: EMAIL INPUT */}
        {currentStep === "EMAIL" && (
          <form onSubmit={handleRequestEmail} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold tracking-wider text-[#503C2C] uppercase">
                {isRTL
                  ? "البريد الإلكتروني المعتمد"
                  : "Permanent Email Address"}
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
                  className="h-12 w-full rounded-xl border border-[#D8C8B4] bg-white px-4 font-mono text-sm text-[#1C1917] shadow-inner transition-all placeholder:text-[#A8A29E] focus:border-transparent focus:ring-2 focus:ring-[#B88460] focus:outline-none"
                />
                <EnvelopeSimple className="absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-[#A8A29E]" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-xs text-[#78716C] transition-colors hover:text-[#1C1917]"
                >
                  {isRTL ? "إلغاء وتسجيل الخروج" : "Cancel & Sign Out"}
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className={cn(
                  "ml-auto flex h-12 cursor-pointer items-center gap-2 rounded-xl bg-[#D8C8B4] px-6 text-sm font-semibold text-[#1C1917] border border-[#C5B49E] shadow-sm transition-all hover:bg-[#C9B7A0] active:scale-98 disabled:cursor-not-allowed disabled:opacity-40",
                  isRTL && "font-sans"
                )}
              >
                {isSubmitting ? (
                  <>
                    <CircleNotch className="h-4 w-4 animate-spin" />
                    <span>{isRTL ? "جاري الإرسال..." : "Sending Code..."}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isRTL
                        ? "إرسال رمز التحقق ←"
                        : "Send Verification Code →"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: 6-DIGIT OTP */}
        {currentStep === "OTP" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="mb-3 block text-center text-xs font-semibold tracking-wider text-[#503C2C] uppercase">
                {isRTL ? "أدخل الرمز المكون من 6 أرقام" : "Enter 6-Digit Code"}
              </label>

              <div
                className="flex items-center justify-center gap-2 sm:gap-2.5"
                dir="ltr"
                onPaste={handlePasteOtp}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={cn(
                      "h-14 w-11 rounded-xl border border-[#D8C8B4] bg-white text-center font-mono text-xl font-bold text-[#1C1917] shadow-inner transition-all focus:border-transparent focus:ring-2 focus:ring-[#B88460] focus:outline-none sm:h-14 sm:w-12",
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
                className="underline underline-offset-4 transition-colors hover:text-[#1C1917]"
              >
                {isRTL ? "تغيير الإيميل" : "Change Email"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || isSubmitting}
                className={cn(
                  "font-medium transition-colors hover:text-[#503C2C]",
                  cooldown > 0 && "cursor-not-allowed opacity-50"
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
                "flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D8C8B4] text-sm font-semibold tracking-normal text-[#1C1917] border border-[#C5B49E] shadow-sm transition-all hover:bg-[#C9B7A0] active:scale-98 disabled:cursor-not-allowed disabled:opacity-40",
                isRTL && "font-sans"
              )}
            >
              {isSubmitting ? (
                <>
                  <CircleNotch className="h-4 w-4 animate-spin" />
                  <span>{isRTL ? "جاري التحقق..." : "Verifying Code..."}</span>
                </>
              ) : (
                <>
                  <span>
                    {isRTL
                      ? "تأكيد الرمز والمتابعة ←"
                      : "Confirm Code & Continue →"}
                  </span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: SET PERMANENT PASSWORD */}
        {currentStep === "PASSWORD" && (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-[#503C2C] uppercase">
                {isRTL
                  ? "كلمة المرور الدائمة الجديدة"
                  : "New Permanent Password"}
              </label>
              <div className="relative">
                <input
                  id="onboarding-password"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoFocus
                  minLength={6}
                  className="h-12 w-full rounded-xl border border-[#D8C8B4] bg-white px-4 pr-11 font-mono text-sm text-[#1C1917] shadow-inner transition-all placeholder:text-[#A8A29E] focus:border-transparent focus:ring-2 focus:ring-[#B88460] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1 text-[#78716C] hover:text-[#1C1917]"
                >
                  {showPassword ? (
                    <EyeSlash className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-[#503C2C] uppercase">
                {isRTL ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
              </label>
              <div className="relative">
                <input
                  id="onboarding-confirmation"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                  className="h-12 w-full rounded-xl border border-[#D8C8B4] bg-white px-4 pr-11 font-mono text-sm text-[#1C1917] shadow-inner transition-all placeholder:text-[#A8A29E] focus:border-transparent focus:ring-2 focus:ring-[#B88460] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !newPassword ||
                  newPassword !== confirmPassword
                }
                className={cn(
                  "flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D8C8B4] text-sm font-semibold tracking-normal text-[#1C1917] border border-[#C5B49E] shadow-sm transition-all hover:bg-[#C9B7A0] active:scale-98 disabled:cursor-not-allowed disabled:opacity-40",
                  isRTL && "font-sans"
                )}
              >
                {isSubmitting ? (
                  <>
                    <CircleNotch className="h-4 w-4 animate-spin" />
                    <span>
                      {isRTL ? "جاري تفعيل الحساب..." : "Activating Account..."}
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
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

        {onCancel && currentStep !== "EMAIL" && currentStep !== "SUCCESS" && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="mt-4 text-xs text-[#78716C] hover:text-[#1C1917]"
          >
            {isRTL ? "إلغاء وتسجيل الخروج" : "Cancel & Sign Out"}
          </button>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {currentStep === "SUCCESS" && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
            <div className="flex h-16 w-16 animate-bounce items-center justify-center rounded-full border border-emerald-300 bg-emerald-100 text-emerald-600 shadow-lg">
              <CheckCircle className="h-10 w-10" weight="fill" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                {isRTL ? "أهلاً بك في فالنتيا!" : "Welcome to Valentia!"}
              </h3>
              <p className="max-w-sm text-xs text-[#78716C]">
                {isRTL
                  ? "تم ربط بريدك الإلكتروني بنجاح وتعيين كلمة المرور. جاري فتح مساحة عملك الهندسية..."
                  : "Your official email is verified and your password is active. Launching your workspace..."}
              </p>
            </div>

            <div className="pt-2">
              <CircleNotch className="h-5 w-5 animate-spin text-[#B88460]" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
