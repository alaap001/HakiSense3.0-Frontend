import type { ReactNode } from "react"

import { AdminError, AdminLoading } from "@/components/admin/widgets"
import { useAdminOverview } from "@/hooks/useAdmin"
import { fmtMoney } from "@/lib/journal/format"

function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="glass rounded-xl border border-hairline px-4 py-3">
      <p className="micro-label">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tracking-tight text-text-primary">
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-[11px] text-text-secondary/70">{sub}</p> : null}
    </div>
  )
}

export function AdminOverview() {
  const { data, isLoading, error } = useAdminOverview()
  if (isLoading) return <AdminLoading label="Loading metrics…" />
  if (error) return <AdminError message={(error as Error).message} />
  if (!data) return null
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat
        label="Users"
        value={data.users.total}
        sub={`${data.users.pro} pro · ${data.users.free} free`}
      />
      <Stat
        label="Trades"
        value={data.trades.total}
        sub={`${data.trades.open} open · ${data.trades.closed} closed`}
      />
      <Stat
        label="Research runs"
        value={data.runs.total}
        sub={`${data.runs.completed} done · ${data.runs.failed} failed · ${data.runs.running} live`}
      />
      <Stat label="Research spend" value={fmtMoney(data.budget_spent_usd)} sub="total LLM cost" />
    </div>
  )
}
