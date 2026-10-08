"use client";

import * as React from "react";
import { MOCK_PROJECTS, MOCK_USERS } from "@/lib/mock-data";
import { ProjectOverview, AssignedEngineerInfo } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/language-context";
import { useAuth } from "@/components/auth/auth-context";
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
  CaretLeft,
  UserPlus,
  Users,
  GlobeHemisphereWest,
  PencilSimple,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// Format IANA timezone dynamically using Intl.DateTimeFormat
function formatCustomerTimezone(tz?: string, isRTL = false): string {
  if (!tz) return "UTC";
  try {
    const now = new Date();
    const timeStr = new Intl.DateTimeFormat(isRTL ? "ar-EG" : "en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(now);
    return `${tz} (${isRTL ? "التوقيت المحلي: " : "Local: "}${timeStr})`;
  } catch {
    return tz;
  }
}

const ROLE_LABELS: Record<string, { ar: string; en: string }> = {
  LEAD_ARCHITECT: { ar: "معماري رئيسي", en: "Lead Architect" },
  SITE_SUPERVISOR: { ar: "إشراف وتنفيذ موقع", en: "Site Supervisor" },
  MEP_ENGINEER: { ar: "كهروميكانيك (MEP)", en: "MEP Engineer" },
};

const TYPOLOGY_LABELS: Record<string, { ar: string; en: string }> = {
  VILLA: { ar: "فيلا مستقلة", en: "Villa" },
  PENTHOUSE: { ar: "بنتهاوس", en: "Penthouse" },
  DUPLEX: { ar: "دوبلكس", en: "Duplex" },
  TOWNHOUSE: { ar: "تاون هاوس", en: "Townhouse" },
  APARTMENT: { ar: "شقة سكنية", en: "Apartment" },
};

const SPACE_LABELS: Record<string, { ar: string; en: string }> = {
  LIVING_ROOM: { ar: "صالون واستقبال", en: "Living Room" },
  KITCHEN: { ar: "مطبخ", en: "Kitchen" },
  MASTER_BEDROOM: { ar: "جناح نوم رئيسي", en: "Master Bedroom" },
  BEDROOM: { ar: "غرفة نوم", en: "Bedroom" },
  BATHROOM: { ar: "حمام", en: "Bathroom" },
  BALCONY: { ar: "شرفة", en: "Balcony" },
  TERRACE: { ar: "تراس خارجي", en: "Terrace" },
  DINING: { ar: "غرفة طعام", en: "Dining Room" },
};

interface PendingAssignment {
  engineerId: number;
  role: "LEAD_ARCHITECT" | "SITE_SUPERVISOR" | "MEP_ENGINEER";
}

export function PmDashboard() {
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();

  const [projects, setProjects] = React.useState<ProjectOverview[]>(MOCK_PROJECTS);
  const [activeTab, setActiveTab] = React.useState<"INTAKE" | "ACTIVE" | "ALL">("INTAKE");
  const [search, setSearch] = React.useState("");
  const [selectedProject, setSelectedProject] = React.useState<ProjectOverview | null>(null);
  const [assigningProjectId, setAssigningProjectId] = React.useState<string | null>(null);

  // Multi-engineer selection state
  const [selectedAssignments, setSelectedAssignments] = React.useState<PendingAssignment[]>([]);
  const [successToast, setSuccessToast] = React.useState<string | null>(null);

  const engineers = React.useMemo(
    () => MOCK_USERS.filter((u) => u.role === "ENGINEER"),
    []
  );

  // Helper to determine if project has assigned engineers
  const getProjectAssignedEngineers = React.useCallback(
    (p: ProjectOverview): AssignedEngineerInfo[] => {
      if (p.assignedEngineers && p.assignedEngineers.length > 0) {
        return p.assignedEngineers;
      }
      if (p.leadEngineerId != null) {
        const match = engineers.find((e) => e.id === p.leadEngineerId);
        return [
          {
            id: p.leadEngineerId,
            name: p.leadEngineerName || match?.name || `Eng. #${p.leadEngineerId}`,
            role: "LEAD_ARCHITECT",
            phone: match?.phone,
            email: match?.email,
          },
        ];
      }
      return [];
    },
    [engineers]
  );

  // Filter queues: Intake = unassigned; Active = assigned
  const intakeQueue = React.useMemo(() => {
    return projects.filter((p) => {
      const assigned = getProjectAssignedEngineers(p);
      return p.status === "SUBMITTED" && assigned.length === 0;
    });
  }, [projects, getProjectAssignedEngineers]);

  const activeQueue = React.useMemo(() => {
    return projects.filter((p) => {
      const assigned = getProjectAssignedEngineers(p);
      return assigned.length > 0;
    });
  }, [projects, getProjectAssignedEngineers]);

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
        p.compound?.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        getProjectAssignedEngineers(p).some((e) => e.name.toLowerCase().includes(q))
    );
  }, [projects, activeTab, intakeQueue, activeQueue, search, getProjectAssignedEngineers]);

  // Open multi-engineer assignment dialog
  const handleOpenAssignModal = (p: ProjectOverview) => {
    setAssigningProjectId(p.id);
    const existing = getProjectAssignedEngineers(p);
    if (existing.length > 0) {
      setSelectedAssignments(
        existing.map((e) => ({
          engineerId: e.id,
          role: (e.role as PendingAssignment["role"]) || "LEAD_ARCHITECT",
        }))
      );
    } else {
      // Default to empty or first engineer unselected
      setSelectedAssignments([]);
    }
  };

  // Toggle engineer in assignment list
  const handleToggleEngineer = (engineerId: number) => {
    setSelectedAssignments((prev) => {
      const exists = prev.some((a) => a.engineerId === engineerId);
      if (exists) {
        return prev.filter((a) => a.engineerId !== engineerId);
      } else {
        // Assign default role: first engineer -> LEAD_ARCHITECT, subsequent -> SITE_SUPERVISOR
        const defaultRole = prev.length === 0 ? "LEAD_ARCHITECT" : "SITE_SUPERVISOR";
        return [...prev, { engineerId, role: defaultRole }];
      }
    });
  };

  // Update specific engineer role in modal
  const handleUpdateRole = (
    engineerId: number,
    role: PendingAssignment["role"]
  ) => {
    setSelectedAssignments((prev) =>
      prev.map((a) => (a.engineerId === engineerId ? { ...a, role } : a))
    );
  };

  // Confirm multi-engineer assignment
  const handleConfirmAssignment = (projectId: string) => {
    const targetProject = projects.find((p) => p.id === projectId);
    if (!targetProject) return;

    const newAssignedEngineers: AssignedEngineerInfo[] = selectedAssignments.map((a) => {
      const eng = engineers.find((e) => e.id === a.engineerId);
      return {
        id: a.engineerId,
        name: eng?.name || `Eng. #${a.engineerId}`,
        role: a.role,
        phone: eng?.phone,
        email: eng?.email,
        assignedAt: new Date().toISOString().slice(0, 10),
      };
    });

    const lead = newAssignedEngineers.find((e) => e.role === "LEAD_ARCHITECT") || newAssignedEngineers[0];

    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        assignedEngineers: newAssignedEngineers,
        leadEngineerId: lead ? lead.id : null,
        leadEngineerName: lead ? lead.name : null,
        nextMilestone:
          newAssignedEngineers.length > 0
            ? "Architectural Specification & Feasibility Review"
            : "Intake Review & Lead Architect Assignment",
        nextMilestoneDate: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
      };
    });

    setProjects(updated);

    // Update selected dossier if currently open
    if (selectedProject?.id === projectId) {
      const match = updated.find((p) => p.id === projectId);
      if (match) setSelectedProject(match);
    }

    setAssigningProjectId(null);
    setSelectedAssignments([]);

    const engineerNames = newAssignedEngineers.map((e) => e.name).join(isRTL ? "، " : ", ");
    const successMsg =
      newAssignedEngineers.length > 0
        ? isRTL
          ? `تم بنجاح تكليف المهندسين (${engineerNames}) للمشروع: ${targetProject.title}`
          : `Successfully assigned (${engineerNames}) to ${targetProject.title}`
        : isRTL
        ? `تم إلغاء تعيين المهندسين من المشروع: ${targetProject.title}`
        : `All engineers unassigned from ${targetProject.title}`;

    setSuccessToast(successMsg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const getWorkflowBadge = (project: ProjectOverview) => {
    const assigned = getProjectAssignedEngineers(project);
    if (assigned.length > 0) {
      const countLabel =
        assigned.length === 1
          ? assigned[0].name
          : isRTL
          ? `${assigned.length} مهندسين معتمدين`
          : `${assigned.length} Certified Engineers`;

      return {
        label: isRTL ? `معين · ${countLabel}` : `Assigned · ${countLabel}`,
        className: "bg-[#B88460]/15 text-[#8F5A36] border-[#B88460]/30",
      };
    }
    return {
      label: isRTL ? "بانتظار تعيين المهندسين" : "Needs Engineer Assignment",
      className: "bg-amber-500/10 text-amber-800 border-amber-500/30",
    };
  };

  const targetAssignProject = projects.find((p) => p.id === assigningProjectId);

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Top Banner & PM Desk Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D8C8B4] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#B88460]/15 text-[#8F5A36] text-xs font-mono uppercase tracking-wider mb-2 border border-[#B88460]/20">
            <UserGear className="w-3.5 h-3.5" />
            <span>
              {isRTL ? "مكتب إدارة المشروعات التشغيلية" : "PROJECT MANAGEMENT OPS DESK"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#1C1917]">
            {isRTL
              ? "مصفوفة استلام المشروعات وإسناد الفرق الهندسية"
              : "Project Intake & Delivery Matrix"}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B635B] mt-1 max-w-2xl leading-relaxed">
            {isRTL
              ? "مراجعة كراسات العملاء الواردة، وإسناد المهندسين المعماريين ومشرفي الموقع، ومتابعة نطاق المساحات والمراحل التنفيذية."
              : "Review incoming customer submissions, assign certified site and lead engineers, track spatial scopes, and advance fit-out milestones."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl border border-[#D8C8B4] bg-[#FAF7F2] text-xs flex items-center gap-2 font-mono shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#B88460] animate-pulse" />
            <span className="text-[#6B635B]">
              {isRTL ? "مدير المشروعات:" : "LEAD PM:"}
            </span>
            <span className="font-semibold text-[#1C1917]">
              {user?.username || (isRTL ? "نوران حسن" : "Nouran Hassan")}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl border border-[#D8C8B4] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between text-[#6B635B] text-xs mb-3">
            <span className="font-mono uppercase">
              {isRTL ? "قائمة الاستلام (بانتظار التكليف)" : "Intake Queue (Needs Assignment)"}
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-semibold text-[#1C1917] font-mono">
            {intakeQueue.length}
          </div>
          <p className="text-[11px] text-[#6B635B] mt-1">
            {isRTL
              ? "مشروعات جديدة بانتظار فرز وتكليف مدير المشروع"
              : "New submissions awaiting PM triage"}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl border border-[#D8C8B4] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between text-[#6B635B] text-xs mb-3">
            <span className="font-mono uppercase">
              {isRTL ? "المشروعات قيد المراجعة" : "Assigned Fit-Outs"}
            </span>
            <CheckCircle className="w-4 h-4 text-[#B88460]" />
          </div>
          <div className="text-2xl font-semibold text-[#1C1917] font-mono">
            {activeQueue.length}
          </div>
          <p className="text-[11px] text-[#6B635B] mt-1">
            {isRTL
              ? "مشروعات نشطة تحت إشراف وتدقيق الفرق الهندسية"
              : "Active under architectural engineering review"}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl border border-[#D8C8B4] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between text-[#6B635B] text-xs mb-3">
            <span className="font-mono uppercase">
              {isRTL ? "المهندسون المتاحون" : "Engineers on Duty"}
            </span>
            <HardHat className="w-4 h-4 text-[#503C2C]" />
          </div>
          <div className="text-2xl font-semibold text-[#1C1917] font-mono">
            {engineers.length} {isRTL ? "مهندسين" : "Architects"}
          </div>
          <p className="text-[11px] text-[#6B635B] mt-1">
            {isRTL
              ? "معتمدون لإسناد المشروعات والتنفيذ"
              : "Available for commission assignment"}
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-[#EFE8DE] border border-[#B88460]/40 text-[#503C2C] text-xs font-medium flex items-center justify-between animate-in fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#B88460]" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-[#6B635B] hover:text-[#1C1917] p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Work Area: Queue Tabs & Projects Table */}
      <div className="space-y-4">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-2xl border border-[#D8C8B4] bg-[#FAF7F2] shadow-sm">
          {/* Queue Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("INTAKE")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-medium font-mono uppercase transition-colors cursor-pointer flex items-center gap-2 shrink-0",
                activeTab === "INTAKE"
                  ? "bg-[#1C1917] text-[#FAF7F2] font-semibold shadow-xs"
                  : "text-[#6B635B] hover:text-[#1C1917] hover:bg-[#EFE7DC]/50"
              )}
            >
              <span>{isRTL ? "قائمة الاستلام والتكليف" : "Intake Queue"}</span>
              {intakeQueue.length > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                    activeTab === "INTAKE"
                      ? "bg-[#FAF7F2] text-[#1C1917]"
                      : "bg-amber-100 text-amber-900"
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
                "px-3.5 py-2 rounded-xl text-xs font-medium font-mono uppercase transition-colors cursor-pointer flex items-center gap-2 shrink-0",
                activeTab === "ACTIVE"
                  ? "bg-[#1C1917] text-[#FAF7F2] font-semibold shadow-xs"
                  : "text-[#6B635B] hover:text-[#1C1917] hover:bg-[#EFE7DC]/50"
              )}
            >
              <span>{isRTL ? "المشروعات المسندة" : "Assigned Portfolio"}</span>
              <span className="text-[10px] opacity-75">({activeQueue.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-medium font-mono uppercase transition-colors cursor-pointer shrink-0",
                activeTab === "ALL"
                  ? "bg-[#1C1917] text-[#FAF7F2] font-semibold shadow-xs"
                  : "text-[#6B635B] hover:text-[#1C1917] hover:bg-[#EFE7DC]/50"
              )}
            >
              <span>
                {isRTL
                  ? `جميع المشروعات (${projects.length})`
                  : `All Projects (${projects.length})`}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isRTL
                  ? "ابحث بالكود، اسم المشروع، العميل، المهندس..."
                  : "Search code, title, client, engineer..."
              }
              className="w-full h-9 px-3 ps-8 rounded-xl border border-[#D8C8B4] bg-[#FAF7F2] text-xs text-[#1C1917] placeholder:text-[#6B635B]/70 outline-none focus:border-[#1C1917] transition-all"
            />
            <MagnifyingGlass className="w-3.5 h-3.5 absolute start-2.5 top-3 text-[#6B635B]" />
          </div>
        </div>

        {/* Project Queue Table */}
        <div className="rounded-2xl border border-[#D8C8B4] bg-[#FAF7F2] overflow-hidden shadow-sm">
          {displayedProjects.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#EFE7DC] flex items-center justify-center mx-auto text-[#6B635B]">
                <Buildings className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-[#1C1917]">
                {activeTab === "INTAKE"
                  ? isRTL
                    ? "قائمة الاستلام خالية حالياً"
                    : "Intake Queue is Clear"
                  : isRTL
                  ? "لا توجد مشروعات مطابقة"
                  : "No Projects Found"}
              </div>
              <p className="text-xs text-[#6B635B] max-w-sm mx-auto">
                {activeTab === "INTAKE"
                  ? isRTL
                    ? "تم تكليف جميع طلبات المشروعات الواردة من العملاء لفرق المهندسين."
                    : "All incoming customer submissions have been assigned to site engineers."
                  : isRTL
                  ? "لم يتم العثور على أي مشروعات تطابق معايير البحث أو التصفية الحالية."
                  : "No projects match the current search criteria or queue filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-[#EFE7DC]/60 text-[10px] uppercase font-mono text-[#6B635B] border-b border-[#D8C8B4]">
                  <tr>
                    <th className="py-3 px-4 text-start">
                      {isRTL ? "الكود والمشروع" : "Code & Project"}
                    </th>
                    <th className="py-3 px-4 text-start">
                      {isRTL ? "العميل والموقع" : "Client & Location"}
                    </th>
                    <th className="py-3 px-4 text-start">
                      {isRTL ? "نوع العقار والمساحة" : "Typology / Scope"}
                    </th>
                    <th className="py-3 px-4 text-start">
                      {isRTL ? "حالة المتابعة" : "Workflow State"}
                    </th>
                    <th className="py-3 px-4 text-start">
                      {isRTL ? "فريق المهندسين المعينين" : "Assigned Engineers"}
                    </th>
                    <th className="py-3 px-4 text-end">
                      {isRTL ? "الإجراءات" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8C8B4]/70">
                  {displayedProjects.map((p) => {
                    const statusBadge = getWorkflowBadge(p);
                    const assignedList = getProjectAssignedEngineers(p);
                    const typologyName = TYPOLOGY_LABELS[p.typology]?.[language] || p.typology;

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-[#EFE7DC]/40 transition-colors"
                      >
                        {/* Project & Code */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedProject(p)}
                            className="text-start group cursor-pointer block"
                          >
                            <div className="font-semibold text-[#1C1917] group-hover:text-[#8F5A36] transition-colors">
                              {p.title}
                            </div>
                            <div className="text-[10px] font-mono text-[#6B635B]">
                              {p.code} · {isRTL ? "تاريخ الإرسال: " : "Submitted "}
                              {p.createdAt}
                            </div>
                          </button>
                        </td>

                        {/* Client & Location */}
                        <td className="py-3.5 px-4">
                          <div className="text-[#1C1917] font-medium">{p.clientName}</div>
                          <div className="text-[10px] text-[#6B635B]">
                            {p.compound ? `${p.compound}، ` : ""}
                            {p.location}
                          </div>
                        </td>

                        {/* Typology & Area */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-medium text-[#1C1917]">
                            {typologyName} · {p.areaM2} {isRTL ? "م²" : "m²"}
                          </div>
                          <div className="text-[10px] text-[#6B635B]">
                            {p.spaces?.length || 0} {isRTL ? "مساحات محددة" : "Spaces Defined"}
                          </div>
                        </td>

                        {/* Workflow Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border",
                              statusBadge.className
                            )}
                          >
                            {statusBadge.label}
                          </span>
                        </td>

                        {/* Assigned Engineers */}
                        <td className="py-3.5 px-4">
                          {assignedList.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {assignedList.map((eng) => (
                                <span
                                  key={eng.id}
                                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#FAF7F2] border border-[#D8C8B4] text-[11px] font-medium text-[#1C1917]"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#B88460]" />
                                  <span>{eng.name}</span>
                                  {eng.role && (
                                    <span className="text-[9px] text-[#6B635B] font-mono">
                                      ({ROLE_LABELS[eng.role]?.[language] || eng.role})
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] font-mono text-amber-800 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                              {isRTL ? "بانتظار التعيين" : "Unassigned"}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-end">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenAssignModal(p)}
                              className="h-7 px-3 rounded-xl bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              {assignedList.length > 0 ? (
                                <>
                                  <PencilSimple className="w-3.5 h-3.5 text-[#B88460]" />
                                  <span>{isRTL ? "إدارة الفريق" : "Manage Team"}</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3.5 h-3.5 text-[#B88460]" />
                                  <span>{isRTL ? "تعيين مهندسين" : "Assign Engineers"}</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedProject(p)}
                              className="h-7 px-2.5 rounded-xl border border-[#D8C8B4] bg-[#FAF7F2] hover:bg-[#EFE7DC] text-xs text-[#1C1917] cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <span>{isRTL ? "كراسة المشروع" : "Dossier"}</span>
                              {isRTL ? (
                                <CaretLeft className="w-3 h-3" />
                              ) : (
                                <CaretRight className="w-3 h-3" />
                              )}
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

      {/* Multi-Engineer Assignment Modal */}
      {assigningProjectId && targetAssignProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FAF7F2] border border-[#D8C8B4] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#D8C8B4] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#6B635B]">
                  {targetAssignProject.code} ·{" "}
                  {isRTL ? "إسناد وتكليف الفريق الهندسي" : "Commission Engineering Assignment"}
                </span>
                <h3 className="font-serif text-lg font-medium text-[#1C1917] mt-0.5">
                  {isRTL
                    ? "تحديد فريق المهندسين المشرف على المشروع"
                    : "Assign Project Engineering Team"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAssigningProjectId(null);
                  setSelectedAssignments([]);
                }}
                className="w-7 h-7 rounded-full bg-[#EFE7DC] flex items-center justify-center text-[#6B635B] hover:text-[#1C1917] cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Project Summary */}
            <div className="p-3.5 rounded-xl bg-[#EFE7DC]/60 border border-[#D8C8B4] text-xs space-y-1">
              <div>
                <strong className="text-[#1C1917]">{isRTL ? "المشروع: " : "Project: "}</strong>
                <span className="text-[#503C2C]">{targetAssignProject.title}</span>
              </div>
              <div>
                <strong className="text-[#1C1917]">{isRTL ? "العميل والموقع: " : "Client: "}</strong>
                <span className="text-[#503C2C]">
                  {targetAssignProject.clientName} ({targetAssignProject.location})
                </span>
              </div>
              <div>
                <strong className="text-[#1C1917]">{isRTL ? "المواصفات: " : "Scope: "}</strong>
                <span className="text-[#503C2C]">
                  {TYPOLOGY_LABELS[targetAssignProject.typology]?.[language] || targetAssignProject.typology} ·{" "}
                  {targetAssignProject.areaM2} {isRTL ? "م²" : "m²"}
                </span>
              </div>
            </div>

            {/* Explanation Note */}
            <div className="text-xs text-[#6B635B] leading-relaxed">
              {isRTL
                ? "يمكنك اختيار أكثر من مهندس للمشروع الواحد وتحديد دور كل مهندس (مثل: معماري رئيسي، مشرف موقع، أو مهندس كهروميكانيك MEP):"
                : "Select one or more certified engineers for this commission and specify their role (e.g. Lead Architect, Site Supervisor, MEP Specialist):"}
            </div>

            {/* Engineers Selection List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1.5 scrollbar-thin">
              {engineers.map((eng) => {
                const isSelected = selectedAssignments.some((a) => a.engineerId === eng.id);
                const currentAssignment = selectedAssignments.find((a) => a.engineerId === eng.id);
                const currentLoad = projects.filter((p) =>
                  getProjectAssignedEngineers(p).some((e) => e.id === eng.id)
                ).length;

                return (
                  <div
                    key={eng.id}
                    className={cn(
                      "p-3 rounded-xl border text-xs transition-all",
                      isSelected
                        ? "border-[#1C1917] bg-[#FAF7F2] ring-1 ring-[#1C1917]/20 shadow-sm"
                        : "border-[#D8C8B4] bg-[#FAF7F2] hover:bg-[#EFE7DC]/50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Checkbox & Engineer Info */}
                      <label className="flex items-center gap-3 cursor-pointer select-none flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleEngineer(eng.id)}
                          className="w-4 h-4 rounded border-[#D8C8B4] text-[#1C1917] focus:ring-[#1C1917] cursor-pointer"
                        />
                        <div className="w-8 h-8 rounded-full bg-[#B88460]/15 text-[#8F5A36] flex items-center justify-center font-bold font-mono text-xs shrink-0">
                          {eng.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div className="font-semibold text-[#1C1917]">{eng.name}</div>
                          <div className="text-[11px] text-[#6B635B] font-mono">
                            {eng.phone || eng.email}
                          </div>
                        </div>
                      </label>

                      {/* Current Load Badge */}
                      <div className="text-end shrink-0">
                        <span className="text-[10px] font-mono text-[#6B635B] block">
                          {isRTL ? "المشروعات الحالية" : "Current Load"}
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#1C1917]">
                          {currentLoad} {isRTL ? "مشروع" : currentLoad === 1 ? "Project" : "Projects"}
                        </span>
                      </div>
                    </div>

                    {/* Role Selector (visible when engineer is selected) */}
                    {isSelected && (
                      <div className="mt-3 pt-2.5 border-t border-[#D8C8B4]/70 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-[#6B635B] font-medium">
                          {isRTL ? "الدور المعماري / الهندسي:" : "Designated Role:"}
                        </span>
                        <select
                          value={currentAssignment?.role || "LEAD_ARCHITECT"}
                          onChange={(e) =>
                            handleUpdateRole(
                              eng.id,
                              e.target.value as PendingAssignment["role"]
                            )
                          }
                          className="h-7 px-2.5 rounded-lg border border-[#D8C8B4] bg-[#FAF7F2] text-xs text-[#1C1917] font-medium outline-none focus:border-[#1C1917]"
                        >
                          <option value="LEAD_ARCHITECT">
                            {isRTL ? "معماري رئيسي (Lead Architect)" : "Lead Architect"}
                          </option>
                          <option value="SITE_SUPERVISOR">
                            {isRTL ? "إشراف وتنفيذ موقع (Site Supervisor)" : "Site Supervisor"}
                          </option>
                          <option value="MEP_ENGINEER">
                            {isRTL ? "مهندس كهروميكانيك (MEP Specialist)" : "MEP Specialist"}
                          </option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Summary */}
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#D8C8B4] text-xs flex items-center justify-between">
              <span className="text-[#6B635B]">
                {isRTL ? "إجمالي المهندسين المحددين:" : "Assigned Engineers Count:"}
              </span>
              <span className="font-mono font-bold text-[#1C1917]">
                {selectedAssignments.length} {isRTL ? "مهندس" : "Engineers"}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-[#D8C8B4]">
              <button
                type="button"
                onClick={() => {
                  setAssigningProjectId(null);
                  setSelectedAssignments([]);
                }}
                className="px-4 py-2 rounded-xl border border-[#D8C8B4] text-xs text-[#6B635B] hover:text-[#1C1917] hover:bg-[#EFE7DC] cursor-pointer transition-colors"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAssignment(targetAssignProject.id)}
                className="px-4 py-2 rounded-xl bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-[#B88460]" />
                <span>
                  {isRTL
                    ? `تأكيد تكليف الفريق (${selectedAssignments.length} مهندس)`
                    : `Confirm Team Assignment (${selectedAssignments.length})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Project Inspection Dossier Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#FAF7F2] border border-[#D8C8B4] rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#D8C8B4] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B635B]">
                    {selectedProject.code} ·{" "}
                    {isRTL ? "ملف المشروع لإدارة المشروعات" : "PM COMMISSION DOSSIER"}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border",
                      getWorkflowBadge(selectedProject).className
                    )}
                  >
                    {getWorkflowBadge(selectedProject).label}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-medium text-[#1C1917]">
                  {selectedProject.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="w-8 h-8 rounded-full bg-[#EFE7DC] flex items-center justify-center text-[#6B635B] hover:text-[#1C1917] cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Assigned Engineering Team Box */}
            <div className="p-4 rounded-xl bg-[#EFE7DC]/50 border border-[#D8C8B4] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-[#6B635B]">
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-[#B88460]" />
                  <span>
                    {isRTL ? "فريق المهندسين المعتمد للمشروع" : "Assigned Engineering Team"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenAssignModal(selectedProject);
                  }}
                  className="text-xs text-[#8F5A36] hover:underline flex items-center gap-1 font-sans cursor-pointer"
                >
                  <PencilSimple className="w-3.5 h-3.5" />
                  <span>{isRTL ? "تعديل الفريق" : "Edit Team"}</span>
                </button>
              </div>

              {getProjectAssignedEngineers(selectedProject).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {getProjectAssignedEngineers(selectedProject).map((eng) => (
                    <div
                      key={eng.id}
                      className="p-3 rounded-xl bg-[#FAF7F2] border border-[#D8C8B4] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#B88460]/15 text-[#8F5A36] flex items-center justify-center font-bold font-mono text-[11px]">
                          {eng.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div className="font-semibold text-[#1C1917]">{eng.name}</div>
                          <div className="text-[10px] text-[#6B635B] font-mono">
                            {ROLE_LABELS[eng.role || "LEAD_ARCHITECT"]?.[language] || eng.role}
                          </div>
                        </div>
                      </div>
                      {eng.phone && (
                        <a
                          href={`tel:${eng.phone}`}
                          className="text-[#8F5A36] hover:text-[#1C1917] p-1"
                          title={eng.phone}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-dashed border-[#D8C8B4] text-center text-xs text-[#6B635B]">
                  <span>
                    {isRTL
                      ? "لم يتم تعيين أي مهندسين لهذا المشروع بعد."
                      : "No engineers assigned to this commission yet."}
                  </span>
                </div>
              )}
            </div>

            {/* Client & Representative Information */}
            <div className="p-4 rounded-xl bg-[#EFE7DC]/50 border border-[#D8C8B4] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-[#6B635B]">
                <span className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#B88460]" />
                  <span>
                    {isRTL
                      ? "بيانات العميل والتمثيل القانوني"
                      : "Customer & Representation Information"}
                  </span>
                </span>
                <span className="text-[10px] text-[#1C1917] font-mono">
                  {isRTL ? "الميزانية المبدئية: " : "Budget: "}
                  {selectedProject.budgetEgp.toLocaleString()} {isRTL ? "ج.م" : "EGP"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#6B635B] block text-[11px]">
                    {isRTL ? "العميل الرئيسي:" : "Primary Client:"}
                  </span>
                  <span className="font-medium text-[#1C1917]">
                    {selectedProject.clientName}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B635B] block text-[11px]">
                    {isRTL ? "رقم الهاتف:" : "Phone Contact:"}
                  </span>
                  <a
                    href={`tel:${selectedProject.clientPhone}`}
                    className="font-mono text-[#8F5A36] hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{selectedProject.clientPhone}</span>
                  </a>
                </div>
                <div>
                  <span className="text-[#6B635B] block text-[11px]">
                    {isRTL ? "موقع وتوقيت العميل:" : "Customer Location & Timezone:"}
                  </span>
                  <span className="text-[#1C1917] flex items-center gap-1.5 font-mono text-[11px]">
                    <GlobeHemisphereWest className="w-3.5 h-3.5 text-[#6B635B]" />
                    <span>
                      {selectedProject.customerLocation?.city
                        ? `${selectedProject.customerLocation.city}، ${selectedProject.customerLocation.country} · `
                        : ""}
                      {formatCustomerTimezone(
                        selectedProject.customerLocation?.timezone,
                        isRTL
                      )}
                    </span>
                  </span>
                </div>
                <div>
                  <span className="text-[#6B635B] block text-[11px]">
                    {isRTL ? "التمثيل داخل مصر:" : "Representation in Egypt:"}
                  </span>
                  <span className="font-medium text-[#1C1917]">
                    {selectedProject.representative?.representationType === "client_in_person"
                      ? isRTL
                        ? "العميل متواجد بنفسه داخل مصر"
                        : "Client in Egypt in person"
                      : selectedProject.representative?.representationType === "valentia_direct"
                      ? isRTL
                        ? "إشراف ومتابعة مباشرة من فالنتيا"
                        : "Direct Valentia Management"
                      : selectedProject.representative?.name
                      ? `${selectedProject.representative.name} (${
                          selectedProject.representative.relationship || "وكيل"
                        }) · ${selectedProject.representative.phone || ""}`
                      : isRTL
                      ? "ممثل معتمد"
                      : "Authorized Representative"}
                  </span>
                </div>
              </div>
            </div>

            {/* Property Specifications */}
            <div className="p-4 rounded-xl bg-[#EFE7DC]/50 border border-[#D8C8B4] space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#6B635B]">
                <Buildings className="w-3.5 h-3.5 text-[#B88460]" />
                <span>
                  {isRTL ? "مواصفات وبيانات العقار" : "Property Details & Scope"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[#6B635B] block text-[11px]">
                    {isRTL ? "نوع العقار:" : "Typology:"}
                  </span>
                  <span className="font-mono font-medium text-[#1C1917]">
                    {TYPOLOGY_LABELS[selectedProject.typology]?.[language] ||
                      selectedProject.typology}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B635B] block text-[11px]">
                    {isRTL ? "المساحة الإجمالية:" : "Contracted Area:"}
                  </span>
                  <span className="font-mono font-medium text-[#1C1917]">
                    {selectedProject.areaM2} {isRTL ? "م²" : "m²"}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B635B] block text-[11px]">
                    {isRTL ? "الكومباوند:" : "Compound:"}
                  </span>
                  <span className="font-medium text-[#1C1917]">
                    {selectedProject.compound || (isRTL ? "مستقل" : "Stand-alone")}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B635B] block text-[11px]">
                    {isRTL ? "الجدول الزمني المستهدف:" : "Target Timeline:"}
                  </span>
                  <span className="font-medium text-[#1C1917]">
                    {selectedProject.targetTimeline || (isRTL ? "قياسي" : "Standard")}
                  </span>
                </div>
              </div>

              {selectedProject.notes && (
                <div className="border-t border-[#D8C8B4]/60 pt-2 text-xs">
                  <span className="text-[#6B635B] block text-[11px]">
                    {isRTL ? "ملاحظات وتوجيهات العميل:" : "Customer Directives:"}
                  </span>
                  <p className="text-[#1C1917] leading-relaxed mt-0.5 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#D8C8B4] font-mono text-[11px] whitespace-pre-wrap">
                    {selectedProject.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Spaces Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#6B635B]">
                  <ArrowsOutCardinal className="w-3.5 h-3.5 text-[#B88460]" />
                  <span>
                    {isRTL
                      ? `نطاق المساحات المحددة (${selectedProject.spaces?.length || 0})`
                      : `Configured Spaces Scope (${selectedProject.spaces?.length || 0})`}
                  </span>
                </div>
                <span className="text-[11px] text-[#6B635B] font-mono">
                  {selectedProject.scopeType ||
                    (isRTL ? "تشطيب شامل ومفتاح" : "Turnkey Fit-Out")}
                </span>
              </div>

              {selectedProject.spaces && selectedProject.spaces.length > 0 ? (
                <div className="border border-[#D8C8B4] rounded-xl divide-y divide-[#D8C8B4] overflow-hidden">
                  {selectedProject.spaces.map((sp) => (
                    <div
                      key={sp.id}
                      className="p-3 bg-[#FAF7F2] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-medium text-[#1C1917]">{sp.name}</div>
                        <div className="text-[10px] text-[#6B635B] font-mono">
                          {isRTL ? "النوع: " : "Type: "}
                          {SPACE_LABELS[sp.type]?.[language] || sp.type} ·{" "}
                          {isRTL ? "العدد: " : "Qty: "}
                          {sp.quantity}
                        </div>
                      </div>
                      {sp.styleName && (
                        <div className="px-2.5 py-1 rounded-md bg-[#B88460]/15 text-[#8F5A36] text-[10px] font-mono font-medium border border-[#B88460]/20">
                          {sp.styleName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-[#D8C8B4] text-center text-xs text-[#6B635B]">
                  {isRTL
                    ? "لم يتم تحديد مساحات تفصيلية في مرحلة الاستلام."
                    : "No spaces configured in intake."}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="border-t border-[#D8C8B4] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[#6B635B]">
                {isRTL ? "إجمالي المهندسين المعينين: " : "Assigned Engineers: "}
                <strong className="text-[#1C1917]">
                  {getProjectAssignedEngineers(selectedProject).length}
                </strong>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenAssignModal(selectedProject);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2] text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#B88460]" />
                  <span>
                    {getProjectAssignedEngineers(selectedProject).length > 0
                      ? isRTL
                        ? "إدارة وتعديل الفريق الهندسي"
                        : "Manage Engineering Team"
                      : isRTL
                      ? "تعيين فريق المهندسين"
                      : "Assign Engineering Team"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 rounded-xl border border-[#D8C8B4] bg-[#FAF7F2] hover:bg-[#EFE7DC] text-xs font-medium text-[#1C1917] cursor-pointer transition-colors"
                >
                  {isRTL ? "إغلاق الكراسة" : "Close Dossier"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
