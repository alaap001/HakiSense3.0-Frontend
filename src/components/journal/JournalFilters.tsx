import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import type { JournalFilterState } from "@/lib/journal/filters"
import type { Strategy } from "@/types/journal"

const selectClass =
  "h-9 rounded-md border border-input bg-transparent px-2.5 text-sm text-text-primary outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>option]:bg-popover"

export function JournalFilters({
  value,
  onChange,
  strategies,
}: {
  value: JournalFilterState
  onChange: (next: JournalFilterState) => void
  strategies: Strategy[]
}) {
  const set = (patch: Partial<JournalFilterState>) => onChange({ ...value, ...patch })
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-secondary/60" />
        <Input
          value={value.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Ticker or setup…"
          className="h-9 w-44 pl-8 font-mono text-xs uppercase"
        />
      </div>
      <select className={selectClass} value={value.direction} onChange={(e) => set({ direction: e.target.value as JournalFilterState["direction"] })}>
        <option value="all">All sides</option>
        <option value="long">Long</option>
        <option value="short">Short</option>
      </select>
      <select className={selectClass} value={value.status} onChange={(e) => set({ status: e.target.value as JournalFilterState["status"] })}>
        <option value="all">All status</option>
        <option value="closed">Closed</option>
        <option value="open">Open</option>
      </select>
      <select className={selectClass} value={value.strategyId} onChange={(e) => set({ strategyId: e.target.value })}>
        <option value="all">All strategies</option>
        {strategies.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
  )
}
