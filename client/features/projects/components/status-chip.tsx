import * as React from "react";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "../types";
import { useLanguage } from "@/lib/i18n/language-context";

interface StatusConfig {
  labelKey: string;
  defaultLabel: string;
  className: string;
}

const STATUS_MAP: Record<ProjectStatus, StatusConfig> = {
  draft: {
    labelKey: "status.draft",
    defaultLabel: "Draft",
    className: "bg-white/90 text-muted-foreground border-border/80 backdrop-blur-md",
  },
  concept_selected: {
    labelKey: "status.concept_selected",
    defaultLabel: "Concept Selected",
    className: "bg-foreground/5 text-foreground border-foreground/15 backdrop-blur-md",
  },
  drawing_uploaded: {
    labelKey: "status.drawing_uploaded",
    defaultLabel: "Drawing Uploaded",
    className: "bg-foreground/5 text-foreground border-foreground/15 backdrop-blur-md",
  },
  under_engineer_review: {
    labelKey: "status.under_engineer_review",
    defaultLabel: "Under Review",
    className: "bg-foreground/10 text-foreground border-foreground/20 backdrop-blur-md",
  },
  meeting_scheduled: {
    labelKey: "status.meeting_scheduled",
    defaultLabel: "Meeting Scheduled",
    className: "bg-foreground/5 text-foreground border-foreground/15 backdrop-blur-md",
  },
  site_visit_scheduled: {
    labelKey: "status.site_visit_scheduled",
    defaultLabel: "Site Visit Scheduled",
    className: "bg-foreground/10 text-foreground border-foreground/20 backdrop-blur-md",
  },
  site_visit_paid: {
    labelKey: "status.site_visit_paid",
    defaultLabel: "Site Visit Paid",
    className: "bg-foreground/10 text-foreground border-foreground/20 backdrop-blur-md",
  },
  design_in_progress: {
    labelKey: "status.design_in_progress",
    defaultLabel: "Design in Progress",
    className: "bg-foreground/10 text-foreground border-foreground/20 backdrop-blur-md",
  },
  design_delivered: {
    labelKey: "status.design_delivered",
    defaultLabel: "Design Delivered",
    className: "bg-foreground/15 text-foreground border-foreground/25 backdrop-blur-md",
  },
  boq_confirmed: {
    labelKey: "status.boq_confirmed",
    defaultLabel: "BOQ Confirmed",
    className: "bg-primary text-primary-foreground border-primary/80 backdrop-blur-md shadow-xs",
  },
  execution: {
    labelKey: "status.execution",
    defaultLabel: "In Execution",
    className: "bg-foreground text-background border-foreground shadow-xs",
  },
  completed: {
    labelKey: "status.completed",
    defaultLabel: "Completed",
    className: "bg-foreground text-background border-foreground shadow-xs",
  },
};

export function StatusChip({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const { t } = useLanguage();
  const config = STATUS_MAP[status] || STATUS_MAP.draft;
  const label = t(config.labelKey) || config.defaultLabel;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition-all duration-200 shadow-2xs",
        config.className,
        className
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}

