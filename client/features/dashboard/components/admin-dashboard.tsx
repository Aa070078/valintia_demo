"use client";

import * as React from "react";
import {
  MOCK_USERS,
  MOCK_PROJECTS,
  MOCK_CATALOG_PACKAGES,
  MOCK_AUDIT_LOGS,
} from "../mock-data";
import { User, Role, CatalogPackage, AuditLogEntry } from "../types";
import {
  ShieldCheck,
  Copy,
  Check,
  UserPlus,
  Key,
} from "@phosphor-icons/react";
import { CreateStaffModal } from "./create-staff-modal";
import { authApi } from "@/features/auth/api/auth.api";
import type { User as AuthUser } from "@/features/auth/types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export function AdminDashboard() {
  const { isRTL } = useLanguage();
  const [users, setUsers] = React.useState<User[]>(() => {
    const staffList = authApi.getAllStaffUsers();
    const merged = [...MOCK_USERS];
    for (const s of staffList) {
      const idx = merged.findIndex((u) => u.id === s.id || u.username === s.username);
      const transformed: User = {
        id: s.id,
        username: s.username,
        name: s.name,
        email: s.username,
        phone: s.phone,
        role: s.role as Role,
        activeProjectsCount: s.activeProjectsCount || 0,
        mustChangePassword: Boolean(s.mustChangePassword || s.requiresPasswordChange),
      };
      if (idx >= 0) {
        merged[idx] = transformed;
      } else {
        merged.unshift(transformed);
      }
    }
    return merged;
  });
  const [packages] = React.useState<CatalogPackage[]>(MOCK_CATALOG_PACKAGES);
  const [auditLogs, setAuditLogs] = React.useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [activeTab, setActiveTab] = React.useState<"OVERVIEW" | "USERS" | "CATALOG" | "AUDIT">("OVERVIEW");
  const [showCreateStaffModal, setShowCreateStaffModal] = React.useState(false);
  const [copiedUserId, setCopiedUserId] = React.useState<string | number | null>(null);

  const handleUserCreated = (newUser: AuthUser) => {
    setUsers((prev) => [
      {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.username,
        phone: newUser.phone,
        role: newUser.role as Role,
        activeProjectsCount: 0,
        mustChangePassword: true,
      },
      ...prev.filter((u) => u.id !== newUser.id),
    ]);

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        actorName: "System Administrator",
        actorRole: "ADMINISTRATOR",
        action: "PROVISION_STAFF_ACCOUNT",
        targetEntity: `${newUser.name} (@${newUser.username})`,
        details: `Assigned role ${newUser.role} with temporary password enforcement on initial login`,
      },
      ...prev,
    ]);
  };

  // Handle changing user role
  const handleRoleChange = (userId: number | string, newRole: Role) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        actorName: "System Administrator",
        actorRole: "ADMINISTRATOR",
        action: "ELEVATE_USER_ROLE",
        targetEntity: `User #${userId}`,
        details: `Role updated to ${newRole}`,
      },
      ...prev,
    ]);
  };

  const handleCopyCredentials = (u: User) => {
    const text = isRTL
      ? `بيانات الدخول إلى منصة فالنتيا:\nاسم المستخدم: ${u.username}\nالصلاحية: ${u.role}\nالحالة: ${u.mustChangePassword ? "يلزم تغيير كلمة المرور فور أول دخول" : "مفعل"}\nرابط الدخول: https://client-phi-seven-43.vercel.app/login`
      : `Valentia Staff Credentials:\nUsername: ${u.username}\nRole: ${u.role}\nStatus: ${u.mustChangePassword ? "Mandatory Password Change On First Login" : "Verified"}\nLogin URL: https://client-phi-seven-43.vercel.app/login`;

    navigator.clipboard.writeText(text);
    setCopiedUserId(u.id);
    setTimeout(() => setCopiedUserId(null), 2000);
  };

  const totalPipeline = MOCK_PROJECTS.reduce((acc, p) => acc + p.budgetEgp, 0);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isRTL ? "إدارة النظام والتحكم الشامل" : "EXECUTIVE & ATELIER GOVERNANCE"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-foreground">
            {isRTL ? "لوحة الإدارة والتحكم في الصلاحيات" : "Company Leadership & Administration"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            {isRTL
              ? "متابعة مؤشرات الأداء، إدارة كوادر العمل والصلاحيات (RBAC)، تكويد باقات التشطيب، وسجلات الأمان."
              : "Monitor firm-wide financials, manage RBAC staff roles, configure turnkey pricing packages, and inspect security audit trails."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border bg-card shadow-xs flex-wrap">
          {(
            [
              { key: "OVERVIEW", label: "Executive BI", labelAr: "المؤشرات العامة" },
              { key: "USERS", label: "Staff & RBAC", labelAr: "المستخدمين والصلاحيات" },
              { key: "CATALOG", label: "Package Catalog", labelAr: "دليل الباقات" },
              { key: "AUDIT", label: "Audit Logs", labelAr: "سجل العمليات" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                activeTab === t.key
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              {isRTL ? t.labelAr : t.label}
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
                {isRTL ? "قيمة المشاريع النشطة" : "Active Construction Pipeline"}
              </div>
              <div className="text-2xl font-semibold font-mono text-foreground">
                EGP {(totalPipeline / 1_000_000).toFixed(1)}M
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isRTL ? "٦ عقود تشطيب سكني فاخر" : "6 contracted residential estates"}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
              <div className="text-xs text-muted-foreground font-mono uppercase mb-2">
                {isRTL ? "متوسط هامش الربح" : "Average Gross Margin"}
              </div>
              <div className="text-2xl font-semibold font-mono text-emerald-600">
                31.8%
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isRTL ? "+٢.٤٪ أعلى من توقعات السنة" : "+2.4% above FY2026 forecast"}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
              <div className="text-xs text-muted-foreground font-mono uppercase mb-2">
                {isRTL ? "الالتزام بجدول التسليم" : "Turnkey Completion SLA"}
              </div>
              <div className="text-2xl font-semibold font-mono text-foreground">
                94.2%
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isRTL ? "تسليم المفتاح في الميعاد المحدد" : "On-time handover adherence"}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
              <div className="text-xs text-muted-foreground font-mono uppercase mb-2">
                {isRTL ? "إجمالي المستخلصات المحصلة" : "Invoiced & Collected"}
              </div>
              <div className="text-2xl font-semibold font-mono text-foreground">
                EGP 38.6M
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isRTL ? "٥٢٪ من المستخلصات تم تحصيلها" : "52% milestone cashflow collected"}
              </p>
            </div>
          </div>

          {/* Typology Breakdown */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs">
            <h3 className="font-serif text-lg font-medium text-foreground mb-4">
              {isRTL ? "توزيع الإيرادات وهوامش الربح حسب نوع العقار" : "Revenue & Margin Breakdown by Architectural Typology"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-foreground">{isRTL ? "فلل خاصة (Private Villas)" : "Private Villas"}</span>
                  <span className="font-mono text-emerald-600 font-medium">34.2% Margin</span>
                </div>
                <div className="text-xl font-mono font-medium text-foreground">EGP 37.2M</div>
                <div className="w-full h-1.5 bg-border rounded-full mt-3 overflow-hidden">
                  <div className="bg-primary h-full w-[65%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-foreground">{isRTL ? "بنتهاوس معلق (Sky Penthouses)" : "Sky Penthouses"}</span>
                  <span className="font-mono text-emerald-600 font-medium">30.8% Margin</span>
                </div>
                <div className="text-xl font-mono font-medium text-foreground">EGP 20.7M</div>
                <div className="w-full h-1.5 bg-border rounded-full mt-3 overflow-hidden">
                  <div className="bg-primary h-full w-[45%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-foreground">{isRTL ? "دوبلكس عصري (Urban Duplexes)" : "Urban Duplexes"}</span>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">
                {isRTL ? "دليل حسابات فريق العمل والصلاحيات (RBAC)" : "Staff Directory & Role-Based Access Control (RBAC)"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRTL
                  ? "إنشاء حسابات المهندسين والمديرين، تعيين كلمة المرور المؤقتة، وإلزامهم بتغييرها عند أول تسجيل دخول."
                  : "Provision staff accounts for Engineers, Project Managers, and Admins. First-time login password change is strictly enforced."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateStaffModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium uppercase tracking-wider shadow-2xs transition-all cursor-pointer active:scale-98 shrink-0"
            >
              <UserPlus size={15} />
              <span>{isRTL ? "إنشاء حساب موظف جديد" : "Add Staff Account"}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-[10px] uppercase font-mono text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">{isRTL ? "المستخدم" : "User"}</th>
                  <th className="py-3 px-4">{isRTL ? "الإيميل والهاتف" : "Email & Phone"}</th>
                  <th className="py-3 px-4">{isRTL ? "الصلاحية" : "Active Role"}</th>
                  <th className="py-3 px-4">{isRTL ? "المشاريع المسندة" : "Active Workload"}</th>
                  <th className="py-3 px-4">{isRTL ? "حالة أول دخول" : "Security & Status"}</th>
                  <th className="py-3 px-4 text-end">{isRTL ? "إجراءات" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => {
                  const isCopied = copiedUserId === u.id;
                  const needsPasswordChange = Boolean(u.mustChangePassword);

                  return (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">{u.name}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">ID: #{u.id}</div>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground">
                        <div className="font-mono text-[11px] text-foreground">{u.email || u.username}</div>
                        <div className="text-[10px] font-mono">{u.phone || "—"}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                          className="h-7 px-2 rounded-lg border border-border bg-background text-[11px] font-mono uppercase focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                        >
                          <option value="CUSTOMER">CUSTOMER</option>
                          <option value="ENGINEER">ENGINEER</option>
                          <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
                          <option value="COMPANY_OWNER">COMPANY_OWNER</option>
                          <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-muted-foreground">
                        {u.activeProjectsCount ? `${u.activeProjectsCount} ${isRTL ? "مشاريع" : "Projects"}` : "—"}
                      </td>

                      <td className="py-3.5 px-4">
                        {needsPasswordChange ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            <Key className="w-3 h-3 text-amber-600" />
                            <span>{isRTL ? "أول دخول - كلمة سر مؤقتة" : "TEMPORARY PASSWORD"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>{isRTL ? "مفعل ومؤكد" : "VERIFIED"}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-end">
                        <button
                          type="button"
                          onClick={() => handleCopyCredentials(u)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-card hover:bg-muted text-[11px] font-mono text-foreground transition-colors cursor-pointer"
                          title={isRTL ? "نسخ بيانات الدخول" : "Copy credentials"}
                        >
                          {isCopied ? (
                            <>
                              <Check size={12} className="text-emerald-500" />
                              <span className="text-emerald-600 font-semibold">{isRTL ? "تم" : "Done"}</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>{isRTL ? "نسخ" : "Copy"}</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
                {isRTL ? "باقات التشطيب وقوائم الأسعار المعيارية" : "Service Packages & Base Rate Catalog"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRTL
                  ? "تسعير المتر المربع، عدد جولات التعديل، ومواعيد التسليم المعتمدة لكل باقة."
                  : "Standardized client offerings, revision allowances, and construction square-meter baselines."}
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
                    <span className="text-muted-foreground">{isRTL ? "سعر الباقة الأساسي:" : "Base Package Price:"}</span>
                    <span className="font-mono font-medium text-foreground">
                      EGP {pkg.basePriceEgp.toLocaleString()}
                    </span>
                  </div>
                  {pkg.ratePerMeterEgp && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isRTL ? "سعر المتر المربع:" : "Rate Per M²:"}</span>
                      <span className="font-mono font-medium text-foreground">
                        EGP {pkg.ratePerMeterEgp.toLocaleString()} / m²
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isRTL ? "مدة التنفيذ:" : "Turnaround Time:"}</span>
                    <span className="font-mono text-foreground">{pkg.turnaroundDays} {isRTL ? "يوم" : "Days"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isRTL ? "التعديلات المتاحة:" : "Included Revisions:"}</span>
                    <span className="font-mono text-foreground">{pkg.includedRevisions} {isRTL ? "تعديلات" : "Revisions"}</span>
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
                {isRTL ? "سجل العمليات والأمان الموثق" : "Immutable System Audit Log"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRTL
                  ? "سجل غير قابل للتعديل يوثق جميع التكليفات والاعتمادات الهندسية والمالية."
                  : "Cryptographically tracked record of assignments, dimensional certifications, and financial approvals."}
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

      {/* Create Staff Modal */}
      <CreateStaffModal
        open={showCreateStaffModal}
        onClose={() => setShowCreateStaffModal(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}
