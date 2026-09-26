"use client";

import * as React from "react";
import { Role } from "@/lib/types";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PmDashboard } from "@/components/pm/pm-dashboard";
import { EngineerDashboard } from "@/components/engineer/engineer-dashboard";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default function MasterDashboardPage() {
  const [activeRole, setActiveRole] = React.useState<Role>("PROJECT_MANAGER");

  return (
    <DashboardShell activeRole={activeRole} onRoleChange={setActiveRole}>
      {activeRole === "PROJECT_MANAGER" && <PmDashboard />}
      {activeRole === "ENGINEER" && <EngineerDashboard />}
      {(activeRole === "ADMINISTRATOR" || activeRole === "COMPANY_OWNER") && (
        <AdminDashboard />
      )}
    </DashboardShell>
  );
}
