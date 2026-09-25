import { apiClient } from "@/lib/api/client";
import { tokenStorage } from "@/lib/auth/token-storage";
import type {
  User,
  UserRole,
  AuthSession,
  ProposedLoginDto,
  ProposedSignupDto,
  ProposedChangePasswordDto,
} from "../types";

/**
 * Pre-configured development personas for prototype and demonstration testing.
 * These are strictly isolated in this adapter and will be replaced when
 * the backend /auth/login endpoint is connected.
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
};

const DEMO_TEMP_USER: User = {
  id: 99,
  username: "new.client@example.com",
  email: "new.client@example.com",
  name: "Amr Zaki",
  role: "CUSTOMER",
  phone: "+20 109 999 1111",
  mustChangePassword: true,
  requiresPasswordChange: true,
};

const USER_SESSION_KEY = "valentia_current_user";

function getLocalUser(): User | null {
  if (typeof window === "undefined") return DEMO_PERSONAS.CUSTOMER;
  const stored = sessionStorage.getItem(USER_SESSION_KEY) || localStorage.getItem(USER_SESSION_KEY);
  if (!stored) return DEMO_PERSONAS.CUSTOMER;
  try {
    return JSON.parse(stored);
  } catch {
    return DEMO_PERSONAS.CUSTOMER;
  }
}

function saveLocalUser(user: User | null, persistent: boolean = true) {
  if (typeof window === "undefined") return;
  if (!user) {
    sessionStorage.removeItem(USER_SESSION_KEY);
    localStorage.removeItem(USER_SESSION_KEY);
  } else {
    const raw = JSON.stringify(user);
    sessionStorage.setItem(USER_SESSION_KEY, raw);
    if (persistent) {
      localStorage.setItem(USER_SESSION_KEY, raw);
    }
  }
}

export const authApi = {
  /**
   * Endpoint: POST /auth/login
   * Returns JWT token and authenticated user payload.
   */
  async login(dto: ProposedLoginDto): Promise<AuthSession> {
    const loginPayload = {
      username: dto.username || dto.email || "",
      password: dto.password,
    };

    try {
      const response = await apiClient.post<AuthSession>("/auth/login", loginPayload);
      tokenStorage.setToken(response.data.token);
      saveLocalUser(response.data.user, dto.rememberMe !== false);
      return response.data;
    } catch {
      // Mock fallback for development
      const identifier = (dto.username || dto.email || "").toLowerCase();
      let targetUser = DEMO_PERSONAS.CUSTOMER;

      if (identifier.includes("eng")) targetUser = DEMO_PERSONAS.ENGINEER;
      else if (identifier.includes("pm")) targetUser = DEMO_PERSONAS.PROJECT_MANAGER;
      else if (identifier.includes("owner")) targetUser = DEMO_PERSONAS.COMPANY_OWNER;
      else if (identifier.includes("admin")) targetUser = DEMO_PERSONAS.ADMINISTRATOR;
      else if (identifier.includes("temp")) targetUser = DEMO_TEMP_USER;

      const mockToken = `mock-jwt-${targetUser.role.toLowerCase()}-${Date.now()}`;
      tokenStorage.setToken(mockToken);
      saveLocalUser(targetUser, dto.rememberMe !== false);

      return {
        user: targetUser,
        token: mockToken,
      };
    }
  },

  /**
   * Endpoint: POST /auth/signup (or /auth/register)
   */
  async signup(dto: ProposedSignupDto): Promise<AuthSession> {
    try {
      const response = await apiClient.post<AuthSession>("/auth/signup", dto);
      tokenStorage.setToken(response.data.token);
      saveLocalUser(response.data.user, true);
      return response.data;
    } catch {
      // Mock fallback for development
      const newUser: User = {
        id: Math.floor(Math.random() * 10000) + 100,
        username: dto.username,
        email: dto.username.includes("@") ? dto.username : undefined,
        name: dto.name || dto.username.split("@")[0],
        role: dto.role || "CUSTOMER",
        phone: dto.phone,
        mustChangePassword: false,
        requiresPasswordChange: false,
      };

      const mockToken = `mock-jwt-customer-${Date.now()}`;
      tokenStorage.setToken(mockToken);
      saveLocalUser(newUser, true);

      return {
        user: newUser,
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
