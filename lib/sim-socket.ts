"use client"

import { useEffect, useRef, useState } from "react"
import { AGENTS } from "./data"

export type SimEventType =
  | "AGENT_DISCOVERED"
  | "NEGOTIATION_START"
  | "MESSAGE"
  | "DEAL_REACHED"
  | "HIGH_SPEED_TRAVERSAL"
  | "RATE_LIMIT"

export interface SimEvent {
  id: string
  type: SimEventType
  from: string
  to?: string
  ts: number
  label: string
  cost?: number
}

const SUMMARIES = [
  "Offering 20% discount",
  "Checking constraints...",
  "Requesting audience data",
  "Drafting contract { }",
  "Matching capabilities",
  "Proposing webhook bridge",
  "Negotiating commission",
  "Verifying trust score",
]

let counter = 0
function uid() {
  counter += 1
  return `ev_${Date.now()}_${counter}`
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function makeEvent(): SimEvent {
  const types: SimEventType[] = [
    "MESSAGE",
    "MESSAGE",
    "MESSAGE",
    "AGENT_DISCOVERED",
    "NEGOTIATION_START",
    "HIGH_SPEED_TRAVERSAL",
    "DEAL_REACHED",
    "RATE_LIMIT",
  ]
  const type = rand(types)
  const a = rand(AGENTS)
  let b = rand(AGENTS)
  while (b.id === a.id) b = rand(AGENTS)

  const labels: Record<SimEventType, string> = {
    AGENT_DISCOVERED: `${a.name} discovered ${b.name}`,
    NEGOTIATION_START: `${a.name} ↔ ${b.name} negotiating`,
    MESSAGE: rand(SUMMARIES),
    DEAL_REACHED: `${a.name} + ${b.name} deal reached`,
    HIGH_SPEED_TRAVERSAL: `${a.name} jumped to ${b.name}`,
    RATE_LIMIT: `${a.name} hit a rate limit`,
  }

  return {
    id: uid(),
    type,
    from: a.id,
    to: type === "MESSAGE" || type === "RATE_LIMIT" ? undefined : b.id,
    ts: Date.now(),
    label: labels[type],
    cost: type === "MESSAGE" ? Number((Math.random() * 0.03).toFixed(3)) : undefined,
  }
}

/**
 * Simulated WebSocket. Emits SimEvents on an interval to mimic a live
 * agent network feed without any backend.
 */
export function useSimulatedSocket(enabled = true, intervalMs = 1800) {
  const [events, setEvents] = useState<SimEvent[]>([])
  const [last, setLast] = useState<SimEvent | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!enabled) return
    timer.current = setInterval(() => {
      const ev = makeEvent()
      setLast(ev)
      setEvents((prev) => [ev, ...prev].slice(0, 40))
    }, intervalMs)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [enabled, intervalMs])

  return { events, last }
}
