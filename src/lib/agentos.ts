import type {
  HealthStatus,
  ResearchRequest,
  RunListItem,
  SavedRun,
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

/** List saved runs (newest first), scoped to the user when backend auth is on. */
export async function listRuns(token?: string): Promise<RunListItem[]> {
  const res = await fetch(`${BASE}/api/runs`, { headers: authHeaders(token) })
  if (!res.ok) throw new Error(`failed to list runs: ${res.status}`)
  const data = (await res.json()) as { runs: RunListItem[] }
  return data.runs ?? []
}
