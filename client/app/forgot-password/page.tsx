"use client"

import * as React from "react"
import Link from "next/link"
import { authApi } from "@/features/auth/api/auth.api"
import { getErrorMessage } from "@/lib/utils"
import { useLanguage } from "@/lib/i18n/language-context"

export default function ForgotPasswordPage() {
  const { isRTL } = useLanguage()
  const [step, setStep] = React.useState<
    "EMAIL" | "CODE" | "PASSWORD" | "DONE"
  >("EMAIL")
  const [email, setEmail] = React.useState("")
  const [code, setCode] = React.useState("")
  const [proof, setProof] = React.useState<string | null>(null)
  const [password, setPassword] = React.useState("")
  const [confirmation, setConfirmation] = React.useState("")
  const [cooldown, setCooldown] = React.useState(0)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    const timer = window.setInterval(
      () => setCooldown((value) => Math.max(0, value - 1)),
      1000
    )
    return () => window.clearInterval(timer)
  }, [])

  async function sendCode() {
    await authApi.requestPasswordReset(email)
    setEmail(email.trim().toLowerCase())
    setCooldown(60)
    setCode("")
    setProof(null)
    setStep("CODE")
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      if (step === "EMAIL") await sendCode()
      else if (step === "CODE") {
        setProof(await authApi.verifyPasswordReset(email, code))
        setStep("PASSWORD")
      } else if (step === "PASSWORD") {
        if (!proof) throw new Error("Please request and verify a new code.")
        if (password !== confirmation)
          throw new Error("Passwords do not match.")
        await authApi.resetPassword(proof, password)
        setProof(null)
        setPassword("")
        setConfirmation("")
        setStep("DONE")
      }
    } catch (failure) {
      setError(
        getErrorMessage(failure) ||
          "Could not reset your password. Please try again."
      )
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    setBusy(true)
    setError("")
    try {
      await sendCode()
    } catch (failure) {
      setError(getErrorMessage(failure) || "Could not request a new code.")
    } finally {
      setBusy(false)
    }
  }

  const fieldClass =
    "mt-2 w-full rounded-lg border border-border bg-background p-3"

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <section className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-7 shadow-lg">
        <p className="text-sm tracking-widest text-muted-foreground">
          VALENTIA
        </p>
        <h1 className="text-2xl font-semibold">
          {step === "DONE"
            ? isRTL
              ? "تم تغيير كلمة المرور"
              : "Password updated"
            : isRTL
              ? "استعادة كلمة المرور"
              : "Reset your password"}
        </h1>
        {step === "CODE" && (
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? "إذا كان الحساب مؤهلاً لاستعادة كلمة المرور، فسيصلك رمز على بريدك. تحقق من البريد الوارد والرسائل غير المرغوب فيها."
              : "If the account is eligible for recovery, a code will arrive by email. Check your inbox and spam folder."}
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {step !== "DONE" && (
          <form onSubmit={submit} className="space-y-4">
            {step === "EMAIL" && (
              <label className="block text-sm" htmlFor="reset-email">
                {isRTL ? "البريد الإلكتروني" : "Email address"}
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={fieldClass}
                />
              </label>
            )}
            {step === "CODE" && (
              <label className="block text-sm" htmlFor="reset-code">
                {isRTL ? "رمز التحقق" : "Verification code"}
                <input
                  id="reset-code"
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className={fieldClass}
                />
              </label>
            )}
            {step === "PASSWORD" && (
              <>
                <label className="block text-sm" htmlFor="reset-password">
                  {isRTL ? "كلمة المرور الجديدة" : "New password"}
                  <input
                    id="reset-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={fieldClass}
                  />
                </label>
                <label className="block text-sm" htmlFor="reset-confirmation">
                  {isRTL ? "تأكيد كلمة المرور" : "Confirm password"}
                  <input
                    id="reset-confirmation"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    className={fieldClass}
                  />
                </label>
              </>
            )}
            <button
              disabled={busy}
              className="w-full rounded-lg bg-primary p-3 text-primary-foreground disabled:opacity-50"
            >
              {busy
                ? isRTL
                  ? "جارٍ المتابعة…"
                  : "Please wait…"
                : step === "EMAIL"
                  ? isRTL
                    ? "إرسال الرمز"
                    : "Send code"
                  : step === "CODE"
                    ? isRTL
                      ? "تأكيد الرمز"
                      : "Verify code"
                    : isRTL
                      ? "حفظ كلمة المرور"
                      : "Save password"}
            </button>
          </form>
        )}
        {step === "CODE" && (
          <button
            onClick={resend}
            disabled={busy || cooldown > 0}
            className="text-sm text-primary disabled:opacity-50"
          >
            {cooldown > 0
              ? `${isRTL ? "إعادة الإرسال خلال" : "Resend in"} ${cooldown}s`
              : isRTL
                ? "إعادة إرسال الرمز"
                : "Resend code"}
          </button>
        )}
        {(step === "CODE" || step === "PASSWORD") && (
          <button
            disabled={busy}
            className="block text-sm text-muted-foreground"
            onClick={() => {
              setProof(null)
              setError("")
              setStep("EMAIL")
            }}
          >
            {isRTL ? "البدء من جديد" : "Start again"}
          </button>
        )}
        <Link href="/login" className="block text-sm text-primary underline">
          {isRTL ? "العودة لتسجيل الدخول" : "Back to sign in"}
        </Link>
      </section>
    </main>
  )
}
