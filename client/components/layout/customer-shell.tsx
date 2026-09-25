"use client";

import * as React from "react";
import { CustomerHeader } from "./customer-header";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface CustomerShellProps {
  children: React.ReactNode;
}

export function CustomerShell({ children }: CustomerShellProps) {
  const { t, isRTL } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-accent/20 selection:text-foreground">
      <CustomerHeader />
      <main className="flex-1 pb-24 pt-8 sm:pt-12">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">{children}</div>
      </main>
      <footer className="border-t border-border/70 bg-card/40 py-10 text-xs text-muted-foreground transition-colors">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className={cn(
              "font-sans text-foreground",
              isRTL ? "text-[13px] font-bold tracking-normal" : "text-[11px] font-semibold tracking-[0.22em]"
            )}>
              {t("footer.title")}
            </span>
            <span className="text-[10px] text-muted-foreground/60">|</span>
            <span className={cn("text-[11px] text-muted-foreground", isRTL && "font-medium text-[#4A3E31]")}>
              {t("footer.tagline")}
            </span>
          </div>

          <div className={cn("flex flex-wrap items-center gap-6 text-[11px] text-muted-foreground", isRTL && "font-medium text-[#4A3E31]")}>
            <span>{isRTL ? "الشيخ زايد" : "Sheikh Zayed"}</span>
            <span className="opacity-40">·</span>
            <span>{isRTL ? "القاهرة الجديدة" : "New Cairo"}</span>
            <span className="opacity-40">·</span>
            <span>{isRTL ? "الساحل الشمالي" : "North Coast"}</span>
            <span className="opacity-40">·</span>
            <span>{isRTL ? "القاهرة، مصر" : "Cairo, Egypt"}</span>
          </div>

          <p className={cn("text-[11px] text-muted-foreground/80", isRTL && "font-medium")}>
            © {new Date().getFullYear()} {isRTL ? "فالنتيا للتشطيبات المعمارية. جميع الحقوق محفوظة." : "Valentia Fit-Out. All rights reserved."}
          </p>
        </div>
      </footer>
    </div>
  );
}
