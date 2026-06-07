import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { AdminEmpty, AdminError, AdminLoading, PlanBadge } from "@/components/admin/widgets"
import { Input } from "@/components/ui/input"
import { useAdminUsers } from "@/hooks/useAdmin"
import { fmtDate, fmtDateTime } from "@/lib/journal/format"

const TH = "micro-label px-3 py-2.5 font-normal"
const TD = "px-3 py-2.5"

export function AdminUsersTable() {
  const { data: users = [], isLoading, error } = useAdminUsers()
  const [q, setQ] = useState("")
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return users
    return users.filter((u) => (u.email ?? "").toLowerCase().includes(needle))
  }, [users, q])

  if (isLoading) return <AdminLoading label="Loading users…" />
  if (error) return <AdminError message={(error as Error).message} />

  return (
    <div className="space-y-3">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by email…"
        className="max-w-xs border-hairline bg-transparent"
      />
      {filtered.length === 0 ? (
        <AdminEmpty message="No users match." />
      ) : (
        <div className="custom-scrollbar overflow-x-auto rounded-xl border border-hairline">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-hairline text-left">
                {["User", "Plan", "Role", "Trades", "Runs", "Last seen", "Joined"].map((h) => (
                  <th key={h} className={TH}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => navigate(`/admin/users/${u.id}`)}
                  className="cursor-pointer border-b border-hairline/60 transition-colors last:border-0 hover:bg-surface/50"
                >
                  <td className={TD}>
                    <span className="font-mono text-text-primary">{u.email ?? "—"}</span>
                  </td>
                  <td className={TD}>
                    <PlanBadge plan={u.plan} />
                  </td>
                  <td className={TD}>
                    {u.role ? (
                      <span className="font-mono text-[11px] text-brand">{u.role}</span>
                    ) : (
                      <span className="text-text-secondary/50">—</span>
                    )}
                  </td>
                  <td className={`${TD} font-mono text-text-secondary`}>{u.trades}</td>
                  <td className={`${TD} font-mono text-text-secondary`}>{u.runs}</td>
                  <td className={`${TD} whitespace-nowrap text-text-secondary`}>
                    {fmtDateTime(u.last_sign_in_at)}
                  </td>
                  <td className={`${TD} whitespace-nowrap text-text-secondary`}>
                    {fmtDate(u.created_at)}
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
