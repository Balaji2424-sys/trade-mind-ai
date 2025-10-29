"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { AIAgent } from "@/lib/types"
import { CheckCircle2, Loader2, AlertCircle, Clock } from "lucide-react"

interface AgentMonitorProps {
  agents: AIAgent[]
}

export function AgentMonitor({ agents }: AgentMonitorProps) {
  const getStatusIcon = (status: AIAgent["status"]) => {
    switch (status) {
      case "processing":
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: AIAgent["status"]) => {
    switch (status) {
      case "processing":
        return <Badge variant="default">Processing</Badge>
      case "completed":
        return <Badge className="bg-green-600 text-white hover:bg-green-700">Completed</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Idle</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Agent Orchestration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {agents.map((agent) => (
          <div key={agent.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(agent.status)}
                <div>
                  <p className="font-medium">{agent.name}</p>
                  {agent.currentTask && <p className="text-xs text-muted-foreground">{agent.currentTask}</p>}
                </div>
              </div>
              {getStatusBadge(agent.status)}
            </div>
            {agent.status === "processing" && (
              <div className="space-y-1">
                <Progress value={agent.progress} className="h-2" />
                <p className="text-xs text-right text-muted-foreground">{Math.round(agent.progress)}%</p>
              </div>
            )}
            {agent.metrics && agent.status !== "processing" && (
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Success Rate: {agent.metrics.successRate}%</span>
                <span>Avg Time: {agent.metrics.avgProcessingTime}s</span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
