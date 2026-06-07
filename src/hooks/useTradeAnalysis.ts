import { useCallback, useRef, useState } from "react"

import { startTradeAnalysis } from "@/lib/agentos"
import { netPnl, plannedRR, realizedR, returnPct } from "@/lib/journal/metrics"
import { readSSE } from "@/lib/sse"
import type { Trade } from "@/types/journal"

export type AnalysisStatus = "idle" | "streaming" | "error" | "done"

/** Shape the trade into a compact, self-contained payload for the backend analyzer. */
function toPayload(trade: Trade, strategyName?: string | null): Record<string, unknown> {
  return {
    ticker: trade.ticker,
    direction: trade.direction,
    status: trade.status,
    entry_price: trade.entry_price,
    exit_price: trade.exit_price,
    quantity: trade.quantity,
    stop_price: trade.stop_price,
    target_price: trade.target_price,
    fees: trade.fees,
    entry_at: trade.entry_at,
    exit_at: trade.exit_at,
    strategy: strategyName ?? null,
    setup: trade.setup,
    timeframe: trade.timeframe,
    market_condition: trade.market_condition,
    catalyst: trade.catalyst,
    confidence: trade.confidence,
    tags: trade.tags,
    mistakes: trade.mistakes,
    plan_notes: trade.plan_notes,
    review_notes: trade.review_notes,
    // pre-computed so the model reasons over the same numbers the UI shows
    metrics: {
      net_pnl: netPnl(trade),
      return_pct: returnPct(trade),
      realized_r: realizedR(trade),
      planned_rr: plannedRR(trade),
    },
  }
}

/**
 * Stream an AI review of one trade (the paid feature). Mirrors useChat: `RunContent`
 * deltas append to `content`; the terminal `AnalysisComplete` reconciles the full text.
 * Gating is enforced server-side; the UI should still hide the trigger for free users.
 */
export function useTradeAnalysis(getToken: () => Promise<string | undefined>) {
  const [content, setContent] = useState("")
  const [status, setStatus] = useState<AnalysisStatus>("idle")
  const [statusLabel, setStatusLabel] = useState("")
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const run = useCallback(
    async (trade: Trade, opts?: { question?: string; strategyName?: string | null }) => {
      if (status === "streaming") return
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      setContent("")
      setError(null)
      setStatus("streaming")
      setStatusLabel("Reviewing the trade…")
      try {
        const token = await getToken()
        const res = await startTradeAnalysis(
          { trade: toPayload(trade, opts?.strategyName), question: opts?.question },
          token,
          ctrl.signal,
        )
        let acc = ""
        for await (const ev of readSSE(res, ctrl.signal)) {
          switch (ev.event) {
            case "RunContent":
              if (typeof ev.content === "string" && ev.content) {
                acc += ev.content
                setStatusLabel("")
                setContent((c) => c + ev.content)
              }
              break
            case "AnalysisComplete":
              if (typeof ev.answer === "string" && ev.answer && ev.answer !== acc) {
                setContent(ev.answer)
              }
              setStatus("done")
              setStatusLabel("")
              break
            case "AnalysisError":
              setError(typeof ev.error === "string" ? ev.error : "analysis failed")
              setStatus("error")
              setStatusLabel("")
              break
            default:
              break
          }
        }
        setStatus((s) => (s === "streaming" ? "done" : s))
        setStatusLabel("")
      } catch (err) {
        if (!ctrl.signal.aborted) {
          setError(err instanceof Error ? err.message : String(err))
          setStatus("error")
          setStatusLabel("")
        }
      }
    },
    [getToken, status],
  )

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setStatus((s) => (s === "streaming" ? "idle" : s))
    setStatusLabel("")
  }, [])

  return { content, status, statusLabel, error, run, cancel }
}
