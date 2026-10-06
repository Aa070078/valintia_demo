"use client";

import * as React from "react";
import Link from "next/link";
import { Role } from "@/lib/types";
import { useAuth } from "@/components/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Buildings,
  UserGear,
  Compass,
  ShieldCheck,
  Crown,
  SignOut,
  Translate,
  List,
  X,
  ArrowSquareOut,
} from "@phosphor-icons/react";

interface DashboardShellProps {
  children: React.ReactNode;
  activeRole?: Role;
}

export function DashboardShell({
  children,
  activeRole,
}: DashboardShellProps) {
  const { user, logout } = useAuth();
  const { language, isRTL, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const effectiveRole = activeRole || user?.role || "ENGINEER";

  const roleConfigs: Record<
    Role,
    { labelAr: string; labelEn: string; icon: React.ReactNode; badgeColor: string }
  > = {
    PROJECT_MANAGER: {
      labelAr: "مكتب إدارة المشروعات",
      labelEn: "Project Management Desk",
      icon: <UserGear className="w-4 h-4" />,
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    },
    ENGINEER: {
      labelAr: "مكتب المهندس المعماري المعتمد",
      labelEn: "Lead Architect & Field Engineer",
      icon: <Compass className="w-4 h-4" />,
      badgeColor: "bg-[#503C2C]/10 text-[#503C2C] border border-[#503C2C]/20 dark:bg-[#FAF7F2]/10 dark:text-[#FAF7F2]",
    },
    ADMINISTRATOR: {
      labelAr: "إدارة النظام والامتثال",
      labelEn: "System Administration & Compliance",
      icon: <ShieldCheck className="w-4 h-4" />,
      badgeColor: "bg-muted text-muted-foreground border border-border",
    },
    COMPANY_OWNER: {
      labelAr: "مكتب المالك والإدارة العليا",
      labelEn: "Company Owner & Executive Office",
      icon: <Crown className="w-4 h-4" />,
      badgeColor: "bg-[#B88460]/15 text-[#8F5A36] border border-[#B88460]/30 dark:bg-[#B88460]/20 dark:text-[#E5D5C5]",
    },
    CUSTOMER: {
      labelAr: "عميل",
      labelEn: "Customer Client",
      icon: <Buildings className="w-4 h-4" />,
      badgeColor: "bg-muted text-muted-foreground",
    },
  };

  const roleInfo = roleConfigs[effectiveRole];
  const userInitials = (user?.username || user?.email || "ST")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-border bg-card/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Brand & Active Workspace Identity */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
              <Buildings className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-semibold tracking-widest uppercase text-foreground">
                VALENTIA
              </span>
              <span className="block text-[9px] font-mono tracking-wider text-muted-foreground uppercase">
                {isRTL ? "منظومة العمليات الهندسية" : "Operations & Fit-Out Desk"}
              </span>
            </div>
          </Link>

          {/* Current Workspace Pill (Strictly Isolated - No switching) */}
          <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/30 text-xs font-mono">
            {roleInfo.icon}
            <span className="font-medium text-foreground">
              {isRTL ? roleInfo.labelAr : roleInfo.labelEn}
            </span>
          </div>
        </div>

        {/* Desktop Header Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Translate className="w-3.5 h-3.5 text-primary" />
            <span>{language === "ar" ? "English" : "العربية"}</span>
          </button>

          {/* Customer Portal Link */}
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <span>{isRTL ? "بوابة العملاء" : "Customer Portal"}</span>
            <ArrowSquareOut className="w-3.5 h-3.5" />
          </a>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-3 ps-3 border-s border-border">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary font-mono">
              {userInitials}
            </div>
            <div className="text-start">
              <span className="block text-xs font-medium text-foreground leading-tight">
                {user?.username || (isRTL ? "عضو الفريق" : "Staff Member")}
              </span>
              <span className="block text-[10px] font-mono text-muted-foreground">
                {user?.role || effectiveRole}
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              title={isRTL ? "تسجيل الخروج" : "Sign Out"}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <SignOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Header Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={toggleLanguage}
            className="p-2 rounded-lg border border-border text-xs font-mono text-muted-foreground"
          >
            {language === "ar" ? "EN" : "عربي"}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-border bg-card text-foreground"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer / Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bg-card border-b border-border p-5 z-40 shadow-lg space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary font-mono">
              {userInitials}
            </div>
            <div className="text-start">
              <span className="block text-sm font-semibold text-foreground">
                {user?.username || (isRTL ? "عضو الفريق" : "Staff Member")}
              </span>
              <span className="block text-xs font-mono text-muted-foreground">
                {isRTL ? roleInfo.labelAr : roleInfo.labelEn}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground"
            >
              <span>{isRTL ? "الانتقال إلى بوابة العملاء" : "Customer Portal"}</span>
              <ArrowSquareOut className="w-4 h-4 text-muted-foreground" />
            </a>

            <button
              type="button"
              onClick={logout}
              className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors"
            >
              <SignOut className="w-4 h-4" />
              <span>{isRTL ? "تسجيل الخروج من المنظومة" : "Sign Out of Workspace"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
