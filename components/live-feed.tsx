"use client"

import { useSimulatedSocket, type SimEvent } from "@/lib/sim-socket"
import { getAgent } from "@/lib/data"
import { Radio, Search, Handshake, Zap, AlertTriangle, MessageSquare, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const ICON = {
  AGENT_DISCOVERED: Search,
  NEGOTIATION_START: Sparkles,
  MESSAGE: MessageSquare,
  DEAL_REACHED: Handshake,
  HIGH_SPEED_TRAVERSAL: Zap,
  RATE_LIMIT: AlertTriangle,
}

const TONE: Record<SimEvent["type"], string> = {
  AGENT_DISCOVERED: "text-primary",
  NEGOTIATION_START: "text-chart-4",
  MESSAGE: "text-muted-foreground",
  DEAL_REACHED: "text-success",
  HIGH_SPEED_TRAVERSAL: "text-warning",
  RATE_LIMIT: "text-destructive",
}

export function LiveFeed({ className }: { className?: string }) {
  const { events } = useSimulatedSocket(true, 1500)

  return (
    <div className={cn("flex flex-col rounded-xl border border-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Live Network Feed</h3>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
          streaming
        </span>
      </div>
      <div className="flex-1 overflow-hidden p-2">
        {events.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            Waiting for network events...
          </p>
        ) : (
          <ul className="space-y-0.5">
            {events.slice(0, 9).map((ev) => {
              const Icon = ICON[ev.type]
              const from = getAgent(ev.from)
              return (
                <li
                  key={ev.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent/50"
                >
                  <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-md bg-muted", TONE[ev.type])}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-foreground">{ev.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {from?.company} · {ev.type.replace(/_/g, " ").toLowerCase()}
                    </p>
                  </div>
                  {ev.cost ? (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      ${ev.cost.toFixed(3)}
                    </span>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
