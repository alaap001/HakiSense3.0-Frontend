import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { Send, Sparkles, X } from "lucide-react"

import { MarkdownView } from "@/components/dossier/MarkdownView"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { useChat } from "@/hooks/useChat"

const SUGGESTIONS = [
  "What's the core thesis in one line?",
  "What are the biggest red flags?",
  "How has revenue trended recently?",
]

/**
 * Floating "chat with this ticker" dock for the research page. Appears bottom-right once a
 * dossier has loaded; the backend grounds every answer in that ticker's saved thesis, metrics,
 * and filings (we only send the ticker + message). Research, not investment advice.
 */
export function TickerChat({
  ticker,
  companyName,
}: {
  ticker: string
  companyName?: string
}) {
  const { getToken } = useAuth()
  const { messages, status, statusLabel, error, send } = useChat(ticker, getToken)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  // keep the latest turn in view as tokens stream in
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, statusLabel])

  const submit = (text: string) => {
    if (!text.trim()) return
    setDraft("")
    void send(text)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit(draft)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label={`Ask about ${ticker}`}
        className="group fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-violet/40 bg-panel/90 px-4 py-3 text-sm font-medium text-text-primary shadow-xl shadow-violet/20 backdrop-blur transition-all hover:border-violet hover:shadow-violet/40"
      >
        <Sparkles className="size-4 text-brand transition-transform group-hover:rotate-12" />
        Ask about {ticker}
      </button>
    )
  }

  const streaming = status === "streaming"
  const lastIsEmptyAssistant =
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    !messages[messages.length - 1].content

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[min(70vh,560px)] w-[min(92vw,400px)] flex-col overflow-hidden rounded-2xl border border-hairline-strong bg-panel/95 shadow-2xl backdrop-blur-xl">
      {/* header */}
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-violet/15 text-brand">
            <Sparkles className="size-3.5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-text-primary">{companyName || ticker}</p>
            <p className="micro-label">Ask the desk · {ticker}</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close chat"
          className="rounded-md p-1 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-text-secondary">
              Ask anything about{" "}
              <span className="text-text-primary">{companyName || ticker}</span> — grounded in
              its filings, metrics, and the desk&apos;s verified thesis. Research, not advice.
            </p>
            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="rounded-lg border border-hairline bg-surface/50 px-3 py-2 text-left text-xs text-text-secondary transition-colors hover:border-violet/40 hover:text-text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-violet/15 px-3.5 py-2 text-sm leading-relaxed text-text-primary">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-hairline bg-surface/40 px-3.5 py-1.5">
                {m.content ? (
                  <MarkdownView>{m.content}</MarkdownView>
                ) : (
                  <span className="inline-flex items-center gap-1.5 py-1 text-xs text-text-secondary">
                    <span className="size-1.5 animate-pulse rounded-full bg-brand" />
                    {statusLabel || "Thinking…"}
                  </span>
                )}
              </div>
            </div>
          ),
        )}

        {/* tool status under an assistant bubble that already has streamed text */}
        {streaming && statusLabel && !lastIsEmptyAssistant && (
          <p className="px-1 text-xs text-text-secondary/70">{statusLabel}</p>
        )}

        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
      </div>

      {/* input */}
      <div className="border-t border-hairline p-3">
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Ask about ${ticker}…`}
            disabled={streaming}
            className="h-10 flex-1 rounded-xl border-hairline bg-surface/50 text-sm"
          />
          <Button
            onClick={() => submit(draft)}
            disabled={streaming || !draft.trim()}
            size="icon-lg"
            className="shrink-0 rounded-xl"
            aria-label="Send"
          >
            <Send className="size-4" />
          </Button>
        </div>
        <p className="mt-2 px-1 text-[10px] leading-snug text-text-secondary/60">
          Research, not investment advice. Answers cite filings &amp; metrics.
        </p>
      </div>
    </div>
  )
}
