"use client"
interface MomComposerProps {
  projectId: number
  projectTitle: string
  clientName: string
  isRTL: boolean
  onMomUpdated?: () => void
}

export function MomComposer({ projectTitle, isRTL }: MomComposerProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-semibold">{projectTitle}</h3>
      <p className="mt-3 text-sm text-muted-foreground">
        {isRTL
          ? "محاضر الاجتماعات غير متاحة حاليًا."
          : "Meeting minutes are currently unavailable."}
      </p>
    </section>
  )
}
