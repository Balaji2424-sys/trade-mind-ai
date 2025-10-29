"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AIAgent } from "@/lib/types"
import { Activity } from "lucide-react"

interface AgentStatusOverviewProps {
  agents: AIAgent[]
}

export function AgentStatusOverview({ agents }: AgentStatusOverviewProps) {
  const activeAgents = agents.filter((a) => a.status === "processing").length
  const totalProcessed = agents.reduce((sum, a) => sum + (a.metrics?.totalProcessed || 0), 0)
  const avgSuccessRate = agents.reduce((sum, a) => sum + (a.metrics?.successRate || 0), 0) / agents.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          AI Agent Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{agents.length}</p>
            <p className="text-xs text-muted-foreground">Total Agents</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{activeAgents}</p>
            <p className="text-xs text-muted-foreground">Active Now</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Avg Success</p>
          </div>
        </div>
        <div className="space-y-2 border-t pt-4">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between">
              <span className="text-sm">{agent.name}</span>
              <Badge variant={agent.status === "processing" ? "default" : "secondary"}>{agent.status}</Badge>
            </div>
          ))}
        </div>
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Total Processed: <span className="font-medium text-foreground">{totalProcessed.toLocaleString()}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
