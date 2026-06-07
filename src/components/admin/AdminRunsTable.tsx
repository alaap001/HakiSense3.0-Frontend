import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  GateMark,
  ModeBadge,
  StatusBadge,
} from "@/components/admin/widgets"
import { Input } from "@/components/ui/input"
import { useAdminRuns } from "@/hooks/useAdmin"
import { fmtDateTime, fmtMoney } from "@/lib/journal/format"
import type { RunStatus } from "@/types/admin"

const TH = "micro-label px-3 py-2.5 font-normal"
const TD = "px-3 py-2.5"
const STATUSES: Array<"all" | RunStatus> = ["all", "completed", "running", "failed"]

export function AdminRunsTable() {
  const { data, isLoading, error } = useAdminRuns({ limit: 200 })
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"all" | RunStatus>("all")
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const runs = data?.runs ?? []
    const needle = q.trim().toLowerCase()
    return runs.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (!needle ||
          r.ticker.toLowerCase().includes(needle) ||
          (r.user_email ?? "").toLowerCase().includes(needle)),
    )
  }, [data, q, status])

  if (isLoading) return <AdminLoading label="Loading research runs…" />
  if (error) return <AdminError message={(error as Error).message} />

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ticker or email…"
          className="max-w-xs border-hairline bg-transparent"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "all" | RunStatus)}
          className="rounded-full border border-hairline bg-transparent px-3 py-2 text-xs text-text-secondary"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s}
            </option>
          ))}
        </select>
      </div>
      {filtered.length === 0 ? (
        <AdminEmpty message="No research runs recorded yet." />
      ) : (
        <div className="custom-scrollbar overflow-x-auto rounded-xl border border-hairline">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-hairline text-left">
                {["Ticker", "User", "Mode", "Status", "Gate", "Cost", "Started"].map((h) => (
                  <th key={h} className={TH}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => r.user_id && navigate(`/admin/users/${r.user_id}`)}
                  className="cursor-pointer border-b border-hairline/60 transition-colors last:border-0 hover:bg-surface/50"
                >
                  <td className={TD}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-text-primary">{r.ticker}</span>
                      {r.cached ? (
                        <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-text-secondary/70">
                          cached
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className={`${TD} max-w-[200px] truncate font-mono text-text-secondary`}>
                    {r.user_email ?? "—"}
                  </td>
                  <td className={TD}>
                    <ModeBadge mode={r.mode} />
                  </td>
                  <td className={TD}>
                    <StatusBadge status={r.status} />
                  </td>
                  <td className={`${TD} font-mono`}>
                    <GateMark passed={r.gate_passed} />
                  </td>
                  <td className={`${TD} font-mono text-text-secondary`}>
                    {r.budget_spent_usd == null ? "—" : fmtMoney(r.budget_spent_usd)}
                  </td>
                  <td className={`${TD} whitespace-nowrap text-text-secondary`}>
                    {fmtDateTime(r.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
