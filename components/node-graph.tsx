"use client"

import { useEffect, useRef } from "react"
import type { SimEngine } from "@/lib/sim-engine"
import { DISTRICTS, type District } from "@/lib/data"

/**
 * Abstract node-graph rendering of the same engine state. Reuses the live
 * bot positions but renders them as a force-style constellation rather than
 * stylized robots.
 */
export function NodeGraph({ engine, paused }: { engine: SimEngine; paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef(0)
  const pausedRef = useRef(paused)

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

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = (t: number) => {
      const dt = lastRef.current ? t - lastRef.current : 16
      lastRef.current = t
      if (!pausedRef.current) engine.tick(dt)
      ctx.clearRect(0, 0, w, h)

      const bots = engine.list()
      const pos = (nx: number, ny: number) => ({ x: nx * w, y: ny * h })

      // links between partners
      for (const bot of bots) {
        if (bot.partner) {
          const other = engine.bots.get(bot.partner)
          if (other && bot.id < other.id) {
            const a = pos(bot.x, bot.y)
            const b = pos(other.x, other.y)
            const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
            g.addColorStop(0, `oklch(0.7 0.18 ${bot.agent.hue} / 0.6)`)
            g.addColorStop(1, `oklch(0.7 0.18 ${other.agent.hue} / 0.6)`)
            ctx.strokeStyle = g
            ctx.lineWidth = 1.5
            ctx.setLineDash([3, 3])
            ctx.lineDashOffset = -t / 50
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
            ctx.setLineDash([])
          }
        }
      }

      // district labels
      for (const key of Object.keys(DISTRICTS) as District[]) {
        const d = DISTRICTS[key]
        const c = pos(d.cx, d.cy)
        ctx.fillStyle = `oklch(0.6 0.1 ${d.hue} / 0.5)`
        ctx.font = "600 10px ui-monospace, monospace"
        ctx.textAlign = "center"
        ctx.fillText(d.label.toUpperCase(), c.x, c.y - d.r * h - 4)
      }

      // nodes
      for (const bot of bots) {
        const p = pos(bot.x, bot.y)
        const active = bot.state === "talk" || bot.state === "deal" || bot.state === "travel"
        const r = active ? 7 : 5
        const glow = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 16)
        glow.addColorStop(0, `oklch(0.72 0.18 ${bot.agent.hue} / 0.6)`)
        glow.addColorStop(1, `oklch(0.72 0.18 ${bot.agent.hue} / 0)`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, 16, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `oklch(0.75 0.16 ${bot.agent.hue})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = "oklch(0.9 0.01 256 / 0.7)"
        ctx.font = "9px ui-monospace, monospace"
        ctx.textAlign = "center"
        ctx.fillText(bot.agent.name, p.x, p.y + 18)
      }

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [engine])

  return <canvas ref={canvasRef} className="h-full w-full" role="img" aria-label="Abstract agent node graph" />
}
