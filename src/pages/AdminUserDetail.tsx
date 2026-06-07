import type { ReactNode } from "react"
import { ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  GateMark,
  ModeBadge,
  PlanBadge,
  StatusBadge,
} from "@/components/admin/widgets"
import { useAdminUser, useSetPlan } from "@/hooks/useAdmin"
import { fmtDate, fmtDateTime, fmtMoney, fmtR, fmtSignedMoney, pnlClass } from "@/lib/journal/format"
import { netPnl, realizedR } from "@/lib/journal/metrics"
import { cn } from "@/lib/utils"

const TH = "micro-label px-3 py-2.5 font-normal"
const TD = "px-3 py-2.5"

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-10">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="size-3.5" />
        Back to admin
      </Link>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useAdminUser(id)
  const setPlan = useSetPlan()

  if (isLoading)
    return (
      <Wrapper>
        <AdminLoading label="Loading user…" />
      </Wrapper>
    )
  if (error)
    return (
      <Wrapper>
        <AdminError message={(error as Error).message} />
      </Wrapper>
    )
  if (!data) return null

  const { user, trades, strategies, runs } = data
  const nextPlan = user.plan === "pro" ? "free" : "pro"

  return (
    <Wrapper>
      {/* Identity + plan controls */}
      <div className="glass card-glass rounded-2xl border border-hairline p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
                {user.email ?? "Unknown user"}
              </h1>
              <PlanBadge plan={user.plan} />
              {user.role ? (
                <span className="rounded-full border border-violet px-2 py-0.5 text-[11px] text-brand">
                  {user.role}
                </span>
              ) : null}
            </div>
            <p className="mt-2 font-mono text-[11px] text-text-secondary/70">{user.id}</p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-text-secondary">
              <span>Joined {fmtDate(user.created_at)}</span>
              <span>Last seen {fmtDateTime(user.last_sign_in_at)}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <button
              onClick={() => id && setPlan.mutate({ id, plan: nextPlan })}
              disabled={setPlan.isPending}
              className="btn-secondary rounded-full px-4 py-2 text-xs disabled:opacity-60"
            >
              {setPlan.isPending
                ? "Updating…"
                : nextPlan === "pro"
                  ? "Upgrade to Pro"
                  : "Downgrade to Free"}
            </button>
            <span className="text-[10px] text-text-secondary/60">
              Applies on the user's next token refresh
            </span>
            {setPlan.error ? (
              <span className="text-[10px] text-neg">{(setPlan.error as Error).message}</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Research runs */}
      <section className="mt-8">
        <p className="micro-label mb-2">Research runs ({runs.length})</p>
        {runs.length === 0 ? (
          <AdminEmpty message="No research runs." />
        ) : (
          <div className="custom-scrollbar overflow-x-auto rounded-xl border border-hairline">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-hairline text-left">
                  {["Ticker", "Mode", "Status", "Gate", "Cost", "Started"].map((h) => (
                    <th key={h} className={TH}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="border-b border-hairline/60 last:border-0">
                    <td className={`${TD} font-mono font-medium text-text-primary`}>{r.ticker}</td>
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
      </section>

      {/* Trades */}
      <section className="mt-8">
        <p className="micro-label mb-2">Trades ({trades.length})</p>
        {trades.length === 0 ? (
          <AdminEmpty message="No trades logged." />
        ) : (
          <div className="custom-scrollbar overflow-x-auto rounded-xl border border-hairline">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-hairline text-left">
                  {["Ticker", "Dir", "Status", "Entry", "R", "Net P&L"].map((h) => (
                    <th key={h} className={TH}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => {
                  const net = netPnl(t)
                  const r = realizedR(t)
                  return (
                    <tr key={t.id} className="border-b border-hairline/60 last:border-0">
                      <td className={`${TD} font-mono font-medium text-text-primary`}>
                        {t.ticker}
                      </td>
                      <td className={`${TD} capitalize text-text-secondary`}>{t.direction}</td>
                      <td className={`${TD} text-text-secondary`}>{t.status}</td>
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
      </section>

      {/* Strategies */}
      {strategies.length > 0 ? (
        <section className="mt-8">
          <p className="micro-label mb-2">Strategies ({strategies.length})</p>
          <div className="flex flex-wrap gap-2">
            {strategies.map((s) => (
              <span
                key={s.id}
                className="rounded-full border border-hairline px-3 py-1 text-xs text-text-secondary"
              >
                {s.name}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </Wrapper>
  )
}
