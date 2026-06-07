import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Square,
} from "lucide-react"

import { EmptyState } from "@/components/app/EmptyState"
import { LoadingState } from "@/components/app/LoadingState"
import { PageHeader } from "@/components/app/PageHeader"
import { PageShell } from "@/components/app/PageShell"
import { UsageStrip } from "@/components/billing/UsageStrip"
import { Pill } from "@/components/app/controls"
import { TickerCombobox } from "@/components/search/TickerCombobox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { useResearchRun } from "@/hooks/useResearchRun"
import { listRuns } from "@/lib/agentos"
import type { ResearchRequest, RunListItem } from "@/types/api"

type Mode = "intake" | "scope" | "full"

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "intake", label: "Intake only", hint: "no LLM · no Qdrant" },
  { id: "scope", label: "Scope + thesis", hint: "LLM · no Qdrant" },
  { id: "full", label: "Full dossier", hint: "LLM + Qdrant · minutes" },
]

function toRequest(ticker: string, mode: Mode): ResearchRequest {
  if (mode === "intake") return { ticker, intake_only: true }
  if (mode === "scope") return { ticker, phases: [] }
  return { ticker } // full: phases omitted -> backend runs all four waves
}

export default function Dashboard() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const { phase, sessionId, currentStep, feed, run, error, limitReached, start, cancel } =
    useResearchRun(getToken)
  const [ticker, setTicker] = useState("")
  const [mode, setMode] = useState<Mode>("intake")
  const [searchParams, setSearchParams] = useSearchParams()

  const running = phase === "running"

  // Prefill the ticker from ?ticker= (set by the search palette / public search),
  // then clear the param so it doesn't linger or re-fire.
  useEffect(() => {
    const t = searchParams.get("ticker")
    if (t) {
      // Sync the input to the URL (set by the search palette). It must stay an
      // effect so a new ?ticker= prefills even while already on /dashboard.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTicker(t.toUpperCase())
      searchParams.delete("ticker")
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const runs = useQuery({
    queryKey: ["runs"],
    queryFn: async () => listRuns(await getToken()),
  })

  // Refresh the history list and the usage snapshot when a run finishes (a first-time full
  // dossier debits a research credit, so the strip/card must re-read GET /api/billing/me).
  useEffect(() => {
    if (phase === "done") {
      queryClient.invalidateQueries({ queryKey: ["runs"] })
      queryClient.invalidateQueries({ queryKey: ["billing", "me"] })
    }
  }, [phase, queryClient])

  // Show meaningful history only: one card per ticker (the API is newest-first, so
  // the first occurrence wins), and only runs that produced a thesis. Intake-only /
  // empty / thesis-less runs have nothing to open, so they're hidden.
  const visibleRuns = useMemo(() => {
    const seen = new Set<string>()
    const out: RunListItem[] = []
    for (const r of runs.data ?? []) {
      if (!r.headline || !r.headline.trim()) continue
      if (seen.has(r.ticker)) continue
      seen.add(r.ticker)
      out.push(r)
    }
    return out
  }, [runs.data])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const t = ticker.trim().toUpperCase()
    if (!t || running) return
    void start(toRequest(t, mode))
  }

  return (
    <PageShell width="narrow">
      <PageHeader
        eyebrow="Equity Research Engine"
        title={
          <>
            Deep research, <span className="text-gradient">not recommendations.</span>
          </>
        }
        subtitle="Enter a ticker and watch the dossier assemble live — thesis, findings, scenarios and risks, each backed by evidence."
      />

      <UsageStrip />

      {/* Run console — relative z-20 lifts it (and the combobox dropdown, which
          overflows the card) above the Recent-runs section below; .card-glass's
          backdrop-filter creates a stacking context that would otherwise trap it. */}
      <Card className="card-glass relative z-20 mt-8 w-full gap-0 py-0">
        <CardContent className="p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {MODES.map((m) => (
              <Pill
                key={m.id}
                active={mode === m.id}
                onClick={() => setMode(m.id)}
                disabled={running}
                title={m.hint}
              >
                {m.label}
              </Pill>
            ))}
          </div>

          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
            onSubmit={onSubmit}
          >
            <TickerCombobox
              value={ticker}
              onChange={(v) => setTicker(v.toUpperCase())}
              disabled={running}
              placeholder="Research a ticker — e.g. AFFLE"
              ariaLabel="Ticker symbol"
              inputClassName="h-12 border-hairline bg-surface pl-10 font-mono text-sm tracking-wide"
            />
            {running ? (
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={cancel}
                className="h-12 shrink-0 gap-2"
              >
                <Square className="size-4" />
                Cancel
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                disabled={!ticker.trim()}
                className="btn-primary h-12 shrink-0 gap-2 text-white"
              >
                Run research
                <ArrowRight className="size-4" />
              </Button>
            )}
          </form>

          <p className="mt-3 font-mono text-[11px] tracking-wide text-text-secondary/70">
            {MODES.find((m) => m.id === mode)?.hint}
            {sessionId ? ` · session ${sessionId.slice(0, 8)}…` : ""}
          </p>

          {/* Live feed */}
          {(running || feed.length > 0) && (
            <div className="mt-4 rounded-xl border border-hairline bg-panel p-3">
              <div className="mb-2 flex items-center gap-2 text-xs text-text-secondary">
                {running ? (
                  <Loader2 className="size-3.5 animate-spin text-brand" />
                ) : (
                  <Activity className="size-3.5 text-brand" />
                )}
                <span className="font-mono">
                  {running ? currentStep || "starting…" : "stream ended"}
                </span>
              </div>
              <div className="custom-scrollbar max-h-48 space-y-1 overflow-y-auto font-mono text-[11px] leading-relaxed">
                {feed.map((f) => (
                  <div key={f.index} className="text-text-secondary/80">
                    <span className="text-brand/70">{f.event}</span>
                    {f.step ? <span className="text-text-secondary"> · {f.step}</span> : null}
                    {f.text ? (
                      <span className="text-text-secondary/70"> — {f.text.slice(0, 160)}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {phase === "error" && error && (
            <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span className="font-mono">{error}</span>
              </div>
              {limitReached && (
                <Link
                  to="/billing"
                  className="mt-2 inline-flex items-center gap-1 font-medium text-brand hover:underline"
                >
                  Upgrade for more research
                  <ArrowRight className="size-3.5" />
                </Link>
              )}
            </div>
          )}

          {/* Result */}
          {phase === "done" && run && (
            <div className="mt-4 rounded-xl border border-violet/30 bg-violet/[0.06] p-4">
              <div className="flex items-center gap-2 text-sm text-text-primary">
                <CheckCircle2 className="size-4 text-brand" />
                <span className="font-display font-semibold">
                  Dossier loaded — {run.ticker}
                </span>
                {run.gate ? (
                  <Badge
                    variant={run.gate.passed ? "secondary" : "destructive"}
                    className="ml-auto"
                  >
                    gate {run.gate.passed ? "passed" : "blocked"}
                  </Badge>
                ) : null}
              </div>
              {run.headline ? (
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {run.headline}
                </p>
              ) : (
                <p className="mt-2 text-xs text-text-secondary/70">
                  No thesis yet (intake-only run) — {run.desk.company?.name ?? run.ticker}
                </p>
              )}
              <Link
                to={`/research/${run.session_id}`}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                View full dossier
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <section className="mt-10">
        <h2 className="micro-label mb-3 flex items-center gap-2">
          <Clock className="size-3.5" />
          Recent runs
        </h2>
        {runs.isLoading ? (
          <LoadingState label="Loading recent runs…" />
        ) : visibleRuns.length > 0 ? (
          <ul className="space-y-2">
            {visibleRuns.map((r) => (
              <li key={r.session_id}>
                <Link
                  to={`/research/${r.session_id}`}
                  className="glass flex items-center gap-3 rounded-xl border border-hairline px-4 py-3 transition-colors hover:border-violet/40"
                >
                  <Badge variant="outline" className="border-violet/40 font-mono text-brand">
                    {r.ticker}
                  </Badge>
                  <span className="line-clamp-1 flex-1 text-sm text-text-secondary">
                    {r.headline}
                  </span>
                  <span className="hidden font-mono text-[11px] text-text-secondary/60 sm:inline">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Clock}
            title="No dossiers yet"
            description="Run a Scope or Full research above and your completed dossiers will appear here."
          />
        )}
      </section>
    </PageShell>
  )
}
