import { useEffect, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { ExternalLink, Pencil, Trash2 } from "lucide-react"

import { AiTradeReview } from "@/components/journal/AiTradeReview"
import { TradeForm, type TradeFormSubmit } from "@/components/journal/TradeForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"
import { useTradeMutations } from "@/hooks/useJournal"
import {
  fmtDateTime,
  fmtDuration,
  fmtNum,
  fmtPct,
  fmtR,
  fmtSignedMoney,
  pnlClass,
} from "@/lib/journal/format"
import {
  grossPnl,
  holdingPeriodMs,
  netPnl,
  plannedRR,
  realizedR,
  returnPct,
  riskPerUnit,
} from "@/lib/journal/metrics"
import { screenshotUrl, uploadScreenshots } from "@/lib/journal/queries"
import { cn } from "@/lib/utils"
import type { Strategy, Trade } from "@/types/journal"

function Metric({ label, value, valueClass }: { label: string; value: ReactNode; valueClass?: string }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface/40 px-3 py-2">
      <p className="micro-label">{label}</p>
      <p className={cn("mt-0.5 font-mono text-sm text-text-primary", valueClass)}>{value}</p>
    </div>
  )
}

function ScreenshotGrid({ paths }: { paths: string[] }) {
  const [urls, setUrls] = useState<string[]>([])
  useEffect(() => {
    let active = true
    Promise.all(paths.map(screenshotUrl)).then((res) => {
      if (active) setUrls(res.filter((u): u is string => Boolean(u)))
    })
    return () => {
      active = false
    }
  }, [paths])
  if (paths.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {urls.map((u, i) => (
        <a key={i} href={u} target="_blank" rel="noreferrer" className="block">
          <img src={u} alt="trade screenshot" className="size-24 rounded-md border border-hairline object-cover transition-opacity hover:opacity-80" />
        </a>
      ))}
    </div>
  )
}

/**
 * Inner body, mounted only while the dialog is open and keyed by trade id, so its
 * edit/confirm/error state resets cleanly per trade (no synchronizing effect needed).
 */
function DetailBody({
  trade,
  strategies,
  currency,
  onClose,
}: {
  trade: Trade
  strategies: Strategy[]
  currency: string
  onClose: () => void
}) {
  const { user } = useAuth()
  const { update, remove } = useTradeMutations()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const strategyName = trade.strategy_id
    ? strategies.find((s) => s.id === trade.strategy_id)?.name ?? null
    : null
  const net = netPnl(trade)
  const long = trade.direction === "long"

  async function handleEdit({ values, files, keepScreenshots }: TradeFormSubmit) {
    setError(null)
    setSubmitting(true)
    try {
      const uploaded = files.length && user ? await uploadScreenshots(user.id, files) : []
      await update.mutateAsync({
        id: trade.id,
        patch: { ...values, screenshots: [...keepScreenshots, ...uploaded] },
      })
      setEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    setError(null)
    try {
      await remove.mutateAsync(trade.id)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-display">
          <span className="font-mono">{trade.ticker}</span>
          <Badge variant="outline" className={cn(long ? "border-pos/40 text-pos" : "border-neg/40 text-neg")}>
            {trade.direction}
          </Badge>
          {trade.status === "open" ? (
            <Badge variant="outline" className="border-warn/40 text-warn">open</Badge>
          ) : null}
        </DialogTitle>
        <DialogDescription>
          {strategyName ?? trade.setup ?? "Unlabeled setup"} · {fmtDateTime(trade.entry_at)}
        </DialogDescription>
      </DialogHeader>

      {editing ? (
        <TradeForm
          strategies={strategies}
          initial={trade}
          existingScreenshots={trade.screenshots}
          submitting={submitting}
          error={error}
          submitLabel="Save changes"
          onSubmit={handleEdit}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            <Metric label="Net P&L" value={fmtSignedMoney(net, currency)} valueClass={pnlClass(net)} />
            <Metric label="Return" value={fmtPct(returnPct(trade))} valueClass={pnlClass(returnPct(trade))} />
            <Metric label="R-multiple" value={fmtR(realizedR(trade))} valueClass={pnlClass(realizedR(trade))} />
            <Metric label="Planned R:R" value={plannedRR(trade) != null ? fmtNum(plannedRR(trade)) : "—"} />
            <Metric label="Entry" value={fmtNum(trade.entry_price)} />
            <Metric label="Exit" value={trade.exit_price != null ? fmtNum(trade.exit_price) : "—"} />
            <Metric label="Qty" value={fmtNum(trade.quantity)} />
            <Metric label="Stop" value={trade.stop_price != null ? fmtNum(trade.stop_price) : "—"} />
            <Metric label="Target" value={trade.target_price != null ? fmtNum(trade.target_price) : "—"} />
            <Metric label="Risk/unit" value={riskPerUnit(trade) != null ? fmtNum(riskPerUnit(trade)) : "—"} />
            <Metric label="Gross / fees" value={`${fmtNum(grossPnl(trade))} / ${fmtNum(trade.fees)}`} />
            <Metric label="Held" value={fmtDuration(holdingPeriodMs(trade))} />
          </div>

          {(trade.tags.length > 0 || trade.mistakes.length > 0 || trade.catalyst || trade.confidence) && (
            <div className="flex flex-wrap gap-1.5">
              {trade.confidence ? (
                <span className="rounded-full border border-hairline px-2 py-0.5 text-[11px] text-text-secondary">conviction {trade.confidence}/5</span>
              ) : null}
              {trade.catalyst ? (
                <span className="rounded-full border border-hairline px-2 py-0.5 text-[11px] text-text-secondary">{trade.catalyst}</span>
              ) : null}
              {trade.tags.map((t) => (
                <span key={t} className="rounded-full border border-violet/30 bg-violet/10 px-2 py-0.5 text-[11px] text-brand">{t}</span>
              ))}
              {trade.mistakes.map((m) => (
                <span key={m} className="rounded-full border border-neg/30 bg-neg/10 px-2 py-0.5 text-[11px] text-neg">{m}</span>
              ))}
            </div>
          )}

          {(trade.plan_notes || trade.review_notes) && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {trade.plan_notes ? (
                <div>
                  <p className="micro-label mb-1">Plan</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{trade.plan_notes}</p>
                </div>
              ) : null}
              {trade.review_notes ? (
                <div>
                  <p className="micro-label mb-1">Review</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{trade.review_notes}</p>
                </div>
              ) : null}
            </div>
          )}

          {trade.screenshots.length > 0 ? (
            <div>
              <p className="micro-label mb-1.5">Screenshots</p>
              <ScreenshotGrid paths={trade.screenshots} />
            </div>
          ) : null}

          {trade.research_session_id ? (
            <Link
              to={`/research/${trade.research_session_id}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              View the analyst report for {trade.ticker}
              <ExternalLink className="size-3.5" />
            </Link>
          ) : null}

          <AiTradeReview trade={trade} />

          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
          ) : null}

          <div className="flex items-center gap-2 border-t border-hairline pt-4">
            <Button variant="outline" onClick={() => setEditing(true)} className="gap-2">
              <Pencil className="size-3.5" />
              Edit
            </Button>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={remove.isPending}>
                  {remove.isPending ? "Deleting…" : "Confirm delete"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              </div>
            ) : (
              <Button variant="ghost" onClick={() => setConfirmDelete(true)} className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export function TradeDetailDialog({
  trade,
  strategies,
  open,
  onOpenChange,
  currency = "USD",
}: {
  trade: Trade | null
  strategies: Strategy[]
  open: boolean
  onOpenChange: (open: boolean) => void
  currency?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="custom-scrollbar max-h-[92vh] overflow-y-auto border-hairline-strong bg-background sm:max-w-2xl">
        {trade ? (
          <DetailBody
            key={trade.id}
            trade={trade}
            strategies={strategies}
            currency={currency}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
