import { Badge } from "@/components/ui/badge"
import type { CompanyProfile } from "@/types/desk"

export function CompanyHeader({
  company,
  ticker,
}: {
  company: CompanyProfile | null
  ticker: string
}) {
  if (!company) {
    return (
      <h1 className="font-display text-2xl font-semibold text-text-primary">{ticker}</h1>
    )
  }
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-2xl font-semibold text-text-primary">
          {company.name}
        </h1>
        <Badge variant="outline" className="border-violet/40 font-mono text-brand">
          {company.ticker || ticker}
        </Badge>
      </div>
      {company.one_liner ? (
        <p className="mt-1 text-sm text-text-secondary">{company.one_liner}</p>
      ) : null}
      {company.sector_label ? <p className="micro-label mt-2">{company.sector_label}</p> : null}
      {company.peers.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {company.peers.map((p) => (
            <Badge key={p} variant="secondary" className="text-text-secondary">
              {p}
            </Badge>
          ))}
        </div>
      ) : null}
      {company.long_description ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-brand/80">About</summary>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary/90">
            {company.long_description}
          </p>
        </details>
      ) : null}
    </div>
  )
}
