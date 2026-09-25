"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EngineerDashboard } from "@/components/engineer/engineer-dashboard";

export default function EngineerPage() {
  return (
    <DashboardShell activeRole="ENGINEER" onRoleChange={() => {}}>
      <EngineerDashboard />
    </DashboardShell>
  );
}
