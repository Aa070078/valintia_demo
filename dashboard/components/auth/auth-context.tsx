"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Role, User } from "@/lib/types";
import { authApi, LoginCredentials } from "@/lib/auth-api";
import { getAccessToken, setAccessToken, clearAccessToken } from "@/lib/auth-storage";

export function getDefaultPathForRole(role: Role): string {
  switch (role) {
    case "ENGINEER":
      return "/engineer";
    case "PROJECT_MANAGER":
      return "/pm";
    case "ADMINISTRATOR":
    case "COMPANY_OWNER":
      return "/admin";
    default:
      return "/login";
  }
}

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ user: User; redirectUrl: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const router = useRouter();

  const refreshUser = React.useCallback(async () => {
    try {
      const current = await authApi.getCurrentUser();
      setUser(current);
    } catch {
      setUser(null);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    async function loadInitialSession() {
      try {
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          const tokenParam = urlParams.get("token");
          if (tokenParam) {
            setAccessToken(tokenParam);
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }

        const token = getAccessToken();
        if (!token) {
          if (isMounted) setUser(null);
          return;
        }
        const current = await authApi.getCurrentUser();
        if (isMounted) setUser(current);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadInitialSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      if (!res.accessToken) {
        throw new Error(
          res.message || "Login failed: No access token received from server"
        );
      }

      setAccessToken(res.accessToken);

      const currentUser = await authApi.getCurrentUser();
      if (!currentUser) {
        throw new Error("Unable to retrieve user credentials after authentication");
      }

      setUser(currentUser);
      const redirectUrl = getDefaultPathForRole(currentUser.role);
      return { user: currentUser, redirectUrl };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = React.useCallback(() => {
    clearAccessToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
