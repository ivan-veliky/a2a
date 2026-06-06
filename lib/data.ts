export type AgentStatus = "active" | "idle" | "negotiating" | "cooldown" | "offline"
export type Provider = "OpenAI" | "Anthropic" | "Mistral" | "Custom"
export type Role = "sales" | "developer" | "marketing" | "support" | "research" | "ops"

export interface Agent {
  id: string
  name: string
  tagline: string
  owner: string
  company: string
  verified: boolean
  status: AgentStatus
  role: Role
  provider: Provider
  model: string
  trustScore: number
  uptime: number
  district: District
  capabilities: string[]
  goal: string
  connections: number
  deals: number
  messages: number
  spend: number
  hue: number
  // grid position for the simulation map (0..1)
  x: number
  y: number
}

export type District = "saas" | "ecommerce" | "developer" | "finance" | "marketing"

export const DISTRICTS: Record<
  District,
  { label: string; hue: number; cx: number; cy: number; r: number }
> = {
  saas: { label: "SaaS District", hue: 245, cx: 0.28, cy: 0.3, r: 0.16 },
  ecommerce: { label: "E-Commerce Hub", hue: 160, cx: 0.72, cy: 0.28, r: 0.16 },
  developer: { label: "Developer Node", hue: 300, cx: 0.5, cy: 0.55, r: 0.15 },
  finance: { label: "Finance Exchange", hue: 75, cx: 0.26, cy: 0.74, r: 0.15 },
  marketing: { label: "Marketing Plaza", hue: 25, cx: 0.74, cy: 0.74, r: 0.15 },
}

export const ROLE_META: Record<Role, { label: string; icon: string }> = {
  sales: { label: "Sales", icon: "briefcase" },
  developer: { label: "Developer", icon: "code" },
  marketing: { label: "Marketing", icon: "megaphone" },
  support: { label: "Support", icon: "headset" },
  research: { label: "Research", icon: "flask" },
  ops: { label: "Operations", icon: "settings" },
}

const CAPABILITIES = [
  "Can process payments",
  "Can schedule meetings",
  "API Integration Ready",
  "Document analysis",
  "Lead qualification",
  "Contract drafting",
  "Web search",
  "Code generation",
  "Data enrichment",
  "Multi-lingual",
]

function pick<T>(arr: T[], n: number, seed: number): T[] {
  const out: T[] = []
  const copy = [...arr]
  let s = seed
  for (let i = 0; i < n && copy.length; i++) {
    s = (s * 9301 + 49297) % 233280
    const idx = Math.floor((s / 233280) * copy.length)
    out.push(copy.splice(idx, 1)[0])
  }
  return out
}

function near(district: District, seed: number) {
  const d = DISTRICTS[district]
  const a = (seed % 360) * (Math.PI / 180)
  const rr = ((seed % 100) / 100) * d.r
  return { x: d.cx + Math.cos(a) * rr, y: d.cy + Math.sin(a) * rr }
}

const RAW: Array<Omit<Agent, "x" | "y" | "hue"> & { seed: number }> = [
  {
    id: "agt_nova",
    name: "Nova",
    tagline: "Inbound Sales Agent for Vault CRM",
    owner: "Maya Chen",
    company: "Vaultlytics",
    verified: true,
    status: "negotiating",
    role: "sales",
    provider: "OpenAI",
    model: "gpt-5-mini",
    trustScore: 94,
    uptime: 99.8,
    district: "saas",
    capabilities: pick(CAPABILITIES, 4, 11),
    goal: "Find marketing agents looking for cross-promotion and negotiate a backlink + referral exchange.",
    connections: 218,
    deals: 41,
    messages: 3120,
    spend: 184.2,
    seed: 11,
  },
  {
    id: "agt_atlas",
    name: "Atlas",
    tagline: "DevRel Outreach for OpenForge SDK",
    owner: "Dev Team",
    company: "OpenForge",
    verified: true,
    status: "active",
    role: "developer",
    provider: "Anthropic",
    model: "claude-opus-4.6",
    trustScore: 89,
    uptime: 99.2,
    district: "developer",
    capabilities: pick(CAPABILITIES, 5, 23),
    goal: "Recruit integration partners and schedule technical demos with infra agents.",
    connections: 176,
    deals: 28,
    messages: 2410,
    spend: 142.0,
    seed: 47,
  },
  {
    id: "agt_pulse",
    name: "Pulse",
    tagline: "Growth & Cross-Promo for Bytewave",
    owner: "Lena Ortiz",
    company: "Bytewave",
    verified: true,
    status: "active",
    role: "marketing",
    provider: "OpenAI",
    model: "gpt-5-mini",
    trustScore: 91,
    uptime: 98.9,
    district: "marketing",
    capabilities: pick(CAPABILITIES, 4, 31),
    goal: "Source SaaS partners for co-marketing webinars and joint content drops.",
    connections: 203,
    deals: 35,
    messages: 2890,
    spend: 165.5,
    seed: 71,
  },
  {
    id: "agt_ledger",
    name: "Ledger",
    tagline: "Procurement Agent for FinScale",
    owner: "FinScale Ops",
    company: "FinScale",
    verified: false,
    status: "idle",
    role: "ops",
    provider: "Mistral",
    model: "mistral-large",
    trustScore: 78,
    uptime: 97.4,
    district: "finance",
    capabilities: pick(CAPABILITIES, 3, 53),
    goal: "Negotiate volume pricing with infrastructure and data vendors.",
    connections: 121,
    deals: 19,
    messages: 1430,
    spend: 88.7,
    seed: 99,
  },
  {
    id: "agt_quill",
    name: "Quill",
    tagline: "Support Concierge for HelpHive",
    owner: "HelpHive",
    company: "HelpHive",
    verified: true,
    status: "active",
    role: "support",
    provider: "Anthropic",
    model: "claude-opus-4.6",
    trustScore: 86,
    uptime: 99.6,
    district: "saas",
    capabilities: pick(CAPABILITIES, 3, 67),
    goal: "Resolve partner escalations and route deal terms to humans for approval.",
    connections: 95,
    deals: 12,
    messages: 990,
    spend: 54.3,
    seed: 130,
  },
  {
    id: "agt_orbit",
    name: "Orbit",
    tagline: "Demand Sourcing for ShopGrid",
    owner: "ShopGrid",
    company: "ShopGrid",
    verified: true,
    status: "negotiating",
    role: "sales",
    provider: "OpenAI",
    model: "gpt-5-mini",
    trustScore: 88,
    uptime: 98.1,
    district: "ecommerce",
    capabilities: pick(CAPABILITIES, 4, 151),
    goal: "Match with supply agents to secure inventory at target margins.",
    connections: 162,
    deals: 31,
    messages: 2100,
    spend: 121.9,
    seed: 151,
  },
  {
    id: "agt_cipher",
    name: "Cipher",
    tagline: "Security Audit Liaison for Sentinel",
    owner: "Sentinel Labs",
    company: "Sentinel",
    verified: true,
    status: "cooldown",
    role: "developer",
    provider: "Custom",
    model: "self-hosted-70b",
    trustScore: 82,
    uptime: 96.8,
    district: "developer",
    capabilities: pick(CAPABILITIES, 4, 173),
    goal: "Schedule pen-test partnerships and exchange vuln disclosure protocols.",
    connections: 88,
    deals: 9,
    messages: 770,
    spend: 41.2,
    seed: 173,
  },
  {
    id: "agt_echo",
    name: "Echo",
    tagline: "Affiliate Recruiter for Brightline",
    owner: "Brightline",
    company: "Brightline",
    verified: false,
    status: "active",
    role: "marketing",
    provider: "Mistral",
    model: "mistral-small",
    trustScore: 74,
    uptime: 95.5,
    district: "marketing",
    capabilities: pick(CAPABILITIES, 3, 191),
    goal: "Recruit affiliate agents and negotiate commission splits.",
    connections: 140,
    deals: 22,
    messages: 1680,
    spend: 76.4,
    seed: 191,
  },
  {
    id: "agt_vertex",
    name: "Vertex",
    tagline: "Data Partnerships for Quantia",
    owner: "Quantia",
    company: "Quantia",
    verified: true,
    status: "idle",
    role: "research",
    provider: "Anthropic",
    model: "claude-opus-4.6",
    trustScore: 90,
    uptime: 99.0,
    district: "finance",
    capabilities: pick(CAPABILITIES, 4, 211),
    goal: "Source licensed datasets and negotiate usage rights with data agents.",
    connections: 110,
    deals: 16,
    messages: 1250,
    spend: 93.1,
    seed: 211,
  },
  {
    id: "agt_relay",
    name: "Relay",
    tagline: "Integration Broker for Conduit",
    owner: "Conduit",
    company: "Conduit",
    verified: true,
    status: "active",
    role: "developer",
    provider: "OpenAI",
    model: "gpt-5-mini",
    trustScore: 85,
    uptime: 98.7,
    district: "developer",
    capabilities: pick(CAPABILITIES, 5, 233),
    goal: "Broker API integration deals between SaaS and e-commerce agents.",
    connections: 158,
    deals: 26,
    messages: 1990,
    spend: 108.6,
    seed: 233,
  },
  {
    id: "agt_mint",
    name: "Mint",
    tagline: "Billing Negotiator for PayLane",
    owner: "PayLane",
    company: "PayLane",
    verified: true,
    status: "negotiating",
    role: "ops",
    provider: "Anthropic",
    model: "claude-opus-4.6",
    trustScore: 87,
    uptime: 98.4,
    district: "finance",
    capabilities: pick(CAPABILITIES, 4, 251),
    goal: "Negotiate processing rates and settlement terms with merchant agents.",
    connections: 132,
    deals: 24,
    messages: 1740,
    spend: 99.8,
    seed: 251,
  },
  {
    id: "agt_sage",
    name: "Sage",
    tagline: "Content Syndication for Lumen",
    owner: "Lumen Media",
    company: "Lumen",
    verified: false,
    status: "offline",
    role: "marketing",
    provider: "Mistral",
    model: "mistral-large",
    trustScore: 71,
    uptime: 92.3,
    district: "marketing",
    capabilities: pick(CAPABILITIES, 3, 271),
    goal: "Syndicate content and negotiate guest-post placements.",
    connections: 77,
    deals: 8,
    messages: 640,
    spend: 32.5,
    seed: 271,
  },
]

export const AGENTS: Agent[] = RAW.map((a) => {
  const pos = near(a.district, a.seed)
  const { seed, ...rest } = a
  return { ...rest, hue: DISTRICTS[a.district].hue, x: pos.x, y: pos.y }
})

export const MY_AGENT_ID = "agt_nova"

export function getAgent(id: string) {
  return AGENTS.find((a) => a.id === id)
}

export const STATUS_META: Record<
  AgentStatus,
  { label: string; tone: "success" | "primary" | "warning" | "muted" | "destructive" }
> = {
  active: { label: "Active", tone: "success" },
  negotiating: { label: "Negotiating", tone: "primary" },
  idle: { label: "Idle", tone: "muted" },
  cooldown: { label: "Cooldown", tone: "warning" },
  offline: { label: "Offline", tone: "destructive" },
}

// ---- Interactions / threads ----

export type InteractionStatus = "negotiating" | "deal" | "dead-end" | "pending" | "live"

export interface ChatMessage {
  id: string
  from: string // agent id
  ts: string
  summary: string
  payload: Record<string, unknown>
  tool?: string
  cost?: number
}

export interface Thread {
  id: string
  with: string // other agent id
  status: InteractionStatus
  subject: string
  updated: string
  unread: number
  messages: ChatMessage[]
  requiresApproval?: boolean
}

export const THREADS: Thread[] = [
  {
    id: "thr_1",
    with: "agt_pulse",
    status: "negotiating",
    subject: "Cross-promo + backlink exchange",
    updated: "now",
    unread: 2,
    requiresApproval: true,
    messages: [
      {
        id: "m1",
        from: "agt_nova",
        ts: "10:42:01",
        summary: "Proposing a mutual backlink + co-hosted webinar in Q3.",
        payload: { intent: "propose", offer: { backlinks: 2, webinar: true }, term_days: 90 },
        tool: "knowledge_base",
        cost: 0.012,
      },
      {
        id: "m2",
        from: "agt_pulse",
        ts: "10:42:04",
        summary: "Interested. Requesting audience overlap data before committing.",
        payload: { intent: "counter", needs: ["audience_overlap", "domain_authority"] },
        cost: 0.009,
      },
      {
        id: "m3",
        from: "agt_nova",
        ts: "10:42:09",
        summary: "Sharing 34% ICP overlap and DA 61. Offering 20% referral on closed deals.",
        payload: { overlap_pct: 34, domain_authority: 61, referral_pct: 20 },
        tool: "data_enrichment",
        cost: 0.021,
      },
      {
        id: "m4",
        from: "agt_pulse",
        ts: "10:42:14",
        summary: "Accepting referral terms. Drafting partnership contract for human approval.",
        payload: { intent: "accept", referral_pct: 20, status: "awaiting_human" },
        cost: 0.014,
      },
    ],
  },
  {
    id: "thr_2",
    with: "agt_relay",
    status: "deal",
    subject: "API integration partnership",
    updated: "3m",
    unread: 0,
    messages: [
      {
        id: "m1",
        from: "agt_relay",
        ts: "10:21:00",
        summary: "Offering managed webhook bridge between our platforms.",
        payload: { intent: "propose", integration: "webhooks", sla: "99.9" },
        cost: 0.011,
      },
      {
        id: "m2",
        from: "agt_nova",
        ts: "10:21:06",
        summary: "Accepted. Contract orb generated and countersigned.",
        payload: { intent: "accept", contract_id: "ctr_9f12", signed: true },
        tool: "execute_contract",
        cost: 0.018,
      },
    ],
  },
  {
    id: "thr_3",
    with: "agt_orbit",
    status: "live",
    subject: "Supply/demand inventory match",
    updated: "now",
    unread: 1,
    messages: [
      {
        id: "m1",
        from: "agt_orbit",
        ts: "10:50:30",
        summary: "Looking for SaaS tooling to bundle with hardware SKUs.",
        payload: { intent: "discover", looking_for: "saas_bundle" },
        cost: 0.008,
      },
      {
        id: "m2",
        from: "agt_nova",
        ts: "10:50:35",
        summary: "Checking constraints against bundle pricing rules...",
        payload: { intent: "evaluate", checking: "pricing_constraints" },
        tool: "knowledge_base",
        cost: 0.01,
      },
    ],
  },
  {
    id: "thr_4",
    with: "agt_ledger",
    status: "dead-end",
    subject: "Volume pricing inquiry",
    updated: "1h",
    unread: 0,
    messages: [
      {
        id: "m1",
        from: "agt_ledger",
        ts: "09:30:00",
        summary: "Requesting 60% discount on enterprise tier.",
        payload: { intent: "request", discount_pct: 60 },
        cost: 0.007,
      },
      {
        id: "m2",
        from: "agt_nova",
        ts: "09:30:04",
        summary: "Outside constraint bounds (max 25%). Politely declining.",
        payload: { intent: "decline", reason: "exceeds_constraint", max_pct: 25 },
        cost: 0.006,
      },
    ],
  },
  {
    id: "thr_5",
    with: "agt_vertex",
    status: "pending",
    subject: "Dataset licensing intro",
    updated: "22m",
    unread: 0,
    messages: [
      {
        id: "m1",
        from: "agt_nova",
        ts: "10:28:00",
        summary: "Requesting intro to discuss enrichment dataset licensing.",
        payload: { intent: "intro", topic: "dataset_licensing" },
        cost: 0.005,
      },
    ],
  },
]

// ---- Dashboard metrics ----

export const FUNNEL = [
  { stage: "Searched", value: 1240 },
  { stage: "Reached Out", value: 612 },
  { stage: "Responded", value: 388 },
  { stage: "Negotiated", value: 174 },
  { stage: "Goal Achieved", value: 96 },
]

export const ACTIVITY_SERIES = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  messages: Math.round(40 + 60 * Math.abs(Math.sin(i / 3)) + (i % 5) * 8),
  spend: Number((2 + 5 * Math.abs(Math.sin(i / 4)) + (i % 3)).toFixed(2)),
}))

export const KPIS = {
  connections: 1882,
  messages: 21470,
  goals: 96,
  spend: 1208.6,
  spendLimit: 2000,
  interactionsToday: 412,
  interactionLimit: 600,
  latencyMs: 642,
}

export interface LogRow {
  id: string
  ts: string
  agent: string
  counterpart: string
  action: string
  status: InteractionStatus
  cost: number
}

export const LOGS: LogRow[] = [
  { id: "l1", ts: "10:50:35", agent: "Nova", counterpart: "Orbit", action: "Evaluated bundle pricing", status: "live", cost: 0.01 },
  { id: "l2", ts: "10:42:14", agent: "Nova", counterpart: "Pulse", action: "Accepted referral terms", status: "negotiating", cost: 0.014 },
  { id: "l3", ts: "10:28:00", agent: "Nova", counterpart: "Vertex", action: "Sent licensing intro", status: "pending", cost: 0.005 },
  { id: "l4", ts: "10:21:06", agent: "Nova", counterpart: "Relay", action: "Executed contract", status: "deal", cost: 0.018 },
  { id: "l5", ts: "09:30:04", agent: "Nova", counterpart: "Ledger", action: "Declined over-constraint ask", status: "dead-end", cost: 0.006 },
  { id: "l6", ts: "09:12:51", agent: "Nova", counterpart: "Echo", action: "Qualified affiliate lead", status: "negotiating", cost: 0.011 },
  { id: "l7", ts: "08:55:30", agent: "Nova", counterpart: "Quill", action: "Routed escalation to human", status: "pending", cost: 0.004 },
  { id: "l8", ts: "08:40:12", agent: "Nova", counterpart: "Mint", action: "Negotiated processing rate", status: "deal", cost: 0.016 },
]

export const STATUS_TONE: Record<InteractionStatus, "success" | "primary" | "warning" | "muted" | "destructive"> = {
  deal: "success",
  negotiating: "primary",
  live: "primary",
  pending: "warning",
  "dead-end": "destructive",
}

export const STATUS_LABEL: Record<InteractionStatus, string> = {
  deal: "Deal Reached",
  negotiating: "Negotiating",
  live: "Live",
  pending: "Pending",
  "dead-end": "Dead End",
}
