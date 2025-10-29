"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Shipment } from "@/lib/types"
import { Eye } from "lucide-react"
import Link from "next/link"

interface ShipmentTableProps {
  shipments: Shipment[]
}

export function ShipmentTable({ shipments }: ShipmentTableProps) {
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
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "high":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      case "critical":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Shipments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                <th className="pb-3">Reference</th>
                <th className="pb-3">Route</th>
                <th className="pb-3">Goods</th>
                <th className="pb-3">Value</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Risk</th>
                <th className="pb-3">Date</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="border-b last:border-0">
                  <td className="py-4">
                    <p className="font-mono text-sm font-medium">{shipment.referenceNumber}</p>
                  </td>
                  <td className="py-4">
                    <p className="text-sm">
                      {shipment.exporter.country} → {shipment.importer.country}
                    </p>
                  </td>
                  <td className="py-4">
                    <p className="max-w-xs truncate text-sm">{shipment.goods.description}</p>
                  </td>
                  <td className="py-4">
                    <p className="text-sm font-medium">
                      {shipment.goods.currency} {shipment.goods.value.toLocaleString()}
                    </p>
                  </td>
                  <td className="py-4">
                    <Badge className={getStatusColor(shipment.status)}>{shipment.status.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="py-4">
                    {shipment.riskScore ? (
                      <Badge variant="outline" className={getRiskColor(shipment.riskScore.level)}>
                        {shipment.riskScore.level}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-4">
                    <p className="text-sm text-muted-foreground">{new Date(shipment.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="py-4">
                    <Link href={`/shipments/${shipment.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
