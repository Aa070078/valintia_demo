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
import { FirstLoginPasswordModal } from "@/features/auth/components/first-login-password-modal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
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
          <span>{isRTL ? "ثواني بنتحقق من صلاحيات الدخول..." : "Verifying Operations Security Token..."}</span>
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
          {isRTL ? "لازم تسجل دخول الأول" : "Operations Desk Access Required"}
        </h2>
        <p className="text-xs text-[#6B635B] mb-4">
          {isRTL
            ? "الصفحة دي مخصصة لمهندسي وإدارة فالنتيا، لازم تسجل دخولك الأول. بنحولك دلوقتي..."
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
      labelAr: "مدير المشاريع",
      icon: <UserGear className="w-4 h-4" />,
      path: "/dashboard/pm",
    },
    ENGINEER: {
      label: "Lead Architect & Site Engineer",
      labelAr: "مهندس الموقع",
      icon: <Compass className="w-4 h-4" />,
      path: "/dashboard/engineer",
    },
    COMPANY_OWNER: {
      label: "Owner Executive Desk",
      labelAr: "المالك التنفيذي",
      icon: <Crown className="w-4 h-4" />,
      path: "/dashboard/owner",
    },
    ADMINISTRATOR: {
      label: "System Admin",
      labelAr: "لوحة الأدمن",
      icon: <ShieldCheck className="w-4 h-4" />,
      path: "/dashboard/admin",
    },
    ADMIN: {
      label: "System Admin",
      labelAr: "لوحة الأدمن",
      icon: <ShieldCheck className="w-4 h-4" />,
      path: "/dashboard/admin",
    },
    CUSTOMER: {
      label: "Customer Client",
      labelAr: "حساب العميل",
      icon: <Buildings className="w-4 h-4" />,
      path: "/projects",
    },
  };

  const isExecutive = activeRole === "COMPANY_OWNER" || activeRole === "ADMINISTRATOR" || activeRole === "ADMIN";

  const executiveTabs = [
    {
      id: "owner",
      label: "Executive Desk",
      labelAr: "المكتب التنفيذي",
      icon: <Crown className="w-3.5 h-3.5" />,
      path: "/dashboard/owner",
    },
    {
      id: "pm",
      label: "PM Portfolio",
      labelAr: "إدارة المشاريع",
      icon: <UserGear className="w-3.5 h-3.5" />,
      path: "/dashboard/pm",
    },
    {
      id: "admin",
      label: "System Admin",
      labelAr: "لوحة الأدمن",
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      path: "/dashboard/admin",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      {/* Top Operations Header */}
      <header className="h-16 border-b border-border bg-card/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#1C1917] text-[#FAF7F2] flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <Buildings className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-semibold tracking-widest uppercase text-foreground">
                VALENTIA
              </span>
              <span className="block text-[9px] font-mono tracking-wider text-muted-foreground uppercase">
                {isRTL ? "منظومة التشطيب والعمليات" : "Operations & Fit-Out"}
              </span>
            </div>
          </Link>

          {/* Active Role Badge (Enterprise Identity) */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-secondary/50 text-[11px] font-mono font-medium text-foreground">
            {roleConfigs[activeRole]?.icon}
            <span>{isRTL ? roleConfigs[activeRole]?.labelAr : roleConfigs[activeRole]?.label}</span>
          </div>

          {/* Executive Multi-Desk Navigation (Only for Owner and Admin) */}
          {isExecutive && (
            <div className="hidden lg:flex items-center gap-1 ms-3 p-1 rounded-xl border border-border bg-secondary/30">
              {executiveTabs.map((tab) => {
                const isActive = pathname === tab.path;
                return (
                  <Link
                    key={tab.id}
                    href={tab.path}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[11px] font-mono transition-all flex items-center gap-1.5",
                      isActive
                        ? "bg-card text-foreground font-semibold shadow-2xs border border-border"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                    )}
                  >
                    {tab.icon}
                    <span>{isRTL ? tab.labelAr : tab.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Client Portal Link */}
          <Link
            href="/projects"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground shadow-2xs hover:bg-secondary transition-colors"
          >
            <SquaresFour className="w-3.5 h-3.5" />
            <span>{isRTL ? "صفحة العملاء" : "Client Portal"}</span>
          </Link>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground shadow-2xs hover:bg-secondary cursor-pointer"
          >
            <span className={cn(language === "ar" ? "font-bold text-foreground" : "text-muted-foreground")}>
              عربي
            </span>
            <span className="text-border">|</span>
            <span className={cn(language === "en" ? "font-bold text-foreground" : "text-muted-foreground")}>
              EN
            </span>
          </button>

          {/* User & Sign Out */}
          <div className="flex items-center gap-2 border-s border-border ps-2.5 sm:ps-3">
            <span className="text-xs font-mono font-medium text-foreground hidden md:inline-block">
              {user?.name || (isRTL ? "المهندس" : "Staff")}
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

      {/* Main Dashboard Canvas with Mobile-First padding */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Ergonomic Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border px-3 py-2 flex items-center justify-around shadow-lg">
        <Link
          href={roleConfigs[activeRole]?.path || "/dashboard"}
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-mono transition-colors",
            pathname.startsWith("/dashboard")
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {roleConfigs[activeRole]?.icon || <Buildings className="w-4 h-4" />}
          <span>{isRTL ? "العمليات" : "Dashboard"}</span>
        </Link>

        <Link
          href="/projects"
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-mono transition-colors",
            pathname.startsWith("/projects")
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <SquaresFour className="w-4 h-4" />
          <span>{isRTL ? "العملاء" : "Clients"}</span>
        </Link>

        <button
          type="button"
          onClick={toggleLanguage}
          className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <span className="font-bold text-xs">{language === "ar" ? "EN" : "عربي"}</span>
          <span>{isRTL ? "English" : "عربي"}</span>
        </button>

        <button
          type="button"
          onClick={async () => {
            await logout();
            router.replace("/login");
          }}
          className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-mono text-muted-foreground hover:text-destructive cursor-pointer"
        >
          <SignOut className="w-4 h-4" />
          <span>{isRTL ? "خروج" : "Sign Out"}</span>
        </button>
      </nav>

      {/* Mandatory First-Login Password Modal (Unskippable if mustChangePassword is true) */}
      <FirstLoginPasswordModal
        open={Boolean(user?.mustChangePassword || user?.requiresPasswordChange)}
      />
    </div>
  );
}
