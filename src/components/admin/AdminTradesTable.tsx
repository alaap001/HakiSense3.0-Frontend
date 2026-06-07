import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { AdminEmpty, AdminError, AdminLoading } from "@/components/admin/widgets"
import { Input } from "@/components/ui/input"
import { useAdminTrades } from "@/hooks/useAdmin"
import { fmtDate, fmtR, fmtSignedMoney, pnlClass } from "@/lib/journal/format"
import { netPnl, realizedR } from "@/lib/journal/metrics"
import { cn } from "@/lib/utils"

const TH = "micro-label px-3 py-2.5 font-normal"
const TD = "px-3 py-2.5"

export function AdminTradesTable() {
  const { data, isLoading, error } = useAdminTrades({ limit: 200 })
  const [q, setQ] = useState("")
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const trades = data?.trades ?? []
    const needle = q.trim().toLowerCase()
    if (!needle) return trades
    return trades.filter(
      (t) =>
        t.ticker.toLowerCase().includes(needle) ||
        (t.user_email ?? "").toLowerCase().includes(needle),
    )
  }, [data, q])

  if (isLoading) return <AdminLoading label="Loading trades…" />
  if (error) return <AdminError message={(error as Error).message} />

  return (
    <div className="space-y-3">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search ticker or email…"
        className="max-w-xs border-hairline bg-transparent"
      />
      {filtered.length === 0 ? (
        <AdminEmpty message="No trades logged yet." />
      ) : (
        <div className="custom-scrollbar overflow-x-auto rounded-xl border border-hairline">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-hairline text-left">
                {["Ticker", "User", "Dir", "Status", "Entry", "R", "Net P&L"].map((h) => (
                  <th key={h} className={TH}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const net = netPnl(t)
                const r = realizedR(t)
                return (
                  <tr
                    key={t.id}
                    onClick={() => t.user_id && navigate(`/admin/users/${t.user_id}`)}
                    className="cursor-pointer border-b border-hairline/60 transition-colors last:border-0 hover:bg-surface/50"
                  >
                    <td className={`${TD} font-mono font-medium text-text-primary`}>{t.ticker}</td>
                    <td className={`${TD} max-w-[200px] truncate font-mono text-text-secondary`}>
                      {t.user_email ?? "—"}
                    </td>
                    <td className={`${TD} capitalize text-text-secondary`}>{t.direction}</td>
                    <td className={TD}>
                      {t.status === "open" ? (
                        <span className="rounded-full border border-warn/40 px-2 py-0.5 text-[11px] text-warn">
                          open
                        </span>
                      ) : (
                        <span className="text-[11px] text-text-secondary/60">closed</span>
                      )}
                    </td>
                    <td className={`${TD} whitespace-nowrap text-text-secondary`}>
                      {fmtDate(t.entry_at)}
                    </td>
                    <td className={cn(`${TD} font-mono`, pnlClass(r))}>{fmtR(r)}</td>
                    <td className={cn(`${TD} text-right font-mono font-medium`, pnlClass(net))}>
                      {fmtSignedMoney(net)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
