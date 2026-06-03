import { Link } from "react-router-dom"
import { ArrowRight, FileSearch, Layers, ScanSearch, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"

const PILLARS = [
  {
    icon: ScanSearch,
    title: "Read the filings, not the noise",
    body: "We start from primary sources — annual reports, disclosures, financials — and work outward, so every claim traces back to a document.",
  },
  {
    icon: Layers,
    title: "A structured dossier, assembled live",
    body: "Thesis, findings, scenarios, red flags and coverage are built as discrete, inspectable parts — you watch them form, not a black box.",
  },
  {
    icon: ShieldCheck,
    title: "Evidence-gated by design",
    body: "Findings carry confidence and supporting references. Pillars are supported, refuted or retired as the evidence demands.",
  },
  {
    icon: FileSearch,
    title: "Research, not recommendations",
    body: "HakiSense never says BUY, HOLD or SELL. It surfaces what the evidence shows and leaves the judgment to you.",
  },
]

export default function About() {
  return (
    <div>
      {/* Header */}
      <section className="mx-auto max-w-3xl px-6 pb-12 pt-16 text-center">
        <p className="micro-label">About HakiSense</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-text-primary sm:text-5xl">
          See what others miss <span className="text-gradient">in the filings.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-text-secondary">
          HakiSense is an equity-research engine. You give it a ticker; it reads the primary
          sources and assembles a structured, evidence-backed dossier you can interrogate — a
          research analyst&apos;s workflow, made transparent and fast.
        </p>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <div key={p.title} className="card-glass p-6">
              <span className="grid size-10 place-items-center rounded-xl glass glow-violet-subtle">
                <p.icon className="size-5 text-brand" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold text-text-primary">
                {p.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy callout */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-2xl border border-violet/20 bg-violet/[0.06] p-8">
          <h2 className="font-display text-xl font-semibold text-text-primary">
            Why research, not advice?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            A recommendation collapses a rich, uncertain picture into a single word and hides
            the reasoning. We think that&apos;s the wrong abstraction for serious work. HakiSense
            keeps the reasoning in front of you: the evidence, the confidence behind each
            finding, the scenarios that could play out, and the open questions that remain.
            What you do with it is yours to decide.
          </p>
        </div>
      </section>

      {/* How it's built */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <h2 className="micro-label mb-4">How it&apos;s built</h2>
        <p className="text-sm leading-relaxed text-text-secondary">
          Under the hood, a team of specialized agents coordinates the work — intake and
          scoping, evidence retrieval, thesis construction, scenario and risk analysis — each
          contributing to a shared, typed dossier. The result is research that&apos;s reproducible
          and traceable, rather than a single opaque generation.
        </p>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 pb-20 pt-6 text-center">
        <h2 className="font-display text-2xl font-semibold text-text-primary">
          Start with a ticker.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          Watch a dossier assemble in real time, then read it on your terms.
        </p>
        <Button asChild size="lg" className="btn-primary mt-6 gap-2 text-white">
          <Link to="/signup">
            Get started
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>
    </div>
  )
}
