import { useMemo, useState, type FormEvent, type ReactNode } from "react"
import { ImagePlus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isoToLocalInput, localInputToIso } from "@/lib/journal/format"
import { cn } from "@/lib/utils"
import type {
  AssetType,
  MarketCondition,
  NewTrade,
  Strategy,
  Timeframe,
  TradeDirection,
  TradeStatus,
} from "@/types/journal"

/** All trade fields except the resolved `screenshots` (the parent uploads files → paths). */
export type TradeFormValues = Omit<NewTrade, "screenshots">

export interface TradeFormSubmit {
  values: TradeFormValues
  /** New screenshot files to upload. */
  files: File[]
  /** Existing screenshot paths to keep (edit mode). */
  keepScreenshots: string[]
}

interface Props {
  strategies: Strategy[]
  initial?: Partial<TradeFormValues>
  existingScreenshots?: string[]
  submitting?: boolean
  error?: string | null
  submitLabel?: string
  onSubmit: (out: TradeFormSubmit) => void
  onCancel?: () => void
}

type State = {
  ticker: string
  asset_type: AssetType
  direction: TradeDirection
  status: TradeStatus
  strategy_id: string
  setup: string
  entry_at: string
  exit_at: string
  entry_price: string
  exit_price: string
  quantity: string
  stop_price: string
  target_price: string
  fees: string
  confidence: string
  timeframe: string
  market_condition: string
  catalyst: string
  tags: string
  mistakes: string
  plan_notes: string
  review_notes: string
}

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-text-primary outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>option]:bg-popover"

const num = (s: string): number | null => {
  const t = s.trim()
  if (t === "") return null
  const v = Number(t)
  return Number.isFinite(v) ? v : null
}

const list = (s: string): string[] =>
  s.split(",").map((x) => x.trim()).filter(Boolean)

function nowLocal(): string {
  return isoToLocalInput(new Date().toISOString())
}

function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string
  htmlFor?: string
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-text-secondary">
        {label}
        {hint ? <span className="text-text-secondary/50"> · {hint}</span> : null}
      </Label>
      {children}
    </div>
  )
}

export function TradeForm({
  strategies,
  initial,
  existingScreenshots = [],
  submitting = false,
  error,
  submitLabel = "Save trade",
  onSubmit,
  onCancel,
}: Props) {
  const [s, setS] = useState<State>(() => ({
    ticker: initial?.ticker ?? "",
    asset_type: initial?.asset_type ?? "equity",
    direction: initial?.direction ?? "long",
    status: initial?.status ?? "closed",
    strategy_id: initial?.strategy_id ?? "",
    setup: initial?.setup ?? "",
    entry_at: initial?.entry_at ? isoToLocalInput(initial.entry_at) : nowLocal(),
    exit_at: initial?.exit_at ? isoToLocalInput(initial.exit_at) : "",
    entry_price: initial?.entry_price?.toString() ?? "",
    exit_price: initial?.exit_price?.toString() ?? "",
    quantity: initial?.quantity?.toString() ?? "",
    stop_price: initial?.stop_price?.toString() ?? "",
    target_price: initial?.target_price?.toString() ?? "",
    fees: initial?.fees?.toString() ?? "",
    confidence: initial?.confidence?.toString() ?? "",
    timeframe: initial?.timeframe ?? "",
    market_condition: initial?.market_condition ?? "",
    catalyst: initial?.catalyst ?? "",
    tags: (initial?.tags ?? []).join(", "),
    mistakes: (initial?.mistakes ?? []).join(", "),
    plan_notes: initial?.plan_notes ?? "",
    review_notes: initial?.review_notes ?? "",
  }))
  const [files, setFiles] = useState<File[]>([])
  const [keep, setKeep] = useState<string[]>(existingScreenshots)
  const [localError, setLocalError] = useState<string | null>(null)

  const set = <K extends keyof State>(k: K, v: State[K]) => setS((p) => ({ ...p, [k]: v }))

  // live risk / reward preview
  const preview = useMemo(() => {
    const entry = num(s.entry_price)
    const stop = num(s.stop_price)
    const target = num(s.target_price)
    const qty = num(s.quantity)
    if (entry == null || stop == null || entry === stop) return null
    const risk = Math.abs(entry - stop)
    const rr = target != null ? Math.abs(target - entry) / risk : null
    const riskAmt = qty != null ? risk * qty : null
    return { risk, rr, riskAmt }
  }, [s.entry_price, s.stop_price, s.target_price, s.quantity])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLocalError(null)
    const ticker = s.ticker.trim().toUpperCase()
    const entry = num(s.entry_price)
    const qty = num(s.quantity)
    const entryIso = localInputToIso(s.entry_at)
    if (!ticker) return setLocalError("Ticker is required.")
    if (entry == null) return setLocalError("Entry price is required.")
    if (qty == null || qty <= 0) return setLocalError("Quantity must be greater than 0.")
    if (!entryIso) return setLocalError("Entry date/time is required.")

    const exit = num(s.exit_price)
    const exitIso = localInputToIso(s.exit_at)
    if (s.status === "closed" && (exit == null || !exitIso)) {
      return setLocalError("A closed trade needs an exit price and exit time.")
    }

    const values: TradeFormValues = {
      ticker,
      asset_type: s.asset_type,
      direction: s.direction,
      status: s.status,
      strategy_id: s.strategy_id || null,
      setup: s.setup.trim() || null,
      entry_at: entryIso,
      exit_at: s.status === "closed" ? exitIso : null,
      entry_price: entry,
      exit_price: s.status === "closed" ? exit : null,
      quantity: qty,
      stop_price: num(s.stop_price),
      target_price: num(s.target_price),
      fees: num(s.fees) ?? 0,
      confidence: num(s.confidence),
      timeframe: (s.timeframe || null) as Timeframe | null,
      market_condition: (s.market_condition || null) as MarketCondition | null,
      catalyst: s.catalyst.trim() || null,
      tags: list(s.tags),
      mistakes: list(s.mistakes),
      plan_notes: s.plan_notes.trim() || null,
      review_notes: s.review_notes.trim() || null,
      research_session_id: initial?.research_session_id ?? null,
    }
    onSubmit({ values, files, keepScreenshots: keep })
  }

  const closed = s.status === "closed"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* instrument */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Ticker" htmlFor="tf-ticker">
          <Input
            id="tf-ticker"
            value={s.ticker}
            onChange={(e) => set("ticker", e.target.value.toUpperCase())}
            placeholder="AAPL"
            className="font-mono uppercase"
          />
        </Field>
        <Field label="Asset">
          <select className={selectClass} value={s.asset_type} onChange={(e) => set("asset_type", e.target.value as AssetType)}>
            <option value="equity">Equity</option>
            <option value="option">Option</option>
            <option value="future">Future</option>
            <option value="crypto">Crypto</option>
            <option value="forex">Forex</option>
          </select>
        </Field>
        <Field label="Direction">
          <select className={selectClass} value={s.direction} onChange={(e) => set("direction", e.target.value as TradeDirection)}>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </Field>
        <Field label="Status">
          <select className={selectClass} value={s.status} onChange={(e) => set("status", e.target.value as TradeStatus)}>
            <option value="closed">Closed</option>
            <option value="open">Open</option>
          </select>
        </Field>
      </div>

      {/* execution */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Entry price">
          <Input type="number" step="any" value={s.entry_price} onChange={(e) => set("entry_price", e.target.value)} placeholder="0.00" />
        </Field>
        <Field label="Quantity">
          <Input type="number" step="any" value={s.quantity} onChange={(e) => set("quantity", e.target.value)} placeholder="100" />
        </Field>
        <Field label="Fees" hint="optional">
          <Input type="number" step="any" value={s.fees} onChange={(e) => set("fees", e.target.value)} placeholder="0" />
        </Field>
        <Field label="Stop" hint="for R">
          <Input type="number" step="any" value={s.stop_price} onChange={(e) => set("stop_price", e.target.value)} placeholder="optional" />
        </Field>
        <Field label="Target" hint="for R:R">
          <Input type="number" step="any" value={s.target_price} onChange={(e) => set("target_price", e.target.value)} placeholder="optional" />
        </Field>
        <Field label="Exit price" hint={closed ? "required" : "n/a (open)"}>
          <Input type="number" step="any" value={s.exit_price} onChange={(e) => set("exit_price", e.target.value)} placeholder="0.00" disabled={!closed} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Entry date/time">
          <Input type="datetime-local" value={s.entry_at} onChange={(e) => set("entry_at", e.target.value)} />
        </Field>
        <Field label="Exit date/time" hint={closed ? "required" : "n/a (open)"}>
          <Input type="datetime-local" value={s.exit_at} onChange={(e) => set("exit_at", e.target.value)} disabled={!closed} />
        </Field>
      </div>

      {/* live R preview */}
      {preview ? (
        <div className="flex flex-wrap gap-4 rounded-lg border border-violet/25 bg-violet/[0.06] px-3 py-2 text-xs">
          <span className="text-text-secondary">
            Risk/unit <span className="font-mono text-text-primary">{preview.risk.toFixed(2)}</span>
          </span>
          {preview.riskAmt != null ? (
            <span className="text-text-secondary">
              Risk <span className="font-mono text-text-primary">{preview.riskAmt.toFixed(2)}</span>
            </span>
          ) : null}
          <span className="text-text-secondary">
            Planned R:R{" "}
            <span className={cn("font-mono", preview.rr != null && preview.rr >= 1.5 ? "text-pos" : "text-text-primary")}>
              {preview.rr != null ? `${preview.rr.toFixed(2)}` : "— (add target)"}
            </span>
          </span>
        </div>
      ) : null}

      {/* context */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Strategy">
          <select className={selectClass} value={s.strategy_id} onChange={(e) => set("strategy_id", e.target.value)}>
            <option value="">— none —</option>
            {strategies.map((st) => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Timeframe">
          <select className={selectClass} value={s.timeframe} onChange={(e) => set("timeframe", e.target.value)}>
            <option value="">—</option>
            <option value="scalp">Scalp</option>
            <option value="intraday">Intraday</option>
            <option value="swing">Swing</option>
            <option value="position">Position</option>
          </select>
        </Field>
        <Field label="Market">
          <select className={selectClass} value={s.market_condition} onChange={(e) => set("market_condition", e.target.value)}>
            <option value="">—</option>
            <option value="trend">Trend</option>
            <option value="range">Range</option>
            <option value="volatile">Volatile</option>
            <option value="news">News</option>
          </select>
        </Field>
        <Field label="Confidence" hint="1–5">
          <select className={selectClass} value={s.confidence} onChange={(e) => set("confidence", e.target.value)}>
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Setup" hint="free label">
          <Input value={s.setup} onChange={(e) => set("setup", e.target.value)} placeholder="e.g. breakout retest" />
        </Field>
        <Field label="Catalyst">
          <Input value={s.catalyst} onChange={(e) => set("catalyst", e.target.value)} placeholder="earnings, news…" />
        </Field>
        <Field label="Tags" hint="comma-separated">
          <Input value={s.tags} onChange={(e) => set("tags", e.target.value)} placeholder="momentum, gap-up" />
        </Field>
        <Field label="Mistakes" hint="comma-separated">
          <Input value={s.mistakes} onChange={(e) => set("mistakes", e.target.value)} placeholder="chased, no stop, oversized" />
        </Field>
      </div>

      {/* journaling */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Plan" hint="what you intended">
          <textarea
            value={s.plan_notes}
            onChange={(e) => set("plan_notes", e.target.value)}
            rows={3}
            placeholder="Thesis, trigger, invalidation…"
            className="custom-scrollbar w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-text-primary outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </Field>
        <Field label="Review" hint="what happened">
          <textarea
            value={s.review_notes}
            onChange={(e) => set("review_notes", e.target.value)}
            rows={3}
            placeholder="Execution, emotions, lessons…"
            className="custom-scrollbar w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-text-primary outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </Field>
      </div>

      {/* screenshots */}
      <div className="space-y-2">
        <Label className="text-text-secondary">Screenshots</Label>
        <div className="flex flex-wrap items-center gap-2">
          {keep.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 rounded-md border border-hairline bg-surface/50 px-2 py-1 text-[11px] text-text-secondary">
              {p.split("/").pop()?.slice(0, 18)}
              <button type="button" onClick={() => setKeep((k) => k.filter((x) => x !== p))} aria-label="Remove">
                <X className="size-3 hover:text-destructive" />
              </button>
            </span>
          ))}
          {files.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-md border border-violet/40 bg-violet/10 px-2 py-1 text-[11px] text-brand">
              {f.name.slice(0, 18)}
              <button type="button" onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))} aria-label="Remove">
                <X className="size-3" />
              </button>
            </span>
          ))}
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-hairline-strong px-2.5 py-1 text-xs text-text-secondary transition-colors hover:border-violet/50 hover:text-text-primary">
            <ImagePlus className="size-3.5" />
            Add
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? [])
                if (picked.length) setFiles((fs) => [...fs, ...picked])
                e.target.value = ""
              }}
            />
          </label>
        </div>
      </div>

      {(localError || error) && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {localError || error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting} className="btn-primary text-white">
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  )
}
