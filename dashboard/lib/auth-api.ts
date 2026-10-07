import { Role, User } from "./types";
import { getAccessToken, clearAccessToken } from "./auth-storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  onboardingToken?: string;
  message?: string;
}

export interface ApiUserResponse {
  id: number;
  username: string;
  email?: string;
  role: Role;
  mustChangePassword: boolean;
  onboardingRequired?: boolean;
}

export const authApi = {
  /**
   * Authenticate staff user via email/username and password.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg =
        data.message || (Array.isArray(data.message) ? data.message.join(", ") : "Authentication failed");
      throw new Error(errorMsg);
    }

    return data;
  },

  /**
   * Fetch current staff user profile using the stored access token.
   */
  async getCurrentUser(): Promise<User | null> {
    const token = getAccessToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          clearAccessToken();
        }
        return null;
      }

      const data: ApiUserResponse = await res.json();

      return {
        id: data.id,
        username: data.username,
        name: data.username,
        email: data.email || data.username,
        role: data.role,
        mustChangePassword: data.mustChangePassword,
      };
    } catch {
      return null;
    }
  },
};
