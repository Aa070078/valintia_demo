"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, getDefaultPathForRole } from "./auth-context";
import { Role } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/language-context";
import { ShieldWarning, Spinner, Buildings, ArrowLeft, ArrowRight, SignOut } from "@phosphor-icons/react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { isRTL } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectQuery = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${redirectQuery}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
            <Buildings className="w-6 h-6" />
          </div>
          <div className="text-center space-y-1">
            <span className="block text-xs font-semibold tracking-widest uppercase text-foreground">
              VALENTIA
            </span>
            <span className="block text-[10px] font-mono tracking-wider text-muted-foreground uppercase">
              Operations &amp; Security Desk
            </span>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground font-mono">
            <Spinner className="w-4 h-4 animate-spin text-primary" />
            <span>
              {isRTL
                ? "جاري التحقق من الصلاحيات الأمنية..."
                : "Authenticating staff credentials..."}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, the useEffect will redirect; return null during redirection
  if (!isAuthenticated || !user) {
    return null;
  }

  // Role validation check (Least Privilege & Boundary Isolation)
  const isAuthorized = allowedRoles.includes(user.role);

  if (!isAuthorized) {
    const defaultAuthorizedPath = getDefaultPathForRole(user.role);
    const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <ShieldWarning className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-serif font-semibold text-foreground">
              {isRTL
                ? "غير مصرح لك بالوصول إلى هذه المساحة"
                : "Restricted Access · Unauthorized"}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isRTL
                ? `حسابك مسجل حالياً بصلاحية (${user.role}). لا تملك صلاحية الوصول إلى هذه المساحة التشغيلية المخصصة للأدوار: [${allowedRoles.join(
                    ", "
                  )}].`
                : `Your account is authenticated as (${user.role}). This operational area is strictly restricted to roles: [${allowedRoles.join(
                    ", "
                  )}].`}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => router.push(defaultAuthorizedPath)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <span>
                {isRTL
                  ? "الانتقال إلى مساحة عملك المصرح بها"
                  : "Go to Your Authorized Workspace"}
              </span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <SignOut className="w-3.5 h-3.5" />
              <span>{isRTL ? "تسجيل الخروج" : "Sign Out"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized for this route
  return <>{children}</>;
}
