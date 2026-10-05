"use client";

import * as React from "react";
import { MOCK_PROJECTS, MOCK_USERS } from "@/lib/mock-data";
import { ProjectOverview } from "@/lib/types";
import {
  Compass,
  Buildings,
  MapPin,
  Phone,
  User,
  CaretRight,
  CheckCircle,
  Clock,
  ArrowsOutCardinal,
  X,
  NotePencil,
  Check,
  ClipboardText,
  FileText,
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

export function EngineerDashboard() {
  const [projects, setProjects] = React.useState<ProjectOverview[]>(MOCK_PROJECTS);
  // Default to Karim El-Sayed (id: 1)
  const [activeEngineerId, setActiveEngineerId] = React.useState<number>(1);
  const [selectedProject, setSelectedProject] = React.useState<ProjectOverview | null>(null);

  // Engineering Review modal state
  const [isAddingReview, setIsAddingReview] = React.useState(false);
  const [reviewNotes, setReviewNotes] = React.useState("");
  const [reviewChecks, setReviewChecks] = React.useState<Record<string, boolean>>({
    drawingsLegible: false,
    spacesConsistent: false,
    mepConstraintsNoted: false,
  });
  const [actionSuccessMsg, setActionSuccessMsg] = React.useState<string | null>(null);

  const engineers = MOCK_USERS.filter((u) => u.role === "ENGINEER");
  const activeEngineer = engineers.find((e) => e.id === activeEngineerId) || engineers[0];

  // Filter projects assigned to this engineer
  const assignedProjects = React.useMemo(() => {
    return projects.filter((p) => p.leadEngineerId === activeEngineerId);
  }, [projects, activeEngineerId]);

  // Handle saving engineer review notes into project dossier
  const handleSaveReview = (projectId: string) => {
    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
      const stamp = new Date().toISOString().slice(0, 10);
      const noteEntry = `[Architectural Review - ${activeEngineer.name} (${stamp})]: ${reviewNotes.trim()}`;
      return {
        ...p,
        notes: p.notes ? `${p.notes}\n\n${noteEntry}` : noteEntry,
        nextMilestone: "Engineering Review Complete · Consultation Preparation",
        nextMilestoneDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      };
    });

    setProjects(updated);
    if (selectedProject?.id === projectId) {
      const match = updated.find((p) => p.id === projectId);
      if (match) setSelectedProject(match);
    }

    setActionSuccessMsg("Architectural review notes saved to project dossier.");
    setIsAddingReview(false);
    setReviewNotes("");
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const hasReviewLogged = (p: ProjectOverview) => {
    return Boolean(p.notes && p.notes.includes("[Architectural Review"));
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Top Banner & Engineer Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>ARCHITECTURAL ENGINEERING DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-foreground">
            Assigned Architectural Commissions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Review architectural specifications, inspect spaces &amp; style directions, analyze drawings, and prepare technical feasibility reviews for your assigned residences.
          </p>
        </div>

        {/* Engineer Profile & Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card shadow-xs">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs font-mono">
              {activeEngineer.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="text-start">
              <span className="block text-xs font-medium text-foreground leading-tight">
                {activeEngineer.name}
              </span>
              <span className="block text-[10px] font-mono text-muted-foreground">
                {assignedProjects.length} Active {assignedProjects.length === 1 ? "Commission" : "Commissions"}
              </span>
            </div>
          </div>

          {/* Switcher to view other engineers */}
          <div className="hidden sm:block">
            <select
              value={activeEngineerId}
              onChange={(e) => {
                setActiveEngineerId(Number(e.target.value));
                setSelectedProject(null);
                setIsAddingReview(false);
              }}
              className="h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground font-mono outline-none focus:border-primary cursor-pointer"
            >
              {engineers.map((eng) => (
                <option key={eng.id} value={eng.id}>
                  Switch: {eng.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metric Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Buildings className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-semibold font-mono text-foreground">
              {assignedProjects.length}
            </div>
            <div className="text-[11px] text-muted-foreground uppercase font-mono">
              Assigned Commissions
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-semibold font-mono text-foreground">
              {assignedProjects.filter((p) => !hasReviewLogged(p)).length}
            </div>
            <div className="text-[11px] text-muted-foreground uppercase font-mono">
              Pending Spec Review
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-semibold font-mono text-foreground">
              {assignedProjects.filter((p) => hasReviewLogged(p)).length}
            </div>
            <div className="text-[11px] text-muted-foreground uppercase font-mono">
              Reviews Logged
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Assigned Projects List (P0) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-serif font-medium text-foreground">
            Assigned Projects Queue ({assignedProjects.length})
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            Select any project to inspect dossier and conduct architectural review
          </span>
        </div>

        {assignedProjects.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-border bg-card/50 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Buildings className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-foreground">
              No Projects Assigned
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              There are currently no active commissions assigned to {activeEngineer.name}. New commissions will appear here once assigned by the Project Manager.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedProjects.map((project) => {
              const reviewed = hasReviewLogged(project);
              const isSelected = selectedProject?.id === project.id;

              return (
                <div
                  key={project.id}
                  onClick={() => {
                    setSelectedProject(project);
                    setIsAddingReview(false);
                  }}
                  className={cn(
                    "p-5 rounded-2xl border bg-card text-card-foreground shadow-xs transition-all cursor-pointer relative hover:border-primary/50 hover:shadow-md",
                    isSelected ? "border-primary ring-1 ring-primary/30" : "border-border"
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                          {project.code}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {project.typology} · {project.areaM2} m²
                        </span>
                      </div>
                      <h3 className="text-base font-serif font-normal text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                    </div>

                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border shrink-0",
                        reviewed
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300"
                      )}
                    >
                      {reviewed ? "Review Logged" : "Assigned to You"}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs border-t border-border/60 pt-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                      <span className="truncate text-foreground font-medium">
                        {project.compound ? `${project.compound}, ` : ""}
                        {project.location}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground pt-1">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 shrink-0" />
                        <span>Client: <strong className="font-medium text-foreground">{project.clientName}</strong></span>
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {project.spaces?.length || 0} Spaces Defined
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Milestone: {project.nextMilestoneDate}
                    </span>
                    <span className="text-primary font-medium inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Open Project Dossier</span>
                      <CaretRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Project Full Dossier Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {selectedProject.code} · ARCHITECTURAL DOSSIER
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300">
                    Assigned to You
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-normal text-foreground">
                  {selectedProject.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedProject(null);
                  setIsAddingReview(false);
                }}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Client & Representation Context */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted-foreground">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>Client &amp; Representation Information</span>
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
                      ? "Valentia Direct Management"
                      : selectedProject.representative?.name
                      ? `${selectedProject.representative.name} (${selectedProject.representative.relationship || "Rep"}) · ${selectedProject.representative.phone || ""}`
                      : "Authorized Representative"}
                  </span>
                </div>
              </div>
            </div>

            {/* Property Information & Specifications */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted-foreground">
                <Buildings className="w-3.5 h-3.5 text-primary" />
                <span>Property Specifications</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Typology:</span>
                  <span className="font-mono font-medium text-foreground">{selectedProject.typology}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Area:</span>
                  <span className="font-mono font-medium text-foreground">{selectedProject.areaM2} m²</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Compound:</span>
                  <span className="font-medium text-foreground">{selectedProject.compound || "Stand-alone"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">City / Region:</span>
                  <span className="font-medium text-foreground">{selectedProject.location}</span>
                </div>
              </div>

              {selectedProject.notes && (
                <div className="border-t border-border/60 pt-2 text-xs">
                  <span className="text-muted-foreground block text-[11px]">Project Record Notes &amp; History:</span>
                  <p className="text-foreground leading-relaxed mt-0.5 bg-background/50 p-2.5 rounded-lg border border-border/40 font-mono text-[11px] whitespace-pre-wrap">
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
                  No discrete spaces itemized in draft dossier.
                </div>
              )}
            </div>

            {/* Engineer Relevant Actions Only */}
            <div className="border-t border-border pt-4 space-y-4">
              <div className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-2">
                <NotePencil className="w-3.5 h-3.5 text-primary" />
                <span>Engineer Review &amp; Feasibility Notes</span>
              </div>

              {!isAddingReview ? (
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddingReview(true)}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <ClipboardText className="w-4 h-4" />
                    <span>Log Architectural Review</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProject(null);
                      setIsAddingReview(false);
                    }}
                    className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors ms-auto"
                  >
                    Close Dossier
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-primary/40 bg-primary/5 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" />
                      <span>Record Architectural Feasibility Review</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingReview(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Configurable/Contract-driven Criteria Checkboxes (No hardcoded fake budget checks) */}
                  <div className="space-y-2 py-1">
                    <span className="text-[11px] font-mono text-muted-foreground uppercase block">
                      Engineering Verification Checkpoints:
                    </span>
                    <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reviewChecks.drawingsLegible}
                        onChange={(e) =>
                          setReviewChecks((prev) => ({ ...prev, drawingsLegible: e.target.checked }))
                        }
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span>Customer floor plans and architectural layout legible</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reviewChecks.spacesConsistent}
                        onChange={(e) =>
                          setReviewChecks((prev) => ({ ...prev, spacesConsistent: e.target.checked }))
                        }
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span>Spaces breakdown matches property area and unit typology</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reviewChecks.mepConstraintsNoted}
                        onChange={(e) =>
                          setReviewChecks((prev) => ({ ...prev, mepConstraintsNoted: e.target.checked }))
                        }
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span>Special MEP, compound constraints, or acoustic requirements cataloged</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">
                      Lead Architect Notes &amp; Consultation Recommendations:
                    </label>
                    <textarea
                      rows={3}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add engineering assessment, preliminary structural observations, or topics for customer consultation..."
                      className="w-full p-2.5 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingReview(false)}
                      className="px-3 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      disabled={!reviewNotes.trim()}
                      onClick={() => handleSaveReview(selectedProject.id)}
                      className={cn(
                        "px-4 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5",
                        reviewNotes.trim()
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Review Notes</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
