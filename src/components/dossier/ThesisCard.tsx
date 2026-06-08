import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { EvidenceStrength, ThesisBoard } from "@/types/desk"

import { EmptyState } from "./parts"

const STRENGTH: Record<EvidenceStrength, { width: string; color: string }> = {
  strong: { width: "w-full", color: "bg-pos" },
  moderate: { width: "w-2/3", color: "bg-violet-400" },
  weak: { width: "w-1/3", color: "bg-warn" },
  unverified: { width: "w-1/4", color: "bg-surface-strong" },
  untested: { width: "w-[8%]", color: "bg-surface-strong" },
}

export function ThesisCard({ thesis }: { thesis: ThesisBoard }) {
  const pillars = (thesis?.pillars ?? []).filter((p) => p.status !== "retired")
  if (!thesis || (!thesis.headline && pillars.length === 0)) {
    return <EmptyState label="No thesis yet — run a Scope + thesis or Full report." />
  }
  return (
    <div className="space-y-5">
      {thesis.headline ? (
        <p className="text-base leading-relaxed text-text-primary">{thesis.headline}</p>
      ) : null}

      <div className="space-y-3">
        {pillars.map((p) => {
          const s = STRENGTH[p.evidence_strength] ?? STRENGTH.untested
          return (
            <div key={p.id} className="rounded-xl border border-hairline bg-surface p-4">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="border-violet/40 font-mono text-brand">
                  {p.id}
                </Badge>
                <p className="flex-1 text-sm text-text-secondary">{p.statement}</p>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-strong">
                  <div className={cn("h-full rounded-full", s.width, s.color)} />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wide text-text-secondary/70">
                  {p.evidence_strength}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 font-mono text-[10px] text-text-secondary/60">
                <span className="text-pos/80">▲ {p.supporting_finding_ids.length}</span>
                <span className="text-neg/80">▼ {p.refuting_finding_ids.length}</span>
                <span>● {p.context_finding_ids.length}</span>
                <span className="uppercase">{p.role}</span>
                <span className="uppercase">{p.status}</span>
              </div>
            </div>
          )
        })}
      </div>

      {thesis.kill_criteria.length ? (
        <div>
          <h3 className="micro-label mb-2">Kill criteria</h3>
          <ul className="space-y-1.5">
            {thesis.kill_criteria.map((k, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-destructive">✕</span>
                {k}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
