import * as React from "react";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "../types";
import { useLanguage } from "@/lib/i18n/language-context";

import { getProjectStatusInfo } from "../lib/project-status-resolver";

export function StatusChip({
  status,
  className,
}: {
  status: ProjectStatus | string;
  className?: string;
}) {
  const { isRTL } = useLanguage();
  const info = getProjectStatusInfo(status, isRTL);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[10px] transition-all duration-200 shadow-2xs select-none",
        isRTL ? "tracking-normal font-sans font-bold" : "font-semibold uppercase tracking-[0.12em]",
        info.badgeClass,
        className
      )}
    >
      <span className="me-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {info.label}
    </span>
  );
}

