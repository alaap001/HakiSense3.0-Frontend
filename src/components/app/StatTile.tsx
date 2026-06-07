import { type ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * A refined metric tile — mono label, big display value, optional hint. Tones map
 * to the finance semantics (pos/neg) or the brand gradient. Used by the journal,
 * dashboard and admin stat rows so every figure reads the same way.
 */
export function StatTile({
  label,
  value,
  hint,
  tone = "default",
  className,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: "default" | "pos" | "neg" | "brand"
  className?: string
}) {
  return (
    <div className={cn("card-glass rounded-2xl p-4", className)}>
      <p className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">{label}</p>
      <p
        className={cn(
          "mt-1 font-display text-2xl font-bold tracking-tight",
          tone === "default" && "text-text-primary",
          tone === "pos" && "text-pos",
          tone === "neg" && "text-neg",
          tone === "brand" && "text-gradient",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-text-secondary">{hint}</p> : null}
    </div>
  )
}
