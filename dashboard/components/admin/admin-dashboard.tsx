"use client";

import * as React from "react";
import { MOCK_USERS, MOCK_AUDIT_LOGS } from "@/lib/mock-data";
import { User, Role, AuditLogEntry } from "@/lib/types";
import {
  ShieldCheck,
  UserPlus,
  Users,
  CheckCircle,
  X,
  Check,
  Funnel,
  ClockCounterClockwise,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function AdminDashboard() {
  const [users, setUsers] = React.useState<User[]>(MOCK_USERS);
  const [auditLogs, setAuditLogs] = React.useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [activeTab, setActiveTab] = React.useState<"STAFF" | "AUDIT">("STAFF");
  const [roleFilter, setRoleFilter] = React.useState<string>("ALL");

  // Role edit modal state
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<Role>("ENGINEER");

  // Add staff modal state
  const [isAddingStaff, setIsAddingStaff] = React.useState(false);
  const [newStaffName, setNewStaffName] = React.useState("");
  const [newStaffEmail, setNewStaffEmail] = React.useState("");
  const [newStaffPhone, setNewStaffPhone] = React.useState("");
  const [newStaffRole, setNewStaffRole] = React.useState<Role>("ENGINEER");
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);

  // Filtered users
  const filteredUsers = React.useMemo(() => {
    if (roleFilter === "ALL") return users;
    return users.filter((u) => u.role === roleFilter);
  }, [users, roleFilter]);

  // Handle changing user role
  const handleConfirmRoleChange = () => {
    if (!editingUser) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? { ...u, role: selectedRole } : u))
    );

    const logEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      actorName: "System Administrator",
      actorRole: "ADMINISTRATOR",
      action: "ELEVATE_USER_ROLE",
      targetEntity: `User #${editingUser.id} (${editingUser.name})`,
      details: `Role updated from ${editingUser.role} to ${selectedRole}`,
    };

    setAuditLogs((prev) => [logEntry, ...prev]);
    setActionNotice(`Updated ${editingUser.name}'s role to ${selectedRole.replace(/_/g, " ")}`);
    setEditingUser(null);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handle adding new staff member
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;

    const newUser: User = {
      id: Date.now(),
      username: newStaffEmail,
      name: newStaffName,
      email: newStaffEmail,
      phone: newStaffPhone || undefined,
      role: newStaffRole,
      mustChangePassword: true,
      activeProjectsCount: 0,
    };

    setUsers((prev) => [newUser, ...prev]);

    const logEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      actorName: "System Administrator",
      actorRole: "ADMINISTRATOR",
      action: "CREATE_STAFF_ACCOUNT",
      targetEntity: `User #${newUser.id} (${newUser.name})`,
      details: `Created new staff account with role ${newUser.role}`,
    };

    setAuditLogs((prev) => [logEntry, ...prev]);
    setActionNotice(`Staff account created for ${newStaffName}`);
    setIsAddingStaff(false);
    setNewStaffName("");
    setNewStaffEmail("");
    setNewStaffPhone("");
    setTimeout(() => setActionNotice(null), 4000);
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case "ENGINEER":
        return {
          label: "Site Architect",
          className: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300",
        };
      case "PROJECT_MANAGER":
        return {
          label: "Project Manager",
          className: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300",
        };
      case "ADMINISTRATOR":
        return {
          label: "Administrator",
          className: "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300",
        };
      case "COMPANY_OWNER":
        return {
          label: "Company Owner",
          className: "bg-[#B88460]/15 text-[#8F5A36] border-[#B88460]/30 dark:bg-[#B88460]/20 dark:text-[#E5D5C5]",
        };
      default:
        return {
          label: role,
          className: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>EXECUTIVE &amp; ATELIER GOVERNANCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-foreground">
            Staff Governance &amp; Operations
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Manage RBAC staff permissions, audit commission allocations, track team member credentials, and inspect security access logs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border bg-card shadow-xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("STAFF")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono uppercase transition-colors cursor-pointer flex items-center gap-1.5",
              activeTab === "STAFF"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff &amp; RBAC ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("AUDIT")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono uppercase transition-colors cursor-pointer flex items-center gap-1.5",
              activeTab === "AUDIT"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ClockCounterClockwise className="w-3.5 h-3.5" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="p-4 rounded-xl bg-[#EFE8DE] border border-[#B88460]/30 text-[#503C2C] dark:bg-[#2C2621] dark:border-[#B88460]/40 dark:text-[#F5EFE6] text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#B88460]" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-[#706E6B] hover:text-[#503C2C] dark:text-[#A89F95] dark:hover:text-[#F5EFE6]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TAB 1: STAFF & RBAC GOVERNANCE */}
      {activeTab === "STAFF" && (
        <div className="space-y-6">
          {/* Staff Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
              <div className="text-[11px] font-mono text-muted-foreground uppercase mb-1">
                Total Team Staff
              </div>
              <div className="text-xl font-semibold font-mono text-foreground">
                {users.length}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
              <div className="text-[11px] font-mono text-muted-foreground uppercase mb-1">
                Site Engineers
              </div>
              <div className="text-xl font-semibold font-mono text-amber-700 dark:text-amber-300">
                {users.filter((u) => u.role === "ENGINEER").length}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
              <div className="text-[11px] font-mono text-muted-foreground uppercase mb-1">
                Project Managers
              </div>
              <div className="text-xl font-semibold font-mono text-blue-700 dark:text-blue-300">
                {users.filter((u) => u.role === "PROJECT_MANAGER").length}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
              <div className="text-[11px] font-mono text-muted-foreground uppercase mb-1">
                System Admins / Owners
              </div>
              <div className="text-xl font-semibold font-mono text-purple-700 dark:text-purple-300">
                {users.filter((u) => u.role === "ADMINISTRATOR" || u.role === "COMPANY_OWNER").length}
              </div>
            </div>
          </div>

          {/* Controls Bar: Role Filters & Add Staff Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1 mr-1">
                <Funnel className="w-3 h-3" />
                <span>ROLE:</span>
              </span>
              {(["ALL", "ENGINEER", "PROJECT_MANAGER", "ADMINISTRATOR", "COMPANY_OWNER"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-mono uppercase transition-colors cursor-pointer",
                    roleFilter === r
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {r === "ALL" ? "All Roles" : r.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsAddingStaff(true)}
              className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Staff Member</span>
            </button>
          </div>

          {/* Staff Members Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-[10px] uppercase font-mono text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Member Name &amp; Email</th>
                    <th className="py-3 px-4">RBAC Role</th>
                    <th className="py-3 px-4">Phone Contact</th>
                    <th className="py-3 px-4">Assigned Commissions</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => {
                    const roleBadge = getRoleBadge(user.role);

                    return (
                      <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            <span>{user.name || user.username}</span>
                            {user.mustChangePassword && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                                1st Login Reset
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground">
                            {user.email || user.username}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border",
                              roleBadge.className
                            )}
                          >
                            {roleBadge.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-muted-foreground">
                          {user.phone || "—"}
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          {user.role === "ENGINEER" || user.role === "PROJECT_MANAGER" ? (
                            <span className="font-medium text-foreground">
                              {user.activeProjectsCount || 0} Active
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Firm Wide</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser(user);
                              setSelectedRole(user.role);
                            }}
                            className="h-7 px-2.5 rounded-lg border border-border bg-card hover:bg-muted text-xs text-foreground cursor-pointer transition-colors"
                          >
                            Change Role
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT TRAIL */}
      {activeTab === "AUDIT" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-serif font-medium text-foreground">
              Security &amp; Administrative Event Log
            </h2>
            <span className="text-xs font-mono text-muted-foreground">
              Immutable administrative history
            </span>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-[10px] uppercase font-mono text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {log.timestamp}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-foreground">{log.actorName}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          {log.actorRole}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-muted text-foreground border border-border">
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-foreground whitespace-nowrap">
                        {log.targetEntity}
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground leading-relaxed">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">
                  RBAC Role Update
                </span>
                <h3 className="font-serif text-lg font-normal text-foreground">
                  {editingUser.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase text-muted-foreground">
                Select Authorized Role:
              </label>

              {(["ENGINEER", "PROJECT_MANAGER", "ADMINISTRATOR", "COMPANY_OWNER"] as Role[]).map((r) => (
                <label
                  key={r}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors",
                    selectedRole === r
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border hover:bg-muted/40"
                  )}
                >
                  <span className="font-medium text-foreground">{r.replace(/_/g, " ")}</span>
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={selectedRole === r}
                    onChange={() => setSelectedRole(r)}
                    className="accent-primary"
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleChange}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Update Role</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddingStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddStaff}
            className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">
                  Staff Registration
                </span>
                <h3 className="font-serif text-lg font-normal text-foreground">
                  Add New Team Member
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingStaff(false)}
                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Full Name:
                </label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Eng. Ziad Mansour"
                  className="w-full h-8 px-3 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Email / Username:
                </label>
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="ziad.mansour@valentia.com"
                  className="w-full h-8 px-3 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Phone (Optional):
                </label>
                <input
                  type="tel"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  placeholder="+20 100 000 0000"
                  className="w-full h-8 px-3 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Assigned Role:
                </label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as Role)}
                  className="w-full h-8 px-3 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:border-primary cursor-pointer font-mono"
                >
                  <option value="ENGINEER">Site Architect (ENGINEER)</option>
                  <option value="PROJECT_MANAGER">Project Manager (PROJECT_MANAGER)</option>
                  <option value="ADMINISTRATOR">Administrator (ADMINISTRATOR)</option>
                  <option value="COMPANY_OWNER">Company Owner (COMPANY_OWNER)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsAddingStaff(false)}
                className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
