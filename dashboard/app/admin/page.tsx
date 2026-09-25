"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default function AdminPage() {
  return (
    <DashboardShell activeRole="ADMINISTRATOR" onRoleChange={() => {}}>
      <AdminDashboard />
    </DashboardShell>
  );
}
