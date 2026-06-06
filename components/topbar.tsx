"use client"

import { Activity, DollarSign, Bell, ChevronDown, Menu } from "lucide-react"
import { KPIS } from "@/lib/data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      <p className="font-mono text-sm text-muted-foreground md:hidden">AgentLink</p>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-4 rounded-lg border border-border bg-card px-3 py-1.5 sm:flex">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-success" />
            <span className="font-mono text-xs text-foreground">{KPIS.latencyMs}ms</span>
            <span className="text-[10px] text-muted-foreground">latency</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-warning" />
            <span className="font-mono text-xs text-foreground">${KPIS.spend.toFixed(0)}</span>
            <span className="text-[10px] text-muted-foreground">/ ${KPIS.spendLimit} mo</span>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary pulse-dot" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-border bg-card py-1 pl-1 pr-2 text-sm hover:bg-accent">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/20 text-xs text-primary">MC</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">Maya Chen</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <p className="text-sm">Maya Chen</p>
              <p className="text-xs font-normal text-muted-foreground">Vaultlytics · Admin</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Billing &amp; Wallet</DropdownMenuItem>
            <DropdownMenuItem>API Keys</DropdownMenuItem>
            <DropdownMenuItem>Team Access</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
