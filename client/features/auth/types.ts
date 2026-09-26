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

export interface User {
  id: number | string;
  username: string;
  email?: string;
  name: string;
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
}

export interface AuthSession {
  user: User;
  token: string;
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

