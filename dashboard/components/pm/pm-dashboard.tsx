"use client";

import * as React from "react";
import { MOCK_PROJECTS, MOCK_USERS } from "@/lib/mock-data";
import { ProjectOverview } from "@/lib/types";
import {
  UserGear,
  Buildings,
  HardHat,
  Clock,
  CheckCircle,
  MagnifyingGlass,
  User,
  Phone,
  ArrowsOutCardinal,
  X,
  Check,
  CaretRight,
  UserPlus,
  GlobeHemisphereWest,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// Format IANA timezone dynamically using Intl.DateTimeFormat (no hardcoded offsets)
function formatCustomerTimezone(tz?: string): string {
  if (!tz) return "UTC";
  try {
    const now = new Date();
    const timeStr = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(now);
    return `${tz} (Local: ${timeStr})`;
  } catch {
    return tz;
  }
}

export function PmDashboard() {
  const [projects, setProjects] = React.useState<ProjectOverview[]>(MOCK_PROJECTS);
  const [activeTab, setActiveTab] = React.useState<"INTAKE" | "ACTIVE" | "ALL">("INTAKE");
  const [search, setSearch] = React.useState("");
  const [selectedProject, setSelectedProject] = React.useState<ProjectOverview | null>(null);
  const [assigningProjectId, setAssigningProjectId] = React.useState<string | null>(null);
  const [selectedEngineerId, setSelectedEngineerId] = React.useState<number | "">("");
  const [successToast, setSuccessToast] = React.useState<string | null>(null);

  const engineers = MOCK_USERS.filter((u) => u.role === "ENGINEER");

  // Filter queues: Intake = unassigned; Active = assigned
  const intakeQueue = React.useMemo(() => {
    return projects.filter(
      (p) => p.status === "SUBMITTED" && (!p.leadEngineerId || p.leadEngineerId === null)
    );
  }, [projects]);

  const activeQueue = React.useMemo(() => {
    return projects.filter(
      (p) => p.status === "SUBMITTED" && p.leadEngineerId != null
    );
  }, [projects]);

  // Current tab items with search
  const displayedProjects = React.useMemo(() => {
    let source = projects;
    if (activeTab === "INTAKE") source = intakeQueue;
    else if (activeTab === "ACTIVE") source = activeQueue;

    if (!search.trim()) return source;
    const q = search.toLowerCase();
    return source.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.compound.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }, [projects, activeTab, intakeQueue, activeQueue, search]);

  // Handle Engineer Assignment (Status strictly remains SUBMITTED; assigned state is derived from leadEngineerId)
  const handleConfirmAssignment = (projectId: string, engineerId: number) => {
    const engineer = engineers.find((e) => e.id === engineerId);
    if (!engineer) return;

    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        leadEngineerId: engineer.id,
        leadEngineerName: engineer.name,
        // Status remains SUBMITTED (aligned with Prisma schema)
        nextMilestone: "Architectural Specification & Feasibility Review",
        nextMilestoneDate: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
      };
    });

    setProjects(updated);

    // If modal is open for this project, update selected dossier
    if (selectedProject?.id === projectId) {
      const match = updated.find((p) => p.id === projectId);
      if (match) setSelectedProject(match);
    }

    setAssigningProjectId(null);
    setSelectedEngineerId("");
    setSuccessToast(`Successfully assigned ${engineer.name} to ${updated.find((p) => p.id === projectId)?.title}`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const getWorkflowBadge = (project: ProjectOverview) => {
    if (project.leadEngineerId != null) {
      return {
        label: `Assigned · ${project.leadEngineerName || "Site Architect"}`,
        className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300",
      };
    }
    return {
      label: "Needs Engineer Assignment",
      className: "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200",
    };
  };

  const targetAssignProject = projects.find((p) => p.id === assigningProjectId);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Top Banner & PM Desk Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider mb-2">
            <UserGear className="w-3.5 h-3.5" />
            <span>PROJECT MANAGEMENT OPS DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-foreground">
            Project Intake &amp; Delivery Matrix
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Review incoming customer submissions, assign certified site engineers, track spatial scopes, and advance fit-out milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg border border-border bg-card text-xs flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground">LEAD PM:</span>
            <span className="font-semibold text-foreground">Nouran Hassan</span>
          </div>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-3">
            <span className="font-mono uppercase">Intake Queue (Needs Assignment)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-semibold text-foreground font-mono">
            {intakeQueue.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            New submissions awaiting PM triage
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-3">
            <span className="font-mono uppercase">Assigned Fit-Outs</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-semibold text-foreground font-mono">
            {activeQueue.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Active under architectural engineering review
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-3">
            <span className="font-mono uppercase">Engineers on Duty</span>
            <HardHat className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-semibold text-foreground font-mono">
            {engineers.length} Architects
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Available for commission assignment
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Work Area: Queue Tabs & Projects Table */}
      <div className="space-y-4">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-xl border border-border bg-card shadow-xs">
          {/* Queue Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("INTAKE")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium font-mono uppercase transition-colors cursor-pointer flex items-center gap-2",
                activeTab === "INTAKE"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Intake Queue</span>
              {intakeQueue.length > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                    activeTab === "INTAKE" ? "bg-primary-foreground text-primary" : "bg-amber-100 text-amber-900"
                  )}
                >
                  {intakeQueue.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ACTIVE")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium font-mono uppercase transition-colors cursor-pointer flex items-center gap-2",
                activeTab === "ACTIVE"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Assigned Portfolio</span>
              <span className="text-[10px] opacity-75">({activeQueue.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium font-mono uppercase transition-colors cursor-pointer",
                activeTab === "ALL"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>All Projects ({projects.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, title, client, compound..."
              className="w-full h-8 px-3 ps-8 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
            />
            <MagnifyingGlass className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          </div>
        </div>

        {/* Project Queue Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          {displayedProjects.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Buildings className="w-5 h-5" />
              </div>
              <div className="text-sm font-medium text-foreground">
                {activeTab === "INTAKE"
                  ? "Intake Queue is Clear"
                  : "No Projects Found"}
              </div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {activeTab === "INTAKE"
                  ? "All incoming customer submissions have been assigned to site engineers."
                  : "No projects match the current search criteria or queue filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-[10px] uppercase font-mono text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Code &amp; Project</th>
                    <th className="py-3 px-4">Client &amp; Location</th>
                    <th className="py-3 px-4">Typology / Scope</th>
                    <th className="py-3 px-4">Workflow State</th>
                    <th className="py-3 px-4">Assigned Engineer</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayedProjects.map((p) => {
                    const statusBadge = getWorkflowBadge(p);

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedProject(p)}
                            className="text-start group cursor-pointer"
                          >
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {p.title}
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground">
                              {p.code} · Created {p.createdAt}
                            </div>
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-foreground font-medium">{p.clientName}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {p.compound ? `${p.compound}, ` : ""}{p.location}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-mono font-medium text-foreground">
                            {p.typology} · {p.areaM2} m²
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {p.spaces?.length || 0} Spaces Defined
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border",
                              statusBadge.className
                            )}
                          >
                            {statusBadge.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {p.leadEngineerName ? (
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="font-medium text-foreground">{p.leadEngineerName}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200">
                              Unassigned
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {!p.leadEngineerId ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setAssigningProjectId(p.id);
                                  setSelectedEngineerId("");
                                }}
                                className="h-7 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-xs"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Assign Engineer</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setAssigningProjectId(p.id);
                                  setSelectedEngineerId(Number(p.leadEngineerId));
                                }}
                                className="h-7 px-2.5 rounded-lg border border-border bg-card hover:bg-muted text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                              >
                                Reassign
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedProject(p)}
                              className="h-7 px-2.5 rounded-lg border border-border bg-card hover:bg-muted text-xs text-foreground cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <span>Dossier</span>
                              <CaretRight className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Assign Engineer Dialog / Modal */}
      {assigningProjectId && targetAssignProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">
                  {targetAssignProject.code} · Commission Assignment
                </span>
                <h3 className="font-serif text-lg font-normal text-foreground">
                  Assign Lead Architect / Site Engineer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAssigningProjectId(null)}
                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-muted/40 border border-border/80 text-xs space-y-1">
              <div><strong>Project:</strong> {targetAssignProject.title}</div>
              <div><strong>Client:</strong> {targetAssignProject.clientName} ({targetAssignProject.location})</div>
              <div><strong>Typology:</strong> {targetAssignProject.typology} · {targetAssignProject.areaM2} m²</div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase text-muted-foreground">
                Select Certified Site Engineer:
              </label>

              <div className="space-y-2">
                {engineers.map((eng) => {
                  const currentCount = projects.filter((p) => p.leadEngineerId === eng.id).length;
                  const isSelected = selectedEngineerId === eng.id;

                  return (
                    <div
                      key={eng.id}
                      onClick={() => setSelectedEngineerId(eng.id)}
                      className={cn(
                        "p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border bg-card hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-mono">
                          {eng.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{eng.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {eng.phone || eng.email}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-muted-foreground block">
                          Current Load
                        </span>
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {currentCount} {currentCount === 1 ? "Project" : "Projects"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setAssigningProjectId(null)}
                className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedEngineerId}
                onClick={() => handleConfirmAssignment(targetAssignProject.id, Number(selectedEngineerId))}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer",
                  selectedEngineerId
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Project Inspection Dossier Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {selectedProject.code} · PM COMMISSION DOSSIER
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border",
                      getWorkflowBadge(selectedProject).className
                    )}
                  >
                    {getWorkflowBadge(selectedProject).label}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-normal text-foreground">
                  {selectedProject.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Client & Representative Information */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-muted-foreground">
                <span className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Customer &amp; Representation Information</span>
                </span>
                <span className="text-[10px] text-foreground font-mono">
                  Budget: EGP {selectedProject.budgetEgp.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Primary Client:</span>
                  <span className="font-medium text-foreground">{selectedProject.clientName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Phone Contact:</span>
                  <a
                    href={`tel:${selectedProject.clientPhone}`}
                    className="font-mono text-primary hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{selectedProject.clientPhone}</span>
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Customer Location &amp; Timezone:</span>
                  <span className="text-foreground flex items-center gap-1.5 font-mono text-[11px]">
                    <GlobeHemisphereWest className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>
                      {selectedProject.customerLocation?.city
                        ? `${selectedProject.customerLocation.city}, ${selectedProject.customerLocation.country} · `
                        : ""}
                      {formatCustomerTimezone(selectedProject.customerLocation?.timezone)}
                    </span>
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Representation in Egypt:</span>
                  <span className="font-medium text-foreground">
                    {selectedProject.representative?.representationType === "client_in_person"
                      ? "Client in Egypt in person"
                      : selectedProject.representative?.representationType === "valentia_direct"
                      ? "Direct Valentia Management"
                      : selectedProject.representative?.name
                      ? `${selectedProject.representative.name} (${selectedProject.representative.relationship || "Rep"}) · ${selectedProject.representative.phone || ""}`
                      : "Authorized Representative"}
                  </span>
                </div>
              </div>
            </div>

            {/* Property Specifications */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted-foreground">
                <Buildings className="w-3.5 h-3.5 text-primary" />
                <span>Property Details &amp; Scope</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Typology:</span>
                  <span className="font-mono font-medium text-foreground">{selectedProject.typology}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Contracted Area:</span>
                  <span className="font-mono font-medium text-foreground">{selectedProject.areaM2} m²</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Compound:</span>
                  <span className="font-medium text-foreground">{selectedProject.compound || "Stand-alone"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Target Timeline:</span>
                  <span className="font-medium text-foreground">{selectedProject.targetTimeline || "Standard"}</span>
                </div>
              </div>

              {selectedProject.notes && (
                <div className="border-t border-border/60 pt-2 text-xs">
                  <span className="text-muted-foreground block text-[11px]">Customer Directives:</span>
                  <p className="text-foreground leading-relaxed mt-0.5 bg-background/50 p-2 rounded-lg border border-border/40 font-mono text-[11px] whitespace-pre-wrap">
                    {selectedProject.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Spaces Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted-foreground">
                  <ArrowsOutCardinal className="w-3.5 h-3.5 text-primary" />
                  <span>Configured Spaces Scope ({selectedProject.spaces?.length || 0})</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {selectedProject.scopeType || "Turnkey Fit-Out"}
                </span>
              </div>

              {selectedProject.spaces && selectedProject.spaces.length > 0 ? (
                <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
                  {selectedProject.spaces.map((sp) => (
                    <div key={sp.id} className="p-3 bg-card flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-foreground">{sp.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Type: {sp.type.replace(/_/g, " ")} · Qty: {sp.quantity}
                        </div>
                      </div>
                      {sp.styleName && (
                        <div className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-mono font-medium">
                          {sp.styleName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                  No spaces configured in intake.
                </div>
              )}
            </div>

            {/* Assignment & Actions */}
            <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-muted-foreground">Assigned Engineer: </span>
                <span className="font-medium text-foreground">
                  {selectedProject.leadEngineerName || "Unassigned"}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setAssigningProjectId(selectedProject.id);
                    setSelectedEngineerId(selectedProject.leadEngineerId ? Number(selectedProject.leadEngineerId) : "");
                  }}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{selectedProject.leadEngineerId ? "Reassign Engineer" : "Assign Engineer"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
