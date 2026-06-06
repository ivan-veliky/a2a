"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { SimEngine } from "@/lib/sim-engine"
import { useSimulatedSocket } from "@/lib/sim-socket"
import { AGENTS, DISTRICTS, MY_AGENT_ID, ROLE_META, STATUS_META, getAgent, type District } from "@/lib/data"
import { SimCanvas } from "@/components/sim-canvas"
import { NodeGraph } from "@/components/node-graph"
import { LiveFeed } from "@/components/live-feed"
import { AgentAvatar } from "@/components/agent-avatar"
import { StatusPill } from "@/components/status-pill"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Boxes, Share2, Radio, Crosshair, Pause, Play, ShieldCheck, Target, Gauge } from "lucide-react"

type ViewMode = "robots" | "graph" | "feed"

export function SimulationView() {
  // one engine instance for the lifetime of the page
  const engineRef = useRef<SimEngine | null>(null)
  if (engineRef.current === null) engineRef.current = new SimEngine()
  const engine = engineRef.current

  const [view, setView] = useState<ViewMode>("robots")
  const [paused, setPaused] = useState(false)
  const [follow, setFollow] = useState<string | null>(null)
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  // simulated websocket -> feed engine
  const { last, events } = useSimulatedSocket(!paused, 1600)
  const lastIngested = useRef<string | null>(null)
  useEffect(() => {
    if (last && last.id !== lastIngested.current) {
      lastIngested.current = last.id
      engine.ingest(last)
    }
  }, [last, engine])

  const hoverAgent = hover ? getAgent(hover.id) : null
  const selectedAgent = selected ? getAgent(selected) : null
  const liveCount = events.length

  const districtCounts = useMemo(() => {
    const m: Record<District, number> = { saas: 0, ecommerce: 0, developer: 0, finance: 0, marketing: 0 }
    for (const a of AGENTS) m[a.district]++
    return m
  }, [])

  return (
    <div className="relative flex h-[calc(100vh-9rem)] min-h-[560px] flex-col gap-3 px-4 pb-4 md:px-6">
      {/* top control row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ViewToggle view={view} setView={setView} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={follow === MY_AGENT_ID ? "default" : "outline"}
            size="sm"
            onClick={() => setFollow((f) => (f === MY_AGENT_ID ? null : MY_AGENT_ID))}
            className="gap-1.5"
          >
            <Crosshair className="h-3.5 w-3.5" />
            {follow === MY_AGENT_ID ? "Following Nova" : "Follow my agent"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPaused((p) => !p)} className="gap-1.5">
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {paused ? "Resume" : "Pause"}
          </Button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-xl border border-border bg-[oklch(0.14_0.02_255)]">
        {/* live badge */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs backdrop-blur">
          <span className={cn("h-1.5 w-1.5 rounded-full bg-success", !paused && "pulse-dot")} />
          {paused ? "paused" : "live"} · {liveCount} events
        </div>

        {/* district legend */}
        {view !== "feed" ? (
          <div className="pointer-events-none absolute right-3 top-3 z-10 hidden gap-1.5 rounded-lg border border-border bg-card/70 p-2 text-[10px] backdrop-blur sm:grid">
            {(Object.keys(DISTRICTS) as District[]).map((k) => (
              <div key={k} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: `oklch(0.72 0.16 ${DISTRICTS[k].hue})` }}
                />
                <span className="text-muted-foreground">{DISTRICTS[k].label}</span>
                <span className="ml-auto font-mono text-foreground">{districtCounts[k]}</span>
              </div>
            ))}
          </div>
        ) : null}

        {/* main stage */}
        {view === "robots" ? (
          <SimCanvas
            engine={engine}
            followId={follow}
            myId={MY_AGENT_ID}
            paused={paused}
            onHover={(id, x, y) => setHover(id ? { id, x, y } : null)}
            onPickBot={(id) => {
              setSelected(id)
              setFollow((f) => (f === id ? f : id))
            }}
          />
        ) : view === "graph" ? (
          <NodeGraph engine={engine} paused={paused} />
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <LiveFeed className="h-full" />
          </div>
        )}

        {/* hover tooltip: public profile card */}
        {hoverAgent && view === "robots" ? (
          <div
            className="pointer-events-none fixed z-50 w-56 rounded-lg border border-border bg-popover p-3 shadow-xl"
            style={{
              left: Math.min(hover!.x + 14, (typeof window !== "undefined" ? window.innerWidth : 9999) - 240),
              top: hover!.y + 14,
            }}
          >
            <div className="flex items-center gap-2">
              <AgentAvatar agent={hoverAgent} className="h-9 w-9" />
              <div className="min-w-0">
                <p className="flex items-center gap-1 truncate text-sm font-semibold">{hoverAgent.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{hoverAgent.company}</p>
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">{hoverAgent.goal}</p>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{ROLE_META[hoverAgent.role].label}</span>
              <span className="flex items-center gap-1 font-mono text-foreground">
                <ShieldCheck className="h-3 w-3 text-success" />
                {hoverAgent.trustScore}
              </span>
            </div>
          </div>
        ) : null}

        {/* selected agent dock */}
        {selectedAgent ? (
          <div className="absolute bottom-3 left-3 z-10 w-64 rounded-xl border border-border bg-card/85 p-3 backdrop-blur">
            <div className="flex items-center gap-2">
              <AgentAvatar agent={selectedAgent} className="h-9 w-9" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{selectedAgent.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{selectedAgent.tagline}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <Metric icon={<Target className="h-3 w-3" />} label="Deals" value={String(selectedAgent.deals)} />
              <Metric icon={<ShieldCheck className="h-3 w-3" />} label="Trust" value={String(selectedAgent.trustScore)} />
              <Metric icon={<Gauge className="h-3 w-3" />} label="Conns" value={String(selectedAgent.connections)} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <StatusPill
                tone={STATUS_META[selectedAgent.status].tone}
                label={STATUS_META[selectedAgent.status].label}
                pulse={selectedAgent.status === "negotiating"}
              />
              <Button
                size="sm"
                variant={follow === selectedAgent.id ? "default" : "outline"}
                className="h-7 gap-1 px-2 text-xs"
                onClick={() => setFollow((f) => (f === selectedAgent.id ? null : selectedAgent.id))}
              >
                <Crosshair className="h-3 w-3" />
                {follow === selectedAgent.id ? "Following" : "Follow"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/50 py-1.5">
      <div className="flex items-center justify-center gap-1 text-muted-foreground">{icon}</div>
      <p className="font-mono text-sm font-semibold leading-tight">{value}</p>
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  )
}

function ViewToggle({ view, setView }: { view: ViewMode; setView: (v: ViewMode) => void }) {
  const items: { id: ViewMode; label: string; icon: typeof Boxes }[] = [
    { id: "robots", label: "Robots", icon: Boxes },
    { id: "graph", label: "Node Graph", icon: Share2 },
    { id: "feed", label: "Feed", icon: Radio },
  ]
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
      {items.map((it) => {
        const Icon = it.icon
        const active = view === it.id
        return (
          <button
            key={it.id}
            onClick={() => setView(it.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{it.label}</span>
          </button>
        )
      })}
    </div>
  )
}
