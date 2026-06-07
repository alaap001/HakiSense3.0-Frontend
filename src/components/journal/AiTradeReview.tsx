import { Loader2, Sparkles } from "lucide-react"

import { MarkdownView } from "@/components/dossier/MarkdownView"
import { UpgradeGate } from "@/components/journal/UpgradeGate"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useEntitlements } from "@/hooks/useEntitlements"
import { useTradeAnalysis } from "@/hooks/useTradeAnalysis"
import type { Trade } from "@/types/journal"

/** Ultra-gated AI critique of a single trade. Other plans see the upgrade card instead. */
export function AiTradeReview({ trade }: { trade: Trade }) {
  const { canUseAi } = useEntitlements()
  const { getToken } = useAuth()
  const { content, status, statusLabel, error, run } = useTradeAnalysis(getToken)

  if (!canUseAi) return <UpgradeGate />

  const streaming = status === "streaming"

  return (
    <div className="rounded-xl border border-violet/30 bg-violet/[0.05] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="micro-label flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-brand" />
          AI trade review
        </p>
        {status === "idle" ? (
          <Button size="sm" className="btn-primary gap-1.5 text-white" onClick={() => void run(trade)}>
            <Sparkles className="size-3.5" />
            Run review
          </Button>
        ) : streaming ? (
          <span className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Loader2 className="size-3.5 animate-spin text-brand" />
            {statusLabel || "Analyzing…"}
          </span>
        ) : (
          <Button size="sm" variant="outline" onClick={() => void run(trade)}>
            Re-run
          </Button>
        )}
      </div>

      {content ? (
        <div className="mt-3">
          <MarkdownView>{content}</MarkdownView>
        </div>
      ) : status === "idle" ? (
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          A desk-grade critique of this trade — entry, stop, sizing, R:R and whether you followed
          your plan — plus one thing to do better next time. Research, not investment advice.
        </p>
      ) : null}

      {error ? (
        <p className="mt-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
