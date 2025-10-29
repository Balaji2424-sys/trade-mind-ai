"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ProcessingLog } from "@/lib/types"
import { FileText, CheckCircle2, Hash, Calculator, Shield, AlertTriangle, Zap, Info, XCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ProcessingActivityFeedProps {
  logs: ProcessingLog[]
  maxHeight?: string
}

export function ProcessingActivityFeed({ logs, maxHeight = "600px" }: ProcessingActivityFeedProps) {
  const getAgentIcon = (agentType: ProcessingLog["agentType"]) => {
    switch (agentType) {
      case "document_intake":
        return <FileText className="h-4 w-4" />
      case "validation":
        return <CheckCircle2 className="h-4 w-4" />
      case "hs_code":
        return <Hash className="h-4 w-4" />
      case "duty":
        return <Calculator className="h-4 w-4" />
      case "compliance":
        return <Shield className="h-4 w-4" />
      case "risk":
        return <AlertTriangle className="h-4 w-4" />
      case "report":
        return <Zap className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: ProcessingLog["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "error":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "warning":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      default:
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
    }
  }

  const getStatusIcon = (status: ProcessingLog["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-3 w-3" />
      case "error":
        return <XCircle className="h-3 w-3" />
      case "warning":
        return <AlertTriangle className="h-3 w-3" />
      default:
        return <Info className="h-3 w-3" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Live Processing Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No processing activity yet</p>
                <p className="text-sm">Start processing a shipment to see live updates</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border ${getStatusColor(log.status)} transition-all hover:shadow-sm`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getAgentIcon(log.agentType)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{log.agentName}</span>
                        <Badge variant="outline" className="text-xs">
                          {log.action}
                        </Badge>
                        <div className="flex items-center gap-1 ml-auto">{getStatusIcon(log.status)}</div>
                      </div>
                      <p className="text-sm text-foreground/80">{log.details}</p>
                      {log.data && Object.keys(log.data).length > 0 && (
                        <div className="mt-2 text-xs font-mono bg-background/50 p-2 rounded">
                          {Object.entries(log.data).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-muted-foreground">{key}:</span>{" "}
                              <span className="text-foreground">{JSON.stringify(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
