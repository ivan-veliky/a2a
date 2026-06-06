import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { Agent } from "@/lib/data"

export function AgentAvatar({
  agent,
  className,
}: {
  agent: Pick<Agent, "name" | "hue">
  className?: string
}) {
  return (
    <Avatar className={cn("h-10 w-10", className)}>
      <AvatarFallback
        className="font-mono text-xs font-semibold"
        style={{
          background: `oklch(0.3 0.08 ${agent.hue})`,
          color: `oklch(0.85 0.13 ${agent.hue})`,
          boxShadow: `inset 0 0 0 1px oklch(0.5 0.13 ${agent.hue} / 0.5)`,
        }}
      >
        {agent.name.slice(0, 2)}
      </AvatarFallback>
    </Avatar>
  )
}
