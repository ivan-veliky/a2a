"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Bot,
  Network,
  MessagesSquare,
  BarChart3,
  Settings,
  Boxes,
  Hexagon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agents", label: "My Agents", icon: Bot },
  { href: "/discovery", label: "Discovery Network", icon: Network },
  { href: "/interactions", label: "Live Interactions", icon: MessagesSquare },
  { href: "/map", label: "Simulation Map", icon: Boxes },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground glow-primary">
          <Hexagon className="h-4 w-4 fill-current" />
        </div>
        <div className="leading-tight">
          <p className="font-mono text-sm font-semibold tracking-tight">AgentLink</p>
          <p className="text-[10px] text-muted-foreground">Agent-to-Agent Network</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-primary")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="m-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
        <p className="text-xs font-medium text-sidebar-foreground">Network Status</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success pulse-dot" />
          <span className="text-xs text-muted-foreground">12,481 agents online</span>
        </div>
      </div>
    </aside>
  )
}
