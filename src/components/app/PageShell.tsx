import { type ReactNode } from "react"

import { cn } from "@/lib/utils"

const WIDTHS = {
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-6xl",
} as const

/**
 * The standard frame for every app page. Unifies the container width (aligned to
 * the nav), padding and vertical rhythm — and staggers its direct children up on
 * mount (`.app-stagger`, reduced-motion safe) so each surface enters like the
 * landing rather than snapping in. Pages render a PageHeader + sections inside.
 */
export function PageShell({
  children,
  width = "default",
  className,
}: {
  children: ReactNode
  width?: keyof typeof WIDTHS
  className?: string
}) {
  return (
    <div className={cn("app-stagger relative z-10 mx-auto w-full px-6 py-10", WIDTHS[width], className)}>
      {children}
    </div>
  )
}
