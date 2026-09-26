import * as React from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

interface EditorialHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EditorialHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: EditorialHeaderProps) {
  const { isRTL } = useLanguage();

  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="flex max-w-2xl flex-col gap-2.5 text-start">
        {eyebrow && (
          <div className="flex items-center gap-2.5">
            <span className="h-px w-6 bg-foreground/50" />
            <span
              className={cn(
                "text-[11px] font-bold text-foreground/85",
                isRTL ? "tracking-normal text-xs text-[#503C2C]" : "tracking-[0.22em] uppercase"
              )}
            >
              {eyebrow}
            </span>
          </div>
        )}
        <h1
          className={cn(
            "text-foreground transition-colors",
            isRTL
              ? "font-sans font-bold text-2xl sm:text-3xl lg:text-4xl leading-[1.3] text-[#1C1917]"
              : "font-serif text-3xl font-normal tracking-tight sm:text-4xl lg:text-5xl"
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "leading-relaxed transition-colors",
              isRTL
                ? "text-sm sm:text-base font-medium text-[#4A3E31] leading-relaxed"
                : "text-sm sm:text-base text-muted-foreground"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
