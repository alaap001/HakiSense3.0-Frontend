import type {
  ChatRequest,
  HealthStatus,
  ResearchRequest,
  RunListItem,
  SavedRun,
  TradeAnalysisRequest,
} from "@/types/api"

/** Dev: `/agentos` (Vite proxy → :7777). Prod: the real backend origin. */
const BASE = (import.meta.env.VITE_AGENTOS_URL as string | undefined) ?? "/agentos"

function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getHealth(): Promise<HealthStatus> {
  const res = await fetch(`${BASE}/api/health`)
  if (!res.ok) throw new Error(`health check failed: ${res.status}`)
  return res.json() as Promise<HealthStatus>
}

/**
 * Start a research run. Returns the streaming Response so the caller drives the
 * SSE with `readSSE()`. The SERVER (not the client) issues the session_id — read
 * it from the first `RunStarted` event.
 */
export async function startResearch(
  req: ResearchRequest,
  token?: string,
  signal?: AbortSignal,
): Promise<Response> {
  const res = await fetch(`${BASE}/api/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(req),
    signal,
  })
  if (!res.ok || !res.body) throw new Error(`research failed to start: ${res.status}`)
  return res
}

/**
 * Fetch the saved dossier. Call this on the `ResearchComplete` event (the record
 * is written just before it fires); it 404s until then.
 */
export async function getDesk(sessionId: string, token?: string): Promise<SavedRun> {
  const res = await fetch(`${BASE}/api/desk/${encodeURIComponent(sessionId)}`, {
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error(`desk not ready: ${res.status}`)
  return res.json() as Promise<SavedRun>
}

/**
 * Send one chat turn about a ticker. Returns the streaming Response so the caller drives
 * the SSE with `readSSE()` — `RunContent` events carry token deltas, the terminal
 * `ChatComplete` carries the full answer. Auth-gated: the backend 401s without a token.
 */
export async function startChat(
  req: ChatRequest,
  token?: string,
  signal?: AbortSignal,
): Promise<Response> {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(req),
    signal,
  })
  if (!res.ok || !res.body) throw new Error(`chat failed to start: ${res.status}`)
  return res
}

/**
 * Stream an AI review of a single journaled trade. Returns the streaming Response so the
 * caller drives the SSE with `readSSE()`. PAID: the backend 403s callers who aren't on the
 * Pro plan (verified from the JWT's app_metadata.plan claim), and 401s without a token.
 */
export async function startTradeAnalysis(
  req: TradeAnalysisRequest,
  token?: string,
  signal?: AbortSignal,
): Promise<Response> {
  const res = await fetch(`${BASE}/api/journal/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(req),
    signal,
  })
  if (res.status === 403) throw new Error("AI analysis is a Pro feature.")
  if (!res.ok || !res.body) throw new Error(`analysis failed to start: ${res.status}`)
  return res
}

/** List saved runs (newest first), scoped to the user when backend auth is on. */
export async function listRuns(token?: string): Promise<RunListItem[]> {
  const res = await fetch(`${BASE}/api/runs`, { headers: authHeaders(token) })
  if (!res.ok) throw new Error(`failed to list runs: ${res.status}`)
  const data = (await res.json()) as { runs: RunListItem[] }
  return data.runs ?? []
}
