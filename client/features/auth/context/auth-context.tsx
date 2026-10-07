"use client";

import * as React from "react";
import type {
  User,
  UserRole,
  ProposedLoginDto,
  ProposedSignupDto,
  ProposedChangePasswordDto,
} from "../types";
import { authApi } from "../api/auth.api";

export interface LoginResult {
  redirectUrl?: string;
  onboardingRequired?: boolean;
  onboardingToken?: string;
  user?: User;
}

interface AuthContextValue {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  requiresPasswordChange: boolean;
  isLoading: boolean;
  login: (dto: ProposedLoginDto) => Promise<LoginResult>;
  signup: (dto: ProposedSignupDto) => Promise<{ redirectUrl?: string }>;
  logout: () => Promise<void>;
  changePassword: (dto: ProposedChangePasswordDto & { onboardingToken?: string }) => Promise<boolean>;
  refreshCurrentUser: () => Promise<User | null>;
  devSwitchRole: (role: UserRole) => Promise<{ redirectUrl?: string }>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    async function initAuth() {
      try {
        const current = await authApi.getCurrentUser();
        setUser(current);
      } catch (err) {
        console.warn("Failed to restore auth session:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const handleRoleRedirection = (role: UserRole, token?: string): { redirectUrl?: string } => {
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
    const dashboardBase =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : "";

    if (role === "PROJECT_MANAGER") {
      return { redirectUrl: `${dashboardBase}/pm${tokenQuery}` };
    }
    if (role === "ENGINEER") {
      return { redirectUrl: `${dashboardBase}/engineer${tokenQuery}` };
    }
    if (role === "COMPANY_OWNER" || role === "ADMINISTRATOR" || role === "ADMIN") {
      return { redirectUrl: `${dashboardBase}/admin${tokenQuery}` };
    }
    return { redirectUrl: "/projects" };
  };

  const refreshCurrentUser = async (): Promise<User | null> => {
    try {
      const current = await authApi.getCurrentUser();
      setUser(current);
      return current;
    } catch {
      return null;
    }
  };

  const login = async (dto: ProposedLoginDto): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const session = await authApi.login(dto);
      setUser(session.user);
      if (session.onboardingRequired || session.user.onboardingRequired) {
        return {
          onboardingRequired: true,
          onboardingToken: session.onboardingToken || session.token,
          user: session.user,
        };
      }
      return handleRoleRedirection(session.user.role, session.token);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (dto: ProposedSignupDto): Promise<{ redirectUrl?: string }> => {
    setIsLoading(true);
    try {
      const session = await authApi.signup(dto);
      setUser(session.user);
      return handleRoleRedirection(session.user.role);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const changePassword = async (
    dto: ProposedChangePasswordDto & { onboardingToken?: string }
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      await authApi.changePassword(dto);
      if (user) {
        setUser({
          ...user,
          mustChangePassword: false,
          requiresPasswordChange: false,
          isFirstLogin: false,
          onboardingRequired: false,
        });
      }
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const devSwitchRole = async (role: UserRole): Promise<{ redirectUrl?: string }> => {
    setIsLoading(true);
    try {
      const switchedUser = await authApi.switchRoleDev(role);
      setUser(switchedUser);
      return handleRoleRedirection(switchedUser.role);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    role: user?.role || "CUSTOMER",
    isAuthenticated: Boolean(user),
    mustChangePassword: Boolean(user?.mustChangePassword || user?.requiresPasswordChange),
    requiresPasswordChange: Boolean(user?.requiresPasswordChange || user?.mustChangePassword),
    isLoading,
    login,
    signup,
    logout,
    changePassword,
    refreshCurrentUser,
    devSwitchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
