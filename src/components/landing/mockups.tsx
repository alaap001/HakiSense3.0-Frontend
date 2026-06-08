import {
  ArrowUpRight,
  Check,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Presentational product mockups for the marketing landing page. Pure markup + SVG —
 * no data, no fetching, no new dependencies. They exist to *show* the product (a dossier,
 * the per-stock chat, the journal) inside the hero and the feature spotlights, so a first
 * time visitor sees what they're signing up for before they click.
 */

/** A miniature research dossier — company header, thesis pillars, a cited finding. */
export function DossierMock({ className }: { className?: string }) {
  return (
    <div className={cn("card-glass w-[20rem] max-w-full overflow-hidden rounded-2xl p-5", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-brand/12 font-display text-xs font-bold text-brand">
            RI
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold text-text-primary">RELIANCE</p>
            <p className="font-mono text-[10px] text-text-secondary">Oil &amp; Gas · NSE</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-brand">
          <ShieldCheck className="size-2.5" />
          Report
        </span>
      </div>

      <p className="mt-4 font-display text-[13px] font-semibold leading-snug text-text-primary">
        Three pillars decide the next re-rating — and two are already cracking.
      </p>

      <div className="mt-4 space-y-2.5">
        {[
          { label: "New-energy capex funded", val: 82, tone: "pos" as const },
          { label: "Retail margin durable", val: 64, tone: "spark" as const },
          { label: "Telco ARPU inflects", val: 38, tone: "neg" as const },
        ].map((p) => (
          <div key={p.label}>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-text-secondary">{p.label}</span>
              <span className="font-mono text-text-secondary/70">{p.val}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-strong">
              <div
                className={cn(
                  "h-full rounded-full",
                  p.tone === "pos" && "bg-pos",
                  p.tone === "spark" && "bg-spark",
                  p.tone === "neg" && "bg-neg",
                )}
                style={{ width: `${p.val}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-hairline bg-surface p-2.5">
        <span className="mt-0.5 rounded bg-pos/15 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase text-pos">
          Bull
        </span>
        <p className="text-[10px] leading-relaxed text-text-secondary">
          Gross debt down 11% YoY; coverage now 6.4×.
          <span className="ml-1 inline-flex items-center gap-0.5 font-mono text-[9px] text-brand">
            <FileText className="size-2.5" /> FY24 AR · p.142
          </span>
        </p>
      </div>
    </div>
  )
}

/** The per-stock chatbot — a short, cited Q&A exchange. */
export function ChatMock({ className }: { className?: string }) {
  return (
    <div className={cn("card-glass w-[19rem] max-w-full overflow-hidden rounded-2xl p-4", className)}>
      <div className="flex items-center gap-2 border-b border-hairline pb-3">
        <span className="grid size-7 place-items-center rounded-lg bg-sky/15 text-sky">
          <Sparkles className="size-3.5" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-xs font-semibold text-text-primary">Ask TCS</p>
          <p className="font-mono text-[9px] text-text-secondary">grounded in its filings</p>
        </div>
        <span className="ml-auto flex items-center gap-1 font-mono text-[9px] text-pos">
          <span className="size-1.5 animate-pulse-glow rounded-full bg-pos" />
          live
        </span>
      </div>

      <div className="mt-3 space-y-2.5">
        <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-brand/12 px-3 py-2 text-[11px] text-text-primary">
          Is deal TCV growth keeping up with attrition?
        </div>
        <div className="w-fit max-w-[88%] rounded-2xl rounded-bl-sm border border-hairline bg-surface px-3 py-2 text-[11px] leading-relaxed text-text-secondary">
          TCV rose 23% YoY while attrition cooled to 12.1% — the gap is closing.
          <span className="mt-1.5 flex w-fit items-center gap-1 rounded-md bg-sky/12 px-1.5 py-0.5 font-mono text-[8px] text-sky">
            <FileText className="size-2.5" /> Q4 transcript · CFO remarks
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5">
        <span className="flex-1 truncate text-[10px] text-text-secondary/70">Ask anything…</span>
        <span className="grid size-5 place-items-center rounded-full bg-brand text-white">
          <ArrowUpRight className="size-3" />
        </span>
      </div>
    </div>
  )
}

/** The free trade journal — a rising equity curve and two headline stats. */
export function JournalMock({ className }: { className?: string }) {
  return (
    <div className={cn("card-glass w-[20rem] max-w-full overflow-hidden rounded-2xl p-5", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-pos/15 text-pos">
            <TrendingUp className="size-3.5" />
          </span>
          <p className="font-display text-sm font-semibold text-text-primary">Your journal</p>
        </div>
        <span className="rounded-full border border-pos/30 bg-pos/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-pos">
          Free
        </span>
      </div>

      <svg viewBox="0 0 280 96" className="mt-4 h-24 w-full" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--pos))" stopOpacity="0.28" />
            <stop offset="100%" stopColor="hsl(var(--pos))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 78 L28 72 L56 76 L84 58 L112 62 L140 44 L168 48 L196 30 L224 34 L252 16 L280 10 L280 96 L0 96 Z"
          fill="url(#equityFill)"
        />
        <path
          d="M0 78 L28 72 L56 76 L84 58 L112 62 L140 44 L168 48 L196 30 L224 34 L252 16 L280 10"
          fill="none"
          stroke="hsl(var(--pos))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-hairline bg-surface p-2.5">
          <p className="font-mono text-[9px] uppercase tracking-wider text-text-secondary">Win rate</p>
          <p className="mt-0.5 font-display text-lg font-bold text-text-primary">63%</p>
        </div>
        <div className="rounded-xl border border-hairline bg-surface p-2.5">
          <p className="font-mono text-[9px] uppercase tracking-wider text-text-secondary">Avg R</p>
          <p className="mt-0.5 font-display text-lg font-bold text-pos">+1.8R</p>
        </div>
      </div>
    </div>
  )
}

/**
 * "It reads everything, live" — the walkthrough beat where the agent tears through
 * a company's filings. Shows a short source list streaming from done → reading →
 * queued, so the visitor sees the machine actually working.
 */
export function AgentReadingMock({ className }: { className?: string }) {
  const docs = [
    { name: "Annual Report FY24", meta: "312 pages", state: "done" as const },
    { name: "Q4 Earnings Call", meta: "transcript", state: "done" as const },
    { name: "Investor Presentation", meta: "48 slides", state: "reading" as const },
    { name: "Credit Rating Note", meta: "ICRA", state: "queued" as const },
  ]
  return (
    <div className={cn("card-glass w-[20rem] max-w-full overflow-hidden rounded-2xl p-5", className)}>
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-brand/12 text-brand">
            <Loader2 className="size-3.5 animate-spin" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold text-text-primary">Reading RELIANCE</p>
            <p className="font-mono text-[9px] text-text-secondary">12 lenses · live</p>
          </div>
        </div>
        <span className="flex items-center gap-1 font-mono text-[9px] text-pos">
          <span className="size-1.5 animate-pulse-glow rounded-full bg-pos" />
          live
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {docs.map((d) => (
          <div key={d.name} className="flex items-center gap-2.5 rounded-xl border border-hairline bg-surface px-3 py-2">
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-lg",
                d.state === "done" && "bg-pos/15 text-pos",
                d.state === "reading" && "bg-brand/12 text-brand",
                d.state === "queued" && "bg-surface-strong text-text-secondary/60",
              )}
            >
              {d.state === "done" ? (
                <Check className="size-3" />
              ) : d.state === "reading" ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <FileText className="size-3" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-text-primary">{d.name}</p>
              {d.state === "reading" ? (
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-strong">
                  <div className="h-full w-3/5 animate-pulse-glow rounded-full bg-brand" />
                </div>
              ) : (
                <p className="font-mono text-[9px] text-text-secondary">{d.meta}</p>
              )}
            </div>
            <span className="font-mono text-[8px] uppercase tracking-wider text-text-secondary/60">
              {d.state}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 font-mono text-[9px] text-text-secondary">
        …cross-checking footnotes &amp; related-party tables
      </p>
    </div>
  )
}
