/**
 * Token Storage Adapter Interface & Implementations
 *
 * For the confirmed JWT Access Token + "Authorization: Bearer <token>" flow,
 * token storage is isolated behind this JS-readable abstraction.
 * Storage strategy can be configured or swapped (LocalStorage, SessionStorage, Memory)
 * without touching Auth Context or API service logic.
 */

export interface TokenStorageAdapter {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
}

const DEFAULT_STORAGE_KEY = "valentia_auth_token";

export class LocalStorageTokenStorageAdapter implements TokenStorageAdapter {
  private key: string;

  constructor(key: string = DEFAULT_STORAGE_KEY) {
    this.key = key;
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(this.key);
    } catch {
      return null;
    }
  }

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.key, token);
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  removeToken(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(this.key);
    } catch {
      // Storage unavailable
    }
  }
}

export class SessionStorageTokenStorageAdapter implements TokenStorageAdapter {
  private key: string;

  constructor(key: string = DEFAULT_STORAGE_KEY) {
    this.key = key;
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem(this.key);
    } catch {
      return null;
    }
  }

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(this.key, token);
    } catch {
      // Storage unavailable
    }
  }

  removeToken(): void {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(this.key);
    } catch {
      // Storage unavailable
    }
  }
}

export class MemoryTokenStorageAdapter implements TokenStorageAdapter {
  private memoryToken: string | null = null;

  getToken(): string | null {
    return this.memoryToken;
  }

  setToken(token: string): void {
    this.memoryToken = token;
  }

  removeToken(): void {
    this.memoryToken = null;
  }
}

/**
 * Default singleton instance used across the client application.
 */
export const tokenStorage: TokenStorageAdapter = new LocalStorageTokenStorageAdapter();
