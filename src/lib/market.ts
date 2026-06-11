/**
 * Market configuration — selects the equities market the whole frontend targets,
 * driven by `VITE_MARKET` ("us" default | "in"). One source of truth for currency,
 * exchanges, example tickers, copy tokens and which ticker index to load, so the
 * same build can serve US equities (B2B / trading desks) or Indian equities by
 * flipping one env var. Read `MARKET.*` in components — never hard-code ₹/$ or
 * NSE/NYSE again; use {@link formatMoney} / {@link formatNumber} for figures.
 */

export type MarketId = "us" | "in"

export interface MarketConfig {
  id: MarketId
  /** ISO 4217 code for Intl currency formatting. */
  currencyCode: string
  /** Glyph, for the rare hand-built price string. */
  currencySymbol: string
  /** BCP-47 locale for number / currency / date grouping. */
  locale: string
  /** Coverage-scope noun for credibility chips, e.g. "US equities". */
  marketNoun: string
  /** Exchanges, long form: "NYSE & Nasdaq". */
  exchanges: string
  /** Single exchange tag for compact chips: "NYSE". */
  primaryExchange: string
  /** Example symbols for placeholders / mock chips (importance-ranked). */
  exampleTickers: string[]
  /** Hero / command-palette search placeholder. */
  searchPlaceholder: string
  /** Rounded universe-size label, e.g. "7,600+". */
  universeCount: string
  /** Public path of the prebuilt ticker index for this market. */
  tickersFile: string
  /** Pain-act phrasing for the annual cost of the incumbent tools. */
  terminalCostPhrase: string
}

const US: MarketConfig = {
  id: "us",
  currencyCode: "USD",
  currencySymbol: "$",
  locale: "en-US",
  marketNoun: "US equities",
  exchanges: "NYSE & Nasdaq",
  primaryExchange: "NYSE",
  exampleTickers: ["AAPL", "MSFT", "NVDA", "AMZN"],
  searchPlaceholder: "Search any stock — symbol or company…",
  universeCount: "7,600+",
  tickersFile: "/tickers.us.json",
  terminalCostPhrase: "$25k a year",
}

const IN: MarketConfig = {
  id: "in",
  currencyCode: "INR",
  currencySymbol: "₹",
  locale: "en-IN",
  marketNoun: "Indian listed equities",
  exchanges: "NSE",
  primaryExchange: "NSE",
  exampleTickers: ["RELIANCE", "TCS", "INFY", "HDFCBANK"],
  searchPlaceholder: "Search any listed Indian stock…",
  universeCount: "5,700+",
  tickersFile: "/tickers.in.json",
  terminalCostPhrase: "into lakhs a year",
}

/** Resolve the active market from env once, at module load. Defaults to US. */
function resolveMarket(): MarketConfig {
  const raw = (import.meta.env.VITE_MARKET as string | undefined)?.toLowerCase().trim()
  return raw === "in" ? IN : US
}

export const MARKET: MarketConfig = resolveMarket()

/**
 * Locale-aware currency string, e.g. 999 → "$999" (US) / "₹999" (IN). Whole-number
 * by default since prices are integers; pass `fractionDigits` for cents/paise.
 */
export function formatMoney(n: number, fractionDigits = 0): string {
  return new Intl.NumberFormat(MARKET.locale, {
    style: "currency",
    currency: MARKET.currencyCode,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n)
}

/** Locale-aware grouped integer, e.g. 25000 → "25,000". */
export function formatNumber(n: number): string {
  return n.toLocaleString(MARKET.locale)
}
