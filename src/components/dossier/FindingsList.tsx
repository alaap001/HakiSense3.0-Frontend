import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Finding, Polarity } from "@/types/desk"

import { EmptyState } from "./parts"

const POLARITY: Record<Polarity, string> = {
  bull: "border-pos/40 text-pos",
  bear: "border-neg/40 text-neg",
  neutral: "border-hairline-strong text-text-secondary",
  fact: "border-violet/40 text-brand",
}

export function FindingsList({ findings }: { findings: Finding[] }) {
  if (!findings.length) return <EmptyState label="No findings yet — run a Full dossier." />

  const counts = findings.reduce<Record<string, number>>((acc, f) => {
    acc[f.polarity] = (acc[f.polarity] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-2">
      <div className="mb-1 flex flex-wrap gap-2 font-mono text-[11px] text-text-secondary/70">
        {(["bull", "bear", "neutral", "fact"] as Polarity[]).map((p) =>
          counts[p] ? (
            <span key={p} className={cn("rounded-full border px-2 py-0.5", POLARITY[p])}>
              {counts[p]} {p}
            </span>
          ) : null,
        )}
      </div>
      {findings.map((f) => (
        <FindingRow key={f.id} finding={f} />
      ))}
    </div>
  )
}

function FindingRow({ finding }: { finding: Finding }) {
  const [open, setOpen] = useState(false)
  const hasEvidence = finding.evidence.length > 0

  return (
    <div className="rounded-xl border border-hairline bg-surface">
      <button
        type="button"
        onClick={() => hasEvidence && setOpen((o) => !o)}
        className={cn(
          "flex w-full items-start gap-3 p-3 text-left",
          hasEvidence ? "cursor-pointer" : "cursor-default",
        )}
      >
        <Badge variant="outline" className={cn("shrink-0 capitalize", POLARITY[finding.polarity])}>
          {finding.polarity}
        </Badge>
        <span className="flex-1 text-sm text-text-secondary">{finding.claim}</span>
        <span className="shrink-0 font-mono text-[10px] uppercase text-text-secondary/50">
          {finding.confidence}
        </span>
        {hasEvidence ? (
          <ChevronDown
            className={cn(
              "mt-0.5 size-4 shrink-0 text-text-secondary/60 transition-transform",
              open && "rotate-180",
            )}
          />
        ) : null}
      </button>
      {open && hasEvidence ? (
        <div className="space-y-2 border-t border-hairline px-3 py-3">
          {finding.evidence.map((e, i) => (
            <div key={i} className="rounded-lg bg-surface p-2.5">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-brand/70">
                <span>{e.kind}</span>
                <span className="text-text-secondary/40">·</span>
                <span className="normal-case text-text-secondary/60">{e.locator}</span>
                {e.as_of ? <span className="ml-auto text-text-secondary/40">{e.as_of}</span> : null}
              </div>
              {e.quote ? (
                <p className="mt-1.5 text-xs leading-relaxed text-text-secondary/90">
                  &ldquo;{e.quote}&rdquo;
                </p>
              ) : null}
            </div>
          ))}
          <div className="flex flex-wrap gap-3 pt-1 font-mono text-[10px] text-text-secondary/50">
            <span>team: {finding.team}</span>
            {finding.pillar_id ? <span>pillar: {finding.pillar_id}</span> : null}
            {finding.coverage_lens ? <span>lens: {finding.coverage_lens}</span> : null}
            <span>status: {finding.status}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
