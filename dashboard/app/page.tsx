"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth, getDefaultPathForRole } from "@/components/auth/auth-context";
import { Buildings, Spinner } from "@phosphor-icons/react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function MasterDashboardIndex() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isRTL } = useLanguage();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.replace("/login");
      } else {
        const dest = getDefaultPathForRole(user.role);
        router.replace(dest);
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
        <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
          <Buildings className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <span className="block text-xs font-semibold tracking-widest uppercase text-foreground">
            VALENTIA
          </span>
          <span className="block text-[10px] font-mono tracking-wider text-muted-foreground uppercase">
            Operations &amp; Fit-Out Desk
          </span>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground font-mono">
          <Spinner className="w-4 h-4 animate-spin text-primary" />
          <span>
            {isRTL
              ? "جاري توجيهك إلى مساحة عملك المصرح بها..."
              : "Directing to your authorized workspace..."}
          </span>
        </div>
      </div>
    </div>
  );
}
