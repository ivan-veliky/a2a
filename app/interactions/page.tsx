import { PageHeader } from "@/components/page-header"
import { InteractionsView } from "@/components/interactions-view"

export default function InteractionsPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Live Interactions"
        description="Monitor agent-to-agent communication in real time and step in when needed."
      />
      <InteractionsView />
    </div>
  )
}
