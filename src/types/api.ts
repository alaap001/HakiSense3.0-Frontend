import type { Desk } from "@/types/desk"

/**
 * A parsed SSE event from POST /api/research. The backend relays Agno's run
 * events plus its own `RunStarted` / `ResearchComplete` / `WorkflowError`.
 * `event` is the discriminator; other fields vary by event type.
 */
export interface SSEEvent {
  event: string
  session_id?: string
  chat_id?: string
  ticker?: string
  step_name?: string
  step_index?: number
  content?: string
  answer?: string
  tool_name?: string
  error?: string
  headline?: string
  gate_passed?: boolean | null
  [key: string]: unknown
}

/**
 * POST /api/research body.
 *  - phases omitted / null -> full dossier (all four waves; needs Qdrant + LLM)
 *  - phases: []            -> scope + grounded thesis only (LLM, no Qdrant)
 *  - intake_only: true     -> Phase-0 intake only (no LLM, no Qdrant)
 */
export interface ResearchRequest {
  ticker: string
  phases?: string[] | null
  intake_only?: boolean
}

/**
 * POST /api/chat body — ask one question about a ticker. The backend assembles the
 * thesis/filings context server-side from the saved dossier, so only the ticker, the
 * message, and (for multi-turn memory) a stable chat_id are sent. Omit chat_id to start fresh.
 */
export interface ChatRequest {
  ticker: string
  message: string
  chat_id?: string
}

/**
 * POST /api/journal/analyze body — ask the desk to critique one journaled trade. The trade
 * payload travels from the client (the journal lives in Supabase, not the research backend);
 * `portfolio` is optional aggregate context computed client-side.
 */
export interface TradeAnalysisRequest {
  trade: Record<string, unknown>
  question?: string
  portfolio?: Record<string, unknown>
}

export interface GateReport {
  passed: boolean
  blockers: unknown[]
  warnings: unknown[]
  stats: Record<string, unknown>
}

/** GET /api/desk/{session_id} — one saved run record. */
export interface SavedRun {
  session_id: string
  ticker: string
  user_id: string | null
  created_at: string
  headline: string
  desk: Desk
  report_md: string
  gate: GateReport | null
}

/** Item in GET /api/runs (`{ runs: RunListItem[] }`). */
export interface RunListItem {
  session_id: string
  ticker: string
  headline: string
  created_at: string
}

export interface HealthStatus {
  status: string
  service: string
}
