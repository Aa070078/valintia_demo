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
  CreateStaffDto,
  OnboardingEmailRequestResponse,
  OnboardingEmailVerifyResponse,
  SendOtpResponse,
  VerifyOtpResponse,
  ResetPasswordDto,
} from "../types"

/**
 * Pre-configured atelier team and client seed accounts.
 */
export const DEMO_PERSONAS: Record<UserRole, User> = {
  CUSTOMER: {
    id: 1,
    username: "tarek.mansour@example.com",
    email: "tarek.mansour@example.com",
    name: "Tarek Mansour",
    role: "CUSTOMER",
    phone: "+971 50 123 4567",
    mustChangePassword: false,
    requiresPasswordChange: false,
  },
  ENGINEER: {
    id: 2,
    username: "karim.elsayed@valentia.com",
    email: "karim.elsayed@valentia.com",
    name: "Eng. Karim El-Sayed",
    role: "ENGINEER",
    phone: "+20 100 555 1234",
    mustChangePassword: false,
    requiresPasswordChange: false,
    activeProjectsCount: 4,
  },
  PROJECT_MANAGER: {
    id: 3,
    username: "nouran.hassan@valentia.com",
    email: "nouran.hassan@valentia.com",
    name: "Nouran Hassan",
    role: "PROJECT_MANAGER",
    phone: "+20 111 888 4321",
    mustChangePassword: false,
    requiresPasswordChange: false,
    activeProjectsCount: 8,
  },
  COMPANY_OWNER: {
    id: 4,
    username: "owner@valentia.com",
    email: "owner@valentia.com",
    name: "Farid Al-Mansoor",
    role: "COMPANY_OWNER",
    phone: "+20 102 333 7777",
    mustChangePassword: false,
    requiresPasswordChange: false,
  },
  ADMINISTRATOR: {
    id: 5,
    username: "admin@valentia.com",
    email: "admin@valentia.com",
    name: "System Administrator",
    role: "ADMINISTRATOR",
    phone: "+20 122 000 9999",
    mustChangePassword: false,
    requiresPasswordChange: false,
  },
  ADMIN: {
    id: 5,
    username: "admin@valentia.com",
    email: "admin@valentia.com",
    name: "System Administrator",
    role: "ADMINISTRATOR",
    phone: "+20 122 000 9999",
    mustChangePassword: false,
    requiresPasswordChange: false,
  },
}

/**
 * Pre-configured engineer account with mandatory first-login password update.
 */
export const DEMO_FIRST_LOGIN_STAFF: User = {
  id: 301,
  username: "tarek.ramzy@valentia.com",
  email: "tarek.ramzy@valentia.com",
  name: "م. طارق رمزي",
  role: "ENGINEER",
  phone: "+20 109 444 3322",
  mustChangePassword: true,
  requiresPasswordChange: true,
  isFirstLogin: true,
  activeProjectsCount: 2,
}

const USER_SESSION_KEY = "valentia_current_user"
const CUSTOM_STAFF_STORAGE_KEY = "valentia_custom_staff_users"

export interface StoredStaffAccount {
  user: User
  temporaryPassword?: string
  password?: string
}

function getStoredStaffList(): StoredStaffAccount[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(CUSTOM_STAFF_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveStoredStaffList(list: StoredStaffAccount[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CUSTOM_STAFF_STORAGE_KEY, JSON.stringify(list))
  } catch (err) {
    console.warn("Failed to persist custom staff list:", err)
  }
}

function getLocalUser(): User | null {
  if (typeof window === "undefined") return DEMO_PERSONAS.CUSTOMER
  const stored =
    sessionStorage.getItem(USER_SESSION_KEY) ||
    localStorage.getItem(USER_SESSION_KEY)
  if (!stored) return DEMO_PERSONAS.CUSTOMER
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
    return DEMO_PERSONAS.CUSTOMER
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

const IS_MOCK_FALLBACK_ALLOWED =
  process.env.NEXT_PUBLIC_ENABLE_MOCK_FALLBACK === "true"

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
      if (!IS_MOCK_FALLBACK_ALLOWED) {
        throw error
      }
      // Mock / Prototype Fallback
      const identifier = (dto.username || dto.email || "").trim().toLowerCase()

      // 1. Check custom staff created by Owner or Admin
      const customStaffList = getStoredStaffList()
      const matchedCustom = customStaffList.find(
        (s) =>
          s.user.username.toLowerCase() === identifier ||
          s.user.email?.toLowerCase() === identifier
      )

      if (matchedCustom) {
        const targetUser: User = {
          ...matchedCustom.user,
          // Preserve mustChangePassword flag
          mustChangePassword: matchedCustom.user.mustChangePassword ?? true,
          requiresPasswordChange:
            matchedCustom.user.requiresPasswordChange ?? true,
        }

        const mockToken = `mock-jwt-${targetUser.role.toLowerCase()}-${Date.now()}`
        tokenStorage.setToken(mockToken)
        saveLocalUser(targetUser, dto.rememberMe !== false)

        return {
          user: targetUser,
          token: mockToken,
        }
      }

      // 2. Check pre-configured First Login Demo Staff (Eng. Tarek Ramzy)
      if (identifier.includes("tarek.ramzy") || identifier.includes("temp")) {
        const targetUser = { ...DEMO_FIRST_LOGIN_STAFF }
        const mockToken = `mock-jwt-engineer-temp-${Date.now()}`
        tokenStorage.setToken(mockToken)
        saveLocalUser(targetUser, dto.rememberMe !== false)
        return { user: targetUser, token: mockToken }
      }

      // 3. Check Base Personas
      let targetUser = DEMO_PERSONAS.CUSTOMER
      if (identifier.includes("eng") || identifier.includes("karim"))
        targetUser = DEMO_PERSONAS.ENGINEER
      else if (identifier.includes("pm") || identifier.includes("nouran"))
        targetUser = DEMO_PERSONAS.PROJECT_MANAGER
      else if (identifier.includes("owner") || identifier.includes("farid"))
        targetUser = DEMO_PERSONAS.COMPANY_OWNER
      else if (identifier.includes("admin"))
        targetUser = DEMO_PERSONAS.ADMINISTRATOR

      const mockToken = `mock-jwt-${targetUser.role.toLowerCase()}-${Date.now()}`
      tokenStorage.setToken(mockToken)
      saveLocalUser(targetUser, dto.rememberMe !== false)

      return {
        user: targetUser,
        token: mockToken,
      }
    }
  },

  /**
   * Endpoint: POST /otp/send
   * Dispatches EMAIL_VERIFICATION OTP challenge
   */
  async sendRegistrationOtp(email: string): Promise<SendOtpResponse> {
    try {
      const response = await apiClient.post<SendOtpResponse>("/otp/send", {
        email: email.trim().toLowerCase(),
        purpose: "EMAIL_VERIFICATION",
      });
      return response.data;
    } catch (error) {
      if (!IS_MOCK_FALLBACK_ALLOWED) {
        throw error;
      }
      return {
        success: true,
        message: "Demo verification code dispatched",
        expiresInSeconds: 900,
        cooldownSeconds: 60,
      };
    }
  },

  /**
   * Endpoint: POST /otp/verify
   * Verifies EMAIL_VERIFICATION challenge and returns verificationToken proof
   */
  async verifyRegistrationOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    try {
      const response = await apiClient.post<VerifyOtpResponse>("/otp/verify", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        purpose: "EMAIL_VERIFICATION",
      });
      return response.data;
    } catch (error) {
      if (!IS_MOCK_FALLBACK_ALLOWED) {
        throw error;
      }
      return {
        success: true,
        verified: true,
        message: "Code verified (demo fallback)",
        verificationToken: `mock-email-verification-token-${Date.now()}`,
      };
    }
  },

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
      ...(dto.name?.trim() ? { firstName: dto.name.trim().split(/\s+/)[0].slice(0, 80) } : {}),
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

  async resetPassword(
    tokenOrDto: string | ResetPasswordDto,
    newPassword?: string
  ): Promise<{ message?: string } | void> {
    const payload =
      typeof tokenOrDto === "object"
        ? {
            passwordResetToken: tokenOrDto.passwordResetToken,
            newPassword: tokenOrDto.newPassword,
          }
        : {
            passwordResetToken: tokenOrDto,
            newPassword: newPassword!,
          }

    const response = await apiClient.post<{ message: string }>(
      "/auth/reset-password",
      payload
    )
    return response.data
  },

  /**
   * Endpoint: POST /auth/login/otp/request
   */
  async requestLoginOtp(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>("/auth/login/otp/request", {
        email: email.trim().toLowerCase(),
      });
      return response.data;
    } catch (error) {
      if (!IS_MOCK_FALLBACK_ALLOWED) throw error;
      return { message: "If an account with that email exists, an OTP code has been sent." };
    }
  },

  /**
   * Endpoint: POST /auth/login/otp/verify
   */
  async verifyLoginOtp(email: string, otp: string): Promise<AuthSession> {
    try {
      const response = await apiClient.post<BackendAuthResponse>("/auth/login/otp/verify", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      const backendUser = response.data.user;
      const user: User = {
        id: backendUser.id,
        username: backendUser.username,
        name: backendUser.username.split("@")[0],
        role: backendUser.role,
        mustChangePassword: Boolean(backendUser.mustChangePassword),
        requiresPasswordChange: Boolean(backendUser.mustChangePassword),
      };
      const accessToken = response.data.accessToken || "";
      tokenStorage.setToken(accessToken);
      saveLocalUser(user, true);
      return {
        token: accessToken,
        user,
      };
    } catch (error) {
      if (!IS_MOCK_FALLBACK_ALLOWED) throw error;
      const user = DEMO_PERSONAS.CUSTOMER;
      const mockToken = `mock-jwt-customer-otp-${Date.now()}`;
      tokenStorage.setToken(mockToken);
      saveLocalUser(user, true);
      return { token: mockToken, user };
    }
  },

  /**
   * Endpoint: POST /auth/forgot-password
   */
  async requestForgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      return response.data;
    } catch (error) {
      if (!IS_MOCK_FALLBACK_ALLOWED) throw error;
      return { message: "If an account with that email exists, a password reset code has been sent." };
    }
  },

  /**
   * Endpoint: POST /otp/verify (with purpose=PASSWORD_RESET)
   */
  async verifyPasswordResetOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    try {
      const response = await apiClient.post<VerifyOtpResponse>("/otp/verify", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        purpose: "PASSWORD_RESET",
      });
      return response.data;
    } catch (error) {
      if (!IS_MOCK_FALLBACK_ALLOWED) throw error;
      return {
        success: true,
        verified: true,
        message: "Reset code verified",
        passwordResetToken: `mock-password-reset-token-${Date.now()}`,
      };
    }
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
      if (!IS_MOCK_FALLBACK_ALLOWED) {
        tokenStorage.removeToken()
        onboardingStorage.removeToken()
        saveLocalUser(null)
        return null
      }
      return getLocalUser()
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
      if (!IS_MOCK_FALLBACK_ALLOWED) throw error
      return {
        success: true,
        message: `Verification code sent to ${params.email}`,
        expiresInSeconds: 600,
        cooldownSeconds: 60,
        devOtp: "123456",
      }
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
      if (!IS_MOCK_FALLBACK_ALLOWED) throw error
      return {
        success: true,
        email: params.email,
        emailVerified: true,
        mustChangePassword: true,
        onboardingComplete: false,
        message: "Email verified successfully.",
      }
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
      if (!IS_MOCK_FALLBACK_ALLOWED) {
        throw error
      }
      // Mock Fallback: Update user in session and in stored staff list
      const currentUser = getLocalUser()
      if (currentUser) {
        const updatedUser: User = {
          ...currentUser,
          mustChangePassword: false,
          requiresPasswordChange: false,
          isFirstLogin: false,
        }
        saveLocalUser(updatedUser)

        // Also update in stored staff list
        const staffList = getStoredStaffList()
        const updatedList = staffList.map((s) => {
          if (
            s.user.username.toLowerCase() === currentUser.username.toLowerCase()
          ) {
            return {
              ...s,
              password: dto.newPassword,
              user: {
                ...s.user,
                mustChangePassword: false,
                requiresPasswordChange: false,
                isFirstLogin: false,
              },
            }
          }
          return s
        })
        saveStoredStaffList(updatedList)
      }
      return {
        message: "Password changed successfully",
        mustChangePassword: false,
      }
    }
  },

  /**
   * Provision a new Staff Account (Created by Admin or Company Owner).
   * By default, mustChangePassword = true.
   */
  async createStaffUser(
    dto: CreateStaffDto
  ): Promise<{ user: User; temporaryPassword: string }> {
    const newUser: User = {
      id: Math.floor(Math.random() * 9000) + 1000,
      name: dto.name,
      username: dto.username.trim(),
      email: dto.username.includes("@")
        ? dto.username.trim()
        : `${dto.username.trim()}@valentia.com`,
      role: dto.role,
      phone: dto.phone || "",
      mustChangePassword: true,
      requiresPasswordChange: true,
      isFirstLogin: true,
      activeProjectsCount: 0,
    }

    try {
      await apiClient.post("/users", {
        ...newUser,
        password: dto.temporaryPassword,
      })
    } catch {
      // Prototype Fallback: Persist in custom staff storage
      const currentList = getStoredStaffList()
      const updatedList = [
        {
          user: newUser,
          temporaryPassword: dto.temporaryPassword,
          password: dto.temporaryPassword,
        },
        ...currentList,
      ]
      saveStoredStaffList(updatedList)
    }

    return {
      user: newUser,
      temporaryPassword: dto.temporaryPassword,
    }
  },

  /**
   * Returns list of all staff accounts (base personas + custom created accounts).
   */
  getAllStaffUsers(): User[] {
    const baseStaff: User[] = [
      DEMO_PERSONAS.ENGINEER,
      DEMO_PERSONAS.PROJECT_MANAGER,
      DEMO_PERSONAS.COMPANY_OWNER,
      DEMO_PERSONAS.ADMINISTRATOR,
      DEMO_FIRST_LOGIN_STAFF,
    ]

    const custom = getStoredStaffList().map((s) => s.user)
    // Combine and deduplicate by username
    const map = new Map<string, User>()
    baseStaff.forEach((u) => map.set(u.username.toLowerCase(), u))
    custom.forEach((u) => map.set(u.username.toLowerCase(), u))

    return Array.from(map.values())
  },

  /**
   * Development-only role switch helper for testing routing boundaries.
   */
  async switchRoleDev(role: UserRole): Promise<User> {
    const user = DEMO_PERSONAS[role] || DEMO_PERSONAS.CUSTOMER
    const mockToken = `mock-jwt-${role.toLowerCase()}-${Date.now()}`
    tokenStorage.setToken(mockToken)
    saveLocalUser(user)
    return user
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
