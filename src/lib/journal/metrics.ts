/**
 * Pure trade-journal math. No React, no I/O — every function takes plain data
 * and returns a number (or null when undefined). These power the free analytics
 * layer; the backend never computes P&L for the UI.
 *
 * Conventions:
 *  - `direction` sign: long = +1, short = -1.
 *  - "R" (R-multiple) = profit-per-unit ÷ risk-per-unit, where risk = |entry − stop|.
 *  - A metric returns `null` when its inputs are missing (e.g. R with no stop,
 *    P&L on an open trade) rather than 0, so callers can render "—".
 */
import type { Trade } from "@/types/journal"

export function directionSign(direction: Trade["direction"]): 1 | -1 {
  return direction === "short" ? -1 : 1
}

function isClosed(t: Trade): t is Trade & { exit_price: number; exit_at: string } {
  return t.status === "closed" && t.exit_price != null
}

/** Risk per unit/share = |entry − stop|. Null when no stop was recorded. */
export function riskPerUnit(t: Trade): number | null {
  if (t.stop_price == null) return null
  return Math.abs(t.entry_price - t.stop_price)
}

/** Planned reward:risk before the trade = |target − entry| / |entry − stop|. */
export function plannedRR(t: Trade): number | null {
  const risk = riskPerUnit(t)
  if (risk == null || risk === 0 || t.target_price == null) return null
  return Math.abs(t.target_price - t.entry_price) / risk
}

/** Gross P&L in account currency. Null while the trade is open. */
export function grossPnl(t: Trade): number | null {
  if (!isClosed(t)) return null
  return (t.exit_price - t.entry_price) * t.quantity * directionSign(t.direction)
}

/** Net P&L after fees. Null while the trade is open. */
export function netPnl(t: Trade): number | null {
  const gross = grossPnl(t)
  return gross == null ? null : gross - t.fees
}

/** Return on the position's notional (net P&L ÷ entry notional). */
export function returnPct(t: Trade): number | null {
  const net = netPnl(t)
  const notional = t.entry_price * t.quantity
  if (net == null || notional === 0) return null
  return net / notional
}

/** Realized R-multiple (sign-aware). Null without a stop or while open. */
export function realizedR(t: Trade): number | null {
  const risk = riskPerUnit(t)
  if (!isClosed(t) || risk == null || risk === 0) return null
  const profitPerUnit = (t.exit_price - t.entry_price) * directionSign(t.direction)
  return profitPerUnit / risk
}

/** Holding period in milliseconds. Null while open. */
export function holdingPeriodMs(t: Trade): number | null {
  if (t.exit_at == null) return null
  return new Date(t.exit_at).getTime() - new Date(t.entry_at).getTime()
}

/** True/false win, or null while open. Breakeven (net === 0) counts as not-a-win. */
export function isWin(t: Trade): boolean | null {
  const net = netPnl(t)
  return net == null ? null : net > 0
}

export interface JournalStats {
  total: number
  open: number
  closed: number
  grossPnl: number
  netPnl: number
  fees: number
  wins: number
  losses: number
  breakeven: number
  /** Win rate over decided (non-breakeven) closed trades, 0–1. */
  winRate: number
  avgWin: number
  /** Average loss, expressed as a negative number. */
  avgLoss: number
  /** Σwins / |Σlosses|. Null when there are no losses. */
  profitFactor: number | null
  /** Expected $ per closed trade. */
  expectancy: number
  /** Σ realized R over trades that have a stop. */
  totalR: number
  /** Average realized R per R-bearing trade. Null when none have a stop. */
  avgR: number | null
  /** Most negative peak-to-trough swing on the cumulative net-P&L curve (≤ 0). */
  maxDrawdown: number
  /** Largest / smallest single net P&L. */
  bestTrade: number
  worstTrade: number
  /** +n consecutive wins, −n consecutive losses, counting back from the latest exit. */
  currentStreak: number
}

const EMPTY_STATS: JournalStats = {
  total: 0,
  open: 0,
  closed: 0,
  grossPnl: 0,
  netPnl: 0,
  fees: 0,
  wins: 0,
  losses: 0,
  breakeven: 0,
  winRate: 0,
  avgWin: 0,
  avgLoss: 0,
  profitFactor: null,
  expectancy: 0,
  totalR: 0,
  avgR: null,
  maxDrawdown: 0,
  bestTrade: 0,
  worstTrade: 0,
  currentStreak: 0,
}

/** Aggregate stats over a set of trades. Open trades count toward `total`/`open` only. */
export function computeStats(trades: Trade[]): JournalStats {
  if (trades.length === 0) return { ...EMPTY_STATS }

  const closed = trades.filter(isClosed)
  const open = trades.length - closed.length
  if (closed.length === 0) {
    return { ...EMPTY_STATS, total: trades.length, open }
  }

  let grossSum = 0
  let netSum = 0
  let feeSum = 0
  let wins = 0
  let losses = 0
  let breakeven = 0
  let winSum = 0
  let lossSum = 0
  let totalR = 0
  let rCount = 0
  let best = -Infinity
  let worst = Infinity

  for (const t of closed) {
    const net = netPnl(t) ?? 0
    netSum += net
    grossSum += grossPnl(t) ?? 0
    feeSum += t.fees
    if (net > 0) {
      wins++
      winSum += net
    } else if (net < 0) {
      losses++
      lossSum += net
    } else {
      breakeven++
    }
    const r = realizedR(t)
    if (r != null) {
      totalR += r
      rCount++
    }
    if (net > best) best = net
    if (net < worst) worst = net
  }

  const decided = wins + losses

  return {
    total: trades.length,
    open,
    closed: closed.length,
    grossPnl: grossSum,
    netPnl: netSum,
    fees: feeSum,
    wins,
    losses,
    breakeven,
    winRate: decided > 0 ? wins / decided : 0,
    avgWin: wins > 0 ? winSum / wins : 0,
    avgLoss: losses > 0 ? lossSum / losses : 0,
    profitFactor: lossSum < 0 ? winSum / Math.abs(lossSum) : null,
    expectancy: netSum / closed.length,
    totalR,
    avgR: rCount > 0 ? totalR / rCount : null,
    maxDrawdown: maxDrawdown(closed),
    bestTrade: best,
    worstTrade: worst,
    currentStreak: currentStreak(closed),
  }
}

/** A point on the cumulative net-P&L curve, ordered by exit time. */
export interface EquityPoint {
  /** ISO exit timestamp of the trade closed at this point. */
  date: string
  /** Net P&L of this trade. */
  pnl: number
  /** Cumulative net P&L through this trade. */
  equity: number
}

/** Cumulative equity curve from closed trades, sorted by exit time ascending. */
export function equityCurve(trades: Trade[]): EquityPoint[] {
  const closed = trades
    .filter(isClosed)
    .slice()
    .sort((a, b) => new Date(a.exit_at).getTime() - new Date(b.exit_at).getTime())
  let equity = 0
  return closed.map((t) => {
    const pnl = netPnl(t) ?? 0
    equity += pnl
    return { date: t.exit_at, pnl, equity }
  })
}

function maxDrawdown(closed: Trade[]): number {
  const points = equityCurve(closed)
  let peak = 0
  let maxDd = 0
  for (const p of points) {
    if (p.equity > peak) peak = p.equity
    const dd = p.equity - peak
    if (dd < maxDd) maxDd = dd
  }
  return maxDd
}

function currentStreak(closed: Trade[]): number {
  const decided = closed
    .filter((t) => (netPnl(t) ?? 0) !== 0)
    .sort((a, b) => new Date(b.exit_at!).getTime() - new Date(a.exit_at!).getTime())
  if (decided.length === 0) return 0
  const latestWin = (netPnl(decided[0]) ?? 0) > 0
  let streak = 0
  for (const t of decided) {
    if (((netPnl(t) ?? 0) > 0) !== latestWin) break
    streak++
  }
  return latestWin ? streak : -streak
}

/** One bucket of a breakdown (by strategy, ticker, weekday, …). */
export interface Breakdown {
  key: string
  trades: number
  netPnl: number
  winRate: number
  totalR: number
  expectancy: number
}

/** Group closed trades by a key function and compute per-bucket stats. */
export function breakdownBy(trades: Trade[], keyOf: (t: Trade) => string): Breakdown[] {
  const groups = new Map<string, Trade[]>()
  for (const t of trades) {
    if (!isClosed(t)) continue
    const k = keyOf(t)
    const arr = groups.get(k)
    if (arr) arr.push(t)
    else groups.set(k, [t])
  }
  return Array.from(groups.entries())
    .map(([key, group]) => {
      const s = computeStats(group)
      return {
        key,
        trades: s.closed,
        netPnl: s.netPnl,
        winRate: s.winRate,
        totalR: s.totalR,
        expectancy: s.expectancy,
      }
    })
    .sort((a, b) => b.netPnl - a.netPnl)
}
