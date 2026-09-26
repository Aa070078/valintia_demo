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

      {/* Card Body & Footer Container */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="text-start">
          <div className="flex items-center gap-2">
            <span className="h-px w-4 bg-foreground/50" />
            <span
              className={cn(
                "text-[10px] text-foreground/80",
                isRTL ? "font-bold text-xs text-[#503C2C] tracking-normal" : "font-semibold uppercase tracking-[0.2em]"
              )}
            >
              {propertyTypeLabel}
            </span>
          </div>

          <h3
            className={cn(
              "mt-2 text-foreground transition-colors group-hover:text-primary",
              isRTL
                ? "font-sans font-bold text-xl sm:text-2xl leading-snug text-[#1C1917]"
                : "font-serif text-2xl font-medium tracking-tight"
            )}
          >
            {displayTitle}
          </h3>

          <div className="mt-3.5 flex flex-wrap items-center gap-3.5 text-xs text-foreground/75">
            <span className="flex items-center gap-1.5 font-semibold text-[#1C1917]">
              <Ruler size={14} className="text-[#503C2C]" />
              {areaSqm} {isRTL ? "م²" : "m²"}
            </span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5 font-medium text-[#4A3E31]">
              <MapPin size={14} className="text-[#503C2C]" />
              {compound ? `${compound}, ` : ""}
              {city}
            </span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
          <span className={cn(
            "text-xs font-medium",
            isRTL ? "text-[#503C2C] font-semibold" : "text-muted-foreground"
          )}>
            {project.spaces?.length || 0} {t("portfolio.spaces_configured")}
          </span>
          <Link
            href={`/projects/${project.id}`}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-bold text-foreground transition-colors group-hover:text-primary cursor-pointer",
              isRTL ? "tracking-normal" : "uppercase tracking-[0.1em]"
            )}
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

