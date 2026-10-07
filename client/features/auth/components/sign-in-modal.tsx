"use client"

import * as React from "react"
import {
  X,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
} from "@phosphor-icons/react"
import { useAuth } from "../context/auth-context"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn, getErrorMessage } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import { StaffOnboardingModal } from "./staff-onboarding-modal"

interface SignInModalProps {
  open: boolean
  onClose: () => void
}

export function SignInModal({ open, onClose }: SignInModalProps) {
  const { t, isRTL } = useLanguage()
  const {
    user,
    isAuthenticated,
    requiresPasswordChange,
    login,
    logout,
    changePassword,
    isLoading,
    onboardingSession,
  } = useAuth()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [redirectMessage, setRedirectMessage] = React.useState<string | null>(
    null
  )
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  if (!open) return null
  if (onboardingSession)
    return (
      <StaffOnboardingModal
        open
        onboardingToken={onboardingSession.token}
        user={onboardingSession.user}
        currentPassword={password || undefined}
        onCancel={() => {
          void logout()
          onClose()
        }}
        onSuccess={(destination) => {
          if (destination) window.location.assign(destination)
          else onClose()
        }}
      />
    )

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setRedirectMessage(null)

    try {
      const result = await login({ email, password })
      if (result.onboardingRequired) return
      if (result.redirectUrl) {
        setRedirectMessage(
          isRTL
            ? "تم تسجيل الدخول بنجاح. بنحولك دلوقتي للوحة العمليات..."
            : "Authenticated as internal role. Redirecting to Valentia Operations Dashboard..."
        )
        setTimeout(() => {
          window.location.href = result.redirectUrl!
        }, 1200)
      } else {
        onClose()
      }
    } catch (err: unknown) {
      const apiMsg = getErrorMessage(err)
      setErrorMsg(
        apiMsg ||
          (isRTL
            ? "بيانات الدخول مش صحيحة. اتأكد من الإيميل وكلمة السر."
            : "Authentication failed. Please check credentials.")
      )
    }
  }

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      setErrorMsg(
        isRTL
          ? "كلمة السر لازم تكون ٨ حروف أو أرقام على الأقل."
          : "Password must be at least 8 characters long."
      )
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(
        isRTL ? "كلمتي السر مش متطابقتين." : "Passwords do not match."
      )
      return
    }

    try {
      await changePassword({ newPassword })
      setErrorMsg(null)
      onClose()
    } catch (err: unknown) {
      const apiMsg = getErrorMessage(err)
      setErrorMsg(
        apiMsg ||
          (isRTL
            ? "فشل تحديث كلمة المرور. يرجى المحاولة مرة أخرى."
            : "Failed to update password.")
      )
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-opacity"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card p-6 text-start shadow-2xl sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/80",
            isRTL ? "left-4" : "right-4"
          )}
        >
          <X size={15} weight="bold" />
        </button>

        {/* Temporary Password Change Screen */}
        {requiresPasswordChange ? (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Lock size={18} className="text-[#503C2C]" />
              <span
                className={cn(
                  "text-[10px] font-semibold text-[#503C2C]",
                  isRTL
                    ? "font-sans font-bold tracking-normal"
                    : "font-mono tracking-[0.2em] uppercase"
                )}
              >
                {t("auth.password_change_required") ||
                  (isRTL ? "تنبيه أمني" : "Security Notice")}
              </span>
            </div>
            <h3
              className={cn(
                "text-2xl text-foreground",
                isRTL ? "font-sans font-bold" : "font-serif font-medium"
              )}
            >
              {t("auth.create_new_password") ||
                (isRTL
                  ? "تعيين كلمة السر الدائمة"
                  : "Set Your Permanent Password")}
            </h3>
            <p
              className={cn(
                "mt-1 text-xs leading-relaxed",
                isRTL ? "font-medium text-[#4A3E31]" : "text-muted-foreground"
              )}
            >
              {t("auth.temp_password_desc") ||
                (isRTL
                  ? "أنت مسجل دخول بكلمة سر مؤقتة. من فضلك اختار كلمة سر جديدة لحسابك عشان تكمل."
                  : "You logged in with a temporary password. Please set a secure password for your Valentia account to proceed.")}
            </p>

            <form
              onSubmit={handlePasswordChangeSubmit}
              className="mt-6 flex flex-col gap-4"
            >
              <div>
                <label
                  className={cn(
                    "mb-1 block text-xs font-semibold text-foreground",
                    isRTL && "font-sans"
                  )}
                >
                  {isRTL ? "كلمة السر الجديدة *" : "New Password *"}
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={
                    isRTL ? "٨ أحرف على الأقل" : "Minimum 8 characters"
                  }
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground transition-colors outline-none focus:border-primary"
                />
              </div>

              <div>
                <label
                  className={cn(
                    "mb-1 block text-xs font-semibold text-foreground",
                    isRTL && "font-sans"
                  )}
                >
                  {isRTL ? "تأكيد كلمة السر *" : "Confirm Password *"}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={
                    isRTL ? "أعد كتابة كلمة السر" : "Re-type new password"
                  }
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground transition-colors outline-none focus:border-primary"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-medium text-rose-600">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs text-primary-foreground shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]",
                  isRTL
                    ? "font-sans font-bold tracking-normal"
                    : "font-semibold tracking-[0.14em] uppercase"
                )}
              >
                {isLoading ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <span>
                    {isRTL ? "تحديث والمتابعة ←" : "Update & Continue"}
                  </span>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Normal Sign In & Role Picker */
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#503C2C]" />
              <span
                className={cn(
                  "text-[10px] font-semibold text-[#503C2C]",
                  isRTL
                    ? "font-sans font-bold tracking-normal"
                    : "font-mono tracking-[0.2em] uppercase"
                )}
              >
                VALENTIA ATELIER AUTH
              </span>
            </div>

            <h3
              className={cn(
                "text-2xl text-foreground",
                isRTL ? "font-sans font-bold" : "font-serif font-medium"
              )}
            >
              {isAuthenticated
                ? isRTL
                  ? "حساب المستخدم الحالي"
                  : "Active Session"
                : isRTL
                  ? "تسجيل الدخول"
                  : "Sign In"}
            </h3>

            {isAuthenticated && user ? (
              <div className="mt-4 flex flex-col gap-4">
                <div className="rounded-2xl border border-[#E2D7C8] bg-[#F4EEE5] p-4 text-xs dark:border-[#2C2C32] dark:bg-[#24242A]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[#1C1917] dark:text-[#FAF7F2]">
                        {user.name || user.username || user.email || "Client"}
                      </h4>
                      <p className="text-[#78716C] dark:text-[#989692]">
                        {user.email}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#1C1917] px-3 py-1 text-[10px] font-semibold tracking-wider text-[#FAF7F2] uppercase dark:bg-[#FAF7F2] dark:text-[#1C1917]">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="cursor-pointer rounded-full border border-rose-300 px-5 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50"
                  >
                    {isRTL ? "تسجيل الخروج" : "Sign Out"}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer rounded-full bg-[#1C1917] px-6 py-2 text-xs font-semibold text-[#FAF7F2] shadow-xs dark:bg-[#FAF7F2] dark:text-[#1C1917]"
                  >
                    {isRTL ? "تمام" : "Done"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p
                  className={cn(
                    "mt-1 text-xs leading-relaxed",
                    isRTL
                      ? "font-medium text-[#4A3E31]"
                      : "text-muted-foreground"
                  )}
                >
                  {isRTL
                    ? "سجل دخولك بحسابك لمتابعة تشطيب وتصميم بيتك والاطلاع على تفاصيل المشروع."
                    : "Sign in to access your fit-out project workspace and track construction progress."}
                </p>

                <form
                  onSubmit={handleLoginSubmit}
                  className="mt-5 flex flex-col gap-3.5"
                >
                  <div>
                    <label
                      className={cn(
                        "mb-1 block text-xs font-semibold text-foreground",
                        isRTL && "font-sans"
                      )}
                    >
                      {isRTL ? "الإيميل" : "Email Address"}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground transition-colors outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label
                      className={cn(
                        "mb-1 block text-xs font-semibold text-foreground",
                        isRTL && "font-sans"
                      )}
                    >
                      {isRTL ? "كلمة السر" : "Password"}
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground transition-colors outline-none focus:border-primary"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-xs font-medium text-rose-600">
                      {errorMsg}
                    </p>
                  )}

                  {redirectMessage && (
                    <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                      <Spinner className="h-3.5 w-3.5" />
                      <span>{redirectMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs text-primary-foreground shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]",
                      isRTL
                        ? "font-sans font-bold tracking-normal"
                        : "font-semibold tracking-[0.14em] uppercase"
                    )}
                  >
                    {isLoading ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <>
                        <span>
                          {isRTL ? "تسجيل الدخول" : "Sign In to Client"}
                        </span>
                        {isRTL ? (
                          <ArrowLeft size={13} weight="bold" />
                        ) : (
                          <ArrowRight size={13} weight="bold" />
                        )}
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
