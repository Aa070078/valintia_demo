"use client";

import * as React from "react";
import {
  MOCK_PROJECTS,
  MOCK_USERS,
  MOCK_CHANGE_ORDERS,
} from "../mock-data";
import { ProjectOverview, ChangeOrder } from "../types";
import {
  CheckCircle,
  Clock,
  UserGear,
  MagnifyingGlass,
  CurrencyDollar,
  HardHat,
  Check,
  X,
} from "@phosphor-icons/react";
import { authApi } from "@/features/auth/api/auth.api";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export function PmDashboard() {
  const { isRTL } = useLanguage();
  const [projects, setProjects] = React.useState<ProjectOverview[]>(MOCK_PROJECTS);
  const [search, setSearch] = React.useState("");
  const [healthFilter, setHealthFilter] = React.useState<string>("ALL");
  const [changeOrders, setChangeOrders] = React.useState<ChangeOrder[]>(MOCK_CHANGE_ORDERS);
  const [selectedProject, setSelectedProject] = React.useState<ProjectOverview | null>(null);
  const [engineers] = React.useState<{ id: number | string; name: string }[]>(() => {
    const allStaff = authApi.getAllStaffUsers();
    const engs = allStaff
      .filter((u) => u.role === "ENGINEER")
      .map((u) => ({ id: u.id, name: u.name }));

    if (engs.length > 0) return engs;
    return MOCK_USERS.filter((u) => u.role === "ENGINEER").map((u) => ({ id: u.id, name: u.name }));
  });

  // Reassign engineer handler
  const handleAssignEngineer = (projectId: string, engineerId: number | string) => {
    const engineer = engineers.find((e) => String(e.id) === String(engineerId));
    if (!engineer) return;

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              leadEngineerId: engineer.id,
              leadEngineerName: engineer.name,
            }
          : p
      )
    );
  };

  // Change order action
  const handleCOAction = (coId: string, status: "APPROVED" | "REJECTED") => {
    setChangeOrders((prev) =>
      prev.map((co) => (co.id === coId ? { ...co, status } : co))
    );
  };

  // Filtered projects
  const filteredProjects = React.useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.clientName.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.compound.toLowerCase().includes(search.toLowerCase());

      const matchesHealth =
        healthFilter === "ALL" || p.health === healthFilter;

      return matchesSearch && matchesHealth;
    });
  }, [projects, search, healthFilter]);

  const totalValue = projects.reduce((acc, p) => acc + p.budgetEgp, 0);
  const onScheduleCount = projects.filter((p) => p.health === "ON_SCHEDULE").length;
  const atRiskCount = projects.filter((p) => p.health !== "ON_SCHEDULE").length;

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider mb-2">
            <UserGear className="w-3.5 h-3.5" />
            <span>{isRTL ? "مكتب إدارة ومتابعة المشاريع" : "PROJECT MANAGEMENT OPS DESK"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-foreground">
            {isRTL ? "متابعة تنفيذ المشاريع وجداول التسليم" : "Portfolio Command & Delivery Matrix"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            {isRTL
              ? "متابعة نسب إنجاز التشطيب، توزيع مهندسي الموقع، إدارة التعديلات (Change Orders)، والالتزام بمواعيد التسليم."
              : "Supervise fit-out progress, assign site engineers, monitor milestone SLA, and resolve client change requests."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg border border-border bg-card text-xs flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground font-mono">{isRTL ? "مشاريع نشطة:" : "LIVE SYNC:"}</span>
            <span className="font-semibold text-foreground">{projects.length} {isRTL ? "فلل تحت التنفيذ" : "ACTIVE FIT-OUTS"}</span>
          </div>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-3">
            <span className="font-mono uppercase">{isRTL ? "إجمالي قيمة المشاريع" : "Total Portfolio Value"}</span>
            <CurrencyDollar className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-semibold text-foreground font-mono">
            EGP {(totalValue / 1_000_000).toFixed(1)}M
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {isRTL ? `موزعة على ${projects.length} عقارات سكنية` : `Across ${projects.length} contracted residences`}
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-3">
            <span className="font-mono uppercase">{isRTL ? "نسبة الالتزام بالجدول" : "Schedule Adherence"}</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-semibold text-foreground font-mono">
            {Math.round((onScheduleCount / projects.length) * 100)}%
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {isRTL
              ? `${onScheduleCount} ماشي في ميعاده · ${atRiskCount} محتاج متابعة`
              : `${onScheduleCount} on track · ${atRiskCount} flagged for review`}
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-3">
            <span className="font-mono uppercase">{isRTL ? "المهندسون المشرفون" : "Lead Engineers Active"}</span>
            <HardHat className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-semibold text-foreground font-mono">
            {engineers.length} {isRTL ? "مهندسين" : "Architects"}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {isRTL ? "متوسط ٢.٨ مشروع لكل مهندس" : "Average workload 2.8 projects/eng"}
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-3">
            <span className="font-mono uppercase">{isRTL ? "طلبات التعديل المعلقة" : "Pending Change Orders"}</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-semibold text-foreground font-mono">
            {changeOrders.filter((c) => c.status === "PENDING_REVIEW").length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {isRTL ? "بانتظار اعتماد التكلفة والوقت" : "Requires cost/schedule approval"}
          </p>
        </div>
      </div>

      {/* Main Grid: Projects Table + Engineer Capacity */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Projects Matrix */}
        <div className="xl:col-span-8 space-y-4">
          {/* Search & Health Filter Bar */}
          <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isRTL ? "بحث بالكود، العميل، الكمبوند..." : "Search by code, villa, client..."}
                className="w-full h-9 px-3 ps-8 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
              />
              <MagnifyingGlass className="w-3.5 h-3.5 absolute start-2.5 top-3 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-mono text-muted-foreground mr-1">
                {isRTL ? "الحالة:" : "HEALTH:"}
              </span>
              {(["ALL", "ON_SCHEDULE", "AT_RISK", "DELAYED"] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setHealthFilter(h)}
                  className={cn(
                    "px-2.5 py-1 rounded text-[10px] font-medium font-mono uppercase transition-colors cursor-pointer whitespace-nowrap",
                    healthFilter === h
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {h === "ALL"
                    ? isRTL ? "الكل" : "ALL"
                    : h === "ON_SCHEDULE"
                    ? isRTL ? "في الميعاد" : "ON SCHEDULE"
                    : h === "AT_RISK"
                    ? isRTL ? "تحت المراقبة" : "AT RISK"
                    : isRTL ? "متأخر" : "DELAYED"}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-[10px] uppercase font-mono text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-3 px-4">{isRTL ? "الكود والمشروع" : "Code & Project"}</th>
                    <th className="py-3 px-4">{isRTL ? "العميل والكمبوند" : "Client & Compound"}</th>
                    <th className="py-3 px-4">{isRTL ? "الميزانية" : "Budget"}</th>
                    <th className="py-3 px-4">{isRTL ? "الحالة" : "Health"}</th>
                    <th className="py-3 px-4">{isRTL ? "المهندس المسؤول" : "Lead Engineer"}</th>
                    <th className="py-3 px-4">{isRTL ? "المرحلة القادمة" : "Next Milestone"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProjects.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedProject(p)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">{p.title}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          {p.code} · {p.typology} ({p.areaM2}m²)
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-foreground font-medium">{p.clientName}</div>
                        <div className="text-[10px] text-muted-foreground">{p.compound}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                        EGP {(p.budgetEgp / 1_000_000).toFixed(2)}M
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium",
                            p.health === "ON_SCHEDULE"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : p.health === "AT_RISK"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                              : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              p.health === "ON_SCHEDULE"
                                ? "bg-emerald-500"
                                : p.health === "AT_RISK"
                                ? "bg-amber-500"
                                : "bg-red-500"
                            )}
                          />
                          {p.health === "ON_SCHEDULE"
                            ? isRTL ? "في الميعاد" : "ON SCHEDULE"
                            : p.health === "AT_RISK"
                            ? isRTL ? "تحت المتابعة" : "AT RISK"
                            : isRTL ? "متأخر" : "DELAYED"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={p.leadEngineerId || ""}
                          onChange={(e) =>
                            handleAssignEngineer(p.id, Number(e.target.value))
                          }
                          className="h-7 px-2 rounded-lg border border-border bg-background text-[11px] text-foreground focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                        >
                          {engineers.map((eng) => (
                            <option key={eng.id} value={eng.id}>
                              {eng.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-foreground truncate max-w-[140px]" title={p.nextMilestone}>
                          {p.nextMilestone}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          {isRTL ? "الميعاد: " : "Due: "} {p.nextMilestoneDate}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Engineer Capacity & Change Orders */}
        <div className="xl:col-span-4 space-y-6">
          {/* Engineer Workload Matrix */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-foreground">
                <HardHat className="w-4 h-4 text-primary" />
                <span className="font-semibold">{isRTL ? "توزيع مهندسي المواقع" : "Engineer Allocation Matrix"}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">MAX 4 / ENG</span>
            </div>

            <div className="space-y-3.5">
              {engineers.map((eng) => {
                const count = projects.filter((p) => p.leadEngineerId === eng.id).length;
                const percent = Math.min((count / 4) * 100, 100);

                return (
                  <div key={eng.id} className="p-3 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-foreground">{eng.name}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {count} / 4 {isRTL ? "مشاريع" : "Projects"}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          count >= 4
                            ? "bg-red-500"
                            : count >= 3
                            ? "bg-amber-500"
                            : "bg-primary"
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Change Orders Triage Card */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-foreground">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-semibold">{isRTL ? "طلبات التعديل (Change Orders)" : "Change Orders Pending Review"}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {changeOrders.filter((c) => c.status === "PENDING_REVIEW").length} {isRTL ? "معلق" : "PENDING"}
              </span>
            </div>

            <div className="space-y-3">
              {changeOrders.map((co) => (
                <div key={co.id} className="p-3.5 rounded-lg border border-border bg-muted/20 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-muted-foreground">{co.projectName}</span>
                    <span
                      className={cn(
                        "text-[10px] font-mono uppercase px-1.5 py-0.5 rounded",
                        co.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : co.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      )}
                    >
                      {co.status === "APPROVED"
                        ? isRTL ? "معتمد" : "APPROVED"
                        : co.status === "REJECTED"
                        ? isRTL ? "مرفوض" : "REJECTED"
                        : isRTL ? "قيد المراجعة" : "PENDING"}
                    </span>
                  </div>

                  <h4 className="font-medium text-foreground text-xs leading-snug mb-1.5">
                    {co.title}
                  </h4>

                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                    {co.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-border pt-2 text-[11px]">
                    <span className="font-mono font-medium text-foreground">
                      +EGP {co.costImpactEgp.toLocaleString()} · +{co.timeImpactDays} {isRTL ? "يوم" : "Days"}
                    </span>

                    {co.status === "PENDING_REVIEW" && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCOAction(co.id, "APPROVED")}
                          className="h-6 px-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          <span>{isRTL ? "اعتماد" : "Approve"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCOAction(co.id, "REJECTED")}
                          className="h-6 px-2 rounded bg-muted hover:bg-red-100 text-red-600 text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <X className="w-3 h-3" />
                          <span>{isRTL ? "رفض" : "Reject"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Project Quick Inspection Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">
                  {selectedProject.code} · {selectedProject.typology}
                </span>
                <h3 className="font-serif text-xl font-normal text-foreground">
                  {selectedProject.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isRTL ? "اسم العميل:" : "Client Name:"}</span>
                <span className="font-medium text-foreground">{selectedProject.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isRTL ? "هاتف العميل:" : "Client Phone:"}</span>
                <span className="font-mono text-foreground">{selectedProject.clientPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isRTL ? "الموقع والكمبوند:" : "Location & Compound:"}</span>
                <span className="text-foreground">{selectedProject.compound}, {selectedProject.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isRTL ? "المساحة التعاقدية:" : "Contracted Area:"}</span>
                <span className="font-mono text-foreground">{selectedProject.areaM2} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isRTL ? "إجمالي الميزانية:" : "Total Budget:"}</span>
                <span className="font-mono font-medium text-foreground">
                  EGP {selectedProject.budgetEgp.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isRTL ? "المهندس المشرف:" : "Lead Architect:"}</span>
                <span className="font-medium text-foreground">{selectedProject.leadEngineerName || (isRTL ? "غير محدد" : "Unassigned")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isRTL ? "المرحلة الحالية:" : "Current Phase:"}</span>
                <span className="font-mono uppercase font-semibold text-primary">{selectedProject.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isRTL ? "المستخلص القادم:" : "Next Milestone:"}</span>
                <span className="text-foreground font-medium">{selectedProject.nextMilestone} ({selectedProject.nextMilestoneDate})</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer hover:bg-primary/90 transition-colors"
              >
                {isRTL ? "إغلاق الملف" : "Close Dossier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
