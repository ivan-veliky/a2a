import { PageHeader } from "@/components/page-header"
import { SimulationView } from "@/components/simulation-view"

export default function MapPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Simulation Map"
        description="A live, gamified view of the agent network — watch robots search, negotiate, and close deals in real time."
      />
      <SimulationView />
    </div>
  )
}
