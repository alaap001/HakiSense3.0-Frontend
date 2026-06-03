import { useCallback, useRef, useState } from "react"

import { getDesk, startResearch } from "@/lib/agentos"
import { readSSE } from "@/lib/sse"
import type { ResearchRequest, SavedRun } from "@/types/api"

export type RunPhase = "idle" | "running" | "done" | "error"

export interface FeedEntry {
  index: number
  event: string
  step?: string
  text?: string
}

export interface UseResearchRun {
  phase: RunPhase
  sessionId: string | null
  currentStep: string
  feed: FeedEntry[]
  run: SavedRun | null
  error: string | null
  start: (req: ResearchRequest) => Promise<void>
  cancel: () => void
}

/**
 * Drive one research run over SSE. Honors the as-built backend contract:
 *  - the SERVER issues the session_id (read from the `RunStarted` event),
 *  - progress is tracked from `StepStarted` / `StepCompleted`,
 *  - the dossier is fetched on `ResearchComplete` (not the engine's
 *    `WorkflowCompleted`, which fires before the record is written).
 *
 * `getToken` comes from useAuth(); it returns undefined when auth is off, in
 * which case no Authorization header is sent (matches the opt-in backend).
 */
export function useResearchRun(
  getToken: () => Promise<string | undefined>,
): UseResearchRun {
  const [phase, setPhase] = useState<RunPhase>("idle")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState("")
  const [feed, setFeed] = useState<FeedEntry[]>([])
  const [run, setRun] = useState<SavedRun | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const seq = useRef(0)

  const push = useCallback((entry: Omit<FeedEntry, "index">) => {
    setFeed((f) => [...f, { index: seq.current++, ...entry }])
  }, [])

  const start = useCallback(
    async (req: ResearchRequest) => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      seq.current = 0
      setPhase("running")
      setSessionId(null)
      setCurrentStep("")
      setFeed([])
      setRun(null)
      setError(null)

      let sid: string | null = null

      const finalize = async (finishSid: string | null) => {
        setCurrentStep("")
        if (!finishSid) {
          setPhase("done")
          return
        }
        try {
          const token = await getToken()
          setRun(await getDesk(finishSid, token))
          setPhase("done")
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err))
          setPhase("error")
        }
      }

      try {
        const token = await getToken()
        const res = await startResearch(req, token, ctrl.signal)
        for await (const ev of readSSE(res, ctrl.signal)) {
          if (ev.session_id && !sid) {
            sid = ev.session_id
            setSessionId(sid)
          }
          switch (ev.event) {
            case "RunStarted":
              push({ event: ev.event, text: `Run started for ${ev.ticker ?? req.ticker}` })
              break
            case "StepStarted":
              if (ev.step_name) {
                setCurrentStep(ev.step_name)
                push({ event: ev.event, step: ev.step_name })
              }
              break
            case "StepCompleted":
              push({
                event: ev.event,
                step: ev.step_name,
                text: typeof ev.content === "string" ? ev.content : undefined,
              })
              break
            case "RunContent":
              if (typeof ev.content === "string" && ev.content) {
                push({ event: ev.event, text: ev.content })
              }
              break
            case "ToolCallStarted":
              push({
                event: ev.event,
                text: typeof ev.content === "string" ? ev.content : undefined,
              })
              break
            case "ResearchComplete":
              await finalize(ev.session_id ?? sid)
              break
            case "WorkflowError":
              setError(typeof ev.error === "string" ? ev.error : "run failed")
              setPhase("error")
              break
            default:
              break
          }
        }
      } catch (err) {
        if (!ctrl.signal.aborted) {
          setError(err instanceof Error ? err.message : String(err))
          setPhase("error")
        }
      }
    },
    [getToken, push],
  )

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setPhase((p) => (p === "running" ? "idle" : p))
  }, [])

  return { phase, sessionId, currentStep, feed, run, error, start, cancel }
}
