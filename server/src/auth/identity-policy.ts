import { isEmail } from 'class-validator';
import { Role } from '../generated/prisma/client.js';

/** Roles supported by administrator provisioning; business permissions remain separate. */
export const INTERNAL_ROLES = [
  Role.ENGINEER,
  Role.PROJECT_MANAGER,
  Role.COMPANY_OWNER,
] as const;

export function isInternalRole(role: Role): boolean {
  return INTERNAL_ROLES.some((internalRole) => internalRole === role);
}

export const TEMPORARY_LOGIN_DOMAIN = 'internal.local';
export function isRealEmail(email: string): boolean {
  return isEmail(email) && !/@(?:.*\.)?internal\.local$/i.test(email);
}
/** Legacy customers/admins retain password access; email OTP still requires verification. */
export function requiresOnboarding(user: {
  role: Role;
  email: string | null;
  emailVerified: boolean;
  mustChangePassword: boolean;
}): boolean {
  return (
    isInternalRole(user.role) &&
    (!user.email || !user.emailVerified || user.mustChangePassword)
  );
}
