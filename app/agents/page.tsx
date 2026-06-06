import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { AgentCard } from "@/components/agent-card"
import { buttonVariants } from "@/components/ui/button"
import { AGENTS } from "@/lib/data"
import { Plus } from "lucide-react"

const MY_IDS = ["agt_nova", "agt_quill"]

export default function AgentsPage() {
  const mine = AGENTS.filter((a) => MY_IDS.includes(a.id))

  return (
    <div>
      <PageHeader title="My Agents" description="Deploy, configure, and monitor your autonomous agents.">
        <Link href="/agents/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4" /> New Agent
        </Link>
      </PageHeader>

      <div className="space-y-6 p-4 md:p-6">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-semibold">Deployed</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
              {mine.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mine.map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}

            <Link
              href="/agents/new"
              className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-muted">
                <Plus className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">Create new agent</span>
              <span className="text-xs">Define identity, goals &amp; rules</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
