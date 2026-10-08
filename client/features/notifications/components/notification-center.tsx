"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, VideoCamera, Sparkle, Check } from "@phosphor-icons/react";
import { useNotifications, type AppNotification } from "../context/notification-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export function NotificationCenter() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { isRTL } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCardClick = (item: AppNotification) => {
    markAsRead(item.id);
    if (item.link) {
      setIsOpen(false);
      router.push(item.link);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-[#78716C] transition-all hover:text-[#1C1917] hover:border-foreground/30 active:scale-95 cursor-pointer",
          isOpen && "border-[#B88460] text-[#1C1917] bg-[#FAF7F2]"
        )}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B88460] px-1 text-[9px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "+9" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-3 w-80 sm:w-96 rounded-3xl border border-[#D8C8B4] bg-[#FAF7F2] p-4 shadow-2xl backdrop-blur-xl z-50 text-[#1C1917] animate-in fade-in zoom-in-95 duration-200",
            isRTL ? "left-0 sm:-left-12" : "right-0 sm:-right-12"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-bold text-[#1C1917]">
                {isRTL ? "مركز التنبيهات والإشعارات" : "Notifications Center"}
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#B88460]/15 text-[#B88460] text-[10px] font-mono font-bold">
                  {unreadCount} {isRTL ? "جديد" : "new"}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-[#503C2C] hover:text-[#B88460] transition-colors cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isRTL ? "تحديد الكل كمقروء" : "Mark all read"}</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#78716C]">
                {isRTL ? "لا توجد إشعارات جديدة حالياً" : "No notifications yet."}
              </div>
            ) : (
              notifications.map((item) => {
                const isReady = item.type === "engineer_ready";
                const isReview = item.type === "review_started";

                return (
                  <div
                    key={item.id}
                    onClick={() => handleCardClick(item)}
                    className={cn(
                      "p-3.5 rounded-2xl border transition-all text-xs flex flex-col gap-2.5 relative cursor-pointer group",
                      item.read
                        ? "bg-white/60 border-[#E8DEC8]/60 text-[#78716C] hover:bg-white hover:border-[#D8C8B4]"
                        : "bg-white border-[#B88460]/40 text-[#1C1917] shadow-2xs hover:border-[#B88460]"
                    )}
                  >
                    <div className="flex gap-3 items-start">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                          isReady
                            ? "bg-[#B88460] text-white"
                            : "bg-[#503C2C] text-[#FAF7F2]"
                        )}
                      >
                        {isReady ? (
                          <VideoCamera className="w-4 h-4" />
                        ) : (
                          <Sparkle className="w-4 h-4 text-[#B88460]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h5 className="font-bold text-xs font-serif truncate text-[#1C1917] group-hover:text-[#503C2C] transition-colors">
                            {isRTL ? item.titleAr : item.titleEn}
                          </h5>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-[#B88460] shrink-0" />
                          )}
                        </div>

                        <p className="text-[11px] leading-relaxed text-[#78716C] line-clamp-2">
                          {isRTL ? item.messageAr : item.messageEn}
                        </p>
                      </div>
                    </div>

                    {item.link && (
                      <div className="pt-2 border-t border-[#E8DEC8]/50 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(item);
                          }}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all active:scale-95 cursor-pointer shadow-xs",
                            isReady
                              ? "bg-[#1C1917] hover:bg-[#342D28] text-[#FAF7F2]"
                              : item.read
                              ? "bg-[#EFE7DC] hover:bg-[#E2D7C8] text-[#503C2C]"
                              : "bg-[#503C2C] hover:bg-[#3D2E22] text-[#FAF7F2]"
                          )}
                        >
                          <span>
                            {isReady
                              ? (isRTL ? "احجز ميعاد الاستشارة" : "Book Consultation Slot")
                              : isReview
                              ? (isRTL ? "متابعة حالة المراجعة" : "View Review Status")
                              : (isRTL ? "فتح واستعراض المشروع" : "Open Project")}
                          </span>
                          <span className={cn("text-[10px]", isRTL ? "rotate-180" : "")}>→</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
