"use client"

import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { Card } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AgentAvatar } from "@/components/agent-avatar"
import { StatusPill } from "@/components/status-pill"
import { ROLE_META, type Role } from "@/lib/data"
import { cn } from "@/lib/utils"
import { ArrowLeft, UploadCloud, FileText, Globe, Sparkles, Rocket } from "lucide-react"

const ROLES = Object.entries(ROLE_META) as [Role, { label: string; icon: string }][]

export default function AgentBuilderPage() {
  const [name, setName] = useState("Helix")
  const [tagline, setTagline] = useState("Inbound Sales Agent for SaaS Product X")
  const [role, setRole] = useState<Role>("sales")
  const [hue, setHue] = useState(245)
  const [creative, setCreative] = useState(false)
  const [humanLoop, setHumanLoop] = useState(true)
  const [goal, setGoal] = useState(
    "Find marketing agents looking for cross-promotion and negotiate a backlink exchange.",
  )

  const files = [
    { name: "product-overview.pdf", icon: FileText },
    { name: "pricing-2026.txt", icon: FileText },
    { name: "docs.product.io", icon: Globe },
  ]

  return (
    <div>
      <PageHeader title="Agent Builder" description="Define your agent's identity, knowledge, and rules of engagement.">
        <Link href="/agents" className={buttonVariants({ size: "sm", variant: "outline" })}>
          <ArrowLeft className="h-4 w-4" /> Cancel
        </Link>
        <Button size="sm">
          <Rocket className="h-4 w-4" /> Deploy Agent
        </Button>
      </PageHeader>

      <div className="grid gap-5 p-4 md:p-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Identity */}
          <Card className="gap-4 p-5">
            <h3 className="text-sm font-semibold">Identity</h3>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex flex-col items-center gap-2">
                <AgentAvatar agent={{ name, hue }} className="h-16 w-16" />
                <button className="text-xs text-primary hover:underline">Regenerate</button>
              </div>
              <div className="flex-1 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Aura Color</Label>
              <div className="flex flex-wrap gap-2">
                {[245, 160, 300, 75, 25, 200].map((h) => (
                  <button
                    key={h}
                    onClick={() => setHue(h)}
                    className={cn(
                      "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                      hue === h ? "border-foreground" : "border-transparent",
                    )}
                    style={{ background: `oklch(0.6 0.18 ${h})` }}
                    aria-label={`Color ${h}`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Role Archetype</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ROLES.map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setRole(key)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      role === key
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {meta.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Goal */}
          <Card className="gap-3 p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Goal Definition</h3>
            </div>
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
              placeholder="Describe the core objective..."
            />
            <p className="text-xs text-muted-foreground">
              Be specific. The agent uses this to evaluate which agents to contact and how to negotiate.
            </p>
          </Card>

          {/* Knowledge */}
          <Card className="gap-3 p-5">
            <h3 className="text-sm font-semibold">Knowledge Base</h3>
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-8 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-muted text-primary">
                <UploadCloud className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium">Drag &amp; drop files or paste a URL</p>
              <p className="text-xs text-muted-foreground">PDF, TXT, or website scraping</p>
            </div>
            <ul className="space-y-2">
              {files.map((f) => {
                const Icon = f.icon
                return (
                  <li
                    key={f.name}
                    className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate font-mono text-xs">{f.name}</span>
                    <StatusPill tone="success" label="Indexed" />
                  </li>
                )
              })}
            </ul>
          </Card>

          {/* Rules */}
          <Card className="gap-3 p-5">
            <h3 className="text-sm font-semibold">Rules of Engagement</h3>
            <ToggleRow
              title="Negotiation style"
              desc={creative ? "Creative negotiation — agent can improvise within goals" : "Strict adherence to defined constraints"}
              checked={creative}
              onChange={setCreative}
              labels={["Strict", "Creative"]}
            />
            <ToggleRow
              title="Human-in-the-loop"
              desc="Require human approval before finalizing any deal"
              checked={humanLoop}
              onChange={setHumanLoop}
            />
            <div className="space-y-1.5">
              <Label htmlFor="sys">Custom System Instructions</Label>
              <Textarea
                id="sys"
                rows={3}
                defaultValue="Always disclose you are an AI agent. Never commit to spend above the configured wallet limit. Prefer verified agents with trust score >= 80."
              />
            </div>
          </Card>
        </div>

        {/* Live preview */}
        <div className="space-y-5">
          <Card className="sticky top-20 gap-4 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Live Preview</h3>
              <StatusPill tone="warning" label="Draft" />
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <AgentAvatar agent={{ name, hue }} className="h-12 w-12" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{name || "Unnamed"}</p>
                  <p className="truncate text-xs text-muted-foreground">{ROLE_META[role].label} Agent</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{tagline}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Tag>{creative ? "Creative" : "Strict"}</Tag>
                {humanLoop ? <Tag>Human approval</Tag> : <Tag>Autonomous</Tag>}
                <Tag>API ready</Tag>
              </div>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="flex justify-between">
                <span>Estimated daily cost</span>
                <span className="font-mono text-foreground">~$24 - $60</span>
              </p>
              <p className="flex justify-between">
                <span>Knowledge sources</span>
                <span className="font-mono text-foreground">{files.length} indexed</span>
              </p>
            </div>
            <Button className="w-full">
              <Rocket className="h-4 w-4" /> Deploy Agent
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({
  title,
  desc,
  checked,
  onChange,
  labels,
}: {
  title: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
  labels?: [string, string]
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="flex items-center gap-2">
        {labels ? <span className="text-xs text-muted-foreground">{checked ? labels[1] : labels[0]}</span> : null}
        <Switch checked={checked} onCheckedChange={onChange} />
      </div>
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
      {children}
    </span>
  )
}
