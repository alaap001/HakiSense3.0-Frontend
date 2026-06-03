/**
 * TypeScript mirror of the backend Desk model (`hakisense/desk/model.py`,
 * Pydantic v2). This is the exact shape of `desk` inside a saved run record.
 * Field names and literal unions track the Python model — keep them in sync.
 */

export type EvidenceKind = "filing" | "transcript" | "web" | "metric" | "computation"

export interface EvidenceSource {
  kind: EvidenceKind
  locator: string
  quote: string | null
  as_of: string | null // ISO date
}

export type Polarity = "bull" | "bear" | "neutral" | "fact"
export type FindingStatus =
  | "hypothesis"
  | "supported"
  | "verified"
  | "refuted"
  | "superseded"
export type Confidence = "high" | "med" | "low" // computed, never typed by the model

export interface Finding {
  id: string
  team: string
  claim: string
  evidence: EvidenceSource[]
  polarity: Polarity
  status: FindingStatus
  pillar_id: string | null
  coverage_lens: string | null
  confidence: Confidence
  superseded_by: string | null
  as_of: string | null
}

export type Role = "core" | "supporting"
export type PillarStatus =
  | "hypothesis"
  | "supported"
  | "verified"
  | "refuted"
  | "retired"
export type EvidenceStrength =
  | "strong"
  | "moderate"
  | "weak"
  | "unverified"
  | "untested"

export interface Pillar {
  id: string
  statement: string
  role: Role
  status: PillarStatus
  supporting_finding_ids: string[]
  refuting_finding_ids: string[]
  context_finding_ids: string[]
  evidence_strength: EvidenceStrength
}

export interface ThesisBoard {
  headline: string
  pillars: Pillar[]
  kill_criteria: string[]
  revision_notes: string[]
}

export interface Scenario {
  name: string // "bull" | "base" | "bear" (code-normalized)
  fair_value: number
  probability: number
  method: string
  drivers: string[]
  rests_on_pillars: string[]
}

export type CoverageStatus = "empty" | "touched" | "covered"

export interface CoverageLens {
  name: string
  owner_team: string
  role: Role
  status: CoverageStatus
  finding_count: number
  note: string | null
}

export interface OpenQuestion {
  id: string
  team: string
  text: string
  reason: string
  suggests_specialist: string | null
}

export type RedFlagSeverity = "red" | "high"
export type RedFlagCategory =
  | "accounting"
  | "governance"
  | "regulatory"
  | "competitive"
  | "execution"

export interface RedFlag {
  id: string
  team: string
  severity: RedFlagSeverity
  category: RedFlagCategory
  description: string
  evidence_finding_ids: string[]
}

export interface MetricPack {
  tables_md: Record<string, string> // markdown tables: pnl, balance_sheet, ...
  metrics: Record<string, number | string>
  anomalies: Array<Record<string, unknown>>
  detectors: Array<Record<string, unknown>>
  source_crosscheck: Array<Record<string, unknown>>
  market: Record<string, unknown>
  sector: string | null
  dupont_note: string | null
}

export interface CompanyProfile {
  name: string
  ticker: string
  one_liner: string
  long_description: string
  sector_label: string
  peers: string[]
}

export interface Desk {
  ticker: string
  company: CompanyProfile | null
  thesis: ThesisBoard
  findings: Finding[]
  coverage: CoverageLens[]
  open_questions: OpenQuestion[]
  red_flags: RedFlag[]
  metrics: MetricPack
  scenarios: Scenario[]
  watch_triggers: string[]
  budget_spent_usd: number
  team_memos: Record<string, string>
  devils_advocate: string
  synthesis: string
}
