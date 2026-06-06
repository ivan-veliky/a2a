"use client"

import { useEffect, useRef } from "react"
import type { SimEngine, Bot } from "@/lib/sim-engine"
import { DISTRICTS, ROLE_META, type District } from "@/lib/data"

interface Props {
  engine: SimEngine
  followId: string | null
  myId: string
  onHover: (id: string | null, sx: number, sy: number) => void
  onPickBot: (id: string) => void
  paused: boolean
}

// isometric projection of a normalized (0..1) ground coordinate
function project(nx: number, ny: number, w: number, h: number) {
  const cx = w / 2
  const cy = h * 0.22
  // map 0..1 to a centered range
  const gx = (nx - 0.5) * w * 0.92
  const gy = (ny - 0.5) * h * 1.05
  const isoX = cx + (gx - gy) * 0.5
  const isoY = cy + (gx + gy) * 0.28
  return { x: isoX, y: isoY }
}

function roleGlyph(role: string) {
  // tiny accessory marker per role
  switch (ROLE_META[role as keyof typeof ROLE_META]?.icon) {
    case "briefcase":
      return "briefcase"
    case "code":
      return "visor"
    case "megaphone":
      return "antenna"
    default:
      return "core"
  }
}

export function SimCanvas({ engine, followId, myId, onHover, onPickBot, paused }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number>(0)
  const hoverRef = useRef<string | null>(null)
  const followRef = useRef<string | null>(followId)
  const pausedRef = useRef(paused)
  const camRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    followRef.current = followId
  }, [followId])
  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = 0
    let h = 0
    let dpr = 1

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const css = getComputedStyle(document.documentElement)
    const read = (v: string, fb: string) => css.getPropertyValue(v).trim() || fb

    const draw = (t: number) => {
      const dt = lastRef.current ? t - lastRef.current : 16
      lastRef.current = t
      if (!pausedRef.current) engine.tick(dt)

      // camera follow (smooth)
      const cam = camRef.current
      const fid = followRef.current
      if (fid) {
        const fb = engine.bots.get(fid)
        if (fb) {
          const p = project(fb.x, fb.y, w, h)
          const targetX = w / 2 - p.x
          const targetY = h / 2 - p.y
          cam.x += (targetX - cam.x) * 0.06
          cam.y += (targetY - cam.y) * 0.06
        }
      } else {
        cam.x += (0 - cam.x) * 0.06
        cam.y += (0 - cam.y) * 0.06
      }

      ctx.clearRect(0, 0, w, h)
      ctx.save()
      ctx.translate(cam.x, cam.y)

      drawGrid(ctx, w, h, t)
      drawDistricts(ctx, w, h, t)

      // pathway links between conversing partners
      const bots = engine.list()
      ctx.lineWidth = 1.5
      for (const bot of bots) {
        if (bot.partner) {
          const other = engine.bots.get(bot.partner)
          if (other && bot.id < other.id) {
            const a = project(bot.x, bot.y, w, h)
            const b = project(other.x, other.y, w, h)
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
            grad.addColorStop(0, `oklch(0.7 0.18 ${bot.agent.hue} / 0.7)`)
            grad.addColorStop(1, `oklch(0.7 0.18 ${other.agent.hue} / 0.7)`)
            ctx.strokeStyle = grad
            ctx.setLineDash([4, 4])
            ctx.lineDashOffset = -t / 40
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
            ctx.setLineDash([])
          }
        }
      }

      // bursts (deal orbs / sparks) under bots
      for (const burst of engine.bursts) {
        const p = project(burst.x, burst.y, w, h)
        const r = (1 - burst.life) * 46 + 6
        ctx.globalAlpha = burst.life
        ctx.strokeStyle = `oklch(0.78 0.18 ${burst.hue})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(p.x, p.y - 18, r, 0, Math.PI * 2)
        ctx.stroke()
        if (burst.kind === "deal") {
          ctx.fillStyle = `oklch(0.8 0.16 ${burst.hue} / ${burst.life * 0.5})`
          ctx.beginPath()
          ctx.arc(p.x, p.y - 18, 10, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      // sort bots by projected Y for depth ordering
      const drawList = bots
        .map((b) => ({ b, p: project(b.x, b.y, w, h) }))
        .sort((a, b) => a.p.y - b.p.y)

      for (const { b, p } of drawList) {
        drawBot(ctx, b, p, t, b.id === myId, b.id === hoverRef.current)
      }

      ctx.restore()
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, myId])

  // pointer interaction: hit test bots in screen space
  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const cam = camRef.current
    let found: string | null = null
    let best = 22
    for (const bot of engine.list()) {
      const p = project(bot.x, bot.y, rect.width, rect.height)
      const sx = p.x + cam.x
      const sy = p.y + cam.y - 14
      const d = Math.hypot(mx - sx, my - sy)
      if (d < best) {
        best = d
        found = bot.id
      }
    }
    hoverRef.current = found
    onHover(found, e.clientX, e.clientY)
    canvas.style.cursor = found ? "pointer" : "default"
  }

  const handleLeave = () => {
    hoverRef.current = null
    onHover(null, 0, 0)
  }

  const handleClick = () => {
    if (hoverRef.current) onPickBot(hoverRef.current)
  }

  return (
    <canvas
      ref={canvasRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onClick={handleClick}
      className="h-full w-full"
      role="img"
      aria-label="Live agent simulation map"
    />
  )
}

/* ---------- drawing helpers ---------- */

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const lines = 22
  ctx.lineWidth = 1
  for (let i = 0; i <= lines; i++) {
    const n = i / lines
    // lines along x
    const a = project(0, n, w, h)
    const b = project(1, n, w, h)
    const a2 = project(n, 0, w, h)
    const b2 = project(n, 1, w, h)
    ctx.strokeStyle = `oklch(0.4 0.04 256 / 0.18)`
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.moveTo(a2.x, a2.y)
    ctx.lineTo(b2.x, b2.y)
    ctx.stroke()
  }
}

function drawDistricts(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  for (const key of Object.keys(DISTRICTS) as District[]) {
    const d = DISTRICTS[key]
    const c = project(d.cx, d.cy, w, h)
    const rx = d.r * w * 0.46
    const ry = d.r * h * 0.5
    const pulse = 0.5 + 0.5 * Math.sin(t / 900 + d.hue)

    ctx.save()
    ctx.translate(c.x, c.y)
    // glowing district platform (iso ellipse)
    ctx.beginPath()
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
    const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, rx)
    grad.addColorStop(0, `oklch(0.32 0.1 ${d.hue} / 0.55)`)
    grad.addColorStop(1, `oklch(0.2 0.04 ${d.hue} / 0.05)`)
    ctx.fillStyle = grad
    ctx.fill()
    ctx.lineWidth = 1.5
    ctx.strokeStyle = `oklch(0.7 0.16 ${d.hue} / ${0.35 + pulse * 0.3})`
    ctx.stroke()
    ctx.restore()

    // label
    ctx.fillStyle = `oklch(0.78 0.13 ${d.hue} / 0.9)`
    ctx.font = "600 11px ui-monospace, monospace"
    ctx.textAlign = "center"
    ctx.fillText(d.label.toUpperCase(), c.x, c.y - ry - 8)
  }
}

function drawBot(
  ctx: CanvasRenderingContext2D,
  bot: Bot,
  p: { x: number; y: number },
  t: number,
  isMine: boolean,
  isHover: boolean,
) {
  const hue = bot.agent.hue
  const bob = Math.sin(bot.bob) * 2
  const baseY = p.y
  const bodyY = baseY - 14 + (bot.state === "cooldown" ? 4 : bob)

  // jetpack trail (neon exhaust)
  if (bot.trail.length > 1) {
    for (let i = 1; i < bot.trail.length; i++) {
      const seg = bot.trail[i]
      const tp = projForTrail(seg.x, seg.y, ctx)
      ctx.fillStyle = `oklch(0.78 0.17 ${(hue + 30) % 360} / ${seg.life * 0.5})`
      ctx.beginPath()
      ctx.arc(tp.x, tp.y - 14, 2 + seg.life * 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // shadow
  ctx.fillStyle = "oklch(0.1 0.02 256 / 0.45)"
  ctx.beginPath()
  ctx.ellipse(p.x, baseY, 11, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  // selection / follow ring
  if (isMine || isHover) {
    ctx.strokeStyle = isMine ? `oklch(0.8 0.18 ${hue})` : "oklch(0.85 0.02 256 / 0.7)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(p.x, baseY, 15, 7, 0, 0, Math.PI * 2)
    ctx.stroke()
  }

  // aura glow
  const glow = ctx.createRadialGradient(p.x, bodyY, 2, p.x, bodyY, 22)
  glow.addColorStop(0, `oklch(0.7 0.18 ${hue} / 0.5)`)
  glow.addColorStop(1, `oklch(0.7 0.18 ${hue} / 0)`)
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(p.x, bodyY, 22, 0, Math.PI * 2)
  ctx.fill()

  // body (rounded chassis)
  const bodyColor = `oklch(0.5 0.14 ${hue})`
  const edge = `oklch(0.78 0.16 ${hue})`
  ctx.fillStyle = bodyColor
  roundRect(ctx, p.x - 7, bodyY - 8, 14, 16, 4)
  ctx.fill()
  ctx.lineWidth = 1.5
  ctx.strokeStyle = edge
  ctx.stroke()

  // head / visor
  ctx.fillStyle = `oklch(0.85 0.05 256)`
  roundRect(ctx, p.x - 5, bodyY - 16, 10, 8, 3)
  ctx.fill()
  // eye
  const blink = Math.sin(t / 600 + bot.bob) > -0.9
  ctx.fillStyle = blink ? edge : `oklch(0.3 0.04 ${hue})`
  roundRect(ctx, p.x - 3, bodyY - 14, 6, 3, 1.5)
  ctx.fill()

  // role accessory
  const glyph = roleGlyph(bot.agent.role)
  ctx.fillStyle = edge
  if (glyph === "briefcase") {
    roundRect(ctx, p.x + 6, bodyY + 1, 5, 5, 1)
    ctx.fill()
  } else if (glyph === "antenna") {
    ctx.beginPath()
    ctx.moveTo(p.x, bodyY - 16)
    ctx.lineTo(p.x, bodyY - 22)
    ctx.lineWidth = 1.5
    ctx.strokeStyle = edge
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(p.x, bodyY - 23, 1.6, 0, Math.PI * 2)
    ctx.fill()
  } else if (glyph === "visor") {
    ctx.fillStyle = `oklch(0.8 0.16 ${hue} / 0.8)`
    roundRect(ctx, p.x - 5, bodyY - 14, 10, 2.5, 1)
    ctx.fill()
  }

  // jetpack flame
  if (bot.jetpack) {
    ctx.fillStyle = `oklch(0.82 0.18 ${(hue + 40) % 360} / 0.9)`
    ctx.beginPath()
    ctx.moveTo(p.x - 4, bodyY + 8)
    ctx.lineTo(p.x, bodyY + 14 + Math.random() * 3)
    ctx.lineTo(p.x + 4, bodyY + 8)
    ctx.fill()
  }

  // cooldown hourglass
  if (bot.state === "cooldown") {
    ctx.fillStyle = "oklch(0.78 0.15 75)"
    ctx.font = "10px ui-monospace, monospace"
    ctx.textAlign = "center"
    ctx.fillText("⧗", p.x, bodyY - 22)
  }

  // spark on rate limit
  if (bot.spark > 0) {
    ctx.strokeStyle = `oklch(0.8 0.2 25 / ${bot.spark})`
    ctx.lineWidth = 1.5
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + t / 100
      ctx.beginPath()
      ctx.moveTo(p.x, bodyY - 4)
      ctx.lineTo(p.x + Math.cos(a) * 12, bodyY - 4 + Math.sin(a) * 12)
      ctx.stroke()
    }
  }

  // name tag
  ctx.fillStyle = "oklch(0.9 0.01 256 / 0.85)"
  ctx.font = "600 9px ui-monospace, monospace"
  ctx.textAlign = "center"
  ctx.fillText(bot.agent.name, p.x, baseY + 14)

  // holographic speech bubble
  if (bot.bubble) {
    drawBubble(ctx, p.x, bodyY - 30, bot.bubble.text, hue)
  }
}

// trail uses normalized coords; recompute using canvas logical size
function projForTrail(nx: number, ny: number, ctx: CanvasRenderingContext2D) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = ctx.canvas.width / dpr
  const h = ctx.canvas.height / dpr
  return project(nx, ny, w, h)
}

function drawBubble(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, hue: number) {
  ctx.font = "600 10px ui-monospace, monospace"
  const padding = 7
  const tw = ctx.measureText(text).width
  const bw = tw + padding * 2
  const bh = 18
  const bx = x - bw / 2
  const by = y - bh

  ctx.fillStyle = `oklch(0.22 0.04 ${hue} / 0.92)`
  ctx.strokeStyle = `oklch(0.72 0.16 ${hue} / 0.8)`
  ctx.lineWidth = 1
  roundRect(ctx, bx, by, bw, bh, 5)
  ctx.fill()
  ctx.stroke()
  // tail
  ctx.beginPath()
  ctx.moveTo(x - 4, by + bh)
  ctx.lineTo(x, by + bh + 5)
  ctx.lineTo(x + 4, by + bh)
  ctx.fillStyle = `oklch(0.22 0.04 ${hue} / 0.92)`
  ctx.fill()

  ctx.fillStyle = `oklch(0.9 0.08 ${hue})`
  ctx.textAlign = "center"
  ctx.fillText(text, x, by + 12)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
