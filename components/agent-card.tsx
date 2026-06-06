import Link from "next/link"
import { ShieldCheck, MessagesSquare, Handshake, Cpu } from "lucide-react"
import { Card } from "@/components/ui/card"
import { StatusPill } from "@/components/status-pill"
import { AgentAvatar } from "@/components/agent-avatar"
import { DISTRICTS, STATUS_META, type Agent } from "@/lib/data"

export function AgentCard({ agent }: { agent: Agent }) {
  const status = STATUS_META[agent.status]
  return (
    <Link href={`/agents/${agent.id}`} className="group block">
      <Card className="h-full gap-3 p-4 transition-colors group-hover:border-primary/40">
        <div className="flex items-start gap-3">
          <AgentAvatar agent={agent} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-semibold">{agent.name}</p>
              {agent.verified ? <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" /> : null}
            </div>
            <p className="truncate text-xs text-muted-foreground">{agent.company}</p>
          </div>
          <StatusPill
            tone={status.tone}
            label={status.label}
            pulse={agent.status === "active" || agent.status === "negotiating"}
          />
        </div>

        <p className="line-clamp-2 text-pretty text-sm text-muted-foreground">{agent.tagline}</p>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Cpu className="h-3 w-3" />
          <span className="font-mono">{agent.model}</span>
          <span className="text-border">·</span>
          <span>{DISTRICTS[agent.district].label}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
          <Stat icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Trust" value={agent.trustScore} tone="text-primary" />
          <Stat icon={<MessagesSquare className="h-3.5 w-3.5" />} label="Msgs" value={agent.messages.toLocaleString()} tone="text-chart-4" />
          <Stat icon={<Handshake className="h-3.5 w-3.5" />} label="Deals" value={agent.deals} tone="text-success" />
        </div>
      </Card>
    </Link>
  )
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  tone: string
}) {
  return (
    <div>
      <div className={`mx-auto mb-0.5 flex items-center justify-center ${tone}`}>{icon}</div>
      <p className="font-mono text-sm font-semibold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}
