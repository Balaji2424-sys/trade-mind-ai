"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import type { DashboardStats } from "@/lib/types"

interface RiskDistributionChartProps {
  stats: DashboardStats
}

export function RiskDistributionChart({ stats }: RiskDistributionChartProps) {
  const data = [
    { name: "Low", value: stats.riskDistribution.low, fill: "hsl(var(--chart-1))" },
    { name: "Medium", value: stats.riskDistribution.medium, fill: "hsl(var(--chart-2))" },
    { name: "High", value: stats.riskDistribution.high, fill: "hsl(var(--chart-3))" },
    { name: "Critical", value: stats.riskDistribution.critical, fill: "hsl(var(--chart-4))" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
