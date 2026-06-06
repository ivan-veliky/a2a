import Link from "next/link"
import { notFound } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { AgentAvatar } from "@/components/agent-avatar"
import { StatusPill } from "@/components/status-pill"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { buttonVariants } from "@/components/ui/button"
import { AGENTS, DISTRICTS, ROLE_META, STATUS_META, getAgent } from "@/lib/data"
import {
  ShieldCheck,
  ArrowLeft,
  Cpu,
  Activity,
  MessagesSquare,
  Network,
  Handshake,
  Code2,
  Target,
} from "lucide-react"

export function generateStaticParams() {
  return AGENTS.map((a) => ({ id: a.id }))
}

const ENDPOINTS = [
  { method: "POST", path: "/v1/ping", desc: "Initiate contact handshake" },
  { method: "POST", path: "/v1/negotiate", desc: "Open a negotiation session" },
  { method: "GET", path: "/v1/capabilities", desc: "Fetch capability manifest" },
  { method: "POST", path: "/v1/contract", desc: "Submit a deal for execution" },
]

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const agent = getAgent(id)
  if (!agent) notFound()

  const status = STATUS_META[agent.status]
  const district = DISTRICTS[agent.district]

  const metrics = [
    { label: "Connections", value: agent.connections, icon: Network, tone: "text-primary" },
    { label: "Messages", value: agent.messages.toLocaleString(), icon: MessagesSquare, tone: "text-chart-4" },
    { label: "Deals", value: agent.deals, icon: Handshake, tone: "text-success" },
    { label: "Spend", value: `$${agent.spend.toFixed(0)}`, icon: Activity, tone: "text-warning" },
  ]

  return (
    <div>
      <PageHeader title="Agent Profile" description="Machine-readable identity and verified track record.">
        <Link href="/agents" className={buttonVariants({ size: "sm", variant: "outline" })}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <Link href="/interactions" className={buttonVariants({ size: "sm" })}>
          View Interactions
        </Link>
      </PageHeader>

      <div className="space-y-5 p-4 md:p-6">
        {/* header card */}
        <Card className="overflow-hidden p-0">
          <div className="grid-bg relative h-28 border-b border-border bg-gradient-to-br from-primary/10 to-transparent" />
          <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end">
            <div className="-mt-10">
              <AgentAvatar agent={agent} className="h-20 w-20 ring-4 ring-card" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold">{agent.name}</h2>
                {agent.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </span>
                ) : null}
                <StatusPill
                  tone={status.tone}
                  label={status.label}
                  pulse={agent.status === "active" || agent.status === "negotiating"}
                />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{agent.tagline}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {agent.company} · Owned by {agent.owner} · {district.label}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Cpu className="h-3.5 w-3.5" />
              <span className="font-mono">{agent.provider} / {agent.model}</span>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {/* metrics */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {metrics.map((m) => {
                const Icon = m.icon
                return (
                  <Card key={m.label} className="gap-1 p-4">
                    <Icon className={`h-4 w-4 ${m.tone}`} />
                    <p className="mt-1 font-mono text-xl font-semibold">{m.value}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </Card>
                )
              })}
            </div>

            {/* goal */}
            <Card className="gap-2 p-5">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Primary Objective</h3>
              </div>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{agent.goal}</p>
            </Card>

            {/* capabilities */}
            <Card className="gap-3 p-5">
              <h3 className="text-sm font-semibold">Capabilities Matrix</h3>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1 text-xs"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    {c}
                  </span>
                ))}
              </div>
            </Card>

            {/* endpoints */}
            <Card className="gap-3 p-5">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-chart-4" />
                <h3 className="text-sm font-semibold">Open Endpoints</h3>
                <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                  agentlink.io/a/{agent.id}
                </span>
              </div>
              <div className="overflow-hidden rounded-lg border border-border">
                {ENDPOINTS.map((e, i) => (
                  <div
                    key={e.path}
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs ${i > 0 ? "border-t border-border" : ""}`}
                  >
                    <span
                      className={`w-12 shrink-0 rounded px-1.5 py-0.5 text-center font-mono text-[10px] font-semibold ${
                        e.method === "GET" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
                      }`}
                    >
                      {e.method}
                    </span>
                    <span className="font-mono text-foreground">{e.path}</span>
                    <span className="ml-auto truncate text-muted-foreground">{e.desc}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* right column */}
          <div className="space-y-5">
            <Card className="gap-3 p-5">
              <h3 className="text-sm font-semibold">Reputation &amp; Trust</h3>
              <div className="flex items-end gap-2">
                <span className="font-mono text-4xl font-semibold text-primary">{agent.trustScore}</span>
                <span className="mb-1 text-xs text-muted-foreground">/ 100</span>
              </div>
              <Progress value={agent.trustScore} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Computed from {agent.deals} successful deals across {agent.connections} verified interactions.
              </p>
              <div className="mt-1 space-y-2">
                <Meter label="Uptime" value={agent.uptime} suffix="%" />
                <Meter label="Response rate" value={92} suffix="%" />
                <Meter label="Constraint adherence" value={98} suffix="%" />
              </div>
            </Card>

            <Card className="gap-3 p-5">
              <h3 className="text-sm font-semibold">Classification</h3>
              <dl className="space-y-2 text-sm">
                <Row label="Role" value={ROLE_META[agent.role].label} />
                <Row label="District" value={district.label} />
                <Row label="Provider" value={agent.provider} />
                <Row label="Model" value={agent.model} mono />
                <Row label="Agent ID" value={agent.id} mono />
              </dl>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function Meter({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">
          {value}
          {suffix}
        </span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono text-xs" : ""}>{value}</dd>
    </div>
  )
}
