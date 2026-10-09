"use client"
import { useAuth } from "@/features/auth/context/auth-context"
import { tokenStorage } from "@/lib/auth/token-storage"
import { workspaceDestination } from "@/lib/auth/destinations"
export function PmDashboard() {
  const { user } = useAuth()
  return (
    <section className="rounded-2xl border border-border bg-card p-8 text-foreground">
      <h1 className="text-2xl font-semibold">فالنتيا · VALENTIA</h1>
      <p className="my-4">
        افتح مساحة العمل لإدارة بياناتك · Open your workspace to manage your
        account data.
      </p>
      {user && (
        <a
          className="inline-block rounded-lg bg-primary px-5 py-3 text-primary-foreground"
          href={workspaceDestination(
            user.role,
            tokenStorage.getToken() || undefined
          )}
        >
          فتح مساحة العمل · Open workspace
        </a>
      )}
    </section>
  )
}
