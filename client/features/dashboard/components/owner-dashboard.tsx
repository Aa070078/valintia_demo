"use client";

import * as React from "react";
import Link from "next/link";
import {
  Crown,
  TrendUp,
  Money,
  UserCheck,
  ShieldCheck,
  CheckCircle,
  Plus,
  Buildings,
  Phone,
  EnvelopeSimple,
  Copy,
  Check,
  ArrowSquareOut,
  MapPin,
  WarningCircle,
  Sparkle,
} from "@phosphor-icons/react";
import { authApi } from "@/features/auth/api/auth.api";
import type { User } from "@/features/auth/types";
import { MOCK_PROJECTS } from "../mock-data";
import { CreateStaffModal } from "./create-staff-modal";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export function OwnerDashboard() {
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = React.useState<"STAFF" | "PORTFOLIO" | "FINANCIALS">("STAFF");
  const [staffUsers, setStaffUsers] = React.useState<User[]>(() => authApi.getAllStaffUsers());
  const [roleFilter, setRoleFilter] = React.useState<string>("ALL");
  const [showCreateStaffModal, setShowCreateStaffModal] = React.useState(false);
  const [copiedUserId, setCopiedUserId] = React.useState<string | number | null>(null);

  const handleUserCreated = (newUser: User) => {
    setStaffUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
  };

  const handleCopyVoucher = (u: User) => {
    const text = isRTL
      ? `بيانات حسابك في فالنتيا:\nاسم المستخدم: ${u.username}\nالصلاحية: ${u.role}\nالحالة: ${u.mustChangePassword ? "يلزم تغيير كلمة السر فور الدخول" : "مفعل"}\nالرابط: https://client-phi-seven-43.vercel.app/login`
      : `Valentia Staff Account:\nUsername: ${u.username}\nRole: ${u.role}\nStatus: ${u.mustChangePassword ? "Password Change Required Upon First Login" : "Active"}\nLogin: https://client-phi-seven-43.vercel.app/login`;

    navigator.clipboard.writeText(text);
    setCopiedUserId(u.id);
    setTimeout(() => setCopiedUserId(null), 2000);
  };

  const filteredStaff = React.useMemo(() => {
    if (roleFilter === "ALL") return staffUsers;
    return staffUsers.filter((u) => u.role === roleFilter);
  }, [staffUsers, roleFilter]);

  const totalContractPipeline = MOCK_PROJECTS.reduce((acc, p) => acc + p.budgetEgp, 0);
  const totalCollected = 38_600_000;
  const collectionPercentage = Math.round((totalCollected / totalContractPipeline) * 100);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Top Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider mb-2">
            <Crown className="w-3.5 h-3.5 text-[#B88460]" weight="fill" />
            <span>{isRTL ? "المكتب التنفيذي • صاحب الشركة" : "EXECUTIVE C-SUITE & OWNER DESK"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-tight text-foreground">
            {isRTL ? "متابعة القيادة وإدارة الكوادر والمشاريع" : "Firm Leadership & Workforce Governance"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            {isRTL
              ? "متابعة التدفقات المالية، هوامش الربح للمشاريع، وإصدار حسابات المهندسين والمديرين ومتابعة أول دخول لهم."
              : "Monitor enterprise fit-out cashflow, oversee staff RBAC accounts, and review portfolio milestone performance across Cairo and North Coast."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCreateStaffModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#503C2C] hover:bg-[#342D28] text-[#FAF7F2] text-xs font-medium uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-98"
          >
            <Plus size={15} weight="bold" />
            <span>{isRTL ? "إنشاء حساب موظف / مهندس" : "Provision New Staff"}</span>
          </button>

          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-2xs"
          >
            <ShieldCheck size={15} />
            <span>{isRTL ? "لوحة الأدمن التقنية" : "Admin Desk"}</span>
          </Link>
        </div>
      </div>

      {/* C-Suite Key Financial & Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs relative overflow-hidden group hover:border-[#B88460]/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono uppercase mb-2">
            <span>{isRTL ? "إجمالي قيمة التعاقدات" : "Gross Contract Value"}</span>
            <Buildings className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold font-mono text-foreground">
            EGP {(totalContractPipeline / 1_000_000).toFixed(1)}M
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{isRTL ? "٦ قصور وفلل سكنية قيد التنفيذ" : "6 contracted high-end estates"}</span>
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs relative overflow-hidden group hover:border-[#B88460]/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono uppercase mb-2">
            <span>{isRTL ? "المتحصلات النقدية" : "Cashflow Collected"}</span>
            <Money className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold font-mono text-emerald-600">
            EGP {(totalCollected / 1_000_000).toFixed(1)}M
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            <span>{collectionPercentage}% {isRTL ? "من مستخلصات المراحل المعتمدة" : "of contracted milestones collected"}</span>
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs relative overflow-hidden group hover:border-[#B88460]/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono uppercase mb-2">
            <span>{isRTL ? "متوسط هامش الربح التشغيلي" : "Average Gross Margin"}</span>
            <TrendUp className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold font-mono text-foreground">
            31.8%
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
            <TrendUp className="w-3 h-3" />
            <span>+3.3% {isRTL ? "أعلى من المستهدف السنوي" : "above FY26 target benchmark"}</span>
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs relative overflow-hidden group hover:border-[#B88460]/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono uppercase mb-2">
            <span>{isRTL ? "الالتزام بمواعيد التسليم (SLA)" : "On-Time Handover SLA"}</span>
            <CheckCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold font-mono text-foreground">
            96.5%
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            <span>{isRTL ? "معدل رضاء العملاء (CSAT): ٤.٩ / ٥.٠" : "Client CSAT: 4.9 / 5.0 (42 verified reviews)"}</span>
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          {(
            [
              { key: "STAFF", label: "Staff Directory & Access", labelAr: "إدارة كوادر العمل والصلاحيات" },
              { key: "PORTFOLIO", label: "Estate Portfolio & Compounds", labelAr: "محفظة الفلل والكمبوندات" },
              { key: "FINANCIALS", label: "Milestones & Cashflow", labelAr: "المستخلصات والتدفقات النقدية" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer",
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {isRTL ? tab.labelAr : tab.label}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Sparkle className="w-3.5 h-3.5 text-[#B88460]" />
          <span>VALENTIA ATELIER EXECUTIVE OS</span>
        </div>
      </div>

      {/* TAB 1: STAFF DIRECTORY & RBAC ACCOUNTS */}
      {activeTab === "STAFF" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  <h3 className="font-serif text-lg font-medium text-foreground">
                    {isRTL ? "دليل حسابات فريق العمل والصلاحيات" : "Staff Directory & Provisioned Credentials"}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRTL
                    ? "الحسابات التي تم إنشاؤها وتحديد كلمة مرور مؤقتة لها، مع إمكانية تسليم البيانات والتأكد من تغيير كلمة السر عند أول دخول."
                    : "Accounts provisioned with temporary passwords. Staff members are mandated to set a new password on their initial login."}
                </p>
              </div>

              {/* Role Filter & Add Button */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-muted/40 text-[11px] font-mono">
                  {(["ALL", "ENGINEER", "PROJECT_MANAGER", "ADMINISTRATOR", "COMPANY_OWNER"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={cn(
                        "px-2.5 py-1 rounded-md transition-colors cursor-pointer",
                        roleFilter === r
                          ? "bg-card text-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {r === "ALL"
                        ? isRTL ? "الكل" : "ALL"
                        : r === "ENGINEER"
                        ? isRTL ? "مهندسون" : "ENGINEERS"
                        : r === "PROJECT_MANAGER"
                        ? isRTL ? "مديرو مشاريع" : "PMS"
                        : r === "ADMINISTRATOR"
                        ? isRTL ? "أدمن" : "ADMIN"
                        : isRTL ? "مالك" : "OWNER"}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateStaffModal(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>{isRTL ? "إضافة حساب جديد" : "Add Account"}</span>
                </button>
              </div>
            </div>

            {/* Staff Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-[10px] uppercase font-mono text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-3 px-4">{isRTL ? "الاسم والمعرف" : "Name & ID"}</th>
                    <th className="py-3 px-4">{isRTL ? "بيانات التواصل" : "Contact"}</th>
                    <th className="py-3 px-4">{isRTL ? "الصلاحية" : "System Role"}</th>
                    <th className="py-3 px-4">{isRTL ? "المشاريع النشطة" : "Active Workload"}</th>
                    <th className="py-3 px-4">{isRTL ? "حالة أول تسجيل دخول" : "Security & Password Status"}</th>
                    <th className="py-3 px-4 text-end">{isRTL ? "الإجراءات" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStaff.map((u) => {
                    const isCopied = copiedUserId === u.id;
                    const isFirstLogin = Boolean(u.mustChangePassword || u.requiresPasswordChange);

                    return (
                      <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                        {/* Name & ID */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.role === "COMPANY_OWNER" && (
                              <Crown className="w-3.5 h-3.5 text-[#B88460]" weight="fill" />
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground">
                            ID: #{u.id}
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <EnvelopeSimple className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                            <span className="font-mono text-[11px] text-foreground">{u.username || u.email}</span>
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-mono">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span>{u.phone}</span>
                            </div>
                          )}
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold",
                              u.role === "ENGINEER"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : u.role === "PROJECT_MANAGER"
                                ? "bg-blue-100 text-blue-900 border border-blue-300"
                                : u.role === "COMPANY_OWNER"
                                ? "bg-purple-100 text-purple-900 border border-purple-300"
                                : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            )}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* Workload */}
                        <td className="py-3.5 px-4 font-mono text-muted-foreground">
                          {u.activeProjectsCount ? (
                            <span className="font-medium text-foreground">
                              {u.activeProjectsCount} {isRTL ? "مشاريع" : "Projects"}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </td>

                        {/* Security & Password Status */}
                        <td className="py-3.5 px-4">
                          {isFirstLogin ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono font-medium animate-pulse">
                              <WarningCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>{isRTL ? "أول دخول • كلمة سر مؤقتة" : "FIRST LOGIN • PENDING"}</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-medium">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{isRTL ? "مفعل ومؤكد" : "VERIFIED & ACTIVE"}</span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-end">
                          <button
                            type="button"
                            onClick={() => handleCopyVoucher(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-card hover:bg-muted text-[11px] font-mono text-foreground transition-colors cursor-pointer"
                            title={isRTL ? "نسخ بيانات الدخول لتسليمها للموظف" : "Copy credentials voucher"}
                          >
                            {isCopied ? (
                              <>
                                <Check size={12} className="text-emerald-500" />
                                <span className="text-emerald-600 font-semibold">{isRTL ? "تم النسخ" : "Copied"}</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>{isRTL ? "نسخ البيانات" : "Copy Info"}</span>
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
        </div>
      )}

      {/* TAB 2: ESTATE PORTFOLIO & PREMIER COMPOUNDS */}
      {activeTab === "PORTFOLIO" && (
        <div className="space-y-6">
          {/* Geographical Compounds Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Marassi (North Coast)</span>
                <span className="font-mono text-emerald-600">3 Villas</span>
              </div>
              <div className="text-xl font-mono font-semibold text-foreground">EGP 28.4M</div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[80%]" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Palm Hills (6th October)</span>
                <span className="font-mono text-emerald-600">2 Mansions</span>
              </div>
              <div className="text-xl font-mono font-semibold text-foreground">EGP 18.2M</div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[60%]" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Mivida (New Cairo)</span>
                <span className="font-mono text-emerald-600">2 Penthouses</span>
              </div>
              <div className="text-xl font-mono font-semibold text-foreground">EGP 14.5M</div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[45%]" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Badya & Allegria</span>
                <span className="font-mono text-emerald-600">3 Estates</span>
              </div>
              <div className="text-xl font-mono font-semibold text-foreground">EGP 13.4M</div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[40%]" />
              </div>
            </div>
          </div>

          {/* Active Projects Dossier List */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-serif text-lg font-medium text-foreground">
                  {isRTL ? "مصفوفة المشاريع السكنية الفاخرة" : "Active Fit-Out Commission Matrix"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRTL ? "الميزانية، مهندس الموقع المسؤول، والمرحلة التنفيذية الحالية." : "Budget, lead supervising architect, and current execution phase."}
                </p>
              </div>

              <Link
                href="/dashboard/pm"
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                <span>{isRTL ? "فتح لوحة مدير المشاريع ←" : "Open PM Desk →"}</span>
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_PROJECTS.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground">{proj.code}</span>
                      <span className="text-foreground font-medium text-sm">· {proj.title}</span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold",
                          proj.health === "ON_SCHEDULE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        )}
                      >
                        {proj.health.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>{proj.compound}, {proj.location}</span>
                      </span>
                      <span>·</span>
                      <span>{proj.clientName}</span>
                      <span>·</span>
                      <span className="font-mono">{proj.areaM2} m²</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end md:self-auto">
                    <div className="text-end">
                      <div className="font-mono font-bold text-sm text-foreground">
                        EGP {(proj.budgetEgp / 1_000_000).toFixed(2)}M
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {isRTL ? "المشرف: " : "Lead: "} {proj.leadEngineerName}
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/pm`}
                      className="p-2 rounded-lg border border-border bg-card hover:bg-white text-muted-foreground hover:text-foreground transition-colors"
                      title="Inspect Dossier"
                    >
                      <ArrowSquareOut size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIAL MILESTONES & COLLECTIONS */}
      {activeTab === "FINANCIALS" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="font-serif text-lg font-medium text-foreground">
                {isRTL ? "جدول استحقاق المستخلصات المالية للعام ٢٠٢٦" : "FY2026 Turnkey Milestone Collections"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRTL
                  ? "تحصيل الدفعات مرتبط بنسب إنجاز مهندسي الموقع واعتماد المستخلصات الهندسية."
                  : "Cash collections strictly tied to engineer site certifications and milestone handovers."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Milestone Progress Bar */}
              <div className="p-5 rounded-xl border border-border bg-muted/20 space-y-4">
                <h4 className="font-medium text-foreground text-sm flex items-center justify-between">
                  <span>{isRTL ? "مستخلصات تم تحصيلها بالكامل" : "Collected Cash (Paid in Full)"}</span>
                  <span className="font-mono text-emerald-600 font-bold">51.8%</span>
                </h4>
                <div className="w-full h-3 rounded-full bg-border overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[51.8%]" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div>
                    <span className="text-muted-foreground block">{isRTL ? "المبلغ المحصل:" : "Collected:"}</span>
                    <span className="font-mono font-semibold text-foreground">EGP 38,600,000</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">{isRTL ? "المتبقي للاستحقاق:" : "Remaining Balance:"}</span>
                    <span className="font-mono font-semibold text-foreground">EGP 35,900,000</span>
                  </div>
                </div>
              </div>

              {/* Cashflow Velocity */}
              <div className="p-5 rounded-xl border border-border bg-muted/20 space-y-3">
                <h4 className="font-medium text-foreground text-sm">
                  {isRTL ? "سرعة دورة رأس المال التشغيلي" : "Working Capital Velocity"}
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">{isRTL ? "متوسط سرعة اعتماد المستخلص:" : "Approval Turnaround:"}</span>
                    <span className="font-mono font-medium text-foreground">48 Hours</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">{isRTL ? "نسبة التغيرات (Change Orders):" : "Change Order Margin:"}</span>
                    <span className="font-mono font-medium text-emerald-600">+14.2% Value Add</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isRTL ? "مؤشر السيولة التشغيلية:" : "Liquidity Health Ratio:"}</span>
                    <span className="font-mono font-medium text-foreground">2.4x (Optimal)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Provisioning Modal */}
      <CreateStaffModal
        open={showCreateStaffModal}
        onClose={() => setShowCreateStaffModal(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}
