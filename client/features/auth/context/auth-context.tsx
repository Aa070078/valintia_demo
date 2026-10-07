"use client"

import * as React from "react"
import type {
  User,
  UserRole,
  ProposedLoginDto,
  ProposedSignupDto,
  ProposedChangePasswordDto,
} from "../types"
import { authApi } from "../api/auth.api"
import { onboardingStorage } from "@/lib/auth/onboarding-storage"
import { workspaceDestination } from "@/lib/auth/destinations"

export interface LoginResult {
  redirectUrl?: string
  onboardingRequired?: boolean
  onboardingToken?: string
  user?: User
}

interface AuthContextValue {
  onboardingSession: { token: string; user: User } | null
  user: User | null
  role: UserRole
  isAuthenticated: boolean
  mustChangePassword: boolean
  requiresPasswordChange: boolean
  isLoading: boolean
  login: (dto: ProposedLoginDto) => Promise<LoginResult>
  signup: (dto: ProposedSignupDto) => Promise<{ redirectUrl?: string }>
  logout: () => Promise<void>
  changePassword: (
    dto: ProposedChangePasswordDto & { onboardingToken?: string }
  ) => Promise<boolean>
  refreshCurrentUser: () => Promise<User | null>
  devSwitchRole: (role: UserRole) => Promise<{ redirectUrl?: string }>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [onboardingSession, setOnboardingSession] = React.useState<{
    token: string
    user: User
  } | null>(null)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)

  React.useEffect(() => {
    async function initAuth() {
      try {
        const current = await authApi.getCurrentUser()
        setUser(current)
        const token = onboardingStorage.getToken()
        if (current?.onboardingRequired && token)
          setOnboardingSession({ token, user: current })
      } catch (err) {
        console.warn("Failed to restore auth session:", err)
      } finally {
        setIsLoading(false)
      }
    }
    initAuth()
  }, [])

  const handleRoleRedirection = (role: UserRole, token?: string) => ({
    redirectUrl: workspaceDestination(role, token),
  })

  const refreshCurrentUser = async (): Promise<User | null> => {
    try {
      const current = await authApi.getCurrentUser()
      setUser(current)
      return current
    } catch {
      return null
    }
  }

  const login = async (dto: ProposedLoginDto): Promise<LoginResult> => {
    setIsLoading(true)
    try {
      const session = await authApi.login(dto)
      setUser(session.user)
      if (session.onboardingRequired || session.user.onboardingRequired) {
        if (!session.onboardingToken)
          throw new Error(
            "Onboarding session is unavailable. Please sign in again."
          )
        setOnboardingSession({
          token: session.onboardingToken,
          user: session.user,
        })
        return {
          onboardingRequired: true,
          onboardingToken: session.onboardingToken || session.token,
          user: session.user,
        }
      }
      setOnboardingSession(null)
      return handleRoleRedirection(session.user.role, session.token)
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (
    dto: ProposedSignupDto
  ): Promise<{ redirectUrl?: string }> => {
    setIsLoading(true)
    try {
      const session = await authApi.signup(dto)
      setUser(session.user)
      return handleRoleRedirection(session.user.role)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
    setOnboardingSession(null)
  }

  const changePassword = async (
    dto: ProposedChangePasswordDto & { onboardingToken?: string }
  ): Promise<boolean> => {
    setIsLoading(true)
    try {
      const result = await authApi.changePassword({
        ...dto,
        onboardingToken: dto.onboardingToken || onboardingSession?.token,
      })
      if (user) {
        setUser({
          ...user,
          mustChangePassword: false,
          requiresPasswordChange: false,
          isFirstLogin: false,
          onboardingRequired: result.onboardingComplete === false,
        })
      }
      return true
    } finally {
      setIsLoading(false)
    }
  }

  const devSwitchRole = async (
    role: UserRole
  ): Promise<{ redirectUrl?: string }> => {
    setIsLoading(true)
    try {
      const switchedUser = await authApi.switchRoleDev(role)
      setUser(switchedUser)
      return handleRoleRedirection(switchedUser.role)
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextValue = {
    onboardingSession,
    user,
    role: user?.role || "CUSTOMER",
    isAuthenticated: Boolean(user && !user.onboardingRequired),
    mustChangePassword: Boolean(
      user?.mustChangePassword || user?.requiresPasswordChange
    ),
    requiresPasswordChange: Boolean(
      user?.requiresPasswordChange || user?.mustChangePassword
    ),
    isLoading,
    login,
    signup,
    logout,
    changePassword,
    refreshCurrentUser,
    devSwitchRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
