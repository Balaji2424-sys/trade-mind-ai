"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { Shipment, ProcessingLog } from "./types"
import { mockShipments } from "./mock-data"

interface ShipmentContextType {
  shipments: Shipment[]
  processingLogs: ProcessingLog[]
  addShipment: (shipment: Shipment) => void
  updateShipment: (id: string, updates: Partial<Shipment>) => void
  getShipment: (id: string) => Shipment | undefined
  addProcessingLog: (log: ProcessingLog) => void
  getShipmentLogs: (shipmentId: string) => ProcessingLog[]
  clearLogs: () => void
}

const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined)

export function ShipmentProvider({ children }: { children: React.ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>(mockShipments)
  const [processingLogs, setProcessingLogs] = useState<ProcessingLog[]>([])

  const addShipment = (shipment: Shipment) => {
    setShipments((prev) => [shipment, ...prev])
  }

  const updateShipment = (id: string, updates: Partial<Shipment>) => {
    setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const getShipment = (id: string) => {
    return shipments.find((s) => s.id === id)
  }

  const addProcessingLog = (log: ProcessingLog) => {
    setProcessingLogs((prev) => [log, ...prev].slice(0, 100)) // Keep last 100 logs
  }

  const getShipmentLogs = (shipmentId: string) => {
    return processingLogs.filter((log) => log.shipmentId === shipmentId)
  }

  const clearLogs = () => {
    setProcessingLogs([])
  }

  return (
    <ShipmentContext.Provider
      value={{
        shipments,
        processingLogs,
        addShipment,
        updateShipment,
        getShipment,
        addProcessingLog,
        getShipmentLogs,
        clearLogs,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  )
}

export function useShipments() {
  const context = useContext(ShipmentContext)
  if (context === undefined) {
    throw new Error("useShipments must be used within a ShipmentProvider")
  }
  return context
}
