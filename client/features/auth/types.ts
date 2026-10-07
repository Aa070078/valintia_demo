/**
 * Authentication & Authorization Types
 *
 * Roles confirmed by architecture:
 * - CUSTOMER -> Customer-facing client/ application
 * - ENGINEER -> Internal dashboard/
 * - PROJECT_MANAGER -> Internal dashboard/
 * - ADMIN -> Internal dashboard/
 *
 * Backend endpoints and DTO fields are marked as proposed until Swagger/DTOs
 * are provided by the backend team.
 */

export type UserRole =
  | "CUSTOMER"
  | "ENGINEER"
  | "PROJECT_MANAGER"
  | "COMPANY_OWNER"
  | "ADMINISTRATOR"
  | "ADMIN";

export type Role = UserRole;

export interface User {
  id: number | string;
  username: string;
  email?: string;
  name?: string;
  role: UserRole;
  /**
   * Directly maps to Prisma model User.mustChangePassword
   */
  mustChangePassword?: boolean;
  requiresPasswordChange?: boolean;
  isFirstLogin?: boolean;
  phone?: string;
  avatarUrl?: string;
  activeProjectsCount?: number;
  onboardingRequired?: boolean;
}

export interface AuthSession {
  user: User;
  token: string;
  onboardingToken?: string;
  onboardingRequired?: boolean;
}

export interface OnboardingEmailRequestResponse {
  success: boolean;
  message: string;
  expiresInSeconds?: number;
  cooldownSeconds?: number;
  devOtp?: string;
}

export interface OnboardingEmailVerifyResponse {
  success: boolean;
  email: string;
  emailVerified: boolean;
  mustChangePassword: boolean;
  onboardingComplete: boolean;
  message: string;
}

export interface ProposedLoginDto {
  username?: string;
  email?: string;
  password: string;
  rememberMe?: boolean;
}

export interface ProposedSignupDto {
  username: string;
  password: string;
  name?: string;
  phone?: string;
  role?: UserRole;
  verificationToken?: string;
}

export interface CreateStaffDto {
  name: string;
  username: string;
  role: UserRole;
  phone?: string;
  temporaryPassword: string;
}

export interface ProposedChangePasswordDto {
  currentPassword?: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
  mustChangePassword: boolean;
}

export type OtpPurpose = "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "LOGIN";

export interface SendOtpDto {
  email: string;
  purpose?: OtpPurpose;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresInSeconds?: number;
  cooldownSeconds?: number;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
  purpose?: OtpPurpose;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  verified: boolean;
  verificationToken?: string;
  passwordResetToken?: string;
}

export interface LoginOtpRequestDto {
  email: string;
}

export interface LoginOtpVerifyDto {
  email: string;
  otp: string;
}

export interface ResetPasswordDto {
  passwordResetToken: string;
  newPassword: string;
}

/**
 * Target application destination by role.
 * CUSTOMER remains in the client application.
 * Internal staff and executives are routed to the dashboard entry.
 */
export const ROLE_DESTINATIONS: Record<UserRole, "client" | "dashboard"> = {
  CUSTOMER: "client",
  ENGINEER: "dashboard",
  PROJECT_MANAGER: "dashboard",
  COMPANY_OWNER: "dashboard",
  ADMINISTRATOR: "dashboard",
  ADMIN: "dashboard",
};

