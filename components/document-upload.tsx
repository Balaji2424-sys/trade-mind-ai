"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react"
import type { Document, DocumentType } from "@/lib/types"

interface DocumentUploadProps {
  onDocumentsChange: (documents: Document[]) => void
  shipmentId: string
}

export function DocumentUpload({ onDocumentsChange, shipmentId }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      handleFiles(files)
    },
    [shipmentId],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files)
        handleFiles(files)
      }
    },
    [shipmentId],
  )

  const handleFiles = (files: File[]) => {
    const newDocuments: Document[] = files.map((file) => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      shipmentId,
      type: inferDocumentType(file.name),
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      uploadedAt: new Date(),
      validationStatus: "pending",
    }))

    const updated = [...documents, ...newDocuments]
    setDocuments(updated)
    onDocumentsChange(updated)
  }

  const inferDocumentType = (fileName: string): DocumentType => {
    const lower = fileName.toLowerCase()
    if (lower.includes("invoice")) return "commercial_invoice"
    if (lower.includes("packing")) return "packing_list"
    if (lower.includes("bill") || lower.includes("lading")) return "bill_of_lading"
    if (lower.includes("certificate") || lower.includes("origin")) return "certificate_of_origin"
    return "other"
  }

  const removeDocument = (id: string) => {
    const updated = documents.filter((doc) => doc.id !== id)
    setDocuments(updated)
    onDocumentsChange(updated)
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/30"
        }`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Upload Trade Documents</h3>
        <p className="mt-2 text-sm text-muted-foreground">Drag and drop files here, or click to browse</p>
        <p className="mt-1 text-xs text-muted-foreground">Supported: PDF, JPG, PNG, DOC (Max 10MB per file)</p>
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Documents ({documents.length})</h4>
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{doc.type.replace(/_/g, " ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.validationStatus === "valid" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                  {doc.validationStatus === "invalid" && <AlertCircle className="h-5 w-5 text-destructive" />}
                  <Button variant="ghost" size="sm" onClick={() => removeDocument(doc.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
