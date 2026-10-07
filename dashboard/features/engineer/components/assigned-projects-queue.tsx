"use client";

import * as React from "react";
import {
  ProjectListItem,
  EngineerWorkQueueFilter,
  ProjectStatus,
} from "../types/engineer.types";
import {
  Buildings,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Clock,
  ArrowsOutCardinal,
  Hourglass,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface AssignedProjectsQueueProps {
  projects: ProjectListItem[];
  activeFilter: EngineerWorkQueueFilter;
  onFilterChange: (filter: EngineerWorkQueueFilter) => void;
  onSelectProject: (projectId: number) => void;
  isRTL: boolean;
}

export function AssignedProjectsQueue({
  projects,
  activeFilter,
  onFilterChange,
  onSelectProject,
  isRTL,
}: AssignedProjectsQueueProps) {
  // Filter logic
  const filteredProjects = React.useMemo(() => {
    return projects.filter((p) => {
      if (activeFilter === "ALL") return true;
      if (activeFilter === "UNDER_REVIEW")
        return p.status === "UNDER_ENGINEER_REVIEW" || p.status === "SUBMITTED";
      if (activeFilter === "CONSULTATION_READY")
        return p.status === "ENGINEER_READY";
      if (activeFilter === "WAITING_CUSTOMER")
        return p.status === "ENGINEER_READY";
      return true;
    });
  }, [projects, activeFilter]);

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "SUBMITTED":
        return {
          label: isRTL ? "مُسلّم حديثاً · بانتظار المراجعة" : "Submitted · Pending Review",
          className:
            "bg-muted text-muted-foreground border-border",
        };
      case "UNDER_ENGINEER_REVIEW":
        return {
          label: isRTL ? "قيد المراجعة الهندسية" : "Under Engineer Review",
          className:
            "bg-[#503C2C]/10 text-[#503C2C] dark:bg-[#FAF7F2]/10 dark:text-[#FAF7F2] border-[#503C2C]/20 dark:border-[#FAF7F2]/20",
        };
      case "ENGINEER_READY":
        return {
          label: isRTL ? "معتمد للاستشارة" : "Ready for Consultation",
          className:
            "bg-[#B88460]/15 text-[#8F5A36] dark:bg-[#B88460]/20 dark:text-[#E5D5C5] border-[#B88460]/30 dark:border-[#B88460]/40",
        };
      default:
        return {
          label: status,
          className: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  const getNextAction = (status: ProjectStatus) => {
    switch (status) {
      case "SUBMITTED":
        return {
          text: isRTL ? "بدء المراجعة الهندسية وتدقيق المخططات" : "Start engineering review and audit plans",
          isSelfAction: true,
        };
      case "UNDER_ENGINEER_REVIEW":
        return {
          text: isRTL ? "تدقيق المتطلبات وتأكيد الجاهزية للاستشارة" : "Audit specifications & sign off readiness",
          isSelfAction: true,
        };
      case "ENGINEER_READY":
        return {
          text: isRTL ? "بانتظار قيام العميل بحجز موعد الاستشارة" : "Waiting for client to select consultation slot",
          isSelfAction: false,
        };
      default:
        return { text: "—", isSelfAction: false };
    }
  };

  const filters: { id: EngineerWorkQueueFilter; labelAr: string; labelEn: string; count: number }[] = [
    {
      id: "ALL",
      labelAr: "جميع المشروعات",
      labelEn: "All Commissions",
      count: projects.length,
    },
    {
      id: "UNDER_REVIEW",
      labelAr: "قيد المراجعة",
      labelEn: "Under Review",
      count: projects.filter(
        (p) => p.status === "UNDER_ENGINEER_REVIEW" || p.status === "SUBMITTED"
      ).length,
    },
    {
      id: "CONSULTATION_READY",
      labelAr: "جاهز للاستشارة",
      labelEn: "Consultation Ready",
      count: projects.filter((p) => p.status === "ENGINEER_READY").length,
    },
    {
      id: "WAITING_CUSTOMER",
      labelAr: "بانتظار العميل",
      labelEn: "Waiting Customer",
      count: projects.filter((p) => p.status === "ENGINEER_READY").length,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Section Header & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-medium text-foreground">
            {isRTL ? "مشروعاتي المسندة" : "My Assigned Commissions"}
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            {isRTL
              ? "المشروعات التي تشرف عليها كمهندس معماري ومسؤول تدقيق فني"
              : "Projects where you are the authorized lead architect and reviewer"}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer",
                activeFilter === f.id
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{isRTL ? f.labelAr : f.labelEn}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted text-muted-foreground">
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-border bg-card/40 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Buildings className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-medium text-foreground">
            {isRTL
              ? "لا توجد مشروعات مسندة تطابق هذا التصنيف"
              : "No projects match the selected filter"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {isRTL
              ? "لا توجد مشروعات تحت هذا المعيار حالياً. استخدم تصنيف 'جميع المشروعات' للاطلاع على القائمة الكاملة."
              : "No projects found under this criteria. Switch to 'All Commissions' to view your full assigned portfolio."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const statusConfig = getStatusBadge(project.status);
            const nextAction = getNextAction(project.status);

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="group p-5 rounded-2xl border border-border bg-card text-card-foreground shadow-xs hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top line: Code, Typology & Status */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground">
                          #{project.id}
                        </span>
                        {project.property && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {project.property.propertyType} · {project.property.areaSqm} m²
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="text-base font-serif font-medium text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                    </div>

                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border shrink-0",
                        statusConfig.className
                      )}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Location & Spaces */}
                  <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                    {project.property && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">
                          {project.property.compound ? `${project.property.compound}, ` : ""}
                          {project.property.city}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <ArrowsOutCardinal className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {project.spaces?.length || 0}{" "}
                        {isRTL ? "مساحات معمارية محددة" : "Configured spaces"}
                      </span>
                    </div>
                  </div>

                  {/* Next Step / Dependency Bar */}
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1 mb-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-muted-foreground">
                      {nextAction.isSelfAction ? (
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <Hourglass className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>
                        {nextAction.isSelfAction
                          ? isRTL
                            ? "الإجراء القادم المسموح:"
                            : "Permitted Next Action:"
                          : isRTL
                          ? "جهة الاعتماد / التبعية:"
                          : "Dependency / Waiting On:"}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-foreground">
                      {nextAction.text}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {new Date(project.updatedAt).toLocaleDateString(
                      isRTL ? "ar-EG" : "en-US"
                    )}
                  </span>
                  <span className="text-primary font-medium inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>{isRTL ? "فتح مساحة عمل المشروع" : "Open Project Workspace"}</span>
                    {isRTL ? (
                      <ArrowLeft className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
