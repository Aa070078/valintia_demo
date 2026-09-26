"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Plus, List, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { useAuth } from "@/features/auth/context/auth-context";
import { SignInModal } from "@/features/auth/components/sign-in-modal";

export function CustomerHeader() {
  const pathname = usePathname();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { user, isAuthenticated, role } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-10">
        {/* Brand Lockup */}
        <Link href="/projects" className="flex items-center gap-3.5 group cursor-pointer">
          {/* Architectural Chevron Icon */}
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/5 transition-transform duration-300 group-hover:scale-105 border border-foreground/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 text-foreground stroke-current"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 20L12 4L20 20" />
              <path d="M8 14L16 14" opacity="0.3" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "font-sans font-medium text-foreground transition-colors group-hover:opacity-80",
              isRTL ? "text-sm font-medium tracking-normal" : "text-[13px] tracking-[0.28em] font-semibold"
            )}>
              {t("brand.name")}
            </span>
            <span className={cn(
              "text-muted-foreground",
              isRTL ? "text-[10px] font-normal tracking-normal text-[#503C2C]" : "text-[9px] uppercase tracking-[0.22em] font-medium"
            )}>
              {t("brand.tagline")}
            </span>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/projects"
            className={cn(
              "relative py-1 transition-all duration-200 hover:-translate-y-0.5",
              isRTL ? "text-xs font-normal" : "text-xs font-semibold uppercase tracking-[0.16em]",
              pathname === "/projects" ||
                (pathname.startsWith("/projects/") &&
                  pathname !== "/projects/new")
                ? "text-foreground font-medium after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-foreground after:rounded-full"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("nav.portfolio")}
          </Link>
          <Link
            href="/projects/new"
            className={cn(
              "relative py-1 transition-all duration-200 hover:-translate-y-0.5",
              isRTL ? "text-xs font-normal" : "text-xs font-semibold uppercase tracking-[0.16em]",
              pathname === "/projects/new"
                ? "text-foreground font-medium after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-foreground after:rounded-full"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("nav.start_project")}
          </Link>

          {/* Operations Desk Link for Staff */}
          {isAuthenticated && role !== "CUSTOMER" && (
            <Link
              href={role === "ENGINEER" ? "/dashboard/engineer" : role === "PROJECT_MANAGER" ? "/dashboard/pm" : "/dashboard/admin"}
              className={cn(
                "relative py-1 transition-all duration-200 hover:-translate-y-0.5",
                isRTL ? "text-xs font-normal text-[#B88460]" : "text-xs font-semibold uppercase tracking-[0.16em] text-[#B88460]",
                pathname.startsWith("/dashboard")
                  ? "text-[#B88460] font-medium after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#B88460] after:rounded-full"
                  : "text-[#B88460]/80 hover:text-[#B88460]"
              )}
            >
              {isRTL ? "لوحة العمليات" : "Operations Desk"}
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-5">
          <Link
            href="/projects/new"
            className={cn(
              "hidden sm:inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-primary-foreground shadow-xs transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.97]",
              isRTL ? "text-xs font-normal" : "text-xs font-semibold uppercase tracking-[0.12em]"
            )}
          >
            <Plus size={13} weight="bold" />
            <span>{t("nav.new_project")}</span>
          </Link>

          {/* Language Switcher */}
          <div className="flex items-center text-xs font-medium tracking-wider text-muted-foreground">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={cn(
                "transition-all duration-200 cursor-pointer px-1.5 py-0.5 rounded-md hover:text-foreground active:scale-95",
                language === "en"
                  ? "font-bold text-foreground bg-foreground/5 shadow-2xs"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              EN
            </button>
            <span className="mx-1 opacity-25">|</span>
            <button
              type="button"
              onClick={() => setLanguage("ar")}
              className={cn(
                "transition-all duration-200 cursor-pointer px-1.5 py-0.5 rounded-md hover:text-foreground active:scale-95 font-medium",
                language === "ar"
                  ? "font-bold text-foreground bg-foreground/5 shadow-2xs"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              عربي
            </button>
          </div>

          {/* Profile Circle / Auth Trigger */}
          <button
            type="button"
            onClick={() => setIsAuthOpen(true)}
            aria-label="User Profile & Sign In"
            title={isAuthenticated && user ? `${user.name} (${role})` : "Sign In"}
            className="flex items-center gap-2 rounded-full border border-border bg-card p-1 text-muted-foreground transition-all duration-200 hover:border-foreground/40 hover:text-foreground hover:shadow-xs active:scale-95 cursor-pointer pr-2.5 touch-manipulation"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/5 text-foreground text-[10px] font-bold">
              {isAuthenticated && initials ? (
                <span>{initials}</span>
              ) : (
                <User size={14} weight="bold" />
              )}
            </div>
            <span className="hidden xs:inline text-[10px] font-semibold tracking-wider uppercase text-foreground">
              {isAuthenticated && user ? user.name.split(" ")[0] : t("nav.sign_in") || "Sign In"}
            </span>
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="md:hidden p-2 rounded-full border border-border bg-card text-[#503C2C] hover:text-[#1C1917] transition-colors cursor-pointer active:scale-95 touch-manipulation"
          >
            {isMobileMenuOpen ? <X size={17} weight="bold" /> : <List size={17} weight="bold" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/98 backdrop-blur-2xl border-b border-border shadow-xl px-6 py-5 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5 text-xs font-medium text-[#503C2C]">
            <Link
              href="/projects"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "p-3 rounded-xl transition-colors flex items-center justify-between",
                pathname === "/projects"
                  ? "bg-secondary text-[#1C1917] font-semibold"
                  : "hover:bg-secondary/60 text-[#6B635B]"
              )}
            >
              <span>{t("nav.portfolio") || (isRTL ? "مشاريعي" : "My Projects")}</span>
            </Link>
            <Link
              href="/projects/new"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "p-3 rounded-xl transition-colors flex items-center justify-between",
                pathname === "/projects/new"
                  ? "bg-secondary text-[#1C1917] font-semibold"
                  : "hover:bg-secondary/60 text-[#6B635B]"
              )}
            >
              <span>{t("nav.start_project") || (isRTL ? "بدء مشروع جديد" : "Commission New Project")}</span>
              <Plus size={14} weight="bold" className="text-[#B88460]" />
            </Link>

            {isAuthenticated && role !== "CUSTOMER" && (
              <Link
                href={role === "ENGINEER" ? "/dashboard/engineer" : role === "PROJECT_MANAGER" ? "/dashboard/pm" : "/dashboard/admin"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl hover:bg-[#B88460]/10 text-[#B88460] font-medium flex items-center justify-between transition-colors"
              >
                <span>{isRTL ? "لوحة العمليات والمهندسين" : "Operations Desk"}</span>
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-[#78716C]">
              {isRTL ? "اللغة:" : "Language:"}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-mono font-medium",
                  language === "en" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-[#6B635B]"
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("ar")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-sans font-medium",
                  language === "ar" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-[#6B635B]"
                )}
              >
                عربي
              </button>
            </div>
          </div>
        </div>
      )}
    </header>

    <SignInModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
