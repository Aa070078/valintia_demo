"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PmDashboard } from "@/components/pm/pm-dashboard";

export default function PmPage() {
  return (
    <DashboardShell activeRole="PROJECT_MANAGER" onRoleChange={() => {}}>
      <PmDashboard />
    </DashboardShell>
  );
}
