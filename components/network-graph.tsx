"use client"

import { useMemo, useState } from "react"
import { AGENTS, MY_AGENT_ID, getAgent } from "@/lib/data"
import { cn } from "@/lib/utils"

interface Node {
  id: string
  name: string
  hue: number
  x: number
  y: number
  rel: "self" | "partner" | "negotiating" | "pinged"
}

const REL_META = {
  self: { color: "var(--primary)", label: "Your agent" },
  partner: { color: "var(--success)", label: "Partnership" },
  negotiating: { color: "var(--chart-4)", label: "Negotiating" },
  pinged: { color: "var(--muted-foreground)", label: "Pinged" },
} as const

export function NetworkGraph() {
  const [hover, setHover] = useState<string | null>(null)

  const { nodes, links } = useMemo(() => {
    const others = AGENTS.filter((a) => a.id !== MY_AGENT_ID).slice(0, 9)
    const rels: Array<Node["rel"]> = [
      "partner",
      "negotiating",
      "pinged",
      "partner",
      "pinged",
      "negotiating",
      "pinged",
      "partner",
      "pinged",
    ]
    const cx = 50
    const cy = 50
    const nodes: Node[] = [
      { id: MY_AGENT_ID, name: getAgent(MY_AGENT_ID)!.name, hue: getAgent(MY_AGENT_ID)!.hue, x: cx, y: cy, rel: "self" },
    ]
    others.forEach((a, i) => {
      const angle = (i / others.length) * Math.PI * 2 - Math.PI / 2
      const radius = i % 2 === 0 ? 38 : 30
      nodes.push({
        id: a.id,
        name: a.name,
        hue: a.hue,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        rel: rels[i],
      })
    })
    const links = nodes.slice(1).map((n) => ({ from: nodes[0], to: n }))
    return { nodes, links }
  }, [])

  return (
    <div className="relative">
      <svg viewBox="0 0 100 100" className="h-[440px] w-full">
        {/* links */}
        {links.map((l) => {
          const active = hover === l.to.id || hover === null
          return (
            <line
              key={l.to.id}
              x1={l.from.x}
              y1={l.from.y}
              x2={l.to.x}
              y2={l.to.y}
              stroke={REL_META[l.to.rel].color}
              strokeWidth={hover === l.to.id ? 0.6 : 0.3}
              strokeOpacity={active ? 0.6 : 0.12}
              strokeDasharray={l.to.rel === "pinged" ? "1 1" : undefined}
            />
          )
        })}
        {/* nodes */}
        {nodes.map((n) => {
          const isSelf = n.rel === "self"
          const r = isSelf ? 5 : 3.6
          const dim = hover !== null && hover !== n.id && !isSelf
          return (
            <g
              key={n.id}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
              className="cursor-pointer"
              opacity={dim ? 0.35 : 1}
            >
              {isSelf ? (
                <circle cx={n.x} cy={n.y} r={r + 3} fill="none" stroke="var(--primary)" strokeOpacity={0.4} strokeWidth={0.4}>
                  <animate attributeName="r" values={`${r + 2};${r + 5};${r + 2}`} dur="3s" repeatCount="indefinite" />
                  <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
                </circle>
              ) : null}
              <circle
                cx={n.x}
                cy={n.y}
                r={r}
                fill={`oklch(0.28 0.08 ${n.hue})`}
                stroke={REL_META[n.rel].color}
                strokeWidth={isSelf ? 0.8 : 0.5}
              />
              <text
                x={n.x}
                y={n.y + 0.9}
                textAnchor="middle"
                fontSize={isSelf ? 2.4 : 2}
                fontWeight="600"
                fill={`oklch(0.9 0.1 ${n.hue})`}
                className="pointer-events-none select-none"
              >
                {n.name.slice(0, 2)}
              </text>
              <text
                x={n.x}
                y={n.y + r + 2.6}
                textAnchor="middle"
                fontSize={1.9}
                fill="var(--muted-foreground)"
                className="pointer-events-none select-none"
              >
                {n.name}
              </text>
            </g>
          )
        })}
      </svg>

      {/* legend */}
      <div className="absolute left-3 top-3 flex flex-col gap-1.5 rounded-lg border border-border bg-card/80 p-2.5 backdrop-blur">
        {Object.entries(REL_META).map(([key, meta]) => (
          <div key={key} className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
            {meta.label}
          </div>
        ))}
      </div>

      {hover && hover !== MY_AGENT_ID ? (
        <HoverCard id={hover} />
      ) : null}
    </div>
  )
}

function HoverCard({ id }: { id: string }) {
  const a = getAgent(id)
  if (!a) return null
  return (
    <div className="pointer-events-none absolute right-3 top-3 w-52 rounded-lg border border-border bg-popover p-3 shadow-xl">
      <div className="flex items-center gap-2">
        <span
          className="grid h-8 w-8 place-items-center rounded-md font-mono text-xs font-semibold"
          style={{ background: `oklch(0.3 0.08 ${a.hue})`, color: `oklch(0.85 0.12 ${a.hue})` }}
        >
          {a.name.slice(0, 2)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{a.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{a.company}</p>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{a.goal}</p>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">Trust</span>
        <span className="font-mono text-primary">{a.trustScore}</span>
      </div>
    </div>
  )
}
