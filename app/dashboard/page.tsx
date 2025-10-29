"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCard } from "@/components/stats-card"
import { ShipmentTable } from "@/components/shipment-table"
import { RiskDistributionChart } from "@/components/risk-distribution-chart"
import { AgentStatusOverview } from "@/components/agent-status-overview"
import { ProcessingActivityFeed } from "@/components/processing-activity-feed"
import { useShipments } from "@/lib/shipment-context"
import { mockDashboardStats, mockAgents } from "@/lib/mock-data"
import { Package, CheckCircle2, Clock, DollarSign, TrendingUp, Shield } from "lucide-react"

export default function DashboardPage() {
  const { shipments, processingLogs } = useShipments()

  const stats = {
    ...mockDashboardStats,
    totalShipments: shipments.length,
    activeShipments: shipments.filter((s) => s.status === "processing").length,
    clearedShipments: shipments.filter((s) => s.status === "cleared").length,
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">Monitor your trade operations and AI agent performance</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard
              title="Total Shipments"
              value={stats.totalShipments}
              icon={Package}
              trend={{ value: 12.5, isPositive: true }}
            />
            <StatsCard
              title="Active Processing"
              value={stats.activeShipments}
              icon={Clock}
              description="Currently in progress"
            />
            <StatsCard
              title="Cleared Shipments"
              value={stats.clearedShipments}
              icon={CheckCircle2}
              trend={{ value: 8.3, isPositive: true }}
            />
            <StatsCard
              title="Total Duties Paid"
              value={`$${(stats.totalDutiesPaid / 1000000).toFixed(1)}M`}
              icon={DollarSign}
              trend={{ value: 15.2, isPositive: true }}
            />
          </div>

          <div className="mb-8">
            <ProcessingActivityFeed logs={processingLogs} maxHeight="400px" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <div className="lg:col-span-2">
              <div className="grid gap-6 md:grid-cols-2 mb-6">
                <StatsCard
                  title="Avg Processing Time"
                  value={`${stats.avgProcessingTime}h`}
                  icon={TrendingUp}
                  trend={{ value: 5.2, isPositive: false }}
                  description="Time to clearance"
                />
                <StatsCard
                  title="Compliance Rate"
                  value={`${stats.complianceRate}%`}
                  icon={Shield}
                  trend={{ value: 2.1, isPositive: true }}
                  description="Passed all checks"
                />
              </div>
              <RiskDistributionChart stats={stats} />
            </div>
            <AgentStatusOverview agents={mockAgents} />
          </div>

          <ShipmentTable shipments={shipments.slice(0, 10)} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
