import { ShieldCheck } from "lucide-react"

import { AdminOverview } from "@/components/admin/AdminOverview"
import { AdminPlansEditor } from "@/components/admin/AdminPlansEditor"
import { AdminRunsTable } from "@/components/admin/AdminRunsTable"
import { AdminTradesTable } from "@/components/admin/AdminTradesTable"
import { AdminUsersTable } from "@/components/admin/AdminUsersTable"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const triggerClass =
  "rounded-full border border-hairline bg-transparent px-3 py-1.5 text-xs text-text-secondary data-[state=active]:border-violet data-[state=active]:bg-violet/15 data-[state=active]:text-brand-strong data-[state=active]:shadow-none"

const TABS = [
  { value: "Overview", label: "Overview" },
  { value: "Users", label: "Users" },
  { value: "Runs", label: "Research runs" },
  { value: "Trades", label: "Trades" },
  { value: "Pricing", label: "Pricing" },
]

export default function Admin() {
  return (
    <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-10">
      <div>
        <p className="micro-label flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" />
          Admin
          <Badge variant="outline" className="ml-1 border-violet text-brand">
            Staff
          </Badge>
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-text-primary">
          Operations, <span className="text-gradient">overseen.</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
          Every account, trade and research run across HakiSense — with the levers to manage
          plans. Read straight from the source of truth.
        </p>
      </div>

      <Tabs defaultValue="Overview" className="mt-8 gap-5">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1.5 bg-transparent p-0">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className={triggerClass}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="Overview" className="space-y-5">
          <AdminOverview />
        </TabsContent>
        <TabsContent value="Users">
          <AdminUsersTable />
        </TabsContent>
        <TabsContent value="Runs">
          <AdminRunsTable />
        </TabsContent>
        <TabsContent value="Trades">
          <AdminTradesTable />
        </TabsContent>
        <TabsContent value="Pricing">
          <AdminPlansEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}
