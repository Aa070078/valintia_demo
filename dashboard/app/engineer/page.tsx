"use client";

import * as React from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EngineerDashboard } from "@/components/engineer/engineer-dashboard";

export default function EngineerPage() {
  return (
    <AuthGuard allowedRoles={["ENGINEER"]}>
      <DashboardShell activeRole="ENGINEER">
        <EngineerDashboard />
      </DashboardShell>
    </AuthGuard>
  );
}
