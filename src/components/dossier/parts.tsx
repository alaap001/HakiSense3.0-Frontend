/** Shared empty-state used by every dossier section when its slice is empty. */
export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-hairline bg-surface px-4 py-8 text-center text-sm text-text-secondary/60">
      {label}
    </div>
  )
}
