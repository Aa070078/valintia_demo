"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { AuthProvider, useAuth } from "@/features/auth/context/auth-context";
import { FirstLoginPasswordModal } from "@/features/auth/components/first-login-password-modal";

import { NotificationProvider } from "@/features/notifications/context/notification-context";
import { NotificationToast } from "@/features/notifications/components/notification-toast";

function FirstLoginGlobalModal() {
  const { requiresPasswordChange, isAuthenticated, onboardingSession } = useAuth();
  return <FirstLoginPasswordModal open={requiresPasswordChange && isAuthenticated && !onboardingSession} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <NotificationProvider>
              <TooltipProvider>
                {children}
                <FirstLoginGlobalModal />
                <NotificationToast />
              </TooltipProvider>
            </NotificationProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
