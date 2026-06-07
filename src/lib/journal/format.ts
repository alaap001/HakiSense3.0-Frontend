/** Small display formatters for the journal UI. Pure, locale-aware, null-safe. */

export function fmtMoney(n: number | null | undefined, currency = "USD"): string {
  if (n == null || Number.isNaN(n)) return "—"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: Math.abs(n) >= 1000 ? 0 : 2,
  }).format(n)
}

/** Signed money, e.g. "+$1,240" / "−$320". */
export function fmtSignedMoney(n: number | null | undefined, currency = "USD"): string {
  if (n == null || Number.isNaN(n)) return "—"
  const sign = n > 0 ? "+" : n < 0 ? "−" : ""
  return sign + fmtMoney(Math.abs(n), currency)
}

/** A 0–1 ratio as a percentage, e.g. 0.123 → "12.3%". */
export function fmtPct(n: number | null | undefined, digits = 1): string {
  if (n == null || Number.isNaN(n)) return "—"
  return `${(n * 100).toFixed(digits)}%`
}

/** R-multiple, e.g. "+1.8R" / "−1.0R" / "—". */
export function fmtR(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—"
  const sign = n > 0 ? "+" : n < 0 ? "−" : ""
  return `${sign}${Math.abs(n).toFixed(2)}R`
}

export function fmtNum(n: number | null | undefined, digits = 2): string {
  if (n == null || Number.isNaN(n)) return "—"
  return n.toLocaleString("en-US", { maximumFractionDigits: digits })
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

/** Human holding period from milliseconds, e.g. "3d 4h" / "45m". */
export function fmtDuration(ms: number | null | undefined): string {
  if (ms == null || ms < 0) return "—"
  const mins = Math.round(ms / 60000)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ${mins % 60}m`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}

/** Tailwind text color for a P&L / R value: green up, red down, muted flat. */
export function pnlClass(n: number | null | undefined): string {
  if (n == null || n === 0 || Number.isNaN(n)) return "text-text-secondary"
  return n > 0 ? "text-pos" : "text-neg"
}

/** A datetime-local input value (local time, no seconds) → ISO; and the inverse. */
export function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (x: number) => String(x).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function localInputToIso(local: string | null | undefined): string | null {
  if (!local) return null
  const d = new Date(local)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}
