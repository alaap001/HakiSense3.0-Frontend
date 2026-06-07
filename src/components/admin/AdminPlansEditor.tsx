import { useState, type ReactNode } from "react"
import { Check, Loader2, Save } from "lucide-react"

import { AdminError, AdminLoading } from "@/components/admin/widgets"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAdminPlans, useUpdatePlan } from "@/hooks/useAdmin"
import type { PlanFeature, PlanRow } from "@/lib/billing"
import { cn } from "@/lib/utils"

const toInt = (s: string): number => {
  const v = parseInt(s, 10)
  return Number.isFinite(v) ? v : 0
}

/** features[] ⇄ one-per-line text; a leading "* " marks a highlighted ("spark") feature. */
const featuresToText = (features: PlanFeature[]): string =>
  features.map((f) => (f.spark ? `* ${f.text}` : f.text)).join("\n")

const textToFeatures = (text: string): PlanFeature[] =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (l.startsWith("*") ? { text: l.replace(/^\*\s*/, ""), spark: true } : { text: l }))

const inputCls = "h-10 border-hairline bg-surface"
const areaCls =
  "w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm leading-relaxed text-text-primary outline-none focus-visible:border-violet/50"

export function AdminPlansEditor() {
  const { data: plans, isLoading, error } = useAdminPlans()
  if (isLoading) return <AdminLoading label="Loading plans…" />
  if (error) return <AdminError message={(error as Error).message} />
  if (!plans || plans.length === 0) return <AdminError message="No plans found." />

  return (
    <div className="space-y-5">
      <p className="rounded-xl border border-hairline bg-surface/60 p-3 text-xs leading-relaxed text-text-secondary">
        Edits are the source of truth — they update the public pricing page and apply to{" "}
        <span className="text-text-primary">new</span> orders immediately. Monthly/quarterly prices
        are entered in ₹ (the charge is derived); paid tiers must be ≥ ₹1.
      </p>
      {[...plans].sort((a, b) => a.sort - b.sort).map((plan) => (
        <PlanForm key={plan.tier} plan={plan} />
      ))}
    </div>
  )
}

function PlanForm({ plan }: { plan: PlanRow }) {
  const update = useUpdatePlan()
  const isFree = plan.tier === "free"

  const [name, setName] = useState(plan.name)
  const [tagline, setTagline] = useState(plan.tagline ?? "")
  const [cta, setCta] = useState(plan.cta ?? "")
  const [includesLead, setIncludesLead] = useState(plan.includes_lead ?? "")
  const [dossiersLabel, setDossiersLabel] = useState(plan.dossiers_label ?? "")
  const [creditsLabel, setCreditsLabel] = useState(plan.credits_label ?? "")
  const [research, setResearch] = useState(String(plan.research_per_month))
  const [credits, setCredits] = useState(String(plan.credits_per_month))
  const [monthly, setMonthly] = useState(String(plan.pricing?.monthly?.perMonth ?? 0))
  const [quarterly, setQuarterly] = useState(
    String(Math.round((plan.pricing?.quarterly?.amount_paise ?? 0) / 100)),
  )
  const [list, setList] = useState(String(plan.pricing?.monthly?.listPerMonth ?? 0))
  const [popular, setPopular] = useState(plan.popular)
  const [active, setActive] = useState(plan.active ?? true)
  const [journalAi, setJournalAi] = useState(Boolean(plan.entitlements?.journal_ai))
  const [features, setFeatures] = useState(featuresToText(plan.features ?? []))

  const save = () => {
    const monthlyPer = toInt(monthly)
    const quarterlyTotal = toInt(quarterly)
    const listPer = toInt(list)
    const quarterlyPer = quarterlyTotal > 0 ? Math.round(quarterlyTotal / 3) : 0
    const discount = (per: number) =>
      listPer > 0 && listPer > per ? Math.round((1 - per / listPer) * 100) : undefined

    const cycle = (per: number, amountPaise: number, billed: string) => ({
      perMonth: per,
      amount_paise: amountPaise,
      billed,
      ...(listPer > 0 ? { listPerMonth: listPer } : {}),
      ...(discount(per) ? { discount: discount(per) } : {}),
    })

    const patch: Partial<PlanRow> = {
      name,
      tagline,
      cta,
      includes_lead: includesLead || null,
      dossiers_label: dossiersLabel,
      credits_label: creditsLabel,
      research_per_month: toInt(research),
      credits_per_month: toInt(credits),
      popular,
      active,
      entitlements: { ...plan.entitlements, journal_ai: journalAi },
      features: textToFeatures(features),
      pricing: {
        monthly: cycle(
          monthlyPer,
          monthlyPer * 100,
          monthlyPer > 0 ? "billed monthly" : "Forever — no card",
        ),
        quarterly: cycle(
          quarterlyPer,
          quarterlyTotal * 100,
          quarterlyTotal > 0
            ? `₹${quarterlyTotal.toLocaleString("en-IN")} billed every 3 months`
            : "Forever — no card",
        ),
      },
    }
    update.mutate({ tier: plan.tier, patch })
  }

  return (
    <div className="rounded-2xl border border-hairline-strong bg-[var(--glass-strong-bg)] p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold capitalize text-text-primary">
          {plan.name}
          {!active ? (
            <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] uppercase text-text-secondary">
              inactive
            </span>
          ) : null}
        </h3>
        <div className="flex items-center gap-3">
          {update.isSuccess ? (
            <span className="flex items-center gap-1 text-xs text-pos">
              <Check className="size-3.5" />
              Saved
            </span>
          ) : null}
          <Button onClick={save} disabled={update.isPending} className="btn-primary gap-2 text-white">
            {update.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Field>
        <Field label="CTA label">
          <Input value={cta} onChange={(e) => setCta(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Tagline" full>
          <Input value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputCls} />
        </Field>
        <Field label="“Everything in …, plus” lead" full>
          <Input
            value={includesLead}
            onChange={(e) => setIncludesLead(e.target.value)}
            placeholder="(blank for the Free tier)"
            className={inputCls}
          />
        </Field>

        <Field label="Research / mo (limit)">
          <Input
            type="number"
            min={0}
            value={research}
            onChange={(e) => setResearch(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Research label (display)">
          <Input
            value={dossiersLabel}
            onChange={(e) => setDossiersLabel(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Chat credits / mo (limit)">
          <Input
            type="number"
            min={0}
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Credits label (display)">
          <Input
            value={creditsLabel}
            onChange={(e) => setCreditsLabel(e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Monthly price (₹/mo)">
          <Input
            type="number"
            min={0}
            value={monthly}
            onChange={(e) => setMonthly(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Quarterly total (₹ / 3 mo)">
          <Input
            type="number"
            min={0}
            value={quarterly}
            onChange={(e) => setQuarterly(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="List price (₹/mo, 0 = none)">
          <Input
            type="number"
            min={0}
            value={list}
            onChange={(e) => setList(e.target.value)}
            className={inputCls}
          />
        </Field>
        <div className="flex items-end gap-5 pb-1">
          <Toggle label="Popular" checked={popular} onChange={setPopular} />
          <Toggle label="Active" checked={active} onChange={setActive} />
          <Toggle label="Journal AI" checked={journalAi} onChange={setJournalAi} />
        </div>

        <Field label="Features — one per line; prefix with * to highlight" full>
          <textarea
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            rows={Math.max(4, features.split("\n").length)}
            className={areaCls}
          />
        </Field>
      </div>

      {isFree ? (
        <p className="mt-3 text-[11px] text-text-secondary/60">
          Free tier: prices are ignored (kept at ₹0). Editing limits here changes the free
          allowance for every user.
        </p>
      ) : null}
      {update.error ? (
        <p className="mt-3 text-xs text-neg">{(update.error as Error).message}</p>
      ) : null}
    </div>
  )
}

function Field({
  label,
  full,
  children,
}: {
  label: string
  full?: boolean
  children: ReactNode
}) {
  return (
    <div className={cn("space-y-1.5", full && "sm:col-span-2")}>
      <Label className="text-xs text-text-secondary">{label}</Label>
      {children}
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-violet"
      />
      {label}
    </label>
  )
}
