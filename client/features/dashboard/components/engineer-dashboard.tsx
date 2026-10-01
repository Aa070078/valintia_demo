"use client";

import * as React from "react";
import { MOCK_PROJECTS, MOCK_USERS } from "../mock-data";
import { ProjectOverview, ProjectStatus } from "../types";
import {
  Compass,
  Buildings,
  MapPin,
  Phone,
  User,
  CaretRight,
  CaretLeft,
  CheckCircle,
  Clock,
  ArrowsOutCardinal,
  X,
  NotePencil,
  Check,
  CalendarCheck,
} from "@phosphor-icons/react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export function EngineerDashboard() {
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const [projects, setProjects] = React.useState<ProjectOverview[]>(MOCK_PROJECTS);
  // Default to user id or Eng. Karim El-Sayed (1)
  const initialEngId = typeof user?.id === "number" ? user.id : 1;
  const [activeEngineerId, setActiveEngineerId] = React.useState<number>(initialEngId);
  const [selectedProject, setSelectedProject] = React.useState<ProjectOverview | null>(null);

  // Survey recording state inside modal
  const [isRecordingSurvey, setIsRecordingSurvey] = React.useState(false);
  const [surveyNotes, setSurveyNotes] = React.useState("");
  const [surveyDate, setSurveyDate] = React.useState("");
  const [surveySuccessMsg, setSurveySuccessMsg] = React.useState<string | null>(null);

  const engineers = MOCK_USERS.filter((u) => u.role === "ENGINEER");
  const activeEngineer =
    engineers.find((e) => String(e.id) === String(activeEngineerId)) ||
    engineers.find((e) => e.username === user?.username) ||
    engineers[0];

  // Filter projects assigned to this engineer
  const targetId = String(activeEngineer.id);
  const targetName = activeEngineer.name;
  const assignedProjects = projects.filter(
    (p) =>
      String(p.leadEngineerId) === targetId ||
      p.leadEngineerName === targetName
  );

  // Handle saving site survey notes and advancing status
  const handleCompleteSurvey = (projectId: string) => {
    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
      const newStatus: ProjectStatus = "SITE_VISIT_COMPLETED";
      return {
        ...p,
        status: newStatus,
        notes: surveyNotes
          ? `${p.notes ? p.notes + "\n\n" : ""}[${isRTL ? "معاينة ورفع مساحي" : "Site Survey"} ${surveyDate || new Date().toISOString().slice(0, 10)}]: ${surveyNotes}`
          : p.notes,
        nextMilestone: isRTL ? "تسليم التصميم ثلاثي الأبعاد والرسومات" : "3D Axonometric & Interior Design Delivery",
        nextMilestoneDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      };
    });

    setProjects(updated);
    if (selectedProject?.id === projectId) {
      const match = updated.find((p) => p.id === projectId);
      if (match) setSelectedProject(match);
    }

    setSurveySuccessMsg(
      isRTL
        ? "تم تسجيل نتائج الرفع المساحي الهندسي بنجاح وتحديث ملف المشروع."
        : "Site survey completed and recorded in project record."
    );
    setIsRecordingSurvey(false);
    setTimeout(() => setSurveySuccessMsg(null), 4000);
  };

  const getStatusBadge = (status: ProjectStatus) => {
    if (isRTL) {
      switch (status) {
        case "ASSIGNED":
          return {
            label: "تم التكليف · بانتظار الرفع",
            className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300",
          };
        case "SITE_VISIT_SCHEDULED":
          return {
            label: "معاينة الموقع مجدولة",
            className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300",
          };
        case "SITE_VISIT_COMPLETED":
          return {
            label: "تم الرفع المساحي · جاري التصميم",
            className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300",
          };
        case "DESIGN_IN_PROGRESS":
          return {
            label: "التصميم والرسومات جارية",
            className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300",
          };
        default:
          return {
            label: status.replace(/_/g, " "),
            className: "bg-muted text-muted-foreground border-border",
          };
      }
    }

    switch (status) {
      case "ASSIGNED":
        return {
          label: "Assigned · Pending Survey",
          className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300",
        };
      case "SITE_VISIT_SCHEDULED":
        return {
          label: "Site Survey Scheduled",
          className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300",
        };
      case "SITE_VISIT_COMPLETED":
        return {
          label: "Survey Completed · In Review",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300",
        };
      case "DESIGN_IN_PROGRESS":
        return {
          label: "Design & Specs Active",
          className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300",
        };
      default:
        return {
          label: status.replace(/_/g, " "),
          className: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  const ArrowIcon = isRTL ? CaretLeft : CaretRight;

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Top Banner & Engineer Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>{isRTL ? "مكتب مهندس الموقع والرفع المساحي" : "FIELD ENGINEERING & ARCHITECTURAL DESK"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-foreground">
            {isRTL ? "المشاريع المسندة للمهندس" : "Assigned Architectural Commissions"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            {isRTL
              ? "مراجعة المواصفات المعمارية، معاينة مساحات العميل، إجراء الرفع المساحي الهندسي، واعتماد المقاسات التنفيذية."
              : "Review architectural specifications, inspect client spaces, conduct site surveys, and verify drawings for your assigned residences."}
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
                {assignedProjects.length} {isRTL ? "مشاريع نشطة" : "Active Projects"}
              </span>
            </div>
          </div>

          <div className="hidden sm:block">
            <select
              value={activeEngineerId}
              onChange={(e) => {
                setActiveEngineerId(Number(e.target.value));
                setSelectedProject(null);
              }}
              className="h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground font-mono outline-none focus:border-primary cursor-pointer"
            >
              {engineers.map((eng) => (
                <option key={eng.id} value={eng.id}>
                  {isRTL ? `تبديل: ${eng.name}` : `Switch: ${eng.name}`}
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
              {isRTL ? "المشاريع المسندة إليك" : "Assigned Commissions"}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-semibold font-mono text-foreground">
              {assignedProjects.filter((p) => p.status === "SITE_VISIT_SCHEDULED" || p.status === "ASSIGNED").length}
            </div>
            <div className="text-[11px] text-muted-foreground uppercase font-mono">
              {isRTL ? "معاينات مجدولة / قيد الرفع" : "Surveys Scheduled / Pending"}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-semibold font-mono text-foreground">
              {assignedProjects.filter((p) => p.status === "SITE_VISIT_COMPLETED" || p.status === "DESIGN_IN_PROGRESS").length}
            </div>
            <div className="text-[11px] text-muted-foreground uppercase font-mono">
              {isRTL ? "تم الرفع / مرحلة التصميم" : "Surveys Completed / In Design"}
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {surveySuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{surveySuccessMsg}</span>
          </div>
          <button
            onClick={() => setSurveySuccessMsg(null)}
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
            {isRTL
              ? `قائمة المشاريع المسندة للمهندس (${assignedProjects.length})`
              : `Assigned Projects Queue (${assignedProjects.length})`}
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            {isRTL ? "اضغط على أي مشروع لفتح الملف الهندسي والمعاينة" : "Select any project to inspect dossier and record site actions"}
          </span>
        </div>

        {assignedProjects.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-border bg-card/50 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Buildings className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-foreground">
              {isRTL ? "لا توجد مشاريع مسندة حالياً" : "No Projects Assigned"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {isRTL
                ? `لا توجد مشاريع مسندة حالياً للمهندس ${activeEngineer.name}. ستظهر المشاريع هنا فور تكليفها من مدير المشروع.`
                : `There are currently no active commissions assigned to ${activeEngineer.name}. New commissions will appear here once assigned by the Project Manager.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedProjects.map((project) => {
              const status = getStatusBadge(project.status);
              const isSelected = selectedProject?.id === project.id;

              return (
                <div
                  key={project.id}
                  onClick={() => {
                    setSelectedProject(project);
                    setIsRecordingSurvey(false);
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
                          {project.typology} · {project.areaM2} {isRTL ? "م²" : "m²"}
                        </span>
                      </div>
                      <h3 className="text-base font-serif font-normal text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                    </div>

                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border shrink-0",
                        status.className
                      )}
                    >
                      {status.label}
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
                        <span>
                          {isRTL ? "العميل:" : "Client:"}{" "}
                          <strong className="font-medium text-foreground">{project.clientName}</strong>
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {project.spaces?.length || 0} {isRTL ? "مساحات محددة" : "Spaces Defined"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {isRTL ? "الموعد المستهدف:" : "Milestone:"} {project.nextMilestoneDate}
                    </span>
                    <span className="text-primary font-medium inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>{isRTL ? "فتح الملف الهندسي" : "Open Project Dossier"}</span>
                      <ArrowIcon className="w-3 h-3" />
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
                    {selectedProject.code} · {isRTL ? "الملف المعماري والهندسي" : "ARCHITECTURAL DOSSIER"}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border",
                      getStatusBadge(selectedProject.status).className
                    )}
                  >
                    {getStatusBadge(selectedProject.status).label}
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
                  setIsRecordingSurvey(false);
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
                <span>{isRTL ? "بيانات العميل وممثل الاستلام" : "Client & Representation Information"}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">{isRTL ? "اسم العميل:" : "Primary Client:"}</span>
                  <span className="font-medium text-foreground">{selectedProject.clientName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">{isRTL ? "رقم الهاتف:" : "Phone Contact:"}</span>
                  <a
                    href={`tel:${selectedProject.clientPhone}`}
                    className="font-mono text-primary hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{selectedProject.clientPhone}</span>
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">{isRTL ? "موقع إقامة العميل:" : "Customer Location:"}</span>
                  <span className="text-foreground">
                    {selectedProject.customerLocation?.city
                      ? `${selectedProject.customerLocation.city}, ${selectedProject.customerLocation.country}`
                      : selectedProject.location}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">{isRTL ? "حالة التمثيل في مصر:" : "Representation in Egypt:"}</span>
                  <span className="font-medium text-foreground">
                    {selectedProject.representative?.representationType === "client_in_person"
                      ? isRTL ? "العميل موجود في مصر ويشرف بنفسه" : "Client in Egypt in person"
                      : selectedProject.representative?.representationType === "valentia_direct"
                      ? isRTL ? "إشراف ومتابعة فالنتيا المباشرة بالكامل" : "Valentia Direct Management"
                      : selectedProject.representative?.name
                      ? `${selectedProject.representative.name} (${selectedProject.representative.relationship || "مفوض"}) · ${selectedProject.representative.phone || ""}`
                      : isRTL ? "ممثل مفوض" : "Authorized Representative"}
                  </span>
                </div>
              </div>
            </div>

            {/* Property Information & Specifications */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted-foreground">
                <Buildings className="w-3.5 h-3.5 text-primary" />
                <span>{isRTL ? "مواصفات العقار" : "Property Specifications"}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">{isRTL ? "النوع:" : "Typology:"}</span>
                  <span className="font-mono font-medium text-foreground">{selectedProject.typology}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">{isRTL ? "المساحة:" : "Area:"}</span>
                  <span className="font-mono font-medium text-foreground">{selectedProject.areaM2} {isRTL ? "م²" : "m²"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">{isRTL ? "الكمبوند:" : "Compound:"}</span>
                  <span className="font-medium text-foreground">{selectedProject.compound || "Stand-alone"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">{isRTL ? "المدينة / المنطقة:" : "City / Region:"}</span>
                  <span className="font-medium text-foreground">{selectedProject.location}</span>
                </div>
              </div>

              {selectedProject.notes && (
                <div className="border-t border-border/60 pt-2 text-xs">
                  <span className="text-muted-foreground block text-[11px]">{isRTL ? "توجيهات وملاحظات العميل:" : "Intake Directives & Notes:"}</span>
                  <p className="text-foreground leading-relaxed mt-0.5 bg-background/50 p-2 rounded-lg border border-border/40 font-mono text-[11px]">
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
                  <span>{isRTL ? `نطاق المساحات المطلوب تصميمها (${selectedProject.spaces?.length || 0})` : `Configured Spaces Scope (${selectedProject.spaces?.length || 0})`}</span>
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
                          {isRTL ? `النوع: ${sp.type} · العدد: ${sp.quantity}` : `Type: ${sp.type.replace(/_/g, " ")} · Qty: ${sp.quantity}`}
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
                  {isRTL ? "لا توجد تفاصيل غرف محددة في المسودة." : "No discrete spaces itemized in draft dossier."}
                </div>
              )}
            </div>

            {/* Engineer Relevant Actions Only */}
            <div className="border-t border-border pt-4 space-y-4">
              <div className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-2">
                <NotePencil className="w-3.5 h-3.5 text-primary" />
                <span>{isRTL ? "إجراءات المعاينة الميدانية والرفع المساحي" : "Engineer Site Actions & Verification"}</span>
              </div>

              {!isRecordingSurvey ? (
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecordingSurvey(true);
                      setSurveyDate(new Date().toISOString().slice(0, 10));
                    }}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>{isRTL ? "تسجيل نتائج الرفع المساحي" : "Record Architectural Site Survey"}</span>
                  </button>

                  {selectedProject.status !== "SITE_VISIT_COMPLETED" && (
                    <button
                      type="button"
                      onClick={() => handleCompleteSurvey(selectedProject.id)}
                      className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground cursor-pointer transition-colors flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{isRTL ? "اعتماد اكتمال المعاينة" : "Mark Survey Completed"}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProject(null);
                      setIsRecordingSurvey(false);
                    }}
                    className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors ms-auto"
                  >
                    {isRTL ? "إغلاق الملف" : "Close Dossier"}
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-primary/40 bg-primary/5 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      {isRTL ? "تسجيل ملاحظات ونتائج الرفع المساحي" : "Log Site Survey Findings"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsRecordingSurvey(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {isRTL ? "إلغاء" : "Cancel"}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">
                        {isRTL ? "تاريخ الزيارة الميدانية:" : "Survey Date:"}
                      </label>
                      <input
                        type="date"
                        value={surveyDate}
                        onChange={(e) => setSurveyDate(e.target.value)}
                        className="w-full h-8 px-2.5 rounded border border-border bg-background text-xs text-foreground outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">
                        {isRTL ? "الملاحظات الإنشائية والمقاسات الفعلية:" : "Architectural & Structural Notes:"}
                      </label>
                      <textarea
                        rows={3}
                        value={surveyNotes}
                        onChange={(e) => setSurveyNotes(e.target.value)}
                        placeholder={
                          isRTL
                            ? "سجل ملاحظات المناسيب، زوايا اللياسة، مجاري التكييف والصحي، وأي تطابق مع الرسومات المعتمدة..."
                            : "Log structural dimensions, ceiling drops, MEP shafts, and wall straightness observations..."
                        }
                        className="w-full p-2 rounded border border-border bg-background text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRecordingSurvey(false)}
                      className="px-3 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {isRTL ? "تراجع" : "Dismiss"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCompleteSurvey(selectedProject.id)}
                      className="px-4 py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium cursor-pointer hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isRTL ? "حفظ واعتماد الرفع المساحي" : "Save & Complete Survey"}</span>
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
