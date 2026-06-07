import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, ArrowLeft, Loader2, NotebookPen } from "lucide-react"

import { AddTradeDialog } from "@/components/journal/AddTradeDialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompanyHeader } from "@/components/dossier/CompanyHeader"
import { CoverageMap } from "@/components/dossier/CoverageMap"
import { FindingsList } from "@/components/dossier/FindingsList"
import { MetricsView } from "@/components/dossier/MetricsView"
import { OpenQuestions } from "@/components/dossier/OpenQuestions"
import { RedFlagsList } from "@/components/dossier/RedFlagsList"
import { ReportView } from "@/components/dossier/ReportView"
import { ScenariosCard } from "@/components/dossier/ScenariosCard"
import { SynthesisView } from "@/components/dossier/SynthesisView"
import { ThesisCard } from "@/components/dossier/ThesisCard"
import { TickerChat } from "@/components/dossier/TickerChat"
import { useStrategies } from "@/hooks/useStrategies"
import { useAuth } from "@/contexts/AuthContext"
import { getDesk } from "@/lib/agentos"

const TABS = [
  "Report",
  "Thesis",
  "Findings",
  "Valuation",
  "Risks",
  "Financials",
  "Coverage",
  "Synthesis",
] as const

const triggerClass =
  "rounded-full border border-hairline bg-transparent px-3 py-1.5 text-xs text-text-secondary data-[state=active]:border-violet data-[state=active]:bg-violet/15 data-[state=active]:text-brand-strong data-[state=active]:shadow-none"

export default function RunView() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { getToken } = useAuth()
  const { data: strategies = [] } = useStrategies()
  const [logOpen, setLogOpen] = useState(false)

  const query = useQuery({
    queryKey: ["desk", sessionId],
    queryFn: async () => getDesk(sessionId as string, await getToken()),
    enabled: Boolean(sessionId),
  })

  const run = query.data
  const desk = run?.desk

  return (
    <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-10">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      {query.isLoading && (
        <div className="mt-10 flex items-center gap-3 text-text-secondary">
          <Loader2 className="size-5 animate-spin text-brand" />
          <span className="font-mono text-sm">Loading dossier…</span>
        </div>
      )}

      {query.isError && (
        <div className="mt-10 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            Couldn&apos;t load this dossier. It may still be running, or the id is unknown.
          </span>
        </div>
      )}

      {run && desk && (
        <>
        <div className="mt-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CompanyHeader company={desk.company} ticker={run.ticker} />
            <Button variant="outline" size="sm" onClick={() => setLogOpen(true)} className="gap-1.5">
              <NotebookPen className="size-3.5" />
              Log a trade
            </Button>
          </div>

          <Tabs defaultValue="Report" className="mt-6 gap-4">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1.5 bg-transparent p-0">
              {TABS.map((t) => (
                <TabsTrigger key={t} value={t} className={triggerClass}>
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="Report">
              <ReportView reportMd={run.report_md} gate={run.gate} />
            </TabsContent>

            <TabsContent value="Thesis">
              <ThesisCard thesis={desk.thesis} />
            </TabsContent>

            <TabsContent value="Findings">
              <FindingsList findings={desk.findings} />
            </TabsContent>

            <TabsContent value="Valuation">
              <ScenariosCard scenarios={desk.scenarios} />
            </TabsContent>

            <TabsContent value="Risks" className="space-y-6">
              <div>
                <h3 className="micro-label mb-2">Red flags</h3>
                <RedFlagsList redFlags={desk.red_flags} />
              </div>
              <div>
                <h3 className="micro-label mb-2">What we don&apos;t know</h3>
                <OpenQuestions questions={desk.open_questions} />
              </div>
            </TabsContent>

            <TabsContent value="Financials">
              <MetricsView metrics={desk.metrics} />
            </TabsContent>

            <TabsContent value="Coverage">
              <CoverageMap coverage={desk.coverage} />
            </TabsContent>

            <TabsContent value="Synthesis">
              <SynthesisView
                synthesis={desk.synthesis}
                devilsAdvocate={desk.devils_advocate}
                teamMemos={desk.team_memos}
              />
            </TabsContent>
          </Tabs>
        </div>
        <TickerChat ticker={run.ticker} companyName={desk.company?.name} />
        <AddTradeDialog
          open={logOpen}
          onOpenChange={setLogOpen}
          strategies={strategies}
          prefill={{ ticker: run.ticker, research_session_id: run.session_id }}
        />
        </>
      )}
    </div>
  )
}
