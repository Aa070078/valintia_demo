"use client";

import * as React from "react";
import Link from "next/link";
import { Role } from "@/lib/types";
import {
  Buildings,
  UserGear,
  Compass,
  ShieldCheck,
  Crown,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  activeRole: Role;
  onRoleChange: (role: Role) => void;
}

export function DashboardShell({
  children,
  activeRole,
  onRoleChange,
}: DashboardShellProps) {

  const roleConfigs: Record<
    Role,
    { label: string; icon: React.ReactNode; badgeColor: string }
  > = {
    PROJECT_MANAGER: {
      label: "Project Manager",
      icon: <UserGear className="w-4 h-4" />,
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    },
    ENGINEER: {
      label: "Lead Architect & Field Engineer",
      icon: <Compass className="w-4 h-4" />,
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    },
    ADMINISTRATOR: {
      label: "System Administrator",
      icon: <ShieldCheck className="w-4 h-4" />,
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    },
    COMPANY_OWNER: {
      label: "Company Owner",
      icon: <Crown className="w-4 h-4" />,
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    },
    CUSTOMER: {
      label: "Customer Client",
      icon: <Buildings className="w-4 h-4" />,
      badgeColor: "bg-muted text-muted-foreground",
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Buildings className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-semibold tracking-widest uppercase text-foreground">
                VALENTIA
              </span>
              <span className="block text-[9px] font-mono tracking-wider text-muted-foreground uppercase">
                Operations &amp; Fit-Out Desk
              </span>
            </div>
          </Link>

          {/* Quick Role Switcher Pills */}
          <div className="hidden lg:flex items-center gap-1.5 ms-6 p-1 rounded-lg border border-border bg-muted/40">
            {(
              [
                "PROJECT_MANAGER",
                "ENGINEER",
                "ADMINISTRATOR",
                "COMPANY_OWNER",
              ] as Role[]
            ).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRoleChange(r)}
                className={cn(
                  "px-2.5 py-1 rounded text-[11px] font-mono uppercase transition-colors cursor-pointer flex items-center gap-1.5",
                  activeRole === r
                    ? "bg-background text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {roleConfigs[r].icon}
                <span>
                  {r === "PROJECT_MANAGER"
                    ? "PM Desk"
                    : r === "ENGINEER"
                    ? "Engineer"
                    : r === "ADMINISTRATOR"
                    ? "Admin"
                    : "Owner"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Role Indicator on Mobile */}
          <div className="lg:hidden">
            <select
              value={activeRole}
              onChange={(e) => onRoleChange(e.target.value as Role)}
              className="h-8 px-2 rounded border border-border bg-background text-xs font-mono"
            >
              <option value="PROJECT_MANAGER">PM Desk</option>
              <option value="ENGINEER">Engineer</option>
              <option value="ADMINISTRATOR">Admin</option>
              <option value="COMPANY_OWNER">Owner</option>
            </select>
          </div>

          {/* Customer Portal Link */}
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <span>Customer Web</span>
            <ArrowSquareOut className="w-3.5 h-3.5" />
          </a>

          {/* User Profile */}
          <div className="flex items-center gap-2 ps-2 border-s border-border">
            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-xs text-foreground font-mono">
              {activeRole === "PROJECT_MANAGER"
                ? "NH"
                : activeRole === "ENGINEER"
                ? "KS"
                : activeRole === "COMPANY_OWNER"
                ? "FM"
                : "SA"}
            </div>
            <div className="hidden sm:block text-start">
              <span className="block text-xs font-medium text-foreground leading-tight">
                {activeRole === "PROJECT_MANAGER"
                  ? "Nouran Hassan"
                  : activeRole === "ENGINEER"
                  ? "Eng. Karim El-Sayed"
                  : activeRole === "COMPANY_OWNER"
                  ? "Farid Al-Mansoor"
                  : "System Admin"}
              </span>
              <span className="block text-[10px] font-mono text-muted-foreground">
                {activeRole}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
