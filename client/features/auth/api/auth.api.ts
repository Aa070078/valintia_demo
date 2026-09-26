import { apiClient } from "@/lib/api/client";
import { tokenStorage } from "@/lib/auth/token-storage";
import type {
  User,
  UserRole,
  AuthSession,
  ProposedLoginDto,
  ProposedSignupDto,
  ProposedChangePasswordDto,
  CreateStaffDto,
} from "../types";

/**
 * Pre-configured development personas for prototype and demonstration testing.
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
};

/**
 * Pre-configured engineer account with mandatory first-login password update.
 */
export const DEMO_FIRST_LOGIN_STAFF: User = {
  id: 301,
  username: "tarek.ramzy@valentia.com",
  email: "tarek.ramzy@valentia.com",
  name: "Eng. Tarek Ramzy (First Login Demo)",
  role: "ENGINEER",
  phone: "+20 109 444 3322",
  mustChangePassword: true,
  requiresPasswordChange: true,
  isFirstLogin: true,
  activeProjectsCount: 2,
};

const USER_SESSION_KEY = "valentia_current_user";
const CUSTOM_STAFF_STORAGE_KEY = "valentia_custom_staff_users";

export interface StoredStaffAccount {
  user: User;
  temporaryPassword?: string;
  password?: string;
}

function getStoredStaffList(): StoredStaffAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_STAFF_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredStaffList(list: StoredStaffAccount[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CUSTOM_STAFF_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn("Failed to persist custom staff list:", err);
  }
}

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
      // Mock / Prototype Fallback
      const identifier = (dto.username || dto.email || "").trim().toLowerCase();
      
      // 1. Check custom staff created by Owner or Admin
      const customStaffList = getStoredStaffList();
      const matchedCustom = customStaffList.find(
        (s) => s.user.username.toLowerCase() === identifier || s.user.email?.toLowerCase() === identifier
      );

      if (matchedCustom) {
        const targetUser: User = {
          ...matchedCustom.user,
          // Preserve mustChangePassword flag
          mustChangePassword: matchedCustom.user.mustChangePassword ?? true,
          requiresPasswordChange: matchedCustom.user.requiresPasswordChange ?? true,
        };

        const mockToken = `mock-jwt-${targetUser.role.toLowerCase()}-${Date.now()}`;
        tokenStorage.setToken(mockToken);
        saveLocalUser(targetUser, dto.rememberMe !== false);

        return {
          user: targetUser,
          token: mockToken,
        };
      }

      // 2. Check pre-configured First Login Demo Staff (Eng. Tarek Ramzy)
      if (identifier.includes("tarek.ramzy") || identifier.includes("temp")) {
        const targetUser = { ...DEMO_FIRST_LOGIN_STAFF };
        const mockToken = `mock-jwt-engineer-temp-${Date.now()}`;
        tokenStorage.setToken(mockToken);
        saveLocalUser(targetUser, dto.rememberMe !== false);
        return { user: targetUser, token: mockToken };
      }

      // 3. Check Base Personas
      let targetUser = DEMO_PERSONAS.CUSTOMER;
      if (identifier.includes("eng") || identifier.includes("karim")) targetUser = DEMO_PERSONAS.ENGINEER;
      else if (identifier.includes("pm") || identifier.includes("nouran")) targetUser = DEMO_PERSONAS.PROJECT_MANAGER;
      else if (identifier.includes("owner") || identifier.includes("farid")) targetUser = DEMO_PERSONAS.COMPANY_OWNER;
      else if (identifier.includes("admin")) targetUser = DEMO_PERSONAS.ADMINISTRATOR;

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
   * Endpoint: GET /auth/me
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
   * Endpoint: POST /auth/change-password
   * Clears mustChangePassword and sets the user's permanent password.
   */
  async changePassword(dto: ProposedChangePasswordDto): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        "/auth/change-password",
        dto
      );
      const currentUser = getLocalUser();
      if (currentUser) {
        saveLocalUser({
          ...currentUser,
          mustChangePassword: false,
          requiresPasswordChange: false,
          isFirstLogin: false,
        });
      }
      return response.data;
    } catch {
      // Mock Fallback: Update user in session and in stored staff list
      const currentUser = getLocalUser();
      if (currentUser) {
        const updatedUser: User = {
          ...currentUser,
          mustChangePassword: false,
          requiresPasswordChange: false,
          isFirstLogin: false,
        };
        saveLocalUser(updatedUser);

        // Also update in stored staff list
        const staffList = getStoredStaffList();
        const updatedList = staffList.map((s) => {
          if (s.user.username.toLowerCase() === currentUser.username.toLowerCase()) {
            return {
              ...s,
              password: dto.newPassword,
              user: {
                ...s.user,
                mustChangePassword: false,
                requiresPasswordChange: false,
                isFirstLogin: false,
              },
            };
          }
          return s;
        });
        saveStoredStaffList(updatedList);
      }
      return { success: true };
    }
  },

  /**
   * Provision a new Staff Account (Created by Admin or Company Owner).
   * By default, mustChangePassword = true.
   */
  async createStaffUser(dto: CreateStaffDto): Promise<{ user: User; temporaryPassword: string }> {
    const newUser: User = {
      id: Math.floor(Math.random() * 9000) + 1000,
      name: dto.name,
      username: dto.username.trim(),
      email: dto.username.includes("@") ? dto.username.trim() : `${dto.username.trim()}@valentia.com`,
      role: dto.role,
      phone: dto.phone || "",
      mustChangePassword: true,
      requiresPasswordChange: true,
      isFirstLogin: true,
      activeProjectsCount: 0,
    };

    try {
      await apiClient.post("/users", {
        ...newUser,
        password: dto.temporaryPassword,
      });
    } catch {
      // Prototype Fallback: Persist in custom staff storage
      const currentList = getStoredStaffList();
      const updatedList = [
        {
          user: newUser,
          temporaryPassword: dto.temporaryPassword,
          password: dto.temporaryPassword,
        },
        ...currentList,
      ];
      saveStoredStaffList(updatedList);
    }

    return {
      user: newUser,
      temporaryPassword: dto.temporaryPassword,
    };
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
    ];

    const custom = getStoredStaffList().map((s) => s.user);
    // Combine and deduplicate by username
    const map = new Map<string, User>();
    baseStaff.forEach((u) => map.set(u.username.toLowerCase(), u));
    custom.forEach((u) => map.set(u.username.toLowerCase(), u));

    return Array.from(map.values());
  },

  /**
   * Development-only role switch helper for testing routing boundaries.
   */
  async switchRoleDev(role: UserRole): Promise<User> {
    const user = DEMO_PERSONAS[role] || DEMO_PERSONAS.CUSTOMER;
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
