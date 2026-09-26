"use client";

import * as React from "react";
import {
  UserPlus,
  Key,
  Copy,
  Check,
  X,
  Sparkle,
  Eye,
  EyeSlash,
  CircleNotch,
  ShieldCheck,
} from "@phosphor-icons/react";
import { authApi } from "@/features/auth/api/auth.api";
import type { User, UserRole } from "@/features/auth/types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface CreateStaffModalProps {
  open: boolean;
  onClose: () => void;
  onUserCreated: (newUser: User) => void;
}

function getRandomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let pass = "Val#2026@";
  for (let i = 0; i < 4; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

function CreateStaffModalDialog({
  onClose,
  onUserCreated,
}: Omit<CreateStaffModalProps, "open">) {
  const { isRTL } = useLanguage();

  const [name, setName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("ENGINEER");
  const [phone, setPhone] = React.useState("");
  const [temporaryPassword, setTemporaryPassword] = React.useState(getRandomPassword);
  const [showPassword, setShowPassword] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [createdResult, setCreatedResult] = React.useState<{
    user: User;
    temporaryPassword: string;
  } | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const generateRandomPassword = () => {
    setTemporaryPassword(getRandomPassword());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !temporaryPassword) {
      setError(
        isRTL
          ? "يرجى ملء جميع الحقول المطلوبة."
          : "Please complete all required fields."
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await authApi.createStaffUser({
        name: name.trim(),
        username: username.trim(),
        role,
        phone: phone.trim(),
        temporaryPassword,
      });

      setCreatedResult(result);
      onUserCreated(result.user);
    } catch (err: unknown) {
      console.error("Failed to create staff user:", err);
      setError(
        isRTL
          ? "حدث خطأ أثناء إنشاء الحساب. تأكد من عدم تكرار اسم المستخدم."
          : "Failed to create user. Ensure the username is unique."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdResult) return;
    const text = isRTL
      ? `بيانات الدخول إلى منصة فالنتيا:\nاسم المستخدم: ${createdResult.user.username}\nكلمة المرور المؤقتة: ${createdResult.temporaryPassword}\nالصلاحية: ${createdResult.user.role}\nرابط الدخول: https://client-phi-seven-43.vercel.app/login\n\n(ملاحظة: سيُطلب منك تعيين كلمة مرور جديدة فور أول تسجيل دخول)`
      : `Valentia Atelier Credentials:\nUsername: ${createdResult.user.username}\nTemporary Password: ${createdResult.temporaryPassword}\nRole: ${createdResult.user.role}\nLogin URL: https://client-phi-seven-43.vercel.app/login\n\n(Note: You will be prompted to set a permanent password upon first login)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={cn(
          "w-full max-w-lg rounded-3xl bg-[#FAF7F2] border border-[#D8C8B4] p-6 sm:p-8 shadow-2xl relative text-[#1C1917] overflow-hidden",
          isRTL ? "text-right" : "text-left"
        )}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 end-5 p-2 rounded-full border border-[#D8C8B4] text-[#503C2C] hover:text-[#1C1917] hover:bg-white transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1C1917] text-[#FAF7F2] flex items-center justify-center shrink-0 shadow-md">
            <UserPlus className="w-6 h-6 text-[#FAF7F2]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B88460]/15 text-[#503C2C] text-[10px] font-mono uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B88460]" />
              <span>{isRTL ? "إدارة الفريق • صلاحيات القيادة" : "STAFF RBAC PROVISIONING"}</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-normal leading-snug">
              {isRTL ? "إنشاء حساب موظف / مهندس جديد" : "Provision New Staff Account"}
            </h2>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 mb-5">
            {error}
          </div>
        )}

        {createdResult ? (
          /* Credentials Delivery Voucher */
          <div className="space-y-5 animate-in zoom-in-95 duration-200">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" weight="bold" />
              <div>
                <span className="font-semibold block">
                  {isRTL ? "تم إنشاء الحساب بنجاح!" : "Staff Account Created Successfully!"}
                </span>
                <span className="text-[11px] text-emerald-700">
                  {isRTL
                    ? "انسخ بيانات الدخول وسلمها للشخص، وهيطلب منه النظام تغيير كلمة السر عند أول دخول."
                    : "Copy credentials and share with the member. The system will enforce a password update on their first login."}
                </span>
              </div>
            </div>

            {/* Voucher Box */}
            <div className="p-5 rounded-2xl bg-[#F4EDE2] border border-[#D8C8B4] space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#D8C8B4]/60">
                <span className="text-[#6B635B]">{isRTL ? "الاسم الكامل:" : "Full Name:"}</span>
                <span className="font-medium text-[#1C1917]">{createdResult.user.name}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#D8C8B4]/60">
                <span className="text-[#6B635B]">{isRTL ? "اسم المستخدم / الإيميل:" : "Username / Email:"}</span>
                <span className="font-mono font-medium text-[#1C1917]">{createdResult.user.username}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#D8C8B4]/60">
                <span className="text-[#6B635B]">{isRTL ? "الصلاحية في النظام:" : "System Role:"}</span>
                <span className="font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[10px]">
                  {createdResult.user.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B635B]">{isRTL ? "كلمة المرور المؤقتة:" : "Temporary Password:"}</span>
                <span className="font-mono font-bold text-[#B88460] text-sm bg-white px-2.5 py-1 rounded-md border border-[#D8C8B4]">
                  {createdResult.temporaryPassword}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#503C2C] hover:bg-[#342D28] text-[#FAF7F2] text-xs font-medium uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-98"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span>{isRTL ? "تم النسخ للحافظة!" : "Copied to Clipboard!"}</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>{isRTL ? "نسخ بيانات الدخول" : "Copy Credentials"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#D8C8B4] text-xs font-medium text-[#503C2C] hover:bg-white transition-colors cursor-pointer"
              >
                {isRTL ? "إغلاق" : "Done"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-[#503C2C] mb-1.5">
                {isRTL ? "الاسم الكامل للموظف أو المهندس *" : "Full Name *"}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isRTL ? "مثال: م. عمر خالد أو مروان إبراهيم..." : "e.g. Eng. Sarah Mansoor"}
                className="w-full h-10 px-3.5 rounded-xl border border-[#D8C8B4] bg-white text-[#1C1917] text-base sm:text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460]"
              />
            </div>

            {/* Username / Email */}
            <div>
              <label className="block text-xs font-medium text-[#503C2C] mb-1.5">
                {isRTL ? "اسم المستخدم أو الإيميل المؤسسي *" : "Username / Corporate Email *"}
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isRTL ? "omar.khaled@valentia.com" : "sarah.mansoor@valentia.com"}
                className="w-full h-10 px-3.5 rounded-xl border border-[#D8C8B4] bg-white text-[#1C1917] text-base sm:text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460]"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-medium text-[#503C2C] mb-1.5">
                {isRTL ? "الصلاحية والدور في فالنتيا *" : "System Role & Permissions *"}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full h-10 px-3.5 rounded-xl border border-[#D8C8B4] bg-white text-[#1C1917] text-base sm:text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460] cursor-pointer"
              >
                <option value="ENGINEER">
                  {isRTL ? "ENGINEER • مهندس موقع وإشراف ورفع مساحي" : "ENGINEER • Lead Site & Survey Architect"}
                </option>
                <option value="PROJECT_MANAGER">
                  {isRTL ? "PROJECT_MANAGER • مدير مشاريع ومتابعة التنفيذ" : "PROJECT_MANAGER • Delivery & Change Orders"}
                </option>
                <option value="COMPANY_OWNER">
                  {isRTL ? "COMPANY_OWNER • صاحب الشركة والإشراف المالي" : "COMPANY_OWNER • Financial & Strategic Oversight"}
                </option>
                <option value="ADMINISTRATOR">
                  {isRTL ? "ADMINISTRATOR • مدير النظام وصلاحيات كاملة" : "ADMINISTRATOR • Full System Governance"}
                </option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-[#503C2C] mb-1.5">
                {isRTL ? "رقم الهاتف / واتساب" : "Mobile Phone (Optional)"}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 100 123 4567"
                className="w-full h-10 px-3.5 rounded-xl border border-[#D8C8B4] bg-white text-[#1C1917] text-base sm:text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460]"
              />
            </div>

            {/* Temporary Password with Auto-Generate */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#503C2C]">
                  {isRTL ? "كلمة المرور المؤقتة *" : "Temporary Password *"}
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] text-[#B88460] hover:text-[#503C2C] flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Sparkle size={13} weight="fill" />
                  <span>{isRTL ? "توليد كلمة سر عشوائية" : "Auto-Generate"}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={temporaryPassword}
                  onChange={(e) => setTemporaryPassword(e.target.value)}
                  className="w-full h-10 px-3.5 pe-10 rounded-xl border border-[#D8C8B4] bg-white text-[#1C1917] font-mono text-base sm:text-xs focus:outline-none focus:ring-1 focus:ring-[#B88460]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-2.5 text-[#6B635B] hover:text-[#1C1917]"
                >
                  {showPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* First Login Enforced Badge */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
              <Key className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {isRTL
                  ? "تنبيه أمان: هذا الحساب سيلزمه تلقائياً تعيين كلمة مرور جديدة وخاصة به عند أول تسجيل دخول له في النظام."
                  : "Security Note: This account will be automatically required to replace this temporary password on their first login."}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#D8C8B4] text-xs font-medium text-[#503C2C] hover:bg-white transition-colors cursor-pointer"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#503C2C] hover:bg-[#342D28] text-[#FAF7F2] text-xs font-medium uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <CircleNotch size={14} className="animate-spin" />
                    <span>{isRTL ? "جاري الإنشاء..." : "Creating..."}</span>
                  </>
                ) : (
                  <span>{isRTL ? "تأكيد وإنشاء الحساب" : "Create Account"}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function CreateStaffModal({
  open,
  onClose,
  onUserCreated,
}: CreateStaffModalProps) {
  if (!open) return null;
  return (
    <CreateStaffModalDialog
      onClose={onClose}
      onUserCreated={onUserCreated}
    />
  );
}
