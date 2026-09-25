"use client";

import * as React from "react";
import {
  MOCK_USERS,
  MOCK_PROJECTS,
  MOCK_CATALOG_PACKAGES,
  MOCK_AUDIT_LOGS,
} from "@/lib/mock-data";
import { User, Role, CatalogPackage, AuditLogEntry } from "@/lib/types";
import { ShieldCheck } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function AdminDashboard() {
  const [users, setUsers] = React.useState<User[]>(MOCK_USERS);
  const [packages] = React.useState<CatalogPackage[]>(MOCK_CATALOG_PACKAGES);
  const [auditLogs, setAuditLogs] = React.useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [activeTab, setActiveTab] = React.useState<"OVERVIEW" | "USERS" | "CATALOG" | "AUDIT">("OVERVIEW");

  // Handle changing user role
  const handleRoleChange = (userId: number, newRole: Role) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    setAuditLogs((prev) => [
      {
        id: `log-${prev.length + 1}`,
        timestamp: "2026-09-25 15:30:00",
        actorName: "System Administrator",
        actorRole: "ADMINISTRATOR",
        action: "ELEVATE_USER_ROLE",
        targetEntity: `User #${userId}`,
        details: `Role updated to ${newRole}`,
      },
      ...prev,
    ]);
  };

  const totalPipeline = MOCK_PROJECTS.reduce((acc, p) => acc + p.budgetEgp, 0);

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>EXECUTIVE & ATELIER GOVERNANCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-foreground">
            Company Leadership & Administration
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Monitor firm-wide financials, manage RBAC staff roles, configure turnkey pricing packages, and inspect security audit trails.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-card shadow-xs">
          {(
            [
              { key: "OVERVIEW", label: "Executive BI" },
              { key: "USERS", label: "Staff & RBAC" },
              { key: "CATALOG", label: "Package Catalog" },
              { key: "AUDIT", label: "Audit Logs" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                activeTab === t.key
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-8">
          {/* Executive Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
              <div className="text-xs text-muted-foreground font-mono uppercase mb-2">
                Active Construction Pipeline
              </div>
              <div className="text-2xl font-semibold font-mono text-foreground">
                EGP {(totalPipeline / 1_000_000).toFixed(1)}M
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                6 contracted residential estates
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
              <div className="text-xs text-muted-foreground font-mono uppercase mb-2">
                Average Gross Margin
              </div>
              <div className="text-2xl font-semibold font-mono text-emerald-600">
                31.8%
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                +2.4% above FY2026 forecast
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
              <div className="text-xs text-muted-foreground font-mono uppercase mb-2">
                Turnkey Completion SLA
              </div>
              <div className="text-2xl font-semibold font-mono text-foreground">
                94.2%
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                On-time handover adherence
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
              <div className="text-xs text-muted-foreground font-mono uppercase mb-2">
                Invoiced & Collected
              </div>
              <div className="text-2xl font-semibold font-mono text-foreground">
                EGP 38.6M
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                52% milestone cashflow collected
              </p>
            </div>
          </div>

          {/* Typology Breakdown */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs">
            <h3 className="font-serif text-lg font-medium text-foreground mb-4">
              Revenue & Margin Breakdown by Architectural Typology
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-foreground">Private Villas</span>
                  <span className="font-mono text-emerald-600 font-medium">34.2% Margin</span>
                </div>
                <div className="text-xl font-mono font-medium text-foreground">EGP 37.2M</div>
                <div className="w-full h-1.5 bg-border rounded-full mt-3 overflow-hidden">
                  <div className="bg-primary h-full w-[65%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-foreground">Sky Penthouses</span>
                  <span className="font-mono text-emerald-600 font-medium">30.8% Margin</span>
                </div>
                <div className="text-xl font-mono font-medium text-foreground">EGP 20.7M</div>
                <div className="w-full h-1.5 bg-border rounded-full mt-3 overflow-hidden">
                  <div className="bg-primary h-full w-[45%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-foreground">Urban Duplexes</span>
                  <span className="font-mono text-emerald-600 font-medium">27.5% Margin</span>
                </div>
                <div className="text-xl font-mono font-medium text-foreground">EGP 16.7M</div>
                <div className="w-full h-1.5 bg-border rounded-full mt-3 overflow-hidden">
                  <div className="bg-primary h-full w-[35%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF & RBAC MANAGEMENT */}
      {activeTab === "USERS" && (
        <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">
                Staff Directory & Role-Based Access Control (RBAC)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage operational permissions for Engineers, Project Managers, Company Owners, and Administrators.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-[10px] uppercase font-mono text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email & Phone</th>
                  <th className="py-3 px-4">Active Role</th>
                  <th className="py-3 px-4">Active Workload</th>
                  <th className="py-3 px-4">Security Status</th>
                  <th className="py-3 px-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{u.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">ID: #{u.id}</div>
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">
                      <div>{u.email}</div>
                      <div className="text-[10px] font-mono">{u.phone || "—"}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        className="h-7 px-2 rounded border border-border bg-background text-[11px] font-mono uppercase focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="ENGINEER">ENGINEER</option>
                        <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
                        <option value="COMPANY_OWNER">COMPANY_OWNER</option>
                        <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-muted-foreground">
                      {u.activeProjectsCount ? `${u.activeProjectsCount} Projects` : "—"}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.mustChangePassword ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-800">
                          TEMPORARY PASSWORD
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800">
                          VERIFIED
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-end">
                      <button
                        type="button"
                        className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                      >
                        Edit Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CATALOG & PRICING */}
      {activeTab === "CATALOG" && (
        <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">
                Service Packages & Base Rate Catalog
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Standardized client offerings, revision allowances, and construction square-meter baselines.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="p-5 rounded-xl border border-border bg-muted/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                    {pkg.type.replace("_", " ")}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>

                <h4 className="font-medium text-foreground text-sm">{pkg.name}</h4>

                <div className="space-y-1.5 border-t border-border pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Package Price:</span>
                    <span className="font-mono font-medium text-foreground">
                      EGP {pkg.basePriceEgp.toLocaleString()}
                    </span>
                  </div>
                  {pkg.ratePerMeterEgp && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate Per M²:</span>
                      <span className="font-mono font-medium text-foreground">
                        EGP {pkg.ratePerMeterEgp.toLocaleString()} / m²
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Turnaround Time:</span>
                    <span className="font-mono text-foreground">{pkg.turnaroundDays} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Included Revisions:</span>
                    <span className="font-mono text-foreground">{pkg.includedRevisions} Revisions</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: IMMUTABLE AUDIT LOG */}
      {activeTab === "AUDIT" && (
        <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">
                Immutable System Audit Log
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cryptographically tracked record of assignments, dimensional certifications, and financial approvals.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-lg border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-foreground">{log.action}</span>
                    <span className="text-muted-foreground">· {log.targetEntity}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-0.5">{log.details}</p>
                </div>

                <div className="text-end shrink-0 text-[10px] font-mono text-muted-foreground">
                  <div>{log.actorName} ({log.actorRole})</div>
                  <div>{log.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
