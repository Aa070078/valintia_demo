"use client";

import * as React from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default function AdminPage() {
  return (
    <AuthGuard allowedRoles={["ADMINISTRATOR", "COMPANY_OWNER"]}>
      <DashboardShell activeRole="ADMINISTRATOR">
        <AdminDashboard />
      </DashboardShell>
    </AuthGuard>
  );
}
