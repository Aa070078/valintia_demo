"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Plus } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { useAuth } from "@/features/auth/context/auth-context";
import { SignInModal } from "@/features/auth/components/sign-in-modal";

export function CustomerHeader() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, role } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);

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
            <span className="font-sans text-[13px] font-semibold tracking-[0.28em] text-foreground transition-colors group-hover:opacity-80">
              {t("brand.name")}
            </span>
            <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {t("brand.tagline")}
            </span>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/projects"
            className={cn(
              "relative py-1 text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 hover:-translate-y-0.5",
              pathname === "/projects" ||
                (pathname.startsWith("/projects/") &&
                  pathname !== "/projects/new")
                ? "text-foreground font-bold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-foreground after:rounded-full"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("nav.portfolio")}
          </Link>
          <Link
            href="/projects/new"
            className={cn(
              "relative py-1 text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 hover:-translate-y-0.5",
              pathname === "/projects/new"
                ? "text-foreground font-bold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-foreground after:rounded-full"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("nav.start_project")}
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-5">
          <Link
            href="/projects/new"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-xs transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.97]"
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
            className="flex items-center gap-2 rounded-full border border-border bg-card p-1 text-muted-foreground transition-all duration-200 hover:border-foreground/40 hover:text-foreground hover:shadow-xs active:scale-95 cursor-pointer pr-2.5"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/5 text-foreground text-[10px] font-bold">
              {isAuthenticated && initials ? (
                <span>{initials}</span>
              ) : (
                <User size={14} weight="bold" />
              )}
            </div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-foreground">
              {isAuthenticated && user ? user.name.split(" ")[0] : t("nav.sign_in") || "Sign In"}
            </span>
          </button>
        </div>
      </div>
    </header>

    <SignInModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
