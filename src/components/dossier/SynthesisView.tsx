import { MarkdownView } from "./MarkdownView"
import { EmptyState } from "./parts"

export function SynthesisView({
  synthesis,
  devilsAdvocate,
  teamMemos,
}: {
  synthesis: string
  devilsAdvocate: string
  teamMemos: Record<string, string>
}) {
  const memos = Object.entries(teamMemos ?? {}).filter(([, v]) => (v || "").trim())
  if (!synthesis?.trim() && !devilsAdvocate?.trim() && !memos.length) {
    return <EmptyState label="No synthesis yet — run a Full dossier." />
  }
  return (
    <div className="space-y-6">
      {devilsAdvocate?.trim() ? (
        <div>
          <h3 className="micro-label mb-2">Devil&apos;s advocate</h3>
          <div className="rounded-xl border border-neg/20 bg-neg/[0.04] p-4">
            <MarkdownView>{devilsAdvocate}</MarkdownView>
          </div>
        </div>
      ) : null}

      {synthesis?.trim() ? (
        <div>
          <h3 className="micro-label mb-2">Director&apos;s synthesis</h3>
          <MarkdownView>{synthesis}</MarkdownView>
        </div>
      ) : null}

      {memos.length ? (
        <div>
          <h3 className="micro-label mb-2">Team memos</h3>
          <div className="space-y-3">
            {memos.map(([team, memo]) => (
              <div key={team} className="rounded-xl border border-hairline bg-surface p-4">
                <p className="font-mono text-[11px] uppercase tracking-wide text-brand/70">
                  {team.replace(/_/g, " ")}
                </p>
                <div className="mt-1">
                  <MarkdownView>{memo}</MarkdownView>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
