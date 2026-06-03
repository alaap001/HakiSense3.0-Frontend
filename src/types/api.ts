import type { Desk } from "@/types/desk"

/**
 * A parsed SSE event from POST /api/research. The backend relays Agno's run
 * events plus its own `RunStarted` / `ResearchComplete` / `WorkflowError`.
 * `event` is the discriminator; other fields vary by event type.
 */
export interface SSEEvent {
  event: string
  session_id?: string
  ticker?: string
  step_name?: string
  step_index?: number
  content?: string
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
