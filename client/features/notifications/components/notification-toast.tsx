"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkle, CheckCircle, VideoCamera, X, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useNotifications } from "../context/notification-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export function NotificationToast() {
  const { activeToast, dismissToast } = useNotifications();
  const { isRTL } = useLanguage();

  if (!activeToast) return null;

  const isReady = activeToast.type === "engineer_ready";

  return (
    <aside
      aria-label="Notification alert"
      className={cn(
        "fixed bottom-6 z-50 max-w-md w-[calc(100%-2rem)] transition-all animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto",
        isRTL ? "left-6" : "right-6"
      )}
    >
      <div
        className={cn(
          "p-4 sm:p-5 rounded-2xl border shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col gap-3",
          isReady
            ? "bg-[#FAF7F2] border-[#B88460]/60 text-[#1C1917]"
            : "bg-[#503C2C] border-[#B88460]/40 text-[#FAF7F2]"
        )}
      >
        {/* Glow */}
        <div
          className={cn(
            "absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none",
            isReady ? "bg-[#B88460]/20" : "bg-[#B88460]/30"
          )}
        />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
                isReady
                  ? "bg-[#B88460] text-white"
                  : "bg-white/10 text-[#FAF7F2]"
              )}
            >
              {isReady ? (
                <VideoCamera className="w-4 h-4" />
              ) : (
                <Sparkle className="w-4 h-4 text-[#B88460]" />
              )}
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#B88460] font-bold">
                {isRTL ? "تحديث جديد في مشروعك" : "Project Update"}
              </div>
              <h4 className="text-xs sm:text-sm font-bold font-serif leading-tight mt-0.5">
                {isRTL ? activeToast.titleAr : activeToast.titleEn}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={dismissToast}
            className="p-1 rounded-lg hover:bg-black/5 text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs leading-relaxed text-[#78716C]">
          {isRTL ? activeToast.messageAr : activeToast.messageEn}
        </p>

        {activeToast.link && (
          <div className="pt-2 border-t border-black/5 flex items-center justify-end">
            <Link
              href={activeToast.link}
              onClick={dismissToast}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer",
                isReady
                  ? "bg-[#503C2C] text-[#FAF7F2] hover:bg-[#3D2E22]"
                  : "bg-[#B88460] text-white hover:bg-[#A37250]"
              )}
            >
              <span>
                {isReady
                  ? (isRTL ? "احجز ميعاد الاستشارة الآن" : "Book Meeting Now")
                  : activeToast.type === "review_started"
                  ? (isRTL ? "متابعة المراجعة الهندسية" : "View Review Status")
                  : (isRTL ? "استعراض التفاصيل" : "View Details")}
              </span>
              {isRTL ? (
                <ArrowLeft className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
