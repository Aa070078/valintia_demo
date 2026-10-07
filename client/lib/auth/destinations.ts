import type { UserRole } from "@/features/auth/types"

/** Access credentials travel in fragments, which are not sent to HTTP servers. */
export function workspaceDestination(role: UserRole, token?: string): string {
  if (role === "CUSTOMER") return "/projects"
  const path =
    role === "ENGINEER"
      ? "/engineer"
      : role === "PROJECT_MANAGER"
        ? "/pm"
        : "/admin"
  const localOrigin =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
      ? `${window.location.protocol}//${window.location.hostname}:3001`
      : typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3001"
  const destination = new URL(
    path,
    process.env.NEXT_PUBLIC_DASHBOARD_URL || localOrigin
  )
  if (token)
    destination.hash = new URLSearchParams({ access_token: token }).toString()
  return destination.toString()
}
