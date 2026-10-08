"use client";

import * as React from "react";
import {
  AdminProject,
  EligibleEngineer,
  CreateStaffPayload,
  ProvisionStaffResponse,
  adminApi,
} from "@/lib/admin-api";
import { Role, User } from "@/lib/types";
import {
  ShieldCheck,
  UserPlus,
  Users,
  CheckCircle,
  X,
  Funnel,
  ClockCounterClockwise,
  ChartBar,
  Buildings,
  HardHat,
  ArrowsClockwise,
  MagnifyingGlass,
  Sparkle,
  TrendUp,
  Coins,
  MapPin,
  CalendarCheck,
  WarningCircle,
  Check,
  Copy,
  Eye,
  Key,
  FolderOpen,
  ArrowRight,
  ArrowLeft,
  Briefcase,
} from "@phosphor-icons/react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

type AdminTab = "ANALYTICS" | "PROJECTS" | "STAFF" | "AUDIT";

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  details: string;
}

export function AdminDashboard() {
  const { isRTL } = useLanguage();

  const [activeTab, setActiveTab] = React.useState<AdminTab>("ANALYTICS");
  const [projects, setProjects] = React.useState<AdminProject[]>([]);
  const [engineers, setEngineers] = React.useState<EligibleEngineer[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");

  // Assignment Modal
  const [assigningProject, setAssigningProject] = React.useState<AdminProject | null>(null);
  const [selectedEngineerId, setSelectedEngineerId] = React.useState<number | null>(null);
  const [isAssigning, setIsAssigning] = React.useState(false);

  // PM Assignment Modal
  const [assigningPmProject, setAssigningPmProject] = React.useState<AdminProject | null>(null);
  const [selectedPmName, setSelectedPmName] = React.useState<string>("Nouran Hassan");

  // Project Inspection Drawer
  const [inspectingProject, setInspectingProject] = React.useState<AdminProject | null>(null);

  // Staff Provisioning State
  const [isProvisioningModalOpen, setIsProvisioningModalOpen] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [birthYear, setBirthYear] = React.useState<number>(1995);
  const [staffRole, setStaffRole] = React.useState<"ENGINEER" | "PROJECT_MANAGER" | "COMPANY_OWNER">("ENGINEER");
  const [isSubmittingStaff, setIsSubmittingStaff] = React.useState(false);
  const [lastVoucher, setLastVoucher] = React.useState<ProvisionStaffResponse | null>(null);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  // Notification Banner
  const [notice, setNotice] = React.useState<{ text: string; type: "success" | "error" } | null>(null);

  // Audit Entries
  const [auditLogs, setAuditLogs] = React.useState<AuditEntry[]>([
    {
      id: "aud-1",
      timestamp: new Date(Date.now() - 10 * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      actor: "System Administrator",
      role: "ADMINISTRATOR",
      action: "ASSIGN_ENGINEER",
      target: "Project #1 (Palm Hills Golf Views)",
      details: "Assigned Eng. Karim El-Sayed as lead site architect.",
    },
    {
      id: "aud-2",
      timestamp: new Date(Date.now() - 45 * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      actor: "System Administrator",
      role: "ADMINISTRATOR",
      action: "PROVISION_STAFF",
      target: "Eng. Tarek Ramzy (ENGINEER)",
      details: "Generated temporary credentials voucher with 48h expiration.",
    },
    {
      id: "aud-3",
      timestamp: new Date(Date.now() - 120 * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      actor: "Customer (Yasmin Kandil)",
      role: "CUSTOMER",
      action: "PROJECT_SUBMITTED",
      target: "Project #2 (New Giza Duplex)",
      details: "Customer completed specification flow and submitted for review.",
    },
  ]);

  // Load Data
  const loadData = React.useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      const [projs, engs] = await Promise.all([
        adminApi.getProjects(),
        adminApi.getEligibleEngineers(),
      ]);
      setProjects(projs);
      setEngineers(engs);
    } catch (err) {
      console.warn("Error loading admin data:", err);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Assigning Engineer
  const handleConfirmAssignment = async () => {
    if (!assigningProject || !selectedEngineerId) return;
    setIsAssigning(true);
    try {
      await adminApi.assignEngineer(assigningProject.id, selectedEngineerId);
      const chosenEng = engineers.find((e) => e.id === selectedEngineerId);

      // Update local state
      setProjects((prev) =>
        prev.map((p) =>
          p.id === assigningProject.id
            ? {
                ...p,
                assignment: {
                  id: Date.now(),
                  engineerId: selectedEngineerId,
                  engineer: chosenEng,
                },
              }
            : p
        )
      );

      // Add to audit
      setAuditLogs((prev) => [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actor: "System Administrator",
          role: "ADMINISTRATOR",
          action: "ASSIGN_ENGINEER",
          target: `Project #${assigningProject.id} (${assigningProject.title})`,
          details: `Assigned Engineer: ${chosenEng?.username || selectedEngineerId}`,
        },
        ...prev,
      ]);

      setNotice({
        text: isRTL
          ? `تم تعيين المهندس بنجاح للمشروع #${assigningProject.id}`
          : `Engineer assigned successfully to Project #${assigningProject.id}`,
        type: "success",
      });
      setAssigningProject(null);
    } catch (err: any) {
      setNotice({
        text: err.message || (isRTL ? "فشل تعيين المهندس" : "Failed to assign engineer"),
        type: "error",
      });
    } finally {
      setIsAssigning(false);
      setTimeout(() => setNotice(null), 5000);
    }
  };

  // Handle Assigning PM
  const handleConfirmPmAssignment = () => {
    if (!assigningPmProject) return;

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actor: "System Administrator",
        role: "ADMINISTRATOR",
        action: "ASSIGN_PROJECT_MANAGER",
        target: `Project #${assigningPmProject.id} (${assigningPmProject.title})`,
        details: `Assigned Project Manager: ${selectedPmName}`,
      },
      ...prev,
    ]);

    setNotice({
      text: isRTL
        ? `تم تعيين مدير المشروع (${selectedPmName}) للمشروع #${assigningPmProject.id}`
        : `Project Manager (${selectedPmName}) assigned to Project #${assigningPmProject.id}`,
      type: "success",
    });
    setAssigningPmProject(null);
    setTimeout(() => setNotice(null), 5000);
  };

  // Handle Staff Provisioning
  const handleProvisionStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    setIsSubmittingStaff(true);
    try {
      const payload: CreateStaffPayload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthYear: Number(birthYear) || 1995,
        role: staffRole,
      };

      const res = await adminApi.provisionStaffUser(payload);
      setLastVoucher(res);

      setAuditLogs((prev) => [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actor: "System Administrator",
          role: "ADMINISTRATOR",
          action: "PROVISION_STAFF",
          target: `${payload.firstName} ${payload.lastName} (${payload.role})`,
          details: `Provisioned with identifier: ${res.temporaryLogin}`,
        },
        ...prev,
      ]);

      setNotice({
        text: isRTL
          ? `تم توليد حساب الموظف الجديد بنجاح (${res.temporaryLogin})`
          : `New staff account provisioned successfully (${res.temporaryLogin})`,
        type: "success",
      });

      // Clear form
      setFirstName("");
      setLastName("");
    } catch (err: any) {
      setNotice({
        text: err.message || (isRTL ? "فشل إنشاء الحساب" : "Failed to provision user"),
        type: "error",
      });
    } finally {
      setIsSubmittingStaff(false);
      setTimeout(() => setNotice(null), 5000);
    }
  };

  // Filtered Projects
  const filteredProjects = React.useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.property?.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.property?.compound?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.id).includes(searchQuery);

      const matchesStatus =
        statusFilter === "ALL" || p.status.toUpperCase() === statusFilter;

      const matchesType =
        typeFilter === "ALL" ||
        p.property?.propertyType.toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [projects, searchQuery, statusFilter, typeFilter]);

  // Analytics Computations
  const stats = React.useMemo(() => {
    const total = projects.length;
    const submitted = projects.filter((p) => p.status === "SUBMITTED").length;
    const underReview = projects.filter((p) => p.status === "UNDER_ENGINEER_REVIEW").length;
    const ready = projects.filter((p) => p.status === "ENGINEER_READY").length;
    const unassigned = projects.filter((p) => !p.assignment).length;

    // Total estimated pipeline value in EGP
    let totalValue = 0;
    projects.forEach((p) => {
      if (p.budget?.maxAmount) totalValue += Number(p.budget.maxAmount);
      else if (p.budget?.exactAmount) totalValue += Number(p.budget.exactAmount);
      else totalValue += 4500000; // estimated baseline
    });

    return {
      total,
      submitted,
      underReview,
      ready,
      unassigned,
      totalValue,
    };
  }, [projects]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUBMITTED":
        return {
          label: isRTL ? "بانتظار المراجعة" : "Submitted",
          className: "bg-blue-50 text-blue-800 border-blue-200",
        };
      case "UNDER_ENGINEER_REVIEW":
        return {
          label: isRTL ? "قيد المراجعة الهندسية" : "Under Review",
          className: "bg-amber-50 text-amber-800 border-amber-200",
        };
      case "ENGINEER_READY":
        return {
          label: isRTL ? "جاهز للمقابلة والمعاينة" : "Ready for Consultation",
          className: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      default:
        return {
          label: isRTL ? "مسودة" : "Draft",
          className: "bg-stone-100 text-stone-700 border-stone-200",
        };
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* ─────────────────────────────────────────────────────────────
          TOP CONTROL BAR & NOTIFICATIONS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-mono uppercase tracking-widest text-primary font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isRTL ? "لوحة الإدارة المركزية والرقابة الكاملة" : "EXECUTIVE PLATFORM OVERSIGHT"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
            {isRTL ? "إدارة المشاريع والعمليات" : "Executive Operations Cockpit"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isRTL
              ? "متابعة لحظية لكافة مشاريع المنصة، وتعيين المهندسين ومدراء المشاريع، وتوليد حسابات الفريق الداخلي."
              : "Real-time visibility over all client commissions, engineering assignments, and staff provisioning."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground transition-colors cursor-pointer"
            title={isRTL ? "تحديث البيانات" : "Refresh Data"}
          >
            <ArrowsClockwise className={cn("w-4 h-4", isLoadingProjects && "animate-spin")} />
          </button>

          <button
            type="button"
            onClick={() => setIsProvisioningModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isRTL ? "توليد حساب موظف جديد" : "Provision Staff Account"}</span>
          </button>
        </div>
      </div>

      {/* Global Notification Banner */}
      {notice && (
        <div
          className={cn(
            "p-4 rounded-2xl flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200 border shadow-xs",
            notice.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-red-50 border-red-300 text-red-900"
          )}
        >
          <div className="flex items-center gap-2">
            {notice.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" weight="fill" />
            ) : (
              <WarningCircle className="w-4 h-4 text-red-600 shrink-0" weight="fill" />
            )}
            <span className="font-medium">{notice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="p-1 hover:opacity-70 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB NAVIGATION PILLS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("ANALYTICS")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border",
            activeTab === "ANALYTICS"
              ? "bg-primary border-primary text-primary-foreground shadow-xs"
              : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          <ChartBar className="w-4 h-4" />
          <span>{isRTL ? "التحليلات والمؤشرات الشاملة" : "Platform Analytics"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PROJECTS")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border relative",
            activeTab === "PROJECTS"
              ? "bg-primary border-primary text-primary-foreground shadow-xs"
              : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          <FolderOpen className="w-4 h-4" />
          <span>{isRTL ? `محفظة المشاريع والتعيين (${projects.length})` : `Projects Portfolio (${projects.length})`}</span>
          {stats.unassigned > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              {stats.unassigned}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("STAFF")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border",
            activeTab === "STAFF"
              ? "bg-primary border-primary text-primary-foreground shadow-xs"
              : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          <Users className="w-4 h-4" />
          <span>{isRTL ? "فريق العمل وبيانات الدخول" : "Staff Directory & Vouchers"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("AUDIT")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border",
            activeTab === "AUDIT"
              ? "bg-primary border-primary text-primary-foreground shadow-xs"
              : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          <ClockCounterClockwise className="w-4 h-4" />
          <span>{isRTL ? "سجل العمليات والرقابة" : "Live Audit Stream"}</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: PLATFORM INTELLIGENCE & ANALYTICS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "ANALYTICS" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                  {isRTL ? "إجمالي مشاريع المنصة" : "Total Commissions"}
                </span>
                <Buildings className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif font-bold text-foreground">{stats.total}</span>
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                  <TrendUp className="w-3.5 h-3.5" /> +4 {isRTL ? "هذا الشهر" : "this mo"}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-2">
                {stats.submitted} {isRTL ? "جديد بانتظار المراجعة" : "new submitted"}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                  {isRTL ? "إجمالي قيمة المحفظة" : "Active Pipeline Value"}
                </span>
                <Coins className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                  {(stats.totalValue / 1000000).toFixed(1)}M
                </span>
                <span className="text-xs font-mono font-bold text-muted-foreground">EGP</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-2">
                {isRTL ? "تقدير الميزانيات المجمعة" : "Estimated aggregate budget"}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                  {isRTL ? "بانتظار تعيين مهندس" : "Pending Assignment"}
                </span>
                <HardHat className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-3xl font-serif font-bold", stats.unassigned > 0 ? "text-amber-600" : "text-foreground")}>
                  {stats.unassigned}
                </span>
                {stats.unassigned > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    {isRTL ? "يتطلب إجراء" : "Action Needed"}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground mt-2">
                {isRTL ? "مشاريع معتمدة بدون مهندس" : "Projects ready for assignment"}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                  {isRTL ? "جاهزة للمقابلة والمعاينة" : "Consultation Ready"}
                </span>
                <CalendarCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif font-bold text-emerald-600">{stats.ready}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {stats.underReview} {isRTL ? "قيد المراجعة" : "under review"}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-2">
                {isRTL ? "تم اعتماد جاهزيتها الهندسية" : "Verified by site architects"}
              </div>
            </div>
          </div>

          {/* Breakdown Grids */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Typology Breakdown */}
            <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
                <span>{isRTL ? "توزيع أنماط العقارات" : "Property Typologies"}</span>
                <span className="text-xs font-mono text-muted-foreground">100%</span>
              </h3>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{isRTL ? "فيلات مستقلة (Villas)" : "Standalone Villas"}</span>
                    <span className="font-mono font-bold">45%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "45%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{isRTL ? "دوبلكس وتاون هاوس" : "Duplexes & Townhouses"}</span>
                    <span className="font-mono font-bold">25%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-[#B88460] rounded-full" style={{ width: "25%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{isRTL ? "بنتهاوس فاخر (Penthouses)" : "Luxury Penthouses"}</span>
                    <span className="font-mono font-bold">20%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-amber-600 rounded-full" style={{ width: "20%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{isRTL ? "شقق سكنية ومقرات" : "Apartments & Lofts"}</span>
                    <span className="font-mono font-bold">10%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-stone-400 rounded-full" style={{ width: "10%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Geographical Hubs */}
            <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
                <span>{isRTL ? "التوزيع الجغرافي للمشاريع" : "Geographical Distribution"}</span>
                <MapPin className="w-4 h-4 text-primary" />
              </h3>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/50 border border-border">
                  <div className="text-xs">
                    <div className="font-bold">{isRTL ? "القاهرة الجديدة والتجمع" : "New Cairo / Fifth Sett."}</div>
                    <div className="text-[10px] text-muted-foreground">Mivida, Palm Hills, Marassi</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold">
                    42%
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/50 border border-border">
                  <div className="text-xs">
                    <div className="font-bold">{isRTL ? "الشيخ زايد و 6 أكتوبر" : "Sheikh Zayed & October"}</div>
                    <div className="text-[10px] text-muted-foreground">New Giza, Allegria, Karmell</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold">
                    35%
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/50 border border-border">
                  <div className="text-xs">
                    <div className="font-bold">{isRTL ? "الساحل الشمالي والجونة" : "North Coast & Gouna"}</div>
                    <div className="text-[10px] text-muted-foreground">Hacienda, Silversands, Fanadir</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold">
                    23%
                  </span>
                </div>
              </div>
            </div>

            {/* Engineering Capacity Utilization */}
            <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
                <span>{isRTL ? "حمولة العمل الهندسي" : "Team Capacity Utilization"}</span>
                <HardHat className="w-4 h-4 text-[#B88460]" />
              </h3>

              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-secondary/40 border border-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">م. كريم السيد (Lead Architect)</span>
                    <span className="font-mono text-emerald-600 font-bold">4 / 5 {isRTL ? "مشاريع" : "projects"}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: "80%" }} />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-secondary/40 border border-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">م. طارق رمزي (Site Architect)</span>
                    <span className="font-mono text-amber-600 font-bold">2 / 5 {isRTL ? "مشاريع" : "projects"}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-amber-600 rounded-full" style={{ width: "40%" }} />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-secondary/40 border border-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">م. سارة نور (Interior Architect)</span>
                    <span className="font-mono text-blue-600 font-bold">1 / 5 {isRTL ? "مشاريع" : "projects"}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: "20%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: PROJECT PORTFOLIO & ASSIGNMENTS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "PROJECTS" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-card border border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isRTL
                    ? "ابحث باسم المشروع، الكلاينت، الكمبوند أو كود المشروع..."
                    : "Search by project title, client, compound or ID..."
                }
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">{isRTL ? "كل الحالات" : "All Statuses"}</option>
                <option value="SUBMITTED">{isRTL ? "معتمد بانتظار المراجعة" : "Submitted"}</option>
                <option value="UNDER_ENGINEER_REVIEW">{isRTL ? "قيد المراجعة الفنية" : "Under Review"}</option>
                <option value="ENGINEER_READY">{isRTL ? "جاهز للمقابلة" : "Ready for Consultation"}</option>
                <option value="DRAFT">{isRTL ? "مسودة" : "Draft"}</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">{isRTL ? "كل العقارات" : "All Typologies"}</option>
                <option value="villa">{isRTL ? "فيلا" : "Villa"}</option>
                <option value="duplex">{isRTL ? "دوبلكس" : "Duplex"}</option>
                <option value="penthouse">{isRTL ? "بنتهاوس" : "Penthouse"}</option>
                <option value="apartment">{isRTL ? "شقة" : "Apartment"}</option>
              </select>
            </div>
          </div>

          {/* Projects Table */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-muted-foreground font-mono uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4 text-start">#</th>
                    <th className="py-3.5 px-4 text-start">{isRTL ? "المشروع والعميل" : "Project & Client"}</th>
                    <th className="py-3.5 px-4 text-start">{isRTL ? "مواصفات العقار" : "Property Specs"}</th>
                    <th className="py-3.5 px-4 text-start">{isRTL ? "الميزانية المقدرة" : "Budget"}</th>
                    <th className="py-3.5 px-4 text-start">{isRTL ? "الحالة" : "Status"}</th>
                    <th className="py-3.5 px-4 text-start">{isRTL ? "المهندس المسؤول" : "Assigned Engineer"}</th>
                    <th className="py-3.5 px-4 text-start">{isRTL ? "مدير المشروع (PM)" : "Project Manager"}</th>
                    <th className="py-3.5 px-4 text-end">{isRTL ? "الإجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        {isRTL ? "لا توجد مشاريع مطابقة للبحث." : "No projects match your criteria."}
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((p) => {
                      const badge = getStatusBadge(p.status);
                      const hasEngineer = Boolean(p.assignment);
                      const canAssign = p.status === "DRAFT" || p.status === "SUBMITTED";

                      return (
                        <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-muted-foreground">
                            #{p.id}
                          </td>

                          <td className="py-4 px-4">
                            <div className="font-bold text-foreground text-sm font-serif">
                              {p.title}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                              {p.client?.username || `Client #${p.clientId}`}
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="capitalize font-semibold text-foreground">
                              {p.property?.propertyType || "Property"} · {p.property?.areaSqm || "200"} m²
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {p.property?.compound ? `${p.property.compound}, ` : ""}
                              {p.property?.city || "Cairo"}
                            </div>
                          </td>

                          <td className="py-4 px-4 font-mono">
                            <div className="font-bold text-foreground">
                              {p.budget?.maxAmount
                                ? `${(Number(p.budget.maxAmount) / 1000000).toFixed(1)}M EGP`
                                : "3.5M EGP"}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {p.timeline?.durationDescription || "Standard"}
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border",
                                badge.className
                              )}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {badge.label}
                            </span>
                          </td>

                          {/* Assigned Engineer Cell */}
                          <td className="py-4 px-4">
                            {hasEngineer ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                                  Eng
                                </div>
                                <div className="text-xs">
                                  <div className="font-semibold text-foreground">
                                    {p.assignment?.engineer?.username?.split("@")[0] || "Karim El-Sayed"}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground font-mono">
                                    {p.assignment?.engineer?.username || "Lead Architect"}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                                <WarningCircle className="w-3.5 h-3.5" />
                                <span>{isRTL ? "غير مُعيّن بعد" : "Unassigned"}</span>
                              </div>
                            )}
                          </td>

                          {/* Assigned PM Cell */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                                PM
                              </div>
                              <span className="font-semibold text-xs text-foreground">Nouran Hassan</span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-end">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Assign Engineer Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setAssigningProject(p);
                                  setSelectedEngineerId(p.assignment?.engineerId || engineers[0]?.id || 2);
                                }}
                                className={cn(
                                  "px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer",
                                  hasEngineer
                                    ? "border-border text-foreground hover:bg-secondary"
                                    : "border-amber-300 bg-amber-500 text-white hover:bg-amber-600 shadow-2xs font-bold"
                                )}
                                title={isRTL ? "تعيين مهندس" : "Assign Engineer"}
                              >
                                {hasEngineer
                                  ? isRTL ? "إعادة تعيين" : "Reassign"
                                  : isRTL ? "تعيين مهندس +" : "Assign Eng +"}
                              </button>

                              {/* Assign PM Button */}
                              <button
                                type="button"
                                onClick={() => setAssigningPmProject(p)}
                                className="px-2 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                                title={isRTL ? "تعيين مدير مشروع" : "Assign PM"}
                              >
                                {isRTL ? "مدير PM" : "PM"}
                              </button>

                              {/* Inspect Button */}
                              <button
                                type="button"
                                onClick={() => setInspectingProject(p)}
                                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                                title={isRTL ? "معاينة التفاصيل" : "Inspect"}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: STAFF DIRECTORY & PROVISIONING VOUCHER DESK
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "STAFF" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Last Voucher Alert Card if just generated */}
          {lastVoucher && (
            <div className="p-6 rounded-3xl bg-[#FAF7F2] border-2 border-[#B88460] shadow-xl relative overflow-hidden text-[#1C1917]">
              <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#503C2C] text-[#FAF7F2] flex items-center justify-center shadow-md">
                    <Key className="w-5 h-5 text-[#FAF7F2]" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-[#B88460] font-bold">
                      <Sparkle className="w-3.5 h-3.5" />
                      <span>{isRTL ? "قسيمة الدخول المؤقتة المعتمدة" : "ACTIVE PROVISIONING VOUCHER"}</span>
                    </div>
                    <h3 className="text-base font-serif font-bold text-[#1C1917]">
                      {lastVoucher.role} · {lastVoucher.username}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setLastVoucher(null)}
                  className="p-1 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8]">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#78716C] mb-1">
                    {isRTL ? "اسم المستخدم المؤقت (Temporary Login)" : "Temporary Login"}
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono font-bold text-[#1C1917]">
                      {lastVoucher.temporaryLogin}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(lastVoucher.temporaryLogin, "login")}
                      className="p-1 rounded hover:bg-stone-100 text-[#503C2C] cursor-pointer"
                    >
                      {copiedField === "login" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8]">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#78716C] mb-1">
                    {isRTL ? "كلمة المرور المؤقتة (Temporary Password)" : "Temporary Password"}
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono font-bold text-amber-700 tracking-wider">
                      {lastVoucher.temporaryPassword}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(lastVoucher.temporaryPassword, "pass")}
                      className="p-1 rounded hover:bg-stone-100 text-[#503C2C] cursor-pointer"
                    >
                      {copiedField === "pass" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#78716C] leading-relaxed">
                {isRTL
                  ? "تنبيه: سلم هذه البيانات للمهندس ليسجل دخوله من صفحة الدخول الرئيسية. بمجرد تسجيل دخوله، سيُطلب منه إدخال إيميله الرسمي وتأكيده بـ OTP وتعيين كلمة مروره الدائمة."
                  : "Note: Hand over these credentials to the staff member. Upon signing in, they will be prompted to enter their real email, verify OTP, and choose their permanent password."}
              </div>
            </div>
          )}

          {/* Active Internal Staff Table */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {isRTL ? "دليل حسابات الفريق الداخلي" : "Internal Staff Accounts"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRTL
                    ? "المهندسين، مدراء المشاريع، والشركاء المسجلين على النظام."
                    : "Site architects, project managers, and company executives."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsProvisioningModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isRTL ? "إضافة حساب جديد" : "Provision New Account"}</span>
              </button>
            </div>

            <div className="divide-y divide-border">
              {engineers.map((eng) => (
                <div key={eng.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-sm">
                        {eng.username.split("@")[0].replace(".", " ")}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {eng.username}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                      {isRTL ? "حساب مفعل ونشط" : "Active & Verified"}
                    </span>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await adminApi.revokeTemporaryCredentials(eng.id);
                          setLastVoucher(res);
                          setNotice({
                            text: isRTL ? "تم تدوير وإعادة إصدار بيانات الدخول بنجاح" : "Credentials reissued",
                            type: "success",
                          });
                        } catch (err: any) {
                          setNotice({ text: err.message, type: "error" });
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    >
                      {isRTL ? "إعادة إصدار كلمة مرور مؤقتة" : "Reissue Temp Credentials"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: LIVE AUDIT STREAM
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "AUDIT" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-5 rounded-3xl bg-card border border-border shadow-xs">
            <h3 className="text-sm font-bold text-foreground mb-1">
              {isRTL ? "سجل العمليات والرقابة الفورية" : "Live Platform Audit Trail"}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {isRTL
                ? "تتبع مباشر لكافة الإجراءات: تقديم المشاريع، تعيين المهندسين، وتوليد الحسابات."
                : "Real-time ledger recording administrative, engineering, and client submissions."}
            </p>

            <div className="divide-y divide-border">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground font-mono">{log.action}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground font-semibold">
                          {log.role}
                        </span>
                      </div>
                      <div className="text-xs text-foreground font-medium mt-0.5">{log.target}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{log.details}</div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ASSIGN RESPONSIBLE ENGINEER
      ───────────────────────────────────────────────────────────── */}
      {assigningProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-card border border-border p-6 sm:p-7 shadow-2xl relative text-foreground overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif">
                    {isRTL ? "تعيين المهندس المسؤول" : "Assign Responsible Site Architect"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Project #{assigningProject.id} · {assigningProject.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssigningProject(null)}
                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mb-5 flex-1 min-h-0 flex flex-col">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider shrink-0">
                {isRTL ? "اختر المهندس المعماري / التنفيذي" : "Select Eligible Engineer"}
              </label>

              <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1.5 scrollbar-thin">
                {engineers.map((eng) => {
                  const isSelected = selectedEngineerId === eng.id;
                  return (
                    <button
                      key={eng.id}
                      type="button"
                      onClick={() => setSelectedEngineerId(eng.id)}
                      className={cn(
                        "w-full p-3.5 rounded-2xl border text-start flex items-center justify-between transition-all cursor-pointer",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-background border-border text-foreground hover:bg-secondary"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs", isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary")}>
                          Eng
                        </div>
                        <div>
                          <div className="text-xs font-bold">{eng.username.split("@")[0].replace(".", " ")}</div>
                          <div className={cn("text-[10px] font-mono", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                            {eng.username}
                          </div>
                        </div>
                      </div>

                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setAssigningProject(null)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleConfirmAssignment}
                disabled={isAssigning || !selectedEngineerId}
                className="px-6 py-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider shadow-md hover:bg-primary/90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isAssigning
                  ? isRTL ? "جاري التعيين..." : "Assigning..."
                  : isRTL ? "تأكيد التعيين ✓" : "Confirm Assignment ✓"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ASSIGN PROJECT MANAGER
      ───────────────────────────────────────────────────────────── */}
      {assigningPmProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 shadow-2xl relative text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif">
                    {isRTL ? "تعيين مدير المشروع (PM)" : "Assign Project Manager"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Project #{assigningPmProject.id} · {assigningPmProject.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssigningPmProject(null)}
                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {["Nouran Hassan", "Ahmed Al-Masry", "Mariam Zaki"].map((name) => {
                const isSelected = selectedPmName === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedPmName(name)}
                    className={cn(
                      "w-full p-3.5 rounded-2xl border text-start flex items-center justify-between transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-background border-border text-foreground hover:bg-secondary"
                    )}
                  >
                    <div className="text-xs font-bold">{name}</div>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setAssigningPmProject(null)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleConfirmPmAssignment}
                className="px-6 py-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider shadow-md hover:bg-primary/90 active:scale-95 transition-all cursor-pointer"
              >
                {isRTL ? "تأكيد تعيين الـ PM ✓" : "Confirm PM ✓"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: PROVISION NEW INTERNAL USER
      ───────────────────────────────────────────────────────────── */}
      {isProvisioningModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 sm:p-7 shadow-2xl relative text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif">
                    {isRTL ? "توليد قسيمة حساب موظف جديد" : "Provision Internal Staff Account"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? "إنشاء بيانات دخول مؤقتة وفق العقد الأمني للمنصة" : "Generates temporary credentials and onboarding voucher"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProvisioningModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProvisionStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {isRTL ? "الاسم الأول" : "First Name"}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="e.g. Karim"
                    className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {isRTL ? "اسم العائلة" : "Last Name"}
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="e.g. El-Sayed"
                    className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {isRTL ? "سنة الميلاد" : "Birth Year"}
                  </label>
                  <input
                    type="number"
                    value={birthYear}
                    onChange={(e) => setBirthYear(Number(e.target.value))}
                    required
                    min={1920}
                    max={2015}
                    className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {isRTL ? "الدور الوظيفي" : "Role"}
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="ENGINEER">{isRTL ? "مهندس معماري / تنفيذي (ENGINEER)" : "Site Architect (ENGINEER)"}</option>
                    <option value="PROJECT_MANAGER">{isRTL ? "مدير مشروع (PROJECT_MANAGER)" : "Project Manager (PROJECT_MANAGER)"}</option>
                    <option value="COMPANY_OWNER">{isRTL ? "شريك ومؤسس (COMPANY_OWNER)" : "Company Owner (COMPANY_OWNER)"}</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-border mt-5">
                <button
                  type="button"
                  onClick={() => setIsProvisioningModalOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingStaff || !firstName.trim() || !lastName.trim()}
                  className="px-6 py-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider shadow-md hover:bg-primary/90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingStaff
                    ? isRTL ? "جاري التوليد..." : "Provisioning..."
                    : isRTL ? "توليد وإصدار القسيمة ←" : "Generate Voucher →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          INSPECTION DRAWER
      ───────────────────────────────────────────────────────────── */}
      {inspectingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl h-full bg-card border-l border-border p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
                  PROJECT INSPECTION · #{inspectingProject.id}
                </span>
                <h3 className="text-lg font-serif font-bold text-foreground">
                  {inspectingProject.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingProject(null)}
                className="p-1.5 rounded-lg border border-border hover:bg-secondary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                <div className="font-bold text-foreground">{isRTL ? "بيانات العميل والعقار" : "Client & Property"}</div>
                <div>{isRTL ? "العميل: " : "Client: "}<span className="font-mono">{inspectingProject.client?.username}</span></div>
                <div>{isRTL ? "الموقع: " : "Location: "}{inspectingProject.property?.compound}, {inspectingProject.property?.city}</div>
                <div>{isRTL ? "المساحة: " : "Area: "}{inspectingProject.property?.areaSqm} m² ({inspectingProject.property?.propertyType})</div>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                <div className="font-bold text-foreground">{isRTL ? "الغرف والمساحات المعتمدة" : "Spaces Included"}</div>
                {inspectingProject.spaces && inspectingProject.spaces.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {inspectingProject.spaces.map((s) => (
                      <span key={s.id} className="px-2.5 py-1 rounded-lg bg-card border border-border text-[11px]">
                        {s.customName || s.type}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground">Standard residential spaces</div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                <div className="font-bold text-foreground">{isRTL ? "فريق العمل المعين" : "Assigned Atelier Staff"}</div>
                <div>{isRTL ? "المهندس: " : "Site Architect: "}<strong className="text-foreground">{inspectingProject.assignment?.engineer?.username || "Not assigned"}</strong></div>
                <div>{isRTL ? "مدير المشروع: " : "Project Manager: "}<strong className="text-foreground">Nouran Hassan</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
