"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import {
  Buildings,
  UserGear,
  Compass,
  ShieldCheck,
  Crown,
  CircleNotch,
  Lock,
  SignOut,
  SquaresFour,
} from "@phosphor-icons/react";
import type { UserRole } from "@/features/auth/types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, devSwitchRole, logout } = useAuth();
  const { isRTL, language, toggleLanguage } = useLanguage();

  const activeRole: UserRole = user?.role || "PROJECT_MANAGER";

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#ECE3D5] text-[#1C1917] p-6">
        <div className="w-12 h-12 rounded-full bg-[#1C1917] text-[#FAF7F2] flex items-center justify-center mb-4 shadow-lg animate-pulse">
          <Buildings className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#503C2C]">
          <CircleNotch className="w-3.5 h-3.5 animate-spin" />
          <span>{isRTL ? "جارٍ التحقق من صلاحيات الأتيليه..." : "Verifying Operations Security Token..."}</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#ECE3D5] text-[#1C1917] p-6">
        <div className="w-12 h-12 rounded-full bg-[#DFD3C1] text-[#503C2C] flex items-center justify-center mb-4 shadow-md">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-2xl font-normal mb-2">
          {isRTL ? "تسجيل الدخول مطلوب" : "Operations Desk Access Required"}
        </h2>
        <p className="text-xs text-[#6B635B] mb-4">
          {isRTL
            ? "لا يمكن الوصول إلى لوحات تحكم الإشراف الهندسي والإدارة دون تسجيل الدخول. جارٍ توجيهك..."
            : "Staff credentials required to access the fit-out operations desk. Redirecting..."}
        </p>
      </div>
    );
  }

  const roleConfigs: Record<
    UserRole,
    { label: string; labelAr: string; icon: React.ReactNode; path: string }
  > = {
    PROJECT_MANAGER: {
      label: "PM Desk",
      labelAr: "إدارة المشاريع",
      icon: <UserGear className="w-4 h-4" />,
      path: "/dashboard/pm",
    },
    ENGINEER: {
      label: "Lead Architect & Site Engineer",
      labelAr: "الإشراف الهندسي الميداني",
      icon: <Compass className="w-4 h-4" />,
      path: "/dashboard/engineer",
    },
    ADMINISTRATOR: {
      label: "System Admin",
      labelAr: "إدارة النظام والرقابة",
      icon: <ShieldCheck className="w-4 h-4" />,
      path: "/dashboard/admin",
    },
    ADMIN: {
      label: "System Admin",
      labelAr: "إدارة النظام والرقابة",
      icon: <ShieldCheck className="w-4 h-4" />,
      path: "/dashboard/admin",
    },
    COMPANY_OWNER: {
      label: "Company Owner",
      labelAr: "الإدارة التنفيذية",
      icon: <Crown className="w-4 h-4" />,
      path: "/dashboard/admin",
    },
    CUSTOMER: {
      label: "Customer Client",
      labelAr: "بوابة العميل",
      icon: <Buildings className="w-4 h-4" />,
      path: "/projects",
    },
  };

  const handleRoleSelect = async (role: UserRole) => {
    await devSwitchRole(role);
    if (role === "PROJECT_MANAGER") router.push("/dashboard/pm");
    else if (role === "ENGINEER") router.push("/dashboard/engineer");
    else if (role === "ADMINISTRATOR" || role === "ADMIN" || role === "COMPANY_OWNER") router.push("/dashboard/admin");
    else if (role === "CUSTOMER") router.push("/projects");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      {/* Top Operations Header */}
      <header className="h-16 border-b border-border bg-card/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#1C1917] text-[#FAF7F2] flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <Buildings className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-semibold tracking-widest uppercase text-foreground">
                VALENTIA
              </span>
              <span className="block text-[9px] font-mono tracking-wider text-muted-foreground uppercase">
                {isRTL ? "مكتب العمليات والإشراف الميداني" : "Operations & Fit-Out Desk"}
              </span>
            </div>
          </Link>

          {/* Quick Role Switcher Pills for Testing Personas */}
          <div className="hidden lg:flex items-center gap-1.5 ms-6 p-1 rounded-xl border border-border bg-secondary/50">
            {(
              [
                "PROJECT_MANAGER",
                "ENGINEER",
                "ADMINISTRATOR",
                "COMPANY_OWNER",
                "CUSTOMER",
              ] as UserRole[]
            ).map((r) => {
              const cfg = roleConfigs[r];
              const isSelected = activeRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5",
                    isSelected
                      ? "bg-card text-foreground font-semibold shadow-2xs ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                  )}
                  title={`Switch persona to ${cfg.label}`}
                >
                  {cfg.icon}
                  <span>{isRTL ? cfg.labelAr : cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Client Portal Link */}
          <Link
            href="/projects"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground shadow-2xs hover:bg-secondary transition-colors"
          >
            <SquaresFour className="w-3.5 h-3.5" />
            <span>{isRTL ? "بوابة العملاء" : "Client Portal"}</span>
          </Link>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card text-xs font-medium text-foreground shadow-2xs hover:bg-secondary cursor-pointer"
          >
            <span className={cn(language === "en" ? "font-bold text-foreground" : "text-muted-foreground")}>
              EN
            </span>
            <span className="text-border">|</span>
            <span className={cn(language === "ar" ? "font-bold text-foreground" : "text-muted-foreground")}>
              عربي
            </span>
          </button>

          {/* User & Sign Out */}
          <div className="flex items-center gap-2 border-s border-border ps-3">
            <span className="text-xs font-mono font-medium text-foreground hidden md:inline-block">
              {user?.name || "Architect"}
            </span>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              title={isRTL ? "تسجيل الخروج" : "Sign Out"}
            >
              <SignOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
