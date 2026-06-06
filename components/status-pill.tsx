import { cn } from "@/lib/utils"

const TONE: Record<string, string> = {
  success: "bg-success/15 text-success border-success/30",
  primary: "bg-primary/15 text-primary border-primary/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  destructive: "bg-destructive/15 text-destructive border-destructive/30",
  muted: "bg-muted text-muted-foreground border-border",
}

const DOT: Record<string, string> = {
  success: "bg-success",
  primary: "bg-primary",
  warning: "bg-warning",
  destructive: "bg-destructive",
  muted: "bg-muted-foreground",
}

export function StatusPill({
  tone,
  label,
  pulse,
  className,
}: {
  tone: "success" | "primary" | "warning" | "destructive" | "muted"
  label: string
  pulse?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        TONE[tone],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT[tone], pulse && "pulse-dot")} />
      {label}
    </span>
  )
}
