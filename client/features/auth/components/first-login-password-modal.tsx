"use client";

import * as React from "react";
import {
  Lock,
  ShieldCheck,
  Eye,
  EyeSlash,
  SignOut,
  CircleNotch,
  CheckCircle,
} from "@phosphor-icons/react";
import { useAuth } from "../context/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface FirstLoginPasswordModalProps {
  open: boolean;
  onSuccess?: () => void;
}

export function FirstLoginPasswordModal({ open, onSuccess }: FirstLoginPasswordModalProps) {
  const { user, changePassword, logout } = useAuth();
  const { isRTL } = useLanguage();

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 6) {
      setError(
        isRTL
          ? "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف أو أرقام."
          : "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        isRTL
          ? "كلمة المرور وتأكيد كلمة المرور غير متطابقين."
          : "New password and confirmation do not match."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err: unknown) {
      console.error("Failed to update password:", err);
      setError(
        isRTL
          ? "حدث خطأ أثناء تحديث كلمة المرور. يرجى المحاولة مرة أخرى."
          : "Failed to update password. Please verify current password and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={cn(
          "w-full max-w-lg rounded-3xl bg-[#FAF7F2] border border-[#D8C8B4] p-6 sm:p-8 shadow-2xl relative text-[#1C1917] overflow-hidden",
          isRTL ? "text-right" : "text-left"
        )}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#B88460]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header Lockup */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#503C2C] text-[#FAF7F2] flex items-center justify-center shrink-0 shadow-md">
            <Lock className="w-6 h-6 text-[#FAF7F2]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B88460]/15 text-[#503C2C] text-[10px] font-mono uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B88460]" />
              <span>{isRTL ? "أول تسجيل دخول • أمان الحساب" : "FIRST LOGIN • SECURITY PROTOCOL"}</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-normal leading-snug">
              {isRTL ? "تحديث كلمة المرور المؤقتة" : "Mandatory Password Update"}
            </h2>
          </div>
        </div>

        {/* Context / Informational Callout */}
        <div className="p-4 rounded-2xl bg-[#F4EDE2] border border-[#E6DDD2] mb-6 text-xs text-[#503C2C] leading-relaxed">
          <p>
            {isRTL ? (
              <>
                أهلاً بك يا <strong>{user?.name}</strong>. تم إنشاء حسابك بصلاحية{" "}
                <span className="font-mono font-bold text-[#B88460]">{user?.role}</span> بكلمة مرور مؤقتة من إدارة فالنتيا.
                لدواعي أمان النظام وسرية المشاريع، يرجى تعيين كلمة مرور شخصية جديدة لتفعيل دخولك للوحة التحكم.
              </>
            ) : (
              <>
                Welcome, <strong>{user?.name}</strong>. Your account with role{" "}
                <span className="font-mono font-bold text-[#B88460]">{user?.role}</span> was provisioned with a temporary
                password. For security compliance, please set your personal permanent password to proceed.
              </>
            )}
          </p>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 mb-5 animate-in fade-in duration-200">
            {error}
          </div>
        )}

        {/* Success Feedback */}
        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in zoom-in-95 duration-200">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" weight="fill" />
            <h3 className="font-serif text-lg font-medium text-emerald-900">
              {isRTL ? "تم تحديث كلمة المرور بنجاح!" : "Password Successfully Updated!"}
            </h3>
            <p className="text-xs text-emerald-700">
              {isRTL ? "جاري تفعيل حسابك وفتح لوحة العمليات..." : "Unlocking your atelier workspace..."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current / Temporary Password */}
            <div>
              <label className="block text-xs font-medium text-[#503C2C] mb-1.5">
                {isRTL ? "كلمة المرور المؤقتة الحالية" : "Current Temporary Password"}
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={isRTL ? "اكتب كلمة السر المؤقتة..." : "Enter temporary password..."}
                className="w-full h-11 px-3.5 rounded-xl border border-[#D8C8B4] bg-white text-[#1C1917] text-base sm:text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460] touch-manipulation"
              />
            </div>

            {/* New Permanent Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#503C2C]">
                  {isRTL ? "كلمة المرور الجديدة الخاصة بك" : "New Permanent Password"}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-[#B88460] hover:text-[#503C2C] flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeSlash size={13} /> : <Eye size={13} />}
                  <span>{showPassword ? (isRTL ? "إخفاء" : "Hide") : (isRTL ? "إظهار" : "Show")}</span>
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={isRTL ? "اكتب كلمة سر قوية (6 رموز على الأقل)..." : "Minimum 6 characters..."}
                className="w-full h-11 px-3.5 rounded-xl border border-[#D8C8B4] bg-white text-[#1C1917] text-base sm:text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460] touch-manipulation"
              />
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-medium text-[#503C2C] mb-1.5">
                {isRTL ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isRTL ? "أعد كتابة كلمة السر الجديدة..." : "Re-enter new password..."}
                className="w-full h-11 px-3.5 rounded-xl border border-[#D8C8B4] bg-white text-[#1C1917] text-base sm:text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460] touch-manipulation"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => logout()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#D8C8B4] text-xs font-medium text-[#503C2C] hover:bg-white transition-colors cursor-pointer touch-manipulation"
              >
                <SignOut size={14} />
                <span>{isRTL ? "تسجيل الخروج الآن" : "Sign Out"}</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#503C2C] hover:bg-[#342D28] text-[#FAF7F2] text-xs font-medium uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-98 disabled:opacity-50 touch-manipulation"
              >
                {isSubmitting ? (
                  <>
                    <CircleNotch size={14} className="animate-spin" />
                    <span>{isRTL ? "جاري التحديث..." : "Updating..."}</span>
                  </>
                ) : (
                  <span>{isRTL ? "تحديث وتأكيد كلمة المرور" : "Update Password & Continue"}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
