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

export type UserRole = "CUSTOMER" | "ENGINEER" | "PROJECT_MANAGER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  /**
   * Conceptually represents whether the user was issued a temporary password
   * on first sign-in and must change it before continuing.
   * Abstracted so backend field naming (e.g. MUST_CHANGE_PASSWORD, isTemporaryPassword)
   * can be mapped in the API adapter.
   */
  requiresPasswordChange?: boolean;
  phone?: string;
  avatarUrl?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface ProposedLoginDto {
  email: string;
  password: string;
}

export interface ProposedChangePasswordDto {
  currentPassword?: string;
  newPassword: string;
}

/**
 * Target application destination by role.
 * CUSTOMER remains in the client application.
 * Internal staff are routed to the dashboard entry.
 */
export const ROLE_DESTINATIONS: Record<UserRole, "client" | "dashboard"> = {
  CUSTOMER: "client",
  ENGINEER: "dashboard",
  PROJECT_MANAGER: "dashboard",
  ADMIN: "dashboard",
};
