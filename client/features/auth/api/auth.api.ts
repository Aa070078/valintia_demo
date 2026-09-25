import { apiClient } from "@/lib/api/client";
import { tokenStorage } from "@/lib/auth/token-storage";
import type {
  User,
  UserRole,
  AuthSession,
  ProposedLoginDto,
  ProposedChangePasswordDto,
} from "../types";

/**
 * Pre-configured development personas for prototype and demonstration testing.
 * These are strictly isolated in this adapter and will be replaced when
 * the backend /auth/login endpoint is connected.
 */
export const DEMO_PERSONAS: Record<UserRole, User> = {
  CUSTOMER: {
    id: "usr-cust-01",
    email: "tarek.mansour@example.com",
    name: "Tarek Mansour",
    role: "CUSTOMER",
    phone: "+971 50 123 4567",
    requiresPasswordChange: false,
  },
  ENGINEER: {
    id: "usr-eng-01",
    email: "karim.elsayed@valentia.com",
    name: "Eng. Karim El-Sayed",
    role: "ENGINEER",
    phone: "+20 100 555 1234",
    requiresPasswordChange: false,
  },
  PROJECT_MANAGER: {
    id: "usr-pm-01",
    email: "nouran.hassan@valentia.com",
    name: "Nouran Hassan",
    role: "PROJECT_MANAGER",
    phone: "+20 111 888 4321",
    requiresPasswordChange: false,
  },
  ADMIN: {
    id: "usr-admin-01",
    email: "admin@valentia.com",
    name: "System Administrator",
    role: "ADMIN",
    phone: "+20 122 000 9999",
    requiresPasswordChange: false,
  },
};

const DEMO_TEMP_USER: User = {
  id: "usr-temp-01",
  email: "new.client@example.com",
  name: "Amr Zaki",
  role: "CUSTOMER",
  phone: "+20 109 999 1111",
  requiresPasswordChange: true,
};

const USER_SESSION_KEY = "valentia_current_user";

function getLocalUser(): User | null {
  if (typeof window === "undefined") return DEMO_PERSONAS.CUSTOMER;
  const stored = sessionStorage.getItem(USER_SESSION_KEY);
  if (!stored) return DEMO_PERSONAS.CUSTOMER;
  try {
    return JSON.parse(stored);
  } catch {
    return DEMO_PERSONAS.CUSTOMER;
  }
}

function saveLocalUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    sessionStorage.removeItem(USER_SESSION_KEY);
  } else {
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  }
}

export const authApi = {
  /**
   * Proposed Endpoint: POST /auth/login
   * Returns JWT token and authenticated user payload.
   */
  async login(dto: ProposedLoginDto): Promise<AuthSession> {
    try {
      const response = await apiClient.post<AuthSession>("/auth/login", dto);
      tokenStorage.setToken(response.data.token);
      saveLocalUser(response.data.user);
      return response.data;
    } catch {
      // Mock fallback for development
      let targetUser = DEMO_PERSONAS.CUSTOMER;
      if (dto.email.includes("eng")) targetUser = DEMO_PERSONAS.ENGINEER;
      else if (dto.email.includes("pm")) targetUser = DEMO_PERSONAS.PROJECT_MANAGER;
      else if (dto.email.includes("admin")) targetUser = DEMO_PERSONAS.ADMIN;
      else if (dto.email.includes("temp")) targetUser = DEMO_TEMP_USER;

      const mockToken = `mock-jwt-${targetUser.role.toLowerCase()}-${Date.now()}`;
      tokenStorage.setToken(mockToken);
      saveLocalUser(targetUser);

      return {
        user: targetUser,
        token: mockToken,
      };
    }
  },

  /**
   * Proposed Endpoint: GET /auth/me
   */
  async getCurrentUser(): Promise<User | null> {
    const token = tokenStorage.getToken();
    if (!token) return null;

    try {
      const response = await apiClient.get<User>("/auth/me");
      saveLocalUser(response.data);
      return response.data;
    } catch {
      return getLocalUser();
    }
  },

  /**
   * Proposed Endpoint: POST /auth/change-password
   */
  async changePassword(dto: ProposedChangePasswordDto): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        "/auth/change-password",
        dto
      );
      const currentUser = getLocalUser();
      if (currentUser) {
        saveLocalUser({ ...currentUser, requiresPasswordChange: false });
      }
      return response.data;
    } catch {
      const currentUser = getLocalUser();
      if (currentUser) {
        saveLocalUser({ ...currentUser, requiresPasswordChange: false });
      }
      return { success: true };
    }
  },

  /**
   * Development-only role switch helper for testing routing boundaries.
   */
  async switchRoleDev(role: UserRole): Promise<User> {
    const user = DEMO_PERSONAS[role];
    const mockToken = `mock-jwt-${role.toLowerCase()}-${Date.now()}`;
    tokenStorage.setToken(mockToken);
    saveLocalUser(user);
    return user;
  },

  /**
   * Logout helper
   */
  async logout(): Promise<void> {
    tokenStorage.removeToken();
    saveLocalUser(null);
  },
};
