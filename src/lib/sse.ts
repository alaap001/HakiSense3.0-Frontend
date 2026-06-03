import type { SSEEvent } from "@/types/api"

/**
 * Read a `text/event-stream` Response and yield each parsed JSON event.
 *
 * Uses the body reader (not `EventSource`) so the originating request can carry
 * an Authorization header. Events are separated by a blank line; each `data:`
 * line carries JSON. Non-JSON lines (keep-alive comments, partials) are skipped.
 */
export async function* readSSE(
  res: Response,
  signal?: AbortSignal,
): AsyncGenerator<SSEEvent> {
  if (!res.body) throw new Error("response has no body to stream")
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  try {
    while (true) {
      if (signal?.aborted) break
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let sep: number
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const chunk = buffer.slice(0, sep)
        buffer = buffer.slice(sep + 2)
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data:")) continue
          const json = line.slice(line.indexOf(":") + 1).trim()
          if (!json) continue
          try {
            yield JSON.parse(json) as SSEEvent
          } catch {
            /* ignore keep-alives / partial frames */
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
