/**
 * Client-side NSE ticker search. The index (public/tickers.json) is identity only —
 * symbol, company name, sub-sector. No prices, no recommendations. Loaded lazily once
 * and held in module memory; ranking is a cheap linear scan (≈5.7k rows, sub-ms).
 */
export type Ticker = { symbol: string; name: string; sector: string }

type Indexed = Ticker & { _name: string }

let _cache: Promise<Ticker[]> | null = null
let _index: Indexed[] = []

/** Fetch + memoize the ticker list. Safe to call repeatedly; the network hit happens once. */
export function loadTickers(): Promise<Ticker[]> {
  if (!_cache) {
    _cache = fetch("/tickers.json")
      .then((r) => {
        if (!r.ok) throw new Error(`tickers.json ${r.status}`)
        return r.json() as Promise<Ticker[]>
      })
      .then((data) => {
        _index = data.map((t) => ({ ...t, _name: t.name.toLowerCase() }))
        return data
      })
      .catch((err) => {
        _cache = null // allow a retry on the next call
        throw err
      })
  }
  return _cache
}

function wordStartsWith(nameLower: string, q: string): boolean {
  return nameLower.startsWith(q) || nameLower.includes(" " + q)
}

/**
 * Ranked matches for a query. Order: exact symbol → symbol prefix → name word-prefix →
 * symbol substring → name substring; ties break by the source order (importance-ranked).
 * Returns [] until the index has loaded.
 */
export function searchTickers(query: string, limit = 20): Ticker[] {
  const q = query.trim()
  if (!q || _index.length === 0) return []
  const qu = q.toUpperCase()
  const ql = q.toLowerCase()
  const scored: { t: Indexed; score: number; i: number }[] = []
  for (let i = 0; i < _index.length; i++) {
    const t = _index[i]
    let score = -1
    if (t.symbol === qu) score = 0
    else if (t.symbol.startsWith(qu)) score = 1
    else if (wordStartsWith(t._name, ql)) score = 2
    else if (t.symbol.includes(qu)) score = 3
    else if (t._name.includes(ql)) score = 4
    if (score >= 0) scored.push({ t, score, i })
  }
  scored.sort((a, b) => a.score - b.score || a.i - b.i)
  return scored.slice(0, limit).map(({ t }) => ({ symbol: t.symbol, name: t.name, sector: t.sector }))
}

/** First `limit` names from the (importance-ordered) list — used as the empty-state suggestions. */
export function popularTickers(limit = 8): Ticker[] {
  return _index.slice(0, limit).map((t) => ({ symbol: t.symbol, name: t.name, sector: t.sector }))
}

/** Look up one ticker by exact symbol (for rendering recents). */
export function findTicker(symbol: string): Ticker | undefined {
  const s = symbol.toUpperCase()
  const t = _index.find((x) => x.symbol === s)
  return t ? { symbol: t.symbol, name: t.name, sector: t.sector } : undefined
}

// --- Recent searches (localStorage) ---------------------------------------
const RECENT_KEY = "hakisense:recent-tickers"
const RECENT_MAX = 6

export function getRecentSymbols(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    const arr = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : []
  } catch {
    return []
  }
}

export function pushRecentSymbol(symbol: string): void {
  const s = symbol.toUpperCase()
  try {
    const next = [s, ...getRecentSymbols().filter((x) => x !== s)].slice(0, RECENT_MAX)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // ignore (private mode / quota)
  }
}
