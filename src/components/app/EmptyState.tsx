import { type ComponentType, type ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * A polished empty state — icon in a glowing glass chip, title, hint, optional
 * action — replacing the plain one-line "nothing here yet" text scattered around.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ComponentType<{ className?: string }>
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "card-glass flex flex-col items-center rounded-2xl px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="grid size-11 place-items-center rounded-xl glass glow-violet-subtle">
          <Icon className="size-5 text-brand" />
        </span>
      ) : null}
      <p className="mt-4 font-display text-base font-semibold text-text-primary">{title}</p>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
