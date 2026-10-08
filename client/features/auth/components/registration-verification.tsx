"use client"

import * as React from "react"
import { authApi } from "../api/auth.api"
import { getErrorMessage } from "@/lib/utils"
import { useLanguage } from "@/lib/i18n/language-context"

export function RegistrationVerification({
  email,
  initialCooldown,
  onVerified,
  onCancel,
}: {
  email: string
  initialCooldown: number
  onVerified: (proof: string) => Promise<void>
  onCancel: () => void
}) {
  const { isRTL } = useLanguage()
  const [code, setCode] = React.useState("")
  const [proof, setProof] = React.useState<string | null>(null)
  const [cooldown, setCooldown] = React.useState(initialCooldown)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState("")
  React.useEffect(() => {
    const timer = window.setInterval(
      () => setCooldown((value) => Math.max(0, value - 1)),
      1000
    )
    return () => window.clearInterval(timer)
  }, [])

  async function verify(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      const token = proof || (await authApi.verifyRegistrationCode(email, code))
      setProof(token)
      await onVerified(token)
    } catch (failure) {
      setError(
        getErrorMessage(failure) ||
          "Could not complete registration. Please try again."
      )
    } finally {
      setBusy(false)
    }
  }
  async function resend() {
    setBusy(true)
    setError("")
    try {
      const result = await authApi.requestRegistrationCode(email)
      setProof(null)
      setCode("")
      setCooldown(result.cooldownSeconds ?? 60)
    } catch (failure) {
      setError(getErrorMessage(failure) || "Could not resend the code.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-registration-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
    >
      <form
        onSubmit={verify}
        className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-background p-6 text-foreground shadow-xl"
      >
        <h2 id="verify-registration-title" className="text-xl font-semibold">
          {isRTL ? "تأكيد البريد الإلكتروني" : "Verify your email"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isRTL ? "أدخل الرمز الذي أرسلناه إلى" : "Enter the code we sent to"}{" "}
          <span dir="ltr">{email}</span>.
        </p>
        {!proof && (
          <div>
            <label htmlFor="registration-code" className="mb-2 block text-sm">
              {isRTL ? "رمز التحقق" : "Verification code"}
            </label>
            <input
              id="registration-code"
              autoFocus
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full rounded-lg border border-border bg-background p-3 text-center text-xl tracking-widest"
            />
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || (!proof && code.length !== 6)}
          className="w-full rounded-xl bg-[#1C1917] p-3.5 text-sm font-medium text-[#FAF7F2] shadow-sm transition-all hover:bg-[#342D28] active:scale-98 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy
            ? isRTL
              ? "جارٍ إنشاء الحساب…"
              : "Creating your account…"
            : isRTL
              ? "تأكيد وإنشاء الحساب"
              : "Verify and create account"}
        </button>
        <div className="flex justify-between text-sm">
          <button type="button" onClick={onCancel} disabled={busy}>
            {isRTL ? "تغيير البريد" : "Change email"}
          </button>
          <button
            type="button"
            onClick={resend}
            disabled={busy || cooldown > 0}
          >
            {cooldown > 0
              ? `${isRTL ? "إعادة الإرسال خلال" : "Resend in"} ${cooldown}s`
              : isRTL
                ? "إعادة إرسال الرمز"
                : "Resend code"}
          </button>
        </div>
      </form>
    </div>
  )
}
