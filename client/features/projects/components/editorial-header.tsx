import * as React from "react";
import { cn } from "@/lib/utils";

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
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="flex max-w-2xl flex-col gap-2.5">
        {eyebrow && (
          <div className="flex items-center gap-2.5">
            <span className="h-px w-6 bg-foreground/40" />
            <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-foreground/75">
              {eyebrow}
            </span>
          </div>
        )}
        <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
