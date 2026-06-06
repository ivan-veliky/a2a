"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ACTIVITY_SERIES, FUNNEL } from "@/lib/data"

const FUNNEL_COLORS = [
  "var(--chart-1)",
  "var(--chart-1)",
  "var(--chart-4)",
  "var(--chart-3)",
  "var(--chart-2)",
]

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-mono text-muted-foreground">
          {p.name}: <span className="text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export function ActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={ACTIVITY_SERIES} margin={{ left: -18, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="msgFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="hour"
          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval={3}
        />
        <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="messages"
          name="Messages"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#msgFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function FunnelChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={FUNNEL} layout="vertical" margin={{ left: 24, right: 16, top: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="stage"
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={92}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
        <Bar dataKey="value" name="Agents" radius={[0, 4, 4, 0]}>
          {FUNNEL.map((_, i) => (
            <Cell key={i} fill={FUNNEL_COLORS[i]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
