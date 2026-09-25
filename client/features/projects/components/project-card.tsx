import * as React from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, MapPin, Ruler } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Project } from "../types";
import { getProjectDisplayTitle } from "../types";
import { StatusChip } from "./status-chip";
import { useLanguage } from "@/lib/i18n/language-context";

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const { t, isRTL } = useLanguage();
  const defaultImage =
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

  const propertyType = project.property?.propertyType || project.propertyType || "villa";
  const propertyTypeLabel = t(`property.${propertyType}`) || propertyType;
  const areaSqm = project.property?.areaSqm || project.areaSqm || 450;
  const compound = project.property?.compound || project.compound;
  const city = project.property?.city || project.city || "Cairo";
  const displayTitle = getProjectDisplayTitle(project);

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-foreground/30 hover:shadow-editorial active:scale-[0.99]",
        className
      )}
    >
      {/* Visual Image Header */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.coverImage || defaultImage}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Subtle gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />

        {/* Top Floating Status Chip */}
        <div className={cn("absolute top-3.5 z-10", isRTL ? "left-3.5" : "right-3.5")}>
          <StatusChip status={project.status} />
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-px w-4 bg-foreground/40" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/70">
              {propertyTypeLabel}
            </span>
          </div>

          <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
            {displayTitle}
          </h3>

          <div className="mt-3.5 flex flex-wrap items-center gap-3.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <Ruler size={14} className="text-muted-foreground" />
              {areaSqm} {isRTL ? "م²" : "m²"}
            </span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin size={14} className="text-muted-foreground" />
              {compound ? `${compound}, ` : ""}
              {city}
            </span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
          <span className="text-xs text-muted-foreground font-medium">
            {project.spaces?.length || 0} {t("portfolio.spaces_configured")}
          </span>
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-foreground transition-colors group-hover:text-primary cursor-pointer"
          >
            <span>{t("portfolio.view_project")}</span>
            {isRTL ? (
              <ArrowLeft
                size={13}
                weight="bold"
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
            ) : (
              <ArrowRight
                size={13}
                weight="bold"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}

