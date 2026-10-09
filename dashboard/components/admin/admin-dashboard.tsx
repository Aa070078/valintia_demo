"use client"

import * as React from "react"
import {
  AdminProject,
  EligibleEngineer,
  StaffAccount,
  CreateStaffPayload,
  ProvisionStaffResponse,
  adminApi,
} from "@/lib/admin-api"
import { useAuth } from "@/components/auth/auth-context"
import {
  ShieldCheck,
  UserPlus,
  Users,
  CheckCircle,
  X,
  ClockCounterClockwise,
  ChartBar,
  Buildings,
  HardHat,
  ArrowsClockwise,
  MagnifyingGlass,
  Sparkle,
  TrendUp,
  Coins,
  CalendarCheck,
  WarningCircle,
  Check,
  Copy,
  Eye,
  Key,
  FolderOpen,
} from "@phosphor-icons/react"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

type AdminTab = "ANALYTICS" | "PROJECTS" | "STAFF" | "AUDIT"

interface AuditEntry {
  id: string
  timestamp: string
  actor: string
  role: string
  action: string
  target: string
  details: string
}

export function AdminDashboard({
  projectManager = false,
}: {
  projectManager?: boolean
}) {
  const { role } = useAuth()
  const isAdmin = role === "ADMINISTRATOR"
  const { isRTL } = useLanguage()

  const [activeTab, setActiveTab] = React.useState<AdminTab>(
    projectManager ? "PROJECTS" : "ANALYTICS"
  )
  const [projects, setProjects] = React.useState<AdminProject[]>([])
  const [engineers, setEngineers] = React.useState<EligibleEngineer[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL")

  // Assignment Modal
  const [assigningProject, setAssigningProject] =
    React.useState<AdminProject | null>(null)
  const [selectedEngineerId, setSelectedEngineerId] = React.useState<
    number | null
  >(null)
  const [isAssigning, setIsAssigning] = React.useState(false)

  // Project Inspection Drawer
  const [inspectingProject, setInspectingProject] =
    React.useState<AdminProject | null>(null)

  // Staff Provisioning State
  const [isProvisioningModalOpen, setIsProvisioningModalOpen] =
    React.useState(false)
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [birthYear, setBirthYear] = React.useState<number>(1995)
  const [staffRole, setStaffRole] = React.useState<
    "ENGINEER" | "PROJECT_MANAGER" | "COMPANY_OWNER"
  >("ENGINEER")
  const [isSubmittingStaff, setIsSubmittingStaff] = React.useState(false)
  const [lastVoucher, setLastVoucher] =
    React.useState<ProvisionStaffResponse | null>(null)
  const [copiedField, setCopiedField] = React.useState<string | null>(null)

  // Notification Banner
  const [notice, setNotice] = React.useState<{
    text: string
    type: "success" | "error"
  } | null>(null)

  // Audit Entries
  const [auditLogs, setAuditLogs] = React.useState<AuditEntry[]>([])
  const [staffError, setStaffError] = React.useState(false)
  const [staff, setStaff] = React.useState<StaffAccount[]>([])
  const [reissueAccount, setReissueAccount] =
    React.useState<StaffAccount | null>(null)
  const [isReissuing, setIsReissuing] = React.useState(false)

  // Load Data
  const loadData = React.useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        adminApi.getProjects(),
        role === "COMPANY_OWNER"
          ? Promise.resolve([])
          : adminApi.getEligibleEngineers(),
        isAdmin ? adminApi.getStaffUsers() : Promise.resolve([]),
      ])
      if (results[0].status === "fulfilled") setProjects(results[0].value)
      else setProjects([])
      if (results[1].status === "fulfilled") setEngineers(results[1].value)
      else setEngineers([])
      setStaffError(results[2].status === "rejected")
      if (results[2].status === "fulfilled") setStaff(results[2].value)
      else setStaff([])
      const errors = results.filter((result) => result.status === "rejected")
      if (errors.length)
        setNotice({
          text: isRTL
            ? "تعذر تحميل بعض البيانات. أعد المحاولة."
            : "Some data could not be loaded. Please retry.",
          type: "error",
        })
    } catch {
      setNotice({ text: "Unable to load data. Please retry.", type: "error" })
    } finally {
      setIsLoadingProjects(false)
    }
  }, [role, isAdmin, isRTL])

  React.useEffect(() => {
    // This callback fetches external API state; all state updates follow settled requests.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  React.useEffect(() => {
    if (activeTab !== "AUDIT") return
    let cancelled = false
    Promise.all(
      projects.map((project) => adminApi.getProjectActivity(project.id))
    )
      .then((histories) => {
        if (!cancelled)
          setAuditLogs(
            histories.flat().map((activity) => ({
              id: String(activity.id),
              timestamp: new Date(activity.createdAt).toLocaleString(),
              actor: `#${activity.actorId}`,
              role: activity.actorRole,
              action: activity.action,
              target: `Project #${activity.projectId}`,
              details:
                activity.note ||
                `${activity.fromStatus} → ${activity.toStatus}`,
            }))
          )
      })
      .catch(() => {
        if (!cancelled)
          setNotice({ text: "Unable to load project activity.", type: "error" })
      })
    return () => {
      cancelled = true
    }
  }, [activeTab, projects])

  const confirmReissue = async () => {
    if (!reissueAccount || isReissuing) return
    setIsReissuing(true)
    setLastVoucher(null)
    try {
      const voucher = await adminApi.revokeTemporaryCredentials(
        reissueAccount.id
      )
      setLastVoucher(voucher)
      setReissueAccount(null)
      setNotice({
        text: isRTL
          ? "تم إلغاء البيانات السابقة وإصدار بيانات جديدة."
          : "Old credentials revoked. New credentials issued.",
        type: "success",
      })
      await loadData()
    } catch (error) {
      setNotice({
        text:
          error instanceof Error
            ? error.message
            : "Credentials could not be reissued.",
        type: "error",
      })
    } finally {
      setIsReissuing(false)
    }
  }

  // Handle Assigning Engineer
  const handleConfirmAssignment = async () => {
    if (!assigningProject || !selectedEngineerId) return
    setIsAssigning(true)
    try {
      await adminApi.assignEngineer(assigningProject.id, selectedEngineerId)
      await loadData()

      setNotice({
        text: isRTL
          ? `تم تعيين المهندس بنجاح للمشروع #${assigningProject.id}`
          : `Engineer assigned successfully to Project #${assigningProject.id}`,
        type: "success",
      })
      setAssigningProject(null)
    } catch (err: unknown) {
      setNotice({
        text:
          (err instanceof Error ? err.message : "") ||
          (isRTL ? "فشل تعيين المهندس" : "Failed to assign engineer"),
        type: "error",
      })
    } finally {
      setIsAssigning(false)
      setTimeout(() => setNotice(null), 5000)
    }
  }

  // Handle Staff Provisioning
  const handleProvisionStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) return

    setIsSubmittingStaff(true)
    try {
      const payload: CreateStaffPayload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthYear: Number(birthYear) || 1995,
        role: staffRole,
      }

      const res = await adminApi.provisionStaffUser(payload)
      setLastVoucher(res)

      setNotice({
        text: isRTL
          ? `تم توليد حساب الموظف الجديد بنجاح (${res.temporaryLogin})`
          : `New staff account provisioned successfully (${res.temporaryLogin})`,
        type: "success",
      })

      await loadData()
      // Clear form
      setFirstName("")
      setLastName("")
    } catch (err: unknown) {
      setNotice({
        text:
          (err instanceof Error ? err.message : "") ||
          (isRTL ? "فشل إنشاء الحساب" : "Failed to provision user"),
        type: "error",
      })
    } finally {
      setIsSubmittingStaff(false)
      setTimeout(() => setNotice(null), 5000)
    }
  }

  // Filtered Projects
  const filteredProjects = React.useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.property?.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.property?.compound
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        p.client?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.id).includes(searchQuery)

      const matchesStatus =
        statusFilter === "ALL" || p.status.toUpperCase() === statusFilter

      const matchesType =
        typeFilter === "ALL" ||
        p.property?.propertyType.toLowerCase() === typeFilter.toLowerCase()

      return matchesSearch && matchesStatus && matchesType
    })
  }, [projects, searchQuery, statusFilter, typeFilter])

  // Analytics Computations
  const stats = React.useMemo(() => {
    const total = projects.length
    const submitted = projects.filter((p) => p.status === "SUBMITTED").length
    const underReview = projects.filter(
      (p) => p.status === "UNDER_ENGINEER_REVIEW"
    ).length
    const ready = projects.filter((p) => p.status === "ENGINEER_READY").length
    const unassigned = projects.filter((p) => !p.assignment).length

    // Total estimated pipeline value in EGP
    let totalValue = 0
    projects.forEach((p) => {
      if (p.budget?.maxAmount) totalValue += Number(p.budget.maxAmount)
      else if (p.budget?.exactAmount) totalValue += Number(p.budget.exactAmount)
    })

    return {
      total,
      submitted,
      underReview,
      ready,
      unassigned,
      totalValue,
    }
  }, [projects])

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUBMITTED":
        return {
          label: isRTL ? "بانتظار المراجعة" : "Submitted",
          className: "bg-blue-50 text-blue-800 border-blue-200",
        }
      case "UNDER_ENGINEER_REVIEW":
        return {
          label: isRTL ? "قيد المراجعة الهندسية" : "Under Review",
          className: "bg-amber-50 text-amber-800 border-amber-200",
        }
      case "ENGINEER_READY":
        return {
          label: isRTL ? "جاهز للمقابلة والمعاينة" : "Ready for Consultation",
          className: "bg-emerald-50 text-emerald-800 border-emerald-200",
        }
      default:
        return {
          label: isRTL ? "مسودة" : "Draft",
          className: "bg-stone-100 text-stone-700 border-stone-200",
        }
    }
  }

  return (
    <div className="space-y-8 font-sans">
      {/* ─────────────────────────────────────────────────────────────
          TOP CONTROL BAR & NOTIFICATIONS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-primary uppercase">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>
              {isRTL
                ? "لوحة الإدارة المركزية والرقابة الكاملة"
                : "EXECUTIVE PLATFORM OVERSIGHT"}
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
            {isRTL
              ? "إدارة المشاريع والعمليات"
              : "Executive Operations Cockpit"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {isRTL
              ? "متابعة لحظية لكافة مشاريع المنصة، وتعيين المهندسين ومدراء المشاريع، وتوليد حسابات الفريق الداخلي."
              : "Real-time visibility over all client commissions, engineering assignments, and staff provisioning."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            className="cursor-pointer rounded-xl border border-border bg-card p-2.5 text-foreground transition-colors hover:bg-secondary"
            title={isRTL ? "تحديث البيانات" : "Refresh Data"}
          >
            <ArrowsClockwise
              className={cn("h-4 w-4", isLoadingProjects && "animate-spin")}
            />
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsProvisioningModalOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
            >
              <UserPlus className="h-4 w-4" />
              <span>
                {isRTL ? "توليد حساب موظف جديد" : "Provision Staff Account"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Global Notification Banner */}
      {notice && (
        <div
          className={cn(
            "flex animate-in items-center justify-between gap-3 rounded-2xl border p-4 text-xs shadow-xs duration-200 fade-in",
            notice.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-red-300 bg-red-50 text-red-900"
          )}
        >
          <div className="flex items-center gap-2">
            {notice.type === "success" ? (
              <CheckCircle
                className="h-4 w-4 shrink-0 text-emerald-600"
                weight="fill"
              />
            ) : (
              <WarningCircle
                className="h-4 w-4 shrink-0 text-red-600"
                weight="fill"
              />
            )}
            <span className="font-medium">{notice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="cursor-pointer p-1 hover:opacity-70"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB NAVIGATION PILLS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex scrollbar-none items-center gap-2 overflow-x-auto border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("ANALYTICS")}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all",
            activeTab === "ANALYTICS"
              ? "border-primary bg-primary text-primary-foreground shadow-xs"
              : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <ChartBar className="h-4 w-4" />
          <span>
            {isRTL ? "التحليلات والمؤشرات الشاملة" : "Platform Analytics"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PROJECTS")}
          className={cn(
            "relative flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all",
            activeTab === "PROJECTS"
              ? "border-primary bg-primary text-primary-foreground shadow-xs"
              : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <FolderOpen className="h-4 w-4" />
          <span>
            {isRTL
              ? `محفظة المشاريع والتعيين (${projects.length})`
              : `Projects Portfolio (${projects.length})`}
          </span>
          {stats.unassigned > 0 && (
            <span className="py-0.2 ml-1 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
              {stats.unassigned}
            </span>
          )}
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab("STAFF")}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all",
              activeTab === "STAFF"
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Users className="h-4 w-4" />
            <span>
              {isRTL
                ? "فريق العمل وبيانات الدخول"
                : "Staff Directory & Vouchers"}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab("AUDIT")}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all",
            activeTab === "AUDIT"
              ? "border-primary bg-primary text-primary-foreground shadow-xs"
              : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <ClockCounterClockwise className="h-4 w-4" />
          <span>{isRTL ? "سجل العمليات والرقابة" : "Live Audit Stream"}</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: PLATFORM INTELLIGENCE & ANALYTICS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "ANALYTICS" && (
        <div className="animate-in space-y-6 duration-150 fade-in">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-xs">
              <div className="mb-3 flex items-center justify-between text-muted-foreground">
                <span className="font-mono text-[11px] font-semibold tracking-wider uppercase">
                  {isRTL ? "إجمالي مشاريع المنصة" : "Total Commissions"}
                </span>
                <Buildings className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-foreground">
                  {stats.total}
                </span>
                <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                  <TrendUp className="h-3.5 w-3.5" /> +4{" "}
                  {isRTL ? "هذا الشهر" : "this mo"}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                {stats.submitted}{" "}
                {isRTL ? "جديد بانتظار المراجعة" : "new submitted"}
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-xs">
              <div className="mb-3 flex items-center justify-between text-muted-foreground">
                <span className="font-mono text-[11px] font-semibold tracking-wider uppercase">
                  {isRTL ? "إجمالي قيمة المحفظة" : "Active Pipeline Value"}
                </span>
                <Coins className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
                  {(stats.totalValue / 1000000).toFixed(1)}M
                </span>
                <span className="font-mono text-xs font-bold text-muted-foreground">
                  EGP
                </span>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                {isRTL
                  ? "تقدير الميزانيات المجمعة"
                  : "Estimated aggregate budget"}
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-xs">
              <div className="mb-3 flex items-center justify-between text-muted-foreground">
                <span className="font-mono text-[11px] font-semibold tracking-wider uppercase">
                  {isRTL ? "بانتظار تعيين مهندس" : "Pending Assignment"}
                </span>
                <HardHat className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "font-serif text-3xl font-bold",
                    stats.unassigned > 0 ? "text-amber-600" : "text-foreground"
                  )}
                >
                  {stats.unassigned}
                </span>
                {stats.unassigned > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    {isRTL ? "يتطلب إجراء" : "Action Needed"}
                  </span>
                )}
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                {isRTL
                  ? "مشاريع معتمدة بدون مهندس"
                  : "Projects ready for assignment"}
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-xs">
              <div className="mb-3 flex items-center justify-between text-muted-foreground">
                <span className="font-mono text-[11px] font-semibold tracking-wider uppercase">
                  {isRTL ? "جاهزة للمقابلة والمعاينة" : "Consultation Ready"}
                </span>
                <CalendarCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-emerald-600">
                  {stats.ready}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {stats.underReview} {isRTL ? "قيد المراجعة" : "under review"}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                {isRTL
                  ? "تم اعتماد جاهزيتها الهندسية"
                  : "Verified by site architects"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                title: isRTL ? "أنواع العقارات" : "Property types",
                values: projects.map((p) => p.property?.propertyType),
              },
              {
                title: isRTL ? "المواقع" : "Locations",
                values: projects.map((p) => p.property?.city),
              },
              {
                title: isRTL ? "المشاريع حسب المهندس" : "Projects per engineer",
                values: projects.map((p) => p.assignment?.engineer?.username),
              },
            ].map((group) => {
              const counts = group.values.reduce<Record<string, number>>(
                (result, value) => {
                  if (value) result[value] = (result[value] || 0) + 1
                  return result
                },
                {}
              )
              return (
                <section
                  key={group.title}
                  className="rounded-3xl border border-border bg-card p-6"
                >
                  <h3 className="mb-4 text-sm font-bold">{group.title}</h3>
                  {Object.entries(counts).map(([label, count]) => (
                    <div
                      key={label}
                      className="my-3 flex justify-between gap-3 text-xs"
                    >
                      <span>{label}</span>
                      <span className="font-mono text-primary">{count}</span>
                    </div>
                  ))}
                  {Object.keys(counts).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? "لا توجد بيانات" : "No data available"}
                    </p>
                  )}
                </section>
              )
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: PROJECT PORTFOLIO & ASSIGNMENTS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "PROJECTS" && (
        <div className="animate-in space-y-5 duration-150 fade-in">
          {/* Filters Bar */}
          <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs md:flex-row md:items-center">
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
                className="h-10 w-full rounded-xl border border-border bg-background pr-4 pl-9 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <MagnifyingGlass className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="ALL">
                  {isRTL ? "كل الحالات" : "All Statuses"}
                </option>
                <option value="SUBMITTED">
                  {isRTL ? "معتمد بانتظار المراجعة" : "Submitted"}
                </option>
                <option value="UNDER_ENGINEER_REVIEW">
                  {isRTL ? "قيد المراجعة الفنية" : "Under Review"}
                </option>
                <option value="ENGINEER_READY">
                  {isRTL ? "جاهز للمقابلة" : "Ready for Consultation"}
                </option>
                <option value="DRAFT">{isRTL ? "مسودة" : "Draft"}</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="ALL">
                  {isRTL ? "كل العقارات" : "All Typologies"}
                </option>
                <option value="villa">{isRTL ? "فيلا" : "Villa"}</option>
                <option value="duplex">{isRTL ? "دوبلكس" : "Duplex"}</option>
                <option value="penthouse">
                  {isRTL ? "بنتهاوس" : "Penthouse"}
                </option>
                <option value="apartment">{isRTL ? "شقة" : "Apartment"}</option>
              </select>
            </div>
          </div>

          {/* Projects Table */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                    <th className="px-4 py-3.5 text-start">#</th>
                    <th className="px-4 py-3.5 text-start">
                      {isRTL ? "المشروع والعميل" : "Project & Client"}
                    </th>
                    <th className="px-4 py-3.5 text-start">
                      {isRTL ? "مواصفات العقار" : "Property Specs"}
                    </th>
                    <th className="px-4 py-3.5 text-start">
                      {isRTL ? "الميزانية المقدرة" : "Budget"}
                    </th>
                    <th className="px-4 py-3.5 text-start">
                      {isRTL ? "الحالة" : "Status"}
                    </th>
                    <th className="px-4 py-3.5 text-start">
                      {isRTL ? "المهندس المسؤول" : "Assigned Engineer"}
                    </th>
                    <th className="px-4 py-3.5 text-end">
                      {isRTL ? "الإجراءات" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-12 text-center text-muted-foreground"
                      >
                        {isRTL
                          ? "لا توجد مشاريع مطابقة للبحث."
                          : "No projects match your criteria."}
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((p) => {
                      const badge = getStatusBadge(p.status)
                      const hasEngineer = Boolean(p.assignment)

                      return (
                        <tr
                          key={p.id}
                          className="transition-colors hover:bg-secondary/30"
                        >
                          <td className="px-4 py-4 font-mono font-bold text-muted-foreground">
                            #{p.id}
                          </td>

                          <td className="px-4 py-4">
                            <div className="font-serif text-sm font-bold text-foreground">
                              {p.title}
                            </div>
                            <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                              {p.client?.username || `Client #${p.clientId}`}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="font-semibold text-foreground capitalize">
                              {p.property?.propertyType || "Property"} ·{" "}
                              {p.property?.areaSqm || "200"} m²
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {p.property?.compound
                                ? `${p.property.compound}, `
                                : ""}
                              {p.property?.city || "Cairo"}
                            </div>
                          </td>

                          <td className="px-4 py-4 font-mono">
                            <div className="font-bold text-foreground">
                              {p.budget?.maxAmount
                                ? `${(Number(p.budget.maxAmount) / 1000000).toFixed(1)}M EGP`
                                : "3.5M EGP"}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {p.timeline?.durationDescription || "Standard"}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold",
                                badge.className
                              )}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {badge.label}
                            </span>
                          </td>

                          {/* Assigned Engineer Cell */}
                          <td className="px-4 py-4">
                            {hasEngineer ? (
                              <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                  Eng
                                </div>
                                <div className="text-xs">
                                  <div className="font-semibold text-foreground">
                                    {p.assignment?.engineer?.username?.split(
                                      "@"
                                    )[0] ||
                                      (isRTL
                                        ? "المهندس المعيّن"
                                        : "Assigned engineer")}
                                  </div>
                                  <div className="font-mono text-[10px] text-muted-foreground">
                                    {p.assignment?.engineer?.username ||
                                      "Lead Architect"}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">
                                <WarningCircle className="h-3.5 w-3.5" />
                                <span>
                                  {isRTL ? "غير مُعيّن بعد" : "Unassigned"}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4 text-end">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Assign Engineer Button */}
                              <button
                                type="button"
                                disabled={role === "COMPANY_OWNER"}
                                onClick={() => {
                                  setAssigningProject(p)
                                  setSelectedEngineerId(
                                    p.assignment?.engineerId ||
                                      engineers[0]?.id ||
                                      null
                                  )
                                }}
                                className={cn(
                                  "cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all",
                                  hasEngineer
                                    ? "border-border text-foreground hover:bg-secondary"
                                    : "border-amber-300 bg-amber-500 font-bold text-white shadow-2xs hover:bg-amber-600"
                                )}
                                title={
                                  isRTL ? "تعيين مهندس" : "Assign Engineer"
                                }
                              >
                                {hasEngineer
                                  ? isRTL
                                    ? "إعادة تعيين"
                                    : "Reassign"
                                  : isRTL
                                    ? "تعيين مهندس +"
                                    : "Assign Eng +"}
                              </button>

                              {/* Inspect Button */}
                              <button
                                type="button"
                                onClick={() => setInspectingProject(p)}
                                className="cursor-pointer rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                title={isRTL ? "معاينة التفاصيل" : "Inspect"}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
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
      {isAdmin && activeTab === "STAFF" && (
        <div className="animate-in space-y-6 duration-150 fade-in">
          {/* Last Voucher Alert Card if just generated */}
          {lastVoucher && (
            <div className="relative overflow-hidden rounded-3xl border-2 border-[#B88460] bg-[#FAF7F2] p-6 text-[#1C1917] shadow-xl">
              <div className="mb-4 flex items-center justify-between border-b border-[#E8DEC8] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#503C2C] text-[#FAF7F2] shadow-md">
                    <Key className="h-5 w-5 text-[#FAF7F2]" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 font-mono text-[10px] font-bold tracking-widest text-[#B88460] uppercase">
                      <Sparkle className="h-3.5 w-3.5" />
                      <span>
                        {isRTL
                          ? "قسيمة الدخول المؤقتة المعتمدة"
                          : "ACTIVE PROVISIONING VOUCHER"}
                      </span>
                    </div>
                    <h3 className="font-serif text-base font-bold text-[#1C1917]">
                      {lastVoucher.role} · {lastVoucher.username}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setLastVoucher(null)}
                  className="cursor-pointer p-1 text-[#78716C] hover:text-[#1C1917]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#E8DEC8] bg-white p-3.5">
                  <div className="mb-1 font-mono text-[10px] tracking-wider text-[#78716C] uppercase">
                    {isRTL
                      ? "اسم المستخدم المؤقت (Temporary Login)"
                      : "Temporary Login"}
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-xs font-bold text-[#1C1917]">
                      {lastVoucher.temporaryLogin}
                    </code>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(lastVoucher.temporaryLogin, "login")
                      }
                      className="cursor-pointer rounded p-1 text-[#503C2C] hover:bg-stone-100"
                    >
                      {copiedField === "login" ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E8DEC8] bg-white p-3.5">
                  <div className="mb-1 font-mono text-[10px] tracking-wider text-[#78716C] uppercase">
                    {isRTL
                      ? "كلمة المرور المؤقتة (Temporary Password)"
                      : "Temporary Password"}
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-xs font-bold tracking-wider text-amber-700">
                      {lastVoucher.temporaryPassword}
                    </code>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(lastVoucher.temporaryPassword, "pass")
                      }
                      className="cursor-pointer rounded p-1 text-[#503C2C] hover:bg-stone-100"
                    >
                      {copiedField === "pass" ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-xs leading-relaxed text-[#78716C]">
                {isRTL
                  ? "تنبيه: سلم هذه البيانات للمهندس ليسجل دخوله من صفحة الدخول الرئيسية. بمجرد تسجيل دخوله، سيُطلب منه إدخال إيميله الرسمي وتأكيده بـ OTP وتعيين كلمة مروره الدائمة."
                  : "Note: Hand over these credentials to the staff member. Upon signing in, they will be prompted to enter their real email, verify OTP, and choose their permanent password."}
              </div>
            </div>
          )}

          {/* Active Internal Staff Table */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {isRTL
                    ? "دليل حسابات الفريق الداخلي"
                    : "Internal Staff Accounts"}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {isRTL
                    ? "المهندسين، مدراء المشاريع، والشركاء المسجلين على النظام."
                    : "Site architects, project managers, and company executives."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsProvisioningModalOpen(true)}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                <UserPlus className="h-4 w-4" />
                <span>
                  {isRTL ? "إضافة حساب جديد" : "Provision New Account"}
                </span>
              </button>
            </div>

            <div className="divide-y divide-border">
              {staffError && (
                <p className="p-5 text-destructive">
                  {isRTL
                    ? "تعذر تحميل حسابات الموظفين"
                    : "Staff accounts could not be loaded"}
                </p>
              )}
              {!staffError && staff.length === 0 && (
                <p className="p-5 text-muted-foreground">
                  {isRTL ? "لا توجد حسابات موظفين" : "No staff accounts found"}
                </p>
              )}
              {staff.map((account) => {
                const incomplete =
                  !account.email ||
                  !account.emailVerified ||
                  account.mustChangePassword
                return (
                  <div
                    key={account.id}
                    className="flex flex-wrap items-center justify-between gap-4 p-4"
                  >
                    <div>
                      <p className="font-semibold">{account.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {account.role} ·{" "}
                        {account.email ||
                          (isRTL ? "لم يتم ربط بريد" : "No verified email yet")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-md bg-secondary px-2 py-1 text-xs">
                        {incomplete
                          ? isRTL
                            ? "إعداد الحساب غير مكتمل"
                            : "Onboarding incomplete"
                          : isRTL
                            ? "نشط ومؤكد"
                            : "Active & verified"}
                      </span>
                      {incomplete && (
                        <button
                          type="button"
                          disabled={isReissuing}
                          onClick={() => setReissueAccount(account)}
                          className="rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-50"
                        >
                          {isRTL
                            ? "إلغاء وإعادة إصدار بيانات الدخول"
                            : "Revoke & reissue temp credentials"}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: LIVE AUDIT STREAM
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "AUDIT" && (
        <div className="animate-in space-y-4 duration-150 fade-in">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
            <h3 className="mb-1 text-sm font-bold text-foreground">
              {isRTL
                ? "سجل العمليات والرقابة الفورية"
                : "Project Activity History"}
            </h3>
            <p className="mb-4 text-xs text-muted-foreground">
              {isRTL
                ? "تتبع مباشر لكافة الإجراءات: تقديم المشاريع، تعيين المهندسين، وتوليد الحسابات."
                : "Real-time ledger recording administrative, engineering, and client submissions."}
            </p>

            <div className="divide-y divide-border">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between gap-4 py-3.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {log.action}
                        </span>
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {log.role}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-foreground">
                        {log.target}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {log.details}
                      </div>
                    </div>
                  </div>

                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
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
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/70 p-4 backdrop-blur-md duration-200 fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 text-foreground shadow-2xl sm:p-7">
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <HardHat className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold">
                    {isRTL
                      ? "تعيين المهندس المسؤول"
                      : "Assign Responsible Site Architect"}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground">
                    Project #{assigningProject.id} · {assigningProject.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssigningProject(null)}
                className="cursor-pointer p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-6 space-y-4">
              <label className="block text-xs font-semibold tracking-wider text-foreground uppercase">
                {isRTL
                  ? "اختر المهندس المعماري / التنفيذي"
                  : "Select Eligible Engineer"}
              </label>

              <div className="space-y-2">
                {engineers.map((eng) => {
                  const isSelected = selectedEngineerId === eng.id
                  return (
                    <button
                      key={eng.id}
                      type="button"
                      onClick={() => setSelectedEngineerId(eng.id)}
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between rounded-2xl border p-3.5 text-start transition-all",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-xs"
                          : "border-border bg-background text-foreground hover:bg-secondary"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold",
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          Eng
                        </div>
                        <div>
                          <div className="text-xs font-bold">
                            {eng.username.split("@")[0].replace(".", " ")}
                          </div>
                          <div
                            className={cn(
                              "font-mono text-[10px]",
                              isSelected
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            )}
                          >
                            {eng.username}
                          </div>
                        </div>
                      </div>

                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setAssigningProject(null)}
                className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleConfirmAssignment}
                disabled={isAssigning || !selectedEngineerId}
                className="cursor-pointer rounded-full bg-primary px-6 py-3 text-xs font-semibold tracking-wider text-primary-foreground uppercase shadow-md transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
              >
                {isAssigning
                  ? isRTL
                    ? "جاري التعيين..."
                    : "Assigning..."
                  : isRTL
                    ? "تأكيد التعيين ✓"
                    : "Confirm Assignment ✓"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ASSIGN PROJECT MANAGER
      ───────────────────────────────────────────────────────────── */}
      {reissueAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reissue-title"
            className="w-full max-w-lg rounded-3xl border border-border bg-card p-7 text-foreground shadow-2xl"
          >
            <h3 id="reissue-title" className="text-lg font-semibold">
              {isRTL
                ? "إلغاء وإعادة إصدار بيانات الدخول"
                : "Revoke temporary credentials?"}
            </h3>
            <p className="my-4 text-sm text-muted-foreground">
              {reissueAccount.username}
            </p>
            <p className="mb-6 text-sm">
              {isRTL
                ? "سيتم إلغاء بيانات الدخول المؤقتة وجلسات الإعداد السابقة. يبقى الحساب والمشاريع كما هي، وستظهر البيانات الجديدة مرة واحدة."
                : "This invalidates the old temporary login and onboarding sessions. The account and project assignments are preserved. New credentials will be displayed once."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={isReissuing}
                onClick={() => setReissueAccount(null)}
                className="rounded-lg border border-border px-4 py-2"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={isReissuing}
                onClick={confirmReissue}
                className="rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
              >
                {isReissuing
                  ? isRTL
                    ? "جارٍ الإصدار..."
                    : "Reissuing..."
                  : isRTL
                    ? "تأكيد إعادة الإصدار"
                    : "Confirm reissue"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isAdmin && isProvisioningModalOpen && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/70 p-4 backdrop-blur-md duration-200 fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 text-foreground shadow-2xl sm:p-7">
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold">
                    {isRTL
                      ? "توليد قسيمة حساب موظف جديد"
                      : "Provision Internal Staff Account"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isRTL
                      ? "إنشاء بيانات دخول مؤقتة وفق العقد الأمني للمنصة"
                      : "Generates temporary credentials and onboarding voucher"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProvisioningModalOpen(false)}
                className="cursor-pointer p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleProvisionStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    {isRTL ? "الاسم الأول" : "First Name"}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="e.g. Karim"
                    className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    {isRTL ? "اسم العائلة" : "Last Name"}
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="e.g. El-Sayed"
                    className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    {isRTL ? "سنة الميلاد" : "Birth Year"}
                  </label>
                  <input
                    type="number"
                    value={birthYear}
                    onChange={(e) => setBirthYear(Number(e.target.value))}
                    required
                    min={1920}
                    max={2015}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3.5 font-mono text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    {isRTL ? "الدور الوظيفي" : "Role"}
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) =>
                      setStaffRole(e.target.value as CreateStaffPayload["role"])
                    }
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="ENGINEER">
                      {isRTL
                        ? "مهندس معماري / تنفيذي (ENGINEER)"
                        : "Site Architect (ENGINEER)"}
                    </option>
                    <option value="PROJECT_MANAGER">
                      {isRTL
                        ? "مدير مشروع (PROJECT_MANAGER)"
                        : "Project Manager (PROJECT_MANAGER)"}
                    </option>
                    <option value="COMPANY_OWNER">
                      {isRTL
                        ? "شريك ومؤسس (COMPANY_OWNER)"
                        : "Company Owner (COMPANY_OWNER)"}
                    </option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => setIsProvisioningModalOpen(false)}
                  className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmittingStaff || !firstName.trim() || !lastName.trim()
                  }
                  className="cursor-pointer rounded-full bg-primary px-6 py-3 text-xs font-semibold tracking-wider text-primary-foreground uppercase shadow-md transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingStaff
                    ? isRTL
                      ? "جاري التوليد..."
                      : "Provisioning..."
                    : isRTL
                      ? "توليد وإصدار القسيمة ←"
                      : "Generate Voucher →"}
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
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-end bg-black/60 backdrop-blur-xs duration-150 fade-in">
          <div className="h-full w-full max-w-xl space-y-6 overflow-y-auto border-l border-border bg-card p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase">
                  PROJECT INSPECTION · #{inspectingProject.id}
                </span>
                <h3 className="font-serif text-lg font-bold text-foreground">
                  {inspectingProject.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingProject(null)}
                className="cursor-pointer rounded-lg border border-border p-1.5 hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2 rounded-2xl border border-border bg-secondary/50 p-4">
                <div className="font-bold text-foreground">
                  {isRTL ? "بيانات العميل والعقار" : "Client & Property"}
                </div>
                <div>
                  {isRTL ? "العميل: " : "Client: "}
                  <span className="font-mono">
                    {inspectingProject.client?.username}
                  </span>
                </div>
                <div>
                  {isRTL ? "الموقع: " : "Location: "}
                  {inspectingProject.property?.compound},{" "}
                  {inspectingProject.property?.city}
                </div>
                <div>
                  {isRTL ? "المساحة: " : "Area: "}
                  {inspectingProject.property?.areaSqm} m² (
                  {inspectingProject.property?.propertyType})
                </div>
              </div>

              <div className="space-y-2 rounded-2xl border border-border bg-secondary/50 p-4">
                <div className="font-bold text-foreground">
                  {isRTL ? "الغرف والمساحات المعتمدة" : "Spaces Included"}
                </div>
                {inspectingProject.spaces &&
                inspectingProject.spaces.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {inspectingProject.spaces.map((s) => (
                      <span
                        key={s.id}
                        className="rounded-lg border border-border bg-card px-2.5 py-1 text-[11px]"
                      >
                        {s.customName || s.type}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    No spaces recorded
                  </div>
                )}
              </div>

              <div className="space-y-2 rounded-2xl border border-border bg-secondary/50 p-4">
                <div className="font-bold text-foreground">
                  {isRTL ? "فريق العمل المعين" : "Assigned Atelier Staff"}
                </div>
                <div>
                  {isRTL ? "المهندس: " : "Site Architect: "}
                  <strong className="text-foreground">
                    {inspectingProject.assignment?.engineer?.username ||
                      "Not assigned"}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
