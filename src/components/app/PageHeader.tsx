import { type ComponentType, type ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * One header pattern for every app page: a mono eyebrow (optional icon + badge),
 * a display title (pass a `text-gradient` span for the accent word), an optional
 * subtitle, and a right-aligned actions slot. Replaces the per-page hand-rolled
 * headers that drifted in spacing.
 */
export function PageHeader({
  eyebrow,
  icon: Icon,
  badge,
  title,
  subtitle,
  actions,
  className,
}: {
  eyebrow?: string
  icon?: ComponentType<{ className?: string }>
  badge?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="micro-label flex items-center gap-1.5">
            {Icon ? <Icon className="size-3.5" /> : null}
            {eyebrow}
            {badge}
          </p>
        ) : null}
        <h1 className="mt-2.5 font-display text-3xl font-semibold tracking-tight text-text-primary">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  )
}
