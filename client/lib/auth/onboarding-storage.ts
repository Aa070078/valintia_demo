// Restricted onboarding credentials live only in this tab, never in access cookies.
const KEY = "valentia_onboarding_token"
export const onboardingStorage = {
  getToken(): string | null {
    if (typeof window === "undefined") return null
    return window.sessionStorage.getItem(KEY)
  },
  setToken(token: string): void {
    window.sessionStorage.setItem(KEY, token)
  },
  removeToken(): void {
    if (typeof window !== "undefined") window.sessionStorage.removeItem(KEY)
  },
}
