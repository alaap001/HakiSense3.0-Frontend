import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

/** Consistent inline loading row — one spinner + label for every app page. */
export function LoadingState({
  label = "Loading…",
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-3 text-text-secondary", className)}>
      <Loader2 className="size-5 animate-spin text-brand" />
      <span className="font-mono text-sm">{label}</span>
    </div>
  )
}

/** A shimmering skeleton block, for content-shaped loading placeholders. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-surface-strong", className)} />
}
