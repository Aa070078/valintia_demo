import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

export function EmptyProjectsState() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="grid grid-cols-1 items-center lg:grid-cols-12">
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:col-span-6 lg:p-16">
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-brand-slate/40" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Your Journey Starts Here
            </span>
          </div>

          <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            From a place to a lifestyle.
          </h2>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            We design and build exceptional interior spaces in Egypt, while you
            stay informed at every milestone through transparent engineering
            workflows.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
            >
              <span>Start Your Project</span>
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted lg:col-span-6 lg:aspect-auto lg:h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80"
            alt="Valentia Architectural Interior"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent lg:hidden" />
        </div>
      </div>
    </div>
  );
}
