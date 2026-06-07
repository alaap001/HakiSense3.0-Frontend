import { useMemo, useState } from "react"
import { Loader2, NotebookPen, Plus } from "lucide-react"

import { AddTradeDialog } from "@/components/journal/AddTradeDialog"
import { CalendarHeatmap } from "@/components/journal/CalendarHeatmap"
import { EquityCurve } from "@/components/journal/EquityCurve"
import { JournalFilters } from "@/components/journal/JournalFilters"
import { PerformanceBreakdowns } from "@/components/journal/PerformanceBreakdowns"
import { RDistribution } from "@/components/journal/RDistribution"
import { StatsOverview } from "@/components/journal/StatsOverview"
import { StrategyManager } from "@/components/journal/StrategyManager"
import { TradeBlotter } from "@/components/journal/TradeBlotter"
import { TradeDetailDialog } from "@/components/journal/TradeDetailDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTrades } from "@/hooks/useJournal"
import { useStrategies } from "@/hooks/useStrategies"
import {
  applyFilters,
  DEFAULT_FILTERS,
  type JournalFilterState,
} from "@/lib/journal/filters"
import { computeStats } from "@/lib/journal/metrics"
import { isSupabaseConfigured } from "@/lib/supabase"
import type { Trade } from "@/types/journal"

const triggerClass =
  "rounded-full border border-hairline bg-transparent px-3 py-1.5 text-xs text-text-secondary data-[state=active]:border-violet data-[state=active]:bg-violet/15 data-[state=active]:text-brand-strong data-[state=active]:shadow-none"

export default function Journal() {
  const { data: trades = [], isLoading } = useTrades()
  const { data: strategies = [] } = useStrategies()
  const [filters, setFilters] = useState<JournalFilterState>(DEFAULT_FILTERS)
  const [selected, setSelected] = useState<Trade | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  const stats = useMemo(() => computeStats(trades), [trades])
  const filtered = useMemo(() => applyFilters(trades, filters), [trades, filters])
  // keep the open detail dialog in sync with edits (react-query refetches the list)
  const selectedLive = useMemo(
    () => (selected ? trades.find((t) => t.id === selected.id) ?? selected : null),
    [selected, trades],
  )

  function openTrade(t: Trade) {
    setSelected(t)
    setDetailOpen(true)
  }

  return (
    <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="micro-label flex items-center gap-1.5">
            <NotebookPen className="size-3.5" />
            Trade Journal
            <Badge variant="outline" className="ml-1 border-pos/40 text-pos">Free</Badge>
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-text-primary">
            Your trades, <span className="text-gradient">measured.</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
            Log every trade with its plan and execution. Win rate, expectancy, R-multiples and
            drawdown are computed automatically — discipline you can see.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="btn-primary gap-2 text-white">
          <Plus className="size-4" />
          Log trade
        </Button>
      </div>

      {!isSupabaseConfigured ? (
        <div className="mt-10 rounded-xl border border-hairline bg-panel p-6 text-sm text-text-secondary">
          Sign in to use the journal — your trades are stored privately to your account.
        </div>
      ) : isLoading ? (
        <div className="mt-10 flex items-center gap-3 text-text-secondary">
          <Loader2 className="size-5 animate-spin text-brand" />
          <span className="font-mono text-sm">Loading your journal…</span>
        </div>
      ) : (
        <Tabs defaultValue="Overview" className="mt-8 gap-5">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1.5 bg-transparent p-0">
            {["Overview", "Trades", "Analytics"].map((t) => (
              <TabsTrigger key={t} value={t} className={triggerClass}>{t}</TabsTrigger>
            ))}
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="Overview" className="space-y-5">
            <StatsOverview stats={stats} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <EquityCurve trades={trades} />
              <CalendarHeatmap trades={trades} />
            </div>
            <div>
              <p className="micro-label mb-2">Recent trades</p>
              <TradeBlotter trades={trades.slice(0, 8)} strategies={strategies} onSelect={openTrade} />
            </div>
          </TabsContent>

          {/* TRADES */}
          <TabsContent value="Trades" className="space-y-4">
            <JournalFilters value={filters} onChange={setFilters} strategies={strategies} />
            <p className="text-xs text-text-secondary/60">
              {filtered.length} of {trades.length} trades
            </p>
            <TradeBlotter trades={filtered} strategies={strategies} onSelect={openTrade} />
          </TabsContent>

          {/* ANALYTICS */}
          <TabsContent value="Analytics" className="space-y-5">
            <StatsOverview stats={stats} />
            <EquityCurve trades={trades} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <RDistribution trades={trades} />
              <CalendarHeatmap trades={trades} />
            </div>
            <PerformanceBreakdowns trades={trades} strategies={strategies} />
            <StrategyManager />
          </TabsContent>
        </Tabs>
      )}

      <AddTradeDialog open={addOpen} onOpenChange={setAddOpen} strategies={strategies} />
      <TradeDetailDialog
        trade={selectedLive}
        strategies={strategies}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
