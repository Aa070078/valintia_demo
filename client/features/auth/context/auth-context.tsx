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

interface AuthContextValue {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  requiresPasswordChange: boolean;
  isLoading: boolean;
  login: (dto: ProposedLoginDto) => Promise<{ redirectUrl?: string }>;
  signup: (dto: ProposedSignupDto) => Promise<{ redirectUrl?: string }>;
  logout: () => Promise<void>;
  changePassword: (dto: ProposedChangePasswordDto) => Promise<boolean>;
  devSwitchRole: (role: UserRole) => Promise<{ redirectUrl?: string }>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001";

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

  const handleRoleRedirection = (role: UserRole): { redirectUrl?: string } => {
    if (role !== "CUSTOMER") {
      // Internal staff roles redirect to dashboard entry
      return { redirectUrl: DASHBOARD_URL };
    }
    return {};
  };

  const login = async (dto: ProposedLoginDto): Promise<{ redirectUrl?: string }> => {
    setIsLoading(true);
    try {
      const session = await authApi.login(dto);
      setUser(session.user);
      return handleRoleRedirection(session.user.role);
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

  const changePassword = async (dto: ProposedChangePasswordDto): Promise<boolean> => {
    setIsLoading(true);
    try {
      await authApi.changePassword(dto);
      if (user) {
        setUser({ ...user, requiresPasswordChange: false });
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
    requiresPasswordChange: Boolean(user?.requiresPasswordChange),
    isLoading,
    login,
    signup,
    logout,
    changePassword,
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
