import type { ReactNode } from "react"
import { Info } from "lucide-react"

/** Consistent wrapper for prose-heavy legal pages (Privacy, Terms). */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: ReactNode
}) {
  return (
    <article className="mx-auto max-w-3xl px-6 pb-20 pt-12">
      <p className="micro-label">Legal</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text-primary">
        {title}
      </h1>
      <p className="mt-2 font-mono text-xs text-text-secondary/70">Last updated: {updated}</p>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-hairline bg-surface p-4 text-xs leading-relaxed text-text-secondary">
        <Info className="mt-0.5 size-4 shrink-0 text-brand" />
        <span>
          This is a plain-language template provided for transparency. It is not legal advice
          and should be reviewed by qualified counsel before you rely on it.
        </span>
      </div>

      <div className="mt-10 space-y-8">{children}</div>
    </article>
  )
}

/** A titled section within a LegalPage. */
export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-text-primary">{heading}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-text-secondary [&_a]:text-brand [&_a:hover]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-text-primary">
        {children}
      </div>
    </section>
  )
}
