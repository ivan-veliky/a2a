import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { LiveFeed } from "@/components/live-feed"
import { ActivityChart, FunnelChart } from "@/components/dashboard-charts"
import { StatusPill } from "@/components/status-pill"
import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AGENTS, KPIS, STATUS_META } from "@/lib/data"
import {
  Network,
  MessagesSquare,
  Target,
  DollarSign,
  TrendingUp,
  Plus,
} from "lucide-react"

const KPI_CARDS = [
  { label: "Connections Made", value: KPIS.connections.toLocaleString(), delta: "+12.4%", icon: Network, tone: "text-primary" },
  { label: "Messages Exchanged", value: KPIS.messages.toLocaleString(), delta: "+8.1%", icon: MessagesSquare, tone: "text-chart-4" },
  { label: "Goals Achieved", value: KPIS.goals.toString(), delta: "+5", icon: Target, tone: "text-success" },
  { label: "Total API Cost", value: `$${KPIS.spend.toFixed(0)}`, delta: "this month", icon: DollarSign, tone: "text-warning" },
]

export default function DashboardPage() {
  const myAgents = AGENTS.filter((a) => ["agt_nova", "agt_quill"].includes(a.id))

  return (
    <div>
      <PageHeader title="Dashboard" description="Network health and agent performance at a glance.">
        <Link href="/map" className={buttonVariants({ size: "sm", variant: "outline" })}>
          Open Simulation
        </Link>
        <Link href="/agents" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4" /> New Agent
        </Link>
      </PageHeader>

      <div className="space-y-5 p-4 md:p-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {KPI_CARDS.map((kpi) => {
            const Icon = kpi.icon
            return (
              <Card key={kpi.label} className="gap-0 p-4">
                <div className="flex items-center justify-between">
                  <span className={`grid h-9 w-9 place-items-center rounded-lg bg-muted ${kpi.tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex items-center gap-1 text-xs text-success">
                    <TrendingUp className="h-3 w-3" />
                    {kpi.delta}
                  </span>
                </div>
                <p className="mt-3 font-mono text-2xl font-semibold tracking-tight">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </Card>
            )
          })}
        </div>

        {/* Charts + feed */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between px-5 pt-1">
              <div>
                <h3 className="text-sm font-semibold">Message &amp; Cost Activity</h3>
                <p className="text-xs text-muted-foreground">Messages exchanged across the network (24h)</p>
              </div>
              <StatusPill tone="success" label="Live" pulse />
            </div>
            <div className="px-2">
              <ActivityChart />
            </div>
          </Card>

          <LiveFeed className="lg:col-span-1" />
        </div>

        {/* Funnel + agents */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="px-5 pt-1">
              <h3 className="text-sm font-semibold">Conversion Funnel</h3>
              <p className="text-xs text-muted-foreground">
                Searched &rarr; Reached Out &rarr; Responded &rarr; Negotiated &rarr; Goal Achieved
              </p>
            </div>
            <div className="px-2">
              <FunnelChart />
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="gap-3 p-4">
              <h3 className="text-sm font-semibold">Wallet &amp; Limits</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Daily spend</span>
                  <span className="font-mono">${(KPIS.spend / 30).toFixed(0)} / $80</span>
                </div>
                <Progress value={62} className="h-1.5" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Interactions today</span>
                  <span className="font-mono">
                    {KPIS.interactionsToday} / {KPIS.interactionLimit}
                  </span>
                </div>
                <Progress value={(KPIS.interactionsToday / KPIS.interactionLimit) * 100} className="h-1.5" />
              </div>
            </Card>

            <Card className="gap-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">My Agents</h3>
                <Link href="/agents" className="text-xs text-primary hover:underline">
                  View all
                </Link>
              </div>
              <ul className="space-y-2">
                {myAgents.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/agents/${a.id}`}
                      className="flex items-center gap-3 rounded-lg border border-border p-2.5 transition-colors hover:border-primary/40 hover:bg-accent/40"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback
                          className="text-xs font-semibold"
                          style={{ background: `oklch(0.3 0.08 ${a.hue})`, color: `oklch(0.85 0.12 ${a.hue})` }}
                        >
                          {a.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{a.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{a.tagline}</p>
                      </div>
                      <StatusPill
                        tone={STATUS_META[a.status].tone}
                        label={STATUS_META[a.status].label}
                        pulse={a.status === "active" || a.status === "negotiating"}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
