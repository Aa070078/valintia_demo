import * as React from "react";
import { CustomerHeader } from "./customer-header";

interface CustomerShellProps {
  children: React.ReactNode;
}

export function CustomerShell({ children }: CustomerShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-accent/20 selection:text-foreground">
      <CustomerHeader />
      <main className="flex-1 pb-24 pt-8 sm:pt-12">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">{children}</div>
      </main>
      <footer className="border-t border-border/70 bg-card/40 py-10 text-xs text-muted-foreground transition-colors">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-sans text-[11px] font-semibold tracking-[0.22em] text-foreground">
              VALENTIA
            </span>
            <span className="text-[10px] text-muted-foreground/60">|</span>
            <span className="text-[11px] text-muted-foreground">
              Design & Build Architecture Studio
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px] text-muted-foreground">
            <span>Sheikh Zayed</span>
            <span className="opacity-40">·</span>
            <span>New Cairo</span>
            <span className="opacity-40">·</span>
            <span>North Coast</span>
            <span className="opacity-40">·</span>
            <span>Cairo, Egypt</span>
          </div>

          <p className="text-[11px] text-muted-foreground/80">
            © {new Date().getFullYear()} Valentia Fit-Out. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
