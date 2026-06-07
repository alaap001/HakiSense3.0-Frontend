import { useCallback, useRef, useState } from "react"

import { ApiError, startChat } from "@/lib/agentos"
import { readSSE } from "@/lib/sse"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export type ChatStatus = "idle" | "streaming" | "error"

export interface UseChat {
  messages: ChatMessage[]
  status: ChatStatus
  /** Human-readable hint while the agent works a tool ("Reading the filings…"). */
  statusLabel: string
  error: string | null
  /** True when the last send was refused for being out of monthly chat credits (HTTP 402). */
  limitReached: boolean
  send: (text: string) => Promise<void>
  cancel: () => void
}

/** Map a tool name to a friendly "what the agent is doing" line. */
function toolLabel(name?: string): string {
  switch (name) {
    case "search_knowledge_base":
      return "Reading the filings…"
    case "web_search":
      return "Searching the web…"
    case "get_metric":
    case "fetch_table":
    case "compute":
      return "Checking the numbers…"
    case "read_desk":
      return "Reviewing the thesis…"
    default:
      return "Researching…"
  }
}

/**
 * Drive a single-ticker chat over SSE. One conversation per hook instance: a fresh `chat_id`
 * is minted on mount (per page visit), so reopening the stock starts clean while follow-ups
 * within the visit carry history (the backend replays by chat_id).
 *
 * The reply streams as `RunContent` token deltas appended to the trailing assistant bubble;
 * the terminal `ChatComplete` carries the canonical full answer and reconciles it. `getToken`
 * comes from useAuth(); it returns undefined when auth is off (no Authorization header sent).
 */
export function useChat(
  ticker: string,
  getToken: () => Promise<string | undefined>,
): UseChat {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>("idle")
  const [statusLabel, setStatusLabel] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  // Minted on the first send (an event handler, not render — keeps the render pure) and reused
  // for the rest of the visit, so follow-ups share one conversation. Reset on remount = fresh.
  const chatIdRef = useRef<string | null>(null)

  const send = useCallback(
    async (text: string) => {
      const message = text.trim()
      if (!message || status === "streaming") return

      if (chatIdRef.current === null) {
        chatIdRef.current = `chat-${ticker}-${Math.random().toString(36).slice(2, 10)}`
      }
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      setError(null)
      setLimitReached(false)
      setStatus("streaming")
      setStatusLabel("Thinking…")
      // append the user turn + an empty assistant turn we stream into
      setMessages((m) => [
        ...m,
        { role: "user", content: message },
        { role: "assistant", content: "" },
      ])

      const patchAssistant = (fn: (prev: string) => string) =>
        setMessages((m) => {
          const next = m.slice()
          const last = next[next.length - 1]
          if (last && last.role === "assistant") {
            next[next.length - 1] = { ...last, content: fn(last.content) }
          }
          return next
        })

      try {
        const token = await getToken()
        const res = await startChat(
          { ticker, message, chat_id: chatIdRef.current },
          token,
          ctrl.signal,
        )
        let streamed = ""
        for await (const ev of readSSE(res, ctrl.signal)) {
          switch (ev.event) {
            case "RunContent":
              if (typeof ev.content === "string" && ev.content) {
                streamed += ev.content
                setStatusLabel("")
                patchAssistant((prev) => prev + ev.content)
              }
              break
            case "ToolCallStarted":
              setStatusLabel(toolLabel(ev.tool_name))
              break
            case "ChatComplete":
              // canonical final answer — reconcile if deltas were missed/misordered
              if (typeof ev.answer === "string" && ev.answer && ev.answer !== streamed) {
                patchAssistant(() => ev.answer as string)
              }
              setStatus("idle")
              setStatusLabel("")
              break
            case "ChatError":
              setError(typeof ev.error === "string" ? ev.error : "chat failed")
              setStatus("error")
              setStatusLabel("")
              break
            default:
              break
          }
        }
        // stream closed without an explicit terminal — settle to idle
        setStatus((s) => (s === "streaming" ? "idle" : s))
        setStatusLabel("")
      } catch (err) {
        if (!ctrl.signal.aborted) {
          // Drop the optimistic empty assistant bubble so it doesn't hang on "Thinking…".
          setMessages((m) => {
            const last = m[m.length - 1]
            return last && last.role === "assistant" && !last.content ? m.slice(0, -1) : m
          })
          setLimitReached(err instanceof ApiError && err.status === 402)
          setError(err instanceof Error ? err.message : String(err))
          setStatus("error")
          setStatusLabel("")
        }
      }
    },
    [ticker, getToken, status],
  )

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setStatus((s) => (s === "streaming" ? "idle" : s))
    setStatusLabel("")
  }, [])

  return { messages, status, statusLabel, error, limitReached, send, cancel }
}
