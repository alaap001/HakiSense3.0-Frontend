/**
 * Trade-journal domain types. These mirror the Supabase `public` tables
 * (profiles / strategies / trades / trade_reviews) one-to-one, so a row read
 * via supabase-js can be used as-is. Derived numbers (P&L, R-multiple, …) are
 * NOT stored — see `@/lib/journal/metrics`.
 */

export type Plan = "free" | "pro" | "ultra"

export type TradeDirection = "long" | "short"
export type TradeStatus = "open" | "closed"
export type AssetType = "equity" | "option" | "future" | "crypto" | "forex"
export type Timeframe = "scalp" | "intraday" | "swing" | "position"
export type MarketCondition = "trend" | "range" | "volatile" | "news"

/** A user-defined strategy / setup that trades can be tagged with. */
export interface Strategy {
  id: string
  user_id: string
  name: string
  description: string | null
  /** Hex/token color for the strategy chip, e.g. "#059669". */
  color: string | null
  created_at: string
}

/** A single logged trade (one row of `public.trades`). */
export interface Trade {
  id: string
  user_id: string
  ticker: string
  asset_type: AssetType
  direction: TradeDirection
  status: TradeStatus
  strategy_id: string | null
  /** Free-text setup label when no formal strategy is linked. */
  setup: string | null
  entry_at: string // ISO timestamptz
  exit_at: string | null // null while the trade is open
  entry_price: number
  exit_price: number | null
  quantity: number
  stop_price: number | null
  target_price: number | null
  fees: number
  /** Conviction at entry, 1–5. */
  confidence: number | null
  timeframe: Timeframe | null
  market_condition: MarketCondition | null
  catalyst: string | null
  tags: string[]
  mistakes: string[]
  /** Pre-trade plan (the thesis you wrote before entering). */
  plan_notes: string | null
  /** Post-trade review (what actually happened / lessons). */
  review_notes: string | null
  /** Supabase Storage paths under `trade-screenshots/{user_id}/{trade_id}/`. */
  screenshots: string[]
  /** Optional link to a HakiSense research dossier (research session_id). */
  research_session_id: string | null
  created_at: string
  updated_at: string
}

/** Fields a user supplies when creating a trade (server fills the rest). */
export type NewTrade = Omit<Trade, "id" | "user_id" | "created_at" | "updated_at">

/** Partial edit payload for an existing trade. */
export type TradeUpdate = Partial<NewTrade>

/** A cached AI analysis of a trade (the paid feature's output). */
export interface TradeReview {
  id: string
  user_id: string
  trade_id: string
  content: string
  model: string | null
  created_at: string
}
