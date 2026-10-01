export interface StatusResolution {
  key: string;
  label: string;
  percentage: number;
  stageLabel: string;
  nextStepLabel: string;
  badgeClass: string;
  progressColorClass: string;
}

export function getProjectStatusInfo(
  rawStatus: string | undefined | null,
  isRTL: boolean = true
): StatusResolution {
  const normalized = (rawStatus || "draft").toLowerCase().trim();

  switch (normalized) {
    case "draft":
      return {
        key: "draft",
        label: isRTL ? "مسودة غير مكتملة" : "Draft Proposal",
        percentage: 15,
        stageLabel: isRTL ? "تحديد المواصفات" : "Specification Funnel",
        nextStepLabel: isRTL
          ? "استكمال إدخال مواصفات وتأكيد الطلب"
          : "Complete specifications and confirm commission",
        badgeClass: "bg-stone-100 text-stone-700 border-stone-300",
        progressColorClass: "bg-stone-400",
      };

    case "submitted":
      return {
        key: "submitted",
        label: isRTL ? "تم التأكيد • بانتظار مراجعة Valentia" : "Submitted — Pending Review",
        percentage: 25,
        stageLabel: isRTL ? "مراجعة كراسة المواصفات" : "Atelier Review",
        nextStepLabel: isRTL
          ? "مراجعة المخططات من فريق المهندسين وتنسيق موعد المعاينة"
          : "Engineering review & site survey scheduling",
        badgeClass: "bg-[#503C2C] text-[#FAF7F2] border-[#503C2C] shadow-xs",
        progressColorClass: "bg-[#503C2C]",
      };

    case "initial_review":
    case "under_engineer_review":
    case "under_review":
    case "in_review":
      return {
        key: "under_engineer_review",
        label: isRTL ? "تحت المراجعة الهندسية" : "Under Architectural Review",
        percentage: 35,
        stageLabel: isRTL ? "دراسة الجدوى الإنشائية" : "Feasibility & Architecture",
        nextStepLabel: isRTL
          ? "تجهيز فريق الرفع المعماري للموقع"
          : "Dispatching site measurement & survey team",
        badgeClass: "bg-[#B88460] text-white border-[#B88460] shadow-xs",
        progressColorClass: "bg-[#B88460]",
      };

    case "site_visit_scheduled":
    case "site_survey":
    case "meeting_scheduled":
      return {
        key: "site_visit_scheduled",
        label: isRTL ? "تحديد موعد المعاينة والرفع" : "Site Survey Scheduled",
        percentage: 45,
        stageLabel: isRTL ? "المعاينة الميدانية" : "Field Survey",
        nextStepLabel: isRTL
          ? "حضور مهندس الموقع للرفع المعماري الشامل بالليزر"
          : "Site engineer attendance for architectural measurement",
        badgeClass: "bg-amber-600 text-white border-amber-600 shadow-xs",
        progressColorClass: "bg-amber-600",
      };

    case "site_visit_paid":
      return {
        key: "site_visit_paid",
        label: isRTL ? "تم سداد رسوم المعاينة" : "Survey Fee Cleared",
        percentage: 50,
        stageLabel: isRTL ? "إعداد التقرير المساحي" : "Survey Reporting",
        nextStepLabel: isRTL
          ? "إصدار تقرير المطابقة المعمارية ورفع الأوتوكاد"
          : "Generating as-built CAD drawings & report",
        badgeClass: "bg-amber-700 text-white border-amber-700 shadow-xs",
        progressColorClass: "bg-amber-700",
      };

    case "concept_selected":
    case "drawing_uploaded":
    case "design_in_progress":
      return {
        key: "design_in_progress",
        label: isRTL ? "شغالين في التصميم الـ 3D" : "3D Design & Modeling",
        percentage: 65,
        stageLabel: isRTL ? "التصميم المعماري ثلاثي الأبعاد" : "3D Spatial Design",
        nextStepLabel: isRTL
          ? "إعداد المخططات التنفيذية واعتماد عينات الخامات"
          : "Detailing execution blueprints & material boards",
        badgeClass: "bg-emerald-700 text-white border-emerald-700 shadow-xs",
        progressColorClass: "bg-emerald-700",
      };

    case "design_delivered":
      return {
        key: "design_delivered",
        label: isRTL ? "تم تسليم التصميم والمخططات" : "Design Delivered",
        percentage: 75,
        stageLabel: isRTL ? "اعتماد المخططات" : "Blueprint Sign-off",
        nextStepLabel: isRTL
          ? "مراجعة العميل النهائية لرسومات الفراغات"
          : "Client final approval of 3D spatial renders",
        badgeClass: "bg-teal-700 text-white border-teal-700 shadow-xs",
        progressColorClass: "bg-teal-700",
      };

    case "boq_confirmed":
      return {
        key: "boq_confirmed",
        label: isRTL ? "تم اعتماد المقايسة (BOQ)" : "BOQ Contract Approved",
        percentage: 85,
        stageLabel: isRTL ? "توقيع العقود والمواصفات" : "Contract & Mobilization",
        nextStepLabel: isRTL
          ? "بدء توريد الخامات والتجهيزات الميدانية بالموقع"
          : "Procuring approved materials & site mobilization",
        badgeClass: "bg-[#1C1917] text-[#FAF7F2] border-[#1C1917] shadow-xs",
        progressColorClass: "bg-[#1C1917]",
      };

    case "execution":
    case "in_execution":
      return {
        key: "execution",
        label: isRTL ? "قيد التنفيذ والتشطيب بالموقع" : "Turnkey Execution",
        percentage: 92,
        stageLabel: isRTL ? "الأعمال الإنشائية والتشطيبات" : "Active Construction",
        nextStepLabel: isRTL
          ? "متابعة تقارير الإشراف الأسبوعية حتى الاستلام"
          : "Weekly engineer logs & telemetry until handover",
        badgeClass: "bg-blue-800 text-white border-blue-800 shadow-xs",
        progressColorClass: "bg-blue-700",
      };

    case "completed":
      return {
        key: "completed",
        label: isRTL ? "جاهز للاستلام على المفتاح" : "Turnkey Handover Completed",
        percentage: 100,
        stageLabel: isRTL ? "تم التسليم بنجاح" : "Project Completed",
        nextStepLabel: isRTL
          ? "تسليم المفاتيح وشهادات الضمان الفني"
          : "Handover inspection & long-term warranty active",
        badgeClass: "bg-emerald-800 text-white border-emerald-800 shadow-xs",
        progressColorClass: "bg-emerald-600",
      };

    default:
      return {
        key: normalized,
        label: isRTL
          ? normalized.replace(/[_-]/g, " ")
          : normalized.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        percentage: 30,
        stageLabel: isRTL ? "قيد المعالجة" : "In Progress",
        nextStepLabel: isRTL
          ? "بانتظار تحديث الإجراء التالي من المهندس المسؤول"
          : "Awaiting next milestone from atelier engineer",
        badgeClass: "bg-[#503C2C] text-[#FAF7F2] border-[#503C2C]",
        progressColorClass: "bg-[#503C2C]",
      };
  }
}
