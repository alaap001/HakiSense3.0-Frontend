import { HelpCircle } from "lucide-react"

import type { OpenQuestion } from "@/types/desk"

import { EmptyState } from "./parts"

export function OpenQuestions({ questions }: { questions: OpenQuestion[] }) {
  if (!questions.length) return <EmptyState label="No open questions." />
  return (
    <div className="space-y-2">
      {questions.map((q) => (
        <div
          key={q.id}
          className="flex items-start gap-3 rounded-xl border border-hairline bg-surface p-3"
        >
          <HelpCircle className="mt-0.5 size-4 shrink-0 text-brand/70" />
          <div>
            <p className="text-sm text-text-secondary">{q.text}</p>
            {q.reason ? (
              <p className="mt-1 text-xs text-text-secondary/60">{q.reason}</p>
            ) : null}
            {q.suggests_specialist ? (
              <span className="mt-1 inline-block font-mono text-[10px] uppercase text-brand/60">
                → {q.suggests_specialist}
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
