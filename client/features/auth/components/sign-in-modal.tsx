"use client";

import * as React from "react";
import {
  X,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  ArrowSquareOut,
  Sparkle,
} from "@phosphor-icons/react";
import { useAuth } from "../context/auth-context";
import type { UserRole } from "../types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
}

export function SignInModal({ open, onClose }: SignInModalProps) {
  const { t, isRTL } = useLanguage();
  const {
    user,
    isAuthenticated,
    requiresPasswordChange,
    login,
    logout,
    changePassword,
    devSwitchRole,
    isLoading,
  } = useAuth();

  const [email, setEmail] = React.useState("tarek.mansour@example.com");
  const [password, setPassword] = React.useState("password123");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [redirectMessage, setRedirectMessage] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  if (!open) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setRedirectMessage(null);

    try {
      const result = await login({ email, password });
      if (result.redirectUrl) {
        setRedirectMessage(
          isRTL
            ? "تم تسجيل الدخول بنجاح بصلاحية داخلية. جارٍ التوجيه إلى لوحة تحكم العمليات..."
            : "Authenticated as internal role. Redirecting to Valentia Operations Dashboard..."
        );
        setTimeout(() => {
          window.location.href = result.redirectUrl!;
        }, 1200);
      } else {
        onClose();
      }
    } catch {
      setErrorMsg(
        isRTL
          ? "فشل تسجيل الدخول. يرجى التحقق من البريد وكلمة المرور."
          : "Authentication failed. Please check credentials."
      );
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMsg(
        isRTL
          ? "يجب أن تكون كلمة المرور 8 أحرف على الأقل."
          : "Password must be at least 8 characters long."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(
        isRTL
          ? "كلمتا المرور غير متطابقتين."
          : "Passwords do not match."
      );
      return;
    }

    try {
      await changePassword({ newPassword });
      setErrorMsg(null);
      onClose();
    } catch {
      setErrorMsg("Failed to update password.");
    }
  };

  const handleRoleQuickPick = async (role: UserRole) => {
    setErrorMsg(null);
    setRedirectMessage(null);
    const result = await devSwitchRole(role);
    if (result.redirectUrl) {
      setRedirectMessage(
        isRTL
          ? `تم التبديل إلى دور (${role}). جارٍ التوجيه إلى لوحة العمليات الداخلية...`
          : `Switched to ${role}. Redirecting to internal dashboard...`
      );
      setTimeout(() => {
        window.location.href = result.redirectUrl!;
      }, 1200);
    } else {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-opacity"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl text-start">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute top-4 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer transition-colors",
            isRTL ? "left-4" : "right-4"
          )}
        >
          <X size={15} weight="bold" />
        </button>

        {/* Temporary Password Change Screen */}
        {requiresPasswordChange ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lock size={18} className="text-[#503C2C]" />
              <span className={cn(
                "text-[10px] font-semibold text-[#503C2C]",
                isRTL ? "tracking-normal font-sans font-bold" : "font-mono uppercase tracking-[0.2em]"
              )}>
                {t("auth.password_change_required") || (isRTL ? "تنبيه أمني" : "Security Notice")}
              </span>
            </div>
            <h3 className={cn(
              "text-2xl text-foreground",
              isRTL ? "font-sans font-bold" : "font-serif font-medium"
            )}>
              {t("auth.create_new_password") || (isRTL ? "تعيين كلمة المرور الدائمة" : "Set Your Permanent Password")}
            </h3>
            <p className={cn(
              "mt-1 text-xs leading-relaxed",
              isRTL ? "font-medium text-[#4A3E31]" : "text-muted-foreground"
            )}>
              {t("auth.temp_password_desc") ||
                (isRTL
                  ? "لقد قمت بتسجيل الدخول باستخدام كلمة مرور مؤقتة. يرجى تعيين كلمة مرور جديدة وآمنة لحسابك للمتابعة."
                  : "You logged in with a temporary password. Please set a secure password for your Valentia account to proceed.")}
            </p>

            <form onSubmit={handlePasswordChangeSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label className={cn(
                  "block text-xs font-semibold text-foreground mb-1",
                  isRTL && "font-sans"
                )}>
                  {isRTL ? "كلمة المرور الجديدة *" : "New Password *"}
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isRTL ? "٨ أحرف على الأقل" : "Minimum 8 characters"}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className={cn(
                  "block text-xs font-semibold text-foreground mb-1",
                  isRTL && "font-sans"
                )}>
                  {isRTL ? "تأكيد كلمة المرور *" : "Confirm Password *"}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isRTL ? "أعد إدخال كلمة المرور" : "Re-type new password"}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary transition-colors"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "mt-2 flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs text-primary-foreground shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer",
                  isRTL ? "tracking-normal font-sans font-bold" : "font-semibold uppercase tracking-[0.14em]"
                )}
              >
                {isLoading ? <Spinner className="h-4 w-4" /> : <span>{isRTL ? "تحديث والمتابعة" : "Update & Continue"}</span>}
              </button>
            </form>
          </div>
        ) : (
          /* Normal Sign In & Role Picker */
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={18} className="text-[#503C2C]" />
              <span className={cn(
                "text-[10px] font-semibold text-[#503C2C]",
                isRTL ? "tracking-normal font-sans font-bold" : "font-mono uppercase tracking-[0.2em]"
              )}>
                VALENTIA ATELIER AUTH
              </span>
            </div>

            <h3 className={cn(
              "text-2xl text-foreground",
              isRTL ? "font-sans font-bold" : "font-serif font-medium"
            )}>
              {isAuthenticated
                ? isRTL
                  ? "حساب المستخدم النشط"
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
                      <h4 className="font-semibold text-sm text-[#1C1917] dark:text-[#FAF7F2]">
                        {user.name}
                      </h4>
                      <p className="text-[#78716C] dark:text-[#989692]">{user.email}</p>
                    </div>
                    <span className="rounded-full bg-[#1C1917] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#FAF7F2] dark:bg-[#FAF7F2] dark:text-[#1C1917]">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="rounded-full border border-rose-300 px-5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    {isRTL ? "تسجيل الخروج" : "Sign Out"}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full bg-[#1C1917] px-6 py-2 text-xs font-semibold text-[#FAF7F2] shadow-xs cursor-pointer dark:bg-[#FAF7F2] dark:text-[#1C1917]"
                  >
                    {isRTL ? "إغلاق" : "Done"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className={cn(
                  "mt-1 text-xs leading-relaxed",
                  isRTL ? "font-medium text-[#4A3E31]" : "text-muted-foreground"
                )}>
                  {isRTL
                    ? "سجل الدخول بحساب العميل لمتابعة مشاريعك، أو اختر دوراً للاختبار السريع."
                    : "Sign in with your customer account, or pick a role to test post-login routing."}
                </p>

                <form onSubmit={handleLoginSubmit} className="mt-5 flex flex-col gap-3.5">
                  <div>
                    <label className={cn("block text-xs font-semibold text-foreground mb-1", isRTL && "font-sans")}>
                      {isRTL ? "البريد الإلكتروني" : "Email Address"}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className={cn("block text-xs font-semibold text-foreground mb-1", isRTL && "font-sans")}>
                      {isRTL ? "كلمة المرور" : "Password"}
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>
                  )}

                  {redirectMessage && (
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                      <Spinner className="h-3.5 w-3.5" />
                      <span>{redirectMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "mt-2 flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs text-primary-foreground shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer",
                      isRTL ? "tracking-normal font-sans font-bold" : "font-semibold uppercase tracking-[0.14em]"
                    )}
                  >
                    {isLoading ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <>
                        <span>{isRTL ? "تسجيل الدخول" : "Sign In to Client"}</span>
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

            {/* Development-Only Role Switcher */}
            <div className="mt-6 border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className={cn(
                  "text-[9px] font-semibold flex items-center gap-1 text-[#503C2C]",
                  isRTL ? "tracking-normal font-sans font-bold" : "font-mono uppercase tracking-[0.18em]"
                )}>
                  <Sparkle size={11} weight="fill" />
                  <span>{isRTL ? "تبديل الصلاحيات (تجريبي للتطوير)" : "DEVELOPMENT ROLE SWITCHER (PROTOTYPE)"}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(["CUSTOMER", "ENGINEER", "PROJECT_MANAGER", "ADMIN"] as UserRole[]).map((r) => {
                  const isCurrent = user?.role === r;
                  const isInternal = r !== "CUSTOMER";
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleQuickPick(r)}
                      className={cn(
                        "flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer",
                        isCurrent
                          ? "border-primary bg-primary text-primary-foreground font-bold shadow-xs"
                          : "border-border bg-background text-foreground hover:border-foreground/50 hover:bg-secondary font-medium"
                      )}
                    >
                      <span className="text-[10px] font-bold tracking-tight">{r}</span>
                      <span className="text-[8px] opacity-70 flex items-center gap-0.5 mt-0.5">
                        {isInternal ? (
                          <>
                            <span>Dashboard</span>
                            <ArrowSquareOut size={8} />
                          </>
                        ) : (
                          "Client App"
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
