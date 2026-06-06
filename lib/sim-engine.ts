import { AGENTS, DISTRICTS, type Agent, type District } from "./data"
import type { SimEvent } from "./sim-socket"

export type BotState = "idle" | "search" | "travel" | "talk" | "deal" | "cooldown"

export interface Bot {
  id: string
  agent: Agent
  // normalized home anchor (0..1)
  hx: number
  hy: number
  // normalized current position (0..1)
  x: number
  y: number
  // normalized target
  tx: number
  ty: number
  state: BotState
  stateUntil: number
  speed: number
  partner: string | null
  jetpack: boolean
  bubble: { text: string; until: number } | null
  spark: number
  bob: number
  trail: { x: number; y: number; life: number }[]
}

export interface Burst {
  x: number
  y: number
  life: number
  hue: number
  kind: "deal" | "spark"
}

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now())

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function wanderTarget(d: District) {
  const meta = DISTRICTS[d]
  const a = rand(0, Math.PI * 2)
  const r = rand(0, meta.r * 0.85)
  return { x: meta.cx + Math.cos(a) * r, y: meta.cy + Math.sin(a) * r }
}

/**
 * Headless animation engine. Holds all bot/particle state in plain mutable
 * objects and advances them via `tick(dt)`. It is intentionally decoupled from
 * React: the canvas component calls `tick` + `draw` inside requestAnimationFrame
 * so per-frame work never triggers React re-renders or blocks the main UI tree.
 *
 * SimEvents (the simulated WebSocket payloads: AGENT_DISCOVERED,
 * NEGOTIATION_START, MESSAGE, DEAL_REACHED, HIGH_SPEED_TRAVERSAL, RATE_LIMIT)
 * are pushed in via `ingest()` and translated into character animations and
 * pathfinding targets here.
 */
export class SimEngine {
  bots = new Map<string, Bot>()
  bursts: Burst[] = []
  private order: string[] = []

  constructor() {
    for (const agent of AGENTS) {
      this.bots.set(agent.id, {
        id: agent.id,
        agent,
        hx: agent.x,
        hy: agent.y,
        x: agent.x,
        y: agent.y,
        tx: agent.x,
        ty: agent.y,
        state: agent.status === "cooldown" ? "cooldown" : agent.status === "negotiating" ? "talk" : "search",
        stateUntil: now() + rand(2000, 5000),
        speed: rand(0.05, 0.09),
        partner: null,
        jetpack: false,
        bubble: null,
        spark: 0,
        bob: rand(0, Math.PI * 2),
        trail: [],
      })
    }
    this.order = AGENTS.map((a) => a.id)
  }

  list(): Bot[] {
    return this.order.map((id) => this.bots.get(id)!).filter(Boolean)
  }

  private setState(bot: Bot, state: BotState, duration: number) {
    bot.state = state
    bot.stateUntil = now() + duration
  }

  ingest(ev: SimEvent) {
    const from = this.bots.get(ev.from)
    const to = ev.to ? this.bots.get(ev.to) : null
    const t = now()

    switch (ev.type) {
      case "AGENT_DISCOVERED": {
        if (from && to) {
          // sender walks toward the discovered agent
          from.tx = to.x + rand(-0.03, 0.03)
          from.ty = to.y + rand(-0.03, 0.03)
          this.setState(from, "search", 4000)
          from.bubble = { text: "scanning { } ...", until: t + 2200 }
        }
        break
      }
      case "NEGOTIATION_START": {
        if (from && to) {
          // pair them up face to face at the midpoint
          const mx = (from.x + to.x) / 2
          const my = (from.y + to.y) / 2
          from.tx = mx - 0.025
          from.ty = my
          to.tx = mx + 0.025
          to.ty = my
          from.partner = to.id
          to.partner = from.id
          this.setState(from, "talk", 6000)
          this.setState(to, "talk", 6000)
        }
        break
      }
      case "MESSAGE": {
        if (from) {
          from.bubble = { text: ev.label, until: t + 2600 }
          if (from.state !== "talk") this.setState(from, "search", 3000)
        }
        break
      }
      case "DEAL_REACHED": {
        if (from && to) {
          const mx = (from.x + to.x) / 2
          const my = (from.y + to.y) / 2
          from.tx = mx - 0.02
          from.ty = my
          to.tx = mx + 0.02
          to.ty = my
          this.setState(from, "deal", 2600)
          this.setState(to, "deal", 2600)
          from.bubble = { text: "Deal reached", until: t + 2400 }
          this.bursts.push({ x: mx, y: my, life: 1, hue: from.agent.hue, kind: "deal" })
        }
        break
      }
      case "HIGH_SPEED_TRAVERSAL": {
        if (from && to) {
          from.tx = to.x + rand(-0.04, 0.04)
          from.ty = to.y + rand(-0.04, 0.04)
          from.jetpack = true
          this.setState(from, "travel", 3200)
          from.bubble = { text: "premium tier ⚡", until: t + 1800 }
        }
        break
      }
      case "RATE_LIMIT": {
        if (from) {
          this.setState(from, "cooldown", 5000)
          from.spark = 1
          from.bubble = { text: "rate limit · cooldown", until: t + 2400 }
          this.bursts.push({ x: from.x, y: from.y, life: 1, hue: 25, kind: "spark" })
        }
        break
      }
    }
  }

  tick(dtMs: number) {
    const t = now()
    const dt = Math.min(dtMs, 60) / 1000

    for (const bot of this.bots.values()) {
      bot.bob += dt * 3

      // expire timed states -> return to wandering
      if (t > bot.stateUntil) {
        if (bot.state === "deal" || bot.state === "talk" || bot.state === "travel") {
          bot.partner = null
          bot.jetpack = false
          const wt = wanderTarget(bot.agent.district)
          bot.tx = wt.x
          bot.ty = wt.y
          this.setState(bot, "search", rand(2500, 6000))
        } else if (bot.state === "cooldown") {
          this.setState(bot, "idle", rand(1500, 3000))
          bot.spark = 0
        } else {
          const wt = wanderTarget(bot.agent.district)
          bot.tx = wt.x
          bot.ty = wt.y
          this.setState(bot, "search", rand(2500, 6000))
        }
      }

      // movement (no movement during cooldown / deal celebration)
      if (bot.state !== "cooldown" && bot.state !== "deal") {
        const dx = bot.tx - bot.x
        const dy = bot.ty - bot.y
        const dist = Math.hypot(dx, dy)
        const sp = (bot.jetpack ? bot.speed * 4.2 : bot.speed) * dt
        if (dist > 0.002) {
          const step = Math.min(sp, dist)
          bot.x += (dx / dist) * step
          bot.y += (dy / dist) * step
          if (bot.jetpack) {
            bot.trail.push({ x: bot.x, y: bot.y, life: 1 })
            if (bot.trail.length > 26) bot.trail.shift()
          }
        }
      }

      // decay bubbles, sparks, trail
      if (bot.bubble && t > bot.bubble.until) bot.bubble = null
      if (bot.spark > 0) bot.spark = Math.max(0, bot.spark - dt * 0.6)
      for (const p of bot.trail) p.life -= dt * 1.6
      bot.trail = bot.trail.filter((p) => p.life > 0)
    }

    for (const b of this.bursts) b.life -= dt * 0.9
    this.bursts = this.bursts.filter((b) => b.life > 0)
  }
}
