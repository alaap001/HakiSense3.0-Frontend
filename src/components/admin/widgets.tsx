import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import type { RunMode, RunStatus } from "@/types/admin"

/** Shared presentational atoms for the admin tables. */

export function PlanBadge({ plan }: { plan: "free" | "pro" }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[11px] capitalize",
        plan === "pro"
          ? "border-violet bg-violet/10 text-brand-strong"
          : "border-hairline text-text-secondary",
      )}
    >
      {plan}
    </span>
  )
}

export function StatusBadge({ status }: { status: RunStatus }) {
  const cls: Record<RunStatus, string> = {
    completed: "border-pos/40 text-pos",
    running: "border-warn/40 text-warn",
    failed: "border-neg/40 text-neg",
  }
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", cls[status])}>{status}</span>
  )
}

export function ModeBadge({ mode }: { mode: RunMode }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] capitalize",
        mode === "full" ? "bg-violet/15 text-brand-strong" : "bg-surface text-text-secondary",
      )}
    >
      {mode}
    </span>
  )
}

export function GateMark({ passed }: { passed: boolean | null }) {
  if (passed == null) return <span className="text-text-secondary/50">—</span>
  return <span className={passed ? "text-pos" : "text-neg"}>{passed ? "✓ pass" : "✗ fail"}</span>
}

export function AdminLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-10 text-text-secondary">
      <Loader2 className="size-5 animate-spin text-brand" />
      <span className="font-mono text-sm">{label}</span>
    </div>
  )
}

export function AdminError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-neg/30 bg-neg/5 p-5 text-sm text-neg">{message}</div>
  )
}

export function AdminEmpty({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-hairline-strong p-10 text-center text-sm text-text-secondary">
      {message}
    </div>
  )
}
