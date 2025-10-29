"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AgentMonitor } from "@/components/agent-monitor"
import { ProcessingActivityFeed } from "@/components/processing-activity-feed"
import { useShipments } from "@/lib/shipment-context"
import { AgentOrchestrator } from "@/lib/orchestrator"
import { mockAgents } from "@/lib/mock-data"
import type { AIAgent, Shipment } from "@/lib/types"
import { ArrowLeft, FileText, Package, DollarSign, Shield, AlertTriangle, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function ShipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getShipment, updateShipment, addProcessingLog, getShipmentLogs } = useShipments()
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [agents, setAgents] = useState<AIAgent[]>(mockAgents)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const id = params.id as string
    const foundShipment = getShipment(id)

    if (!foundShipment) {
      router.push("/dashboard")
      return
    }

    setShipment(foundShipment)

    // Auto-start processing if status is "processing"
    if (foundShipment.status === "processing" && !isProcessing) {
      startProcessing(foundShipment)
    }
  }, [params.id])

  const startProcessing = async (currentShipment: Shipment) => {
    setIsProcessing(true)

    const orchestrator = new AgentOrchestrator(
      agents,
      (updatedAgents) => {
        setAgents([...updatedAgents])
      },
      (updates) => {
        setShipment((prev) => (prev ? { ...prev, ...updates } : null))
      },
      (log) => {
        addProcessingLog(log)
      },
    )

    const processedShipment = await orchestrator.processShipment(currentShipment)

    // Update in context
    updateShipment(processedShipment.id, processedShipment)
    setShipment(processedShipment)
    setIsProcessing(false)
  }

  if (!shipment) {
    return null
  }

  const getStatusColor = (status: Shipment["status"]) => {
    switch (status) {
      case "cleared":
        return "bg-green-600 text-white hover:bg-green-700"
      case "processing":
        return "bg-blue-600 text-white hover:bg-blue-700"
      case "rejected":
        return "bg-red-600 text-white hover:bg-red-700"
      case "pending_review":
        return "bg-yellow-600 text-white hover:bg-yellow-700"
      default:
        return "bg-gray-600 text-white hover:bg-gray-700"
    }
  }

  const getRiskColor = (level?: string) => {
    switch (level) {
      case "low":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "high":
        return "text-orange-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  const shipmentLogs = getShipmentLogs(shipment.id)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold">{shipment.referenceNumber}</h1>
                  <p className="text-sm text-muted-foreground">
                    {shipment.exporter.country} → {shipment.importer.country}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(shipment.status)}>{shipment.status.replace(/_/g, " ")}</Badge>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <AgentMonitor agents={agents} />

              <ProcessingActivityFeed logs={shipmentLogs} maxHeight="500px" />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Goods Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-base">{shipment.goods.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                      <p className="text-base">
                        {shipment.goods.quantity} {shipment.goods.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Value</p>
                      <p className="text-base">
                        {shipment.goods.currency} {shipment.goods.value.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Weight</p>
                      <p className="text-base">
                        {shipment.goods.weight} {shipment.goods.weightUnit}
                      </p>
                    </div>
                    {shipment.hsCode && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">HS Code</p>
                        <p className="text-base font-mono">{shipment.hsCode.code}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {shipment.dutyCalculation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Duty Calculation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Value</span>
                        <span className="font-medium">
                          {shipment.dutyCalculation.currency} {shipment.dutyCalculation.baseValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duty ({shipment.dutyCalculation.dutyRate}%)</span>
                        <span className="font-medium">
                          {shipment.dutyCalculation.currency} {shipment.dutyCalculation.dutyAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span className="font-medium">
                          {shipment.dutyCalculation.currency} {shipment.dutyCalculation.taxAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-3">
                        <span className="font-semibold">Total Amount</span>
                        <span className="text-lg font-bold text-primary">
                          {shipment.dutyCalculation.currency} {shipment.dutyCalculation.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {shipment.complianceChecks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Compliance Checks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {shipment.complianceChecks.map((check) => (
                      <div key={check.id} className="flex items-start justify-between rounded-lg border p-3">
                        <div className="flex-1">
                          <p className="font-medium">{check.rule}</p>
                          <p className="text-sm text-muted-foreground">{check.message}</p>
                        </div>
                        <Badge
                          variant={
                            check.status === "passed"
                              ? "default"
                              : check.status === "warning"
                                ? "secondary"
                                : "destructive"
                          }
                          className={check.status === "passed" ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          {check.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {shipment.riskScore && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                      <p className={`text-4xl font-bold ${getRiskColor(shipment.riskScore.level)}`}>
                        {shipment.riskScore.overall}
                      </p>
                      <Badge className={`mt-2 ${getRiskColor(shipment.riskScore.level)}`}>
                        {shipment.riskScore.level.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Document Completeness</span>
                        <span className="font-medium">{shipment.riskScore.factors.documentCompleteness}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Compliance History</span>
                        <span className="font-medium">{shipment.riskScore.factors.complianceHistory}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Value Accuracy</span>
                        <span className="font-medium">{shipment.riskScore.factors.valueAccuracy}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Origin Verification</span>
                        <span className="font-medium">{shipment.riskScore.factors.originVerification}%</span>
                      </div>
                    </div>
                    {shipment.riskScore.recommendations.length > 0 && (
                      <div className="space-y-2 border-t pt-4">
                        <p className="text-sm font-medium">Recommendations</p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {shipment.riskScore.recommendations.map((rec, idx) => (
                            <li key={idx}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {shipment.optimizedRoute && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Optimized Route
                    </CardTitle>
                    <CardDescription>Quantum-optimized logistics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      {shipment.optimizedRoute.path.map((location, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {idx + 1}
                          </div>
                          <span className="text-sm">{location}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 border-t pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estimated Cost</span>
                        <span className="font-medium">
                          USD {shipment.optimizedRoute.estimatedCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estimated Time</span>
                        <span className="font-medium">{shipment.optimizedRoute.estimatedTime} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-medium">{shipment.optimizedRoute.confidence}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {shipment.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-lg border p-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.fileName}</p>
                          <p className="text-xs text-muted-foreground capitalize">{doc.type.replace(/_/g, " ")}</p>
                        </div>
                      </div>
                      {doc.validationStatus === "valid" && (
                        <Badge className="bg-green-600 hover:bg-green-700">Valid</Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
