"use client";

import * as React from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PmDashboard } from "@/components/pm/pm-dashboard";

export default function PmPage() {
  return (
    <AuthGuard allowedRoles={["PROJECT_MANAGER"]}>
      <DashboardShell activeRole="PROJECT_MANAGER">
        <PmDashboard />
      </DashboardShell>
    </AuthGuard>
  );
}
