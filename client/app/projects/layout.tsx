"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { Buildings, CircleNotch, Lock } from "@phosphor-icons/react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const { isRTL } = useLanguage();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectTarget = pathname || "/projects";
      router.replace(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#ECE3D5] text-[#1C1917] p-6">
        <div className="w-12 h-12 rounded-full bg-[#1C1917] text-[#FAF7F2] flex items-center justify-center mb-4 shadow-lg animate-pulse">
          <Buildings className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#503C2C]">
          <CircleNotch className="w-3.5 h-3.5 animate-spin" />
          <span>{isRTL ? "جارٍ التحقق من صلاحيات الأتيليه..." : "Verifying Atelier Credentials..."}</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#ECE3D5] text-[#1C1917] p-6">
        <div className="w-12 h-12 rounded-full bg-[#DFD3C1] text-[#503C2C] flex items-center justify-center mb-4 shadow-md">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-2xl font-normal mb-2">
          {isRTL ? "تسجيل الدخول مطلوب" : "Atelier Authentication Required"}
        </h2>
        <p className="text-xs text-[#6B635B] mb-4">
          {isRTL
            ? "لا يمكن الوصول إلى مشاريع ومواصفات الأتيليه دون تسجيل الدخول. جارٍ توجيهك لبوابة الدخول..."
            : "You must be signed in to access atelier project specifications. Redirecting to login..."}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
