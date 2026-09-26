"use client";

import * as React from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { PmDashboard } from "@/features/dashboard/components/pm-dashboard";
import { EngineerDashboard } from "@/features/dashboard/components/engineer-dashboard";
import { AdminDashboard } from "@/features/dashboard/components/admin-dashboard";

export default function DashboardIndexPage() {
  const { role } = useAuth();

  if (role === "ENGINEER") {
    return <EngineerDashboard />;
  }

  if (role === "ADMINISTRATOR" || role === "COMPANY_OWNER") {
    return <AdminDashboard />;
  }

  // Default to PM Dashboard
  return <PmDashboard />;
}
