"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentUpload } from "@/components/document-upload"
import { useShipments } from "@/lib/shipment-context"
import { useAuth } from "@/lib/auth-context"
import type { Shipment, Document } from "@/lib/types"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewShipmentPage() {
  const router = useRouter()
  const { addShipment } = useShipments()
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])

  const [formData, setFormData] = useState({
    exporterName: user?.company || "",
    exporterAddress: "",
    exporterCountry: "",
    importerName: "",
    importerAddress: "",
    importerCountry: "",
    goodsDescription: "",
    quantity: "",
    unit: "pieces",
    value: "",
    currency: "USD",
    weight: "",
    weightUnit: "kg",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newShipment: Shipment = {
      id: `ship-${Date.now()}`,
      userId: user?.id || "user-1",
      referenceNumber: `TM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
      status: "processing",
      createdAt: new Date(),
      updatedAt: new Date(),
      exporter: {
        name: formData.exporterName,
        address: formData.exporterAddress,
        country: formData.exporterCountry,
      },
      importer: {
        name: formData.importerName,
        address: formData.importerAddress,
        country: formData.importerCountry,
      },
      goods: {
        description: formData.goodsDescription,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        value: Number(formData.value),
        currency: formData.currency,
        weight: Number(formData.weight),
        weightUnit: formData.weightUnit,
      },
      documents,
      complianceChecks: [],
      agentResults: {},
      blockchainRecords: [
        {
          id: `block-${Date.now()}`,
          shipmentId: `ship-${Date.now()}`,
          action: "Shipment Created",
          timestamp: new Date(),
          hash: `0x${Math.random().toString(36).substr(2, 12)}`,
          previousHash: "0x0000000000",
          data: { status: "draft" },
        },
      ],
    }

    addShipment(newShipment)
    router.push(`/shipments/${newShipment.id}`)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Create New Shipment</h1>
                <p className="text-sm text-muted-foreground">Enter shipment details and upload required documents</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exporter Information</CardTitle>
                <CardDescription>Details about the exporting party</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="exporterName">Company Name</Label>
                    <Input
                      id="exporterName"
                      name="exporterName"
                      value={formData.exporterName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exporterCountry">Country</Label>
                    <Input
                      id="exporterCountry"
                      name="exporterCountry"
                      value={formData.exporterCountry}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exporterAddress">Address</Label>
                  <Textarea
                    id="exporterAddress"
                    name="exporterAddress"
                    value={formData.exporterAddress}
                    onChange={handleChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Importer Information</CardTitle>
                <CardDescription>Details about the importing party</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="importerName">Company Name</Label>
                    <Input
                      id="importerName"
                      name="importerName"
                      value={formData.importerName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="importerCountry">Country</Label>
                    <Input
                      id="importerCountry"
                      name="importerCountry"
                      value={formData.importerCountry}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="importerAddress">Address</Label>
                  <Textarea
                    id="importerAddress"
                    name="importerAddress"
                    value={formData.importerAddress}
                    onChange={handleChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goods Information</CardTitle>
                <CardDescription>Details about the goods being shipped</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goodsDescription">Description</Label>
                  <Textarea
                    id="goodsDescription"
                    name="goodsDescription"
                    value={formData.goodsDescription}
                    onChange={handleChange}
                    placeholder="Detailed description of goods"
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input id="unit" name="unit" value={formData.unit} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Value (USD)</Label>
                    <Input
                      id="value"
                      name="value"
                      type="number"
                      value={formData.value}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weightUnit">Weight Unit</Label>
                    <Input
                      id="weightUnit"
                      name="weightUnit"
                      value={formData.weightUnit}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trade Documents</CardTitle>
                <CardDescription>Upload required customs and trade documents</CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentUpload onDocumentsChange={setDocuments} shipmentId={`ship-${Date.now()}`} />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isProcessing || documents.length === 0}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Create Shipment"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
