"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Buildings,
  Lock,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  Spinner,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  WarningCircle,
  Translate,
} from "@phosphor-icons/react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { language, isRTL, toggleLanguage } = useLanguage();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // If already authenticated, redirect immediately
  React.useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (redirectParam) {
        router.replace(redirectParam);
      } else {
        if (user.role === "ENGINEER") router.replace("/engineer");
        else if (user.role === "PROJECT_MANAGER") router.replace("/pm");
        else router.replace("/admin");
      }
    } else if (!authLoading && !isAuthenticated) {
      // Forward to the unified client login page
      const targetRedirect = redirectParam
        ? (redirectParam.startsWith("http") ? redirectParam : `http://localhost:3001${redirectParam}`)
        : "http://localhost:3001/engineer";
      window.location.href = `http://localhost:3000/login?redirect=${encodeURIComponent(targetRedirect)}`;
    }
  }, [authLoading, isAuthenticated, user, router, redirectParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(
        isRTL
          ? "يرجى إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور."
          : "Please enter your email/username and password."
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login({
        email: email.trim(),
        password,
      });

      const destination = redirectParam || res.redirectUrl;
      router.push(destination);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("invalid credentials")) {
        setError(
          isRTL
            ? "بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور."
            : "Invalid credentials. Please verify your email and password."
        );
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setError(null);
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans">
      {/* Top Bar with Brand & Language Toggle */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
            <Buildings className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-semibold tracking-widest uppercase text-foreground">
              VALENTIA
            </span>
            <span className="block text-[9px] font-mono tracking-wider text-muted-foreground uppercase">
              {isRTL ? "منظومة العمليات والتشطيب المعماري" : "Operations & Fit-Out Desk"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleLanguage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Translate className="w-3.5 h-3.5 text-primary" />
          <span>{language === "ar" ? "English" : "العربية"}</span>
        </button>
      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1.5 text-center sm:text-start">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-mono mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isRTL ? "تسجيل دخول الكوادر المصرح لهم" : "Authorized Staff Access Only"}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-semibold text-foreground">
              {isRTL ? "مرحباً بك في بوابة فالنتيا" : "Sign in to Valentia Desk"}
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isRTL
                ? "سجّل دخولك بحسابك المهني المعتمد للوصول إلى مساحة عملك الفنية والتشغيلية."
                : "Enter your registered credentials to access your designated workspace."}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 animate-in fade-in">
              <WarningCircle className="w-4 h-4 shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground">
                {isRTL ? "البريد الإلكتروني المهني أو اسم المستخدم" : "Work Email or Identifier"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-muted-foreground">
                  <EnvelopeSimple className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isRTL ? "name@company.com" : "engineer1@test.com"}
                  className="w-full h-11 ps-9 pe-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground">
                {isRTL ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 ps-9 pe-10 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 pe-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlash className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs mt-2"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? "جاري التحقق والمصادقة..." : "Authenticating..."}</span>
                </>
              ) : (
                <>
                  <span>{isRTL ? "تسجيل الدخول إلى مساحة العمل" : "Sign In to Workspace"}</span>
                  <ArrowIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Test Chips for QA / Local Validation */}
          <div className="border-t border-border/70 pt-4 space-y-2">
            <span className="block text-[10px] font-mono uppercase text-muted-foreground">
              {isRTL ? "حسابات التحقق التجريبية المعتمدة:" : "Available Seeded Roles (One-Click Fill):"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill("engineer1@test.com", "Engineer123!")}
                className="px-2.5 py-1 rounded-lg border border-border bg-muted/40 hover:bg-muted text-[11px] font-mono text-foreground transition-colors cursor-pointer"
              >
                👷 {isRTL ? "مهندس معماري" : "Engineer"}
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("pm@test.com", "ProjectManager123!")}
                className="px-2.5 py-1 rounded-lg border border-border bg-muted/40 hover:bg-muted text-[11px] font-mono text-foreground transition-colors cursor-pointer"
              >
                📋 {isRTL ? "مدير مشروعات" : "PM"}
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("admin@test.com", "Admin123!")}
                className="px-2.5 py-1 rounded-lg border border-border bg-muted/40 hover:bg-muted text-[11px] font-mono text-foreground transition-colors cursor-pointer"
              >
                🛡️ {isRTL ? "مسؤول النظام" : "Admin"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="w-full max-w-5xl mx-auto text-center text-[10px] font-mono text-muted-foreground">
        VALENTIA ATELIER PLATFORM · ENTERPRISE RBAC &amp; SECURITY ENFORCED
      </div>
    </div>
  );
}

export default function StaffLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Spinner className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs font-mono text-muted-foreground">
              Loading Valentia Desk...
            </span>
          </div>
        </div>
      }
    >
      <LoginFormContent />
    </React.Suspense>
  );
}

