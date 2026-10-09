import { apiClient } from "@/lib/api/client"
import { tokenStorage } from "@/lib/auth/token-storage"
import { onboardingStorage } from "@/lib/auth/onboarding-storage"
import type {
  User,
  UserRole,
  AuthSession,
  ProposedLoginDto,
  ProposedSignupDto,
  ProposedChangePasswordDto,
  ChangePasswordResponse,
  OnboardingEmailRequestResponse,
  OnboardingEmailVerifyResponse,
} from "../types"

const USER_SESSION_KEY = "valentia_current_user"

function getLocalUser(): User | null {
  if (typeof window === "undefined") return null
  const stored =
    sessionStorage.getItem(USER_SESSION_KEY) ||
    localStorage.getItem(USER_SESSION_KEY)
  if (!stored) return null
  try {
    const parsed = JSON.parse(stored)
    if (parsed && !parsed.name) {
      parsed.name = parsed.username
        ? parsed.username.split("@")[0]
        : parsed.email
          ? parsed.email.split("@")[0]
          : "Client"
    }
    return parsed
  } catch {
    return null
  }
}

function saveLocalUser(user: User | null, persistent: boolean = true) {
  if (typeof window === "undefined") return
  if (!user) {
    sessionStorage.removeItem(USER_SESSION_KEY)
    localStorage.removeItem(USER_SESSION_KEY)
  } else {
    const raw = JSON.stringify(user)
    sessionStorage.setItem(USER_SESSION_KEY, raw)
    if (persistent) {
      localStorage.setItem(USER_SESSION_KEY, raw)
    }
  }
}

interface BackendUser {
  id: number | string
  username: string
  role: UserRole
  mustChangePassword?: boolean
  email?: string
  emailVerified?: boolean
  name?: string
  onboardingRequired?: boolean
}

interface BackendAuthResponse {
  accessToken?: string
  onboardingToken?: string
  onboardingRequired?: boolean
  user: BackendUser
}

function mapBackendUser(backendUser: BackendUser): User {
  const emailCandidate = backendUser.email || ""
  const nameCandidate =
    backendUser.name ||
    (backendUser.username
      ? backendUser.username.split("@")[0]
      : emailCandidate
        ? emailCandidate.split("@")[0]
        : "Client")

  return {
    id: backendUser.id,
    username: backendUser.username,
    name: nameCandidate,
    email: emailCandidate || undefined,
    emailVerified: Boolean(backendUser.emailVerified),
    role: backendUser.role,
    mustChangePassword: Boolean(backendUser.mustChangePassword),
    requiresPasswordChange: Boolean(backendUser.mustChangePassword),
    onboardingRequired: Boolean(backendUser.onboardingRequired),
  }
}

export const authApi = {
  /**
   * Endpoint: POST /auth/login
   * Returns JWT token and authenticated user payload.
   */
  async login(dto: ProposedLoginDto): Promise<AuthSession> {
    const emailCandidate = (dto.email || dto.username || "").trim()
    const loginPayload = {
      email: emailCandidate,
      password: dto.password,
    }

    try {
      const response = await apiClient.post<BackendAuthResponse>(
        "/auth/login",
        loginPayload
      )
      const backendUser = response.data.user
      const user = mapBackendUser(backendUser)
      const token = response.data.accessToken || ""
      if (response.data.onboardingToken) {
        tokenStorage.removeToken()
        onboardingStorage.setToken(response.data.onboardingToken)
      } else if (token) {
        onboardingStorage.removeToken()
        tokenStorage.setToken(token)
      } else {
        throw new Error("Sign-in did not return a session. Please try again.")
      }
      saveLocalUser(user, dto.rememberMe !== false)
      return {
        token,
        user,
        onboardingToken: response.data.onboardingToken,
        onboardingRequired: response.data.onboardingRequired,
      }
    } catch (error) {
      throw error
    }
  },

  /**
   * Endpoint: POST /auth/register followed by real login
   */
  async requestRegistrationCode(email: string) {
    const { data } = await apiClient.post<OnboardingEmailRequestResponse>(
      "/otp/send",
      {
        email: email.trim().toLowerCase(),
        purpose: "EMAIL_VERIFICATION",
      }
    )
    return data
  },

  async verifyRegistrationCode(email: string, otp: string): Promise<string> {
    const { data } = await apiClient.post<{ verificationToken: string }>(
      "/otp/verify",
      {
        email: email.trim().toLowerCase(),
        otp,
        purpose: "EMAIL_VERIFICATION",
      }
    )
    if (!data.verificationToken)
      throw new Error(
        "Email verification could not be completed. Request a new code."
      )
    return data.verificationToken
  },

  async signup(dto: ProposedSignupDto): Promise<AuthSession> {
    const email = dto.username.trim().toLowerCase()
    await apiClient.post("/auth/register", {
      username: email,
      password: dto.password,
      verificationToken: dto.verificationToken,
      ...(dto.name?.trim()
        ? { firstName: dto.name.trim().split(/\s+/)[0].slice(0, 80) }
        : {}),
    })
    try {
      return await authApi.login({
        email,
        password: dto.password,
        rememberMe: true,
      })
    } catch {
      throw new Error(
        "Your account was created. Please sign in with your email and password."
      )
    }
  },

  async requestPasswordReset(email: string) {
    const { data } = await apiClient.post("/auth/forgot-password", {
      email: email.trim().toLowerCase(),
    })
    return data
  },

  async verifyPasswordReset(email: string, otp: string): Promise<string> {
    const { data } = await apiClient.post<{ passwordResetToken: string }>(
      "/otp/verify",
      {
        email: email.trim().toLowerCase(),
        otp,
        purpose: "PASSWORD_RESET",
      }
    )
    if (!data.passwordResetToken)
      throw new Error(
        "Password reset could not be verified. Request a new code."
      )
    return data.passwordResetToken
  },

  async resetPassword(passwordResetToken: string, newPassword: string) {
    await apiClient.post("/auth/reset-password", {
      passwordResetToken,
      newPassword,
    })
  },

  /**
   * Endpoint: GET /auth/me
   */
  async getCurrentUser(): Promise<User | null> {
    const token = tokenStorage.getToken() || onboardingStorage.getToken()
    if (!token) return null

    try {
      const response = await apiClient.get<BackendUser>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const user = mapBackendUser(response.data)
      saveLocalUser(user)
      return user
    } catch {
      tokenStorage.removeToken()
      onboardingStorage.removeToken()
      saveLocalUser(null)
      return null
    }
  },

  /**
   * Endpoint: POST /auth/onboarding/email/request
   * Request OTP code to verify permanent email during staff onboarding.
   */
  async requestOnboardingEmail(params: {
    email: string
    onboardingToken?: string
  }): Promise<OnboardingEmailRequestResponse> {
    const headers = params.onboardingToken
      ? { Authorization: `Bearer ${params.onboardingToken}` }
      : undefined

    try {
      const response = await apiClient.post<OnboardingEmailRequestResponse>(
        "/auth/onboarding/email/request",
        { email: params.email },
        { headers }
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Endpoint: POST /auth/onboarding/email/verify
   * Verify the 6-digit OTP code for the permanent email.
   */
  async verifyOnboardingEmail(params: {
    email: string
    otp: string
    onboardingToken?: string
  }): Promise<OnboardingEmailVerifyResponse> {
    const headers = params.onboardingToken
      ? { Authorization: `Bearer ${params.onboardingToken}` }
      : undefined

    try {
      const response = await apiClient.post<OnboardingEmailVerifyResponse>(
        "/auth/onboarding/email/verify",
        { email: params.email, otp: params.otp },
        { headers }
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Endpoint: POST /auth/change-password
   * Clears mustChangePassword and sets the user's permanent password.
   */
  async changePassword(
    dto: ProposedChangePasswordDto & { onboardingToken?: string }
  ): Promise<ChangePasswordResponse> {
    const headers = dto.onboardingToken
      ? { Authorization: `Bearer ${dto.onboardingToken}` }
      : undefined

    try {
      const response = await apiClient.post<ChangePasswordResponse>(
        "/auth/change-password",
        { newPassword: dto.newPassword },
        { headers }
      )
      const currentUser = getLocalUser()
      if (currentUser) {
        saveLocalUser({
          ...currentUser,
          mustChangePassword: false,
          requiresPasswordChange: false,
          isFirstLogin: false,
          onboardingRequired: response.data.onboardingComplete === false,
        })
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Logout helper
   */
  async logout(): Promise<void> {
    onboardingStorage.removeToken()
    tokenStorage.removeToken()
    saveLocalUser(null)
  },
}
