"use client"

import { useMemo, useState } from "react"
import {
  THREADS,
  getAgent,
  MY_AGENT_ID,
  STATUS_TONE,
  STATUS_LABEL,
  type Thread,
  type ChatMessage,
} from "@/lib/data"
import { AgentAvatar } from "@/components/agent-avatar"
import { StatusPill } from "@/components/status-pill"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  Search,
  Braces,
  MessageSquareText,
  Wrench,
  Database,
  Coins,
  Pause,
  Play,
  Send,
  FileSignature,
  ShieldCheck,
  CornerDownLeft,
} from "lucide-react"

const TOOL_META: Record<string, { label: string; icon: typeof Wrench; tone: string }> = {
  knowledge_base: { label: "Searched knowledge base", icon: Database, tone: "text-chart-4" },
  data_enrichment: { label: "Used data enrichment", icon: Wrench, tone: "text-primary" },
  execute_contract: { label: "Executed contract", icon: FileSignature, tone: "text-success" },
}

export function InteractionsView() {
  const [activeId, setActiveId] = useState(THREADS[0].id)
  const [query, setQuery] = useState("")
  const [raw, setRaw] = useState(false)
  const [paused, setPaused] = useState(false)
  const [draft, setDraft] = useState("")

  const threads = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return THREADS
    return THREADS.filter((t) => {
      const other = getAgent(t.with)
      return (
        t.subject.toLowerCase().includes(q) ||
        other?.name.toLowerCase().includes(q) ||
        other?.company.toLowerCase().includes(q)
      )
    })
  }, [query])

  const active = THREADS.find((t) => t.id === activeId) ?? THREADS[0]

  return (
    <div className="flex h-[calc(100vh-8.5rem)] min-h-[28rem] flex-col overflow-hidden md:h-[calc(100vh-9rem)] md:flex-row">
      {/* Inbox list */}
      <aside className="flex w-full shrink-0 flex-col border-b border-border md:w-80 md:border-b-0 md:border-r">
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search threads…"
              className="pl-9"
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ul className="divide-y divide-border">
            {threads.map((t) => (
              <ThreadRow
                key={t.id}
                thread={t}
                active={t.id === activeId}
                onSelect={() => setActiveId(t.id)}
              />
            ))}
            {threads.length === 0 ? (
              <li className="px-4 py-8 text-center text-xs text-muted-foreground">No threads match.</li>
            ) : null}
          </ul>
        </div>
      </aside>

      {/* Chat window */}
      <section className="flex min-w-0 flex-1 flex-col">
        <ChatHeader thread={active} raw={raw} onToggleRaw={setRaw} paused={paused} />
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 px-4 py-5 md:px-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {active.messages.map((m) => (
              <MessageBubble key={m.id} message={m} raw={raw} />
            ))}
            <DealBanner thread={active} />
          </div>
        </div>

        {/* Human intervention bar */}
        <InterventionBar
          thread={active}
          paused={paused}
          onTogglePause={() => setPaused((p) => !p)}
          draft={draft}
          setDraft={setDraft}
        />
      </section>
    </div>
  )
}

function ThreadRow({
  thread,
  active,
  onSelect,
}: {
  thread: Thread
  active: boolean
  onSelect: () => void
}) {
  const other = getAgent(thread.with)
  if (!other) return null
  return (
    <li>
      <button
        onClick={onSelect}
        className={cn(
          "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors",
          active ? "bg-accent/60" : "hover:bg-accent/30",
        )}
      >
        <AgentAvatar agent={other} className="h-9 w-9 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium">{other.name}</p>
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{thread.updated}</span>
          </div>
          <p className="truncate text-xs text-muted-foreground">{thread.subject}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <StatusPill
              tone={STATUS_TONE[thread.status]}
              label={STATUS_LABEL[thread.status]}
              pulse={thread.status === "live" || thread.status === "negotiating"}
            />
            {thread.unread > 0 ? (
              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 font-mono text-[10px] font-semibold text-primary-foreground">
                {thread.unread}
              </span>
            ) : null}
          </div>
        </div>
      </button>
    </li>
  )
}

function ChatHeader({
  thread,
  raw,
  onToggleRaw,
  paused,
}: {
  thread: Thread
  raw: boolean
  onToggleRaw: (v: boolean) => void
  paused: boolean
}) {
  const other = getAgent(thread.with)
  const me = getAgent(MY_AGENT_ID)
  if (!other || !me) return null
  return (
    <div className="flex flex-col gap-3 border-b border-border px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex -space-x-2">
          <AgentAvatar agent={me} className="h-8 w-8 ring-2 ring-card" />
          <AgentAvatar agent={other} className="h-8 w-8 ring-2 ring-card" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {me.name} <span className="text-muted-foreground">↔</span> {other.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{thread.subject}</p>
        </div>
        {paused ? (
          <StatusPill tone="warning" label="Paused" className="ml-1 hidden sm:inline-flex" />
        ) : (
          <StatusPill
            tone={STATUS_TONE[thread.status]}
            label={STATUS_LABEL[thread.status]}
            pulse={thread.status === "live" || thread.status === "negotiating"}
            className="ml-1 hidden sm:inline-flex"
          />
        )}
      </div>

      {/* Translation toggle */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1">
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
            !raw ? "bg-primary/15 text-primary" : "text-muted-foreground",
          )}
        >
          <MessageSquareText className="h-3.5 w-3.5" /> Human
        </span>
        <Switch checked={raw} onCheckedChange={onToggleRaw} aria-label="Toggle raw API payloads" />
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
            raw ? "bg-primary/15 text-primary" : "text-muted-foreground",
          )}
        >
          <Braces className="h-3.5 w-3.5" /> Raw API
        </span>
      </div>
    </div>
  )
}

function MessageBubble({ message, raw }: { message: ChatMessage; raw: boolean }) {
  const agent = getAgent(message.from)
  const mine = message.from === MY_AGENT_ID
  if (!agent) return null
  const tool = message.tool ? TOOL_META[message.tool] : undefined

  return (
    <div className={cn("flex items-end gap-2", mine ? "flex-row-reverse" : "flex-row")}>
      <AgentAvatar agent={agent} className="h-7 w-7 shrink-0" />
      <div className={cn("flex max-w-[85%] flex-col gap-1.5", mine ? "items-end" : "items-start")}>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="font-medium text-foreground">{agent.name}</span>
          <span className="font-mono">{message.ts}</span>
        </div>

        <div
          className={cn(
            "rounded-2xl border px-3.5 py-2.5 text-sm",
            mine
              ? "rounded-br-sm border-primary/30 bg-primary/10 text-foreground"
              : "rounded-bl-sm border-border bg-card text-foreground",
          )}
        >
          {raw ? (
            <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-muted-foreground">
              {JSON.stringify(message.payload, null, 2)}
            </pre>
          ) : (
            <p className="leading-relaxed text-pretty">{message.summary}</p>
          )}
        </div>

        {/* Action highlights */}
        {(tool || message.cost) && (
          <div className={cn("flex flex-wrap items-center gap-1.5", mine ? "justify-end" : "justify-start")}>
            {tool ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium",
                  tool.tone,
                )}
              >
                <tool.icon className="h-3 w-3" />
                {tool.label}
              </span>
            ) : null}
            {message.cost ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 font-mono text-[10px] text-warning">
                <Coins className="h-3 w-3" />${message.cost.toFixed(3)}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

function DealBanner({ thread }: { thread: Thread }) {
  if (thread.status === "deal") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>Deal reached and contract executed. Both parties countersigned.</span>
      </div>
    )
  }
  if (thread.status === "dead-end") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <span className="grid h-4 w-4 shrink-0 place-items-center">×</span>
        <span>Negotiation reached a dead end — terms fell outside configured constraints.</span>
      </div>
    )
  }
  return null
}

function InterventionBar({
  thread,
  paused,
  onTogglePause,
  draft,
  setDraft,
}: {
  thread: Thread
  paused: boolean
  onTogglePause: () => void
  draft: string
  setDraft: (v: string) => void
}) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-border bg-card/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant={paused ? "default" : "outline"}
            size="sm"
            onClick={onTogglePause}
            className={cn(paused && "bg-warning text-warning-foreground hover:bg-warning/90")}
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {paused ? "Resume Agent" : "Pause Agent"}
          </Button>

          {thread.requiresApproval ? (
            <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90">
              <FileSignature className="h-4 w-4" />
              Approve Deal / Execute Contract
            </Button>
          ) : (
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Human-in-the-loop disabled for this thread
            </span>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            setDraft("")
          }}
          className="relative"
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={paused ? "Take over the chat — type a message to send as the human operator…" : "Pause the agent to take over the chat…"}
            disabled={!paused}
            className="pr-24"
          />
          <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
            <kbd className="hidden items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:flex">
              <CornerDownLeft className="h-3 w-3" />
            </kbd>
            <Button type="submit" size="icon" className="h-7 w-7" disabled={!paused || !draft.trim()}>
              <Send className="h-3.5 w-3.5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
