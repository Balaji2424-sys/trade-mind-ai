// Core data types for TradeMind Quantum

export type UserRole = "exporter" | "customs_agent" | "logistics" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  company: string
  createdAt: Date
}

export type DocumentType = "commercial_invoice" | "packing_list" | "bill_of_lading" | "certificate_of_origin" | "other"

export type ShipmentStatus = "draft" | "processing" | "validated" | "cleared" | "rejected" | "pending_review"

export type RiskLevel = "low" | "medium" | "high" | "critical"

export type AgentStatus = "idle" | "processing" | "completed" | "error"

export interface Document {
  id: string
  shipmentId: string
  type: DocumentType
  fileName: string
  fileUrl: string
  uploadedAt: Date
  extractedData?: Record<string, any>
  validationStatus?: "pending" | "valid" | "invalid"
  validationErrors?: string[]
}

export interface HSCode {
  code: string
  description: string
  confidence: number
  category: string
}

export interface DutyCalculation {
  hsCode: string
  baseValue: number
  dutyRate: number
  dutyAmount: number
  taxAmount: number
  totalAmount: number
  currency: string
}

export interface ComplianceCheck {
  id: string
  rule: string
  status: "passed" | "failed" | "warning"
  message: string
  severity: "low" | "medium" | "high"
}

export interface RiskScore {
  overall: number
  factors: {
    documentCompleteness: number
    complianceHistory: number
    valueAccuracy: number
    originVerification: number
  }
  level: RiskLevel
  recommendations: string[]
}

export interface BlockchainRecord {
  id: string
  shipmentId: string
  action: string
  timestamp: Date
  hash: string
  previousHash: string
  data: Record<string, any>
}

export interface AIAgent {
  id: string
  name: string
  type: "document_intake" | "validation" | "hs_code" | "duty" | "compliance" | "risk" | "report" | "learning"
  status: AgentStatus
  progress: number
  currentTask?: string
  lastRun?: Date
  metrics?: {
    totalProcessed: number
    successRate: number
    avgProcessingTime: number
  }
}

export interface ProcessingLog {
  id: string
  shipmentId: string
  agentType: AIAgent["type"]
  agentName: string
  timestamp: Date
  action: string
  details: string
  status: "info" | "success" | "warning" | "error"
  data?: Record<string, any>
}

export interface Shipment {
  id: string
  userId: string
  referenceNumber: string
  status: ShipmentStatus
  createdAt: Date
  updatedAt: Date

  // Basic Info
  exporter: {
    name: string
    address: string
    country: string
  }
  importer: {
    name: string
    address: string
    country: string
  }

  // Goods Info
  goods: {
    description: string
    quantity: number
    unit: string
    value: number
    currency: string
    weight: number
    weightUnit: string
  }

  // AI Processing Results
  documents: Document[]
  hsCode?: HSCode
  dutyCalculation?: DutyCalculation
  complianceChecks: ComplianceCheck[]
  riskScore?: RiskScore

  // Agent Processing
  agentResults: {
    documentIntake?: any
    validation?: any
    hsCodeClassification?: any
    dutyEstimation?: any
    compliance?: any
    riskScoring?: any
  }

  // Blockchain
  blockchainRecords: BlockchainRecord[]

  // Quantum Optimization
  optimizedRoute?: {
    path: string[]
    estimatedCost: number
    estimatedTime: number
    confidence: number
  }
}

export interface DashboardStats {
  totalShipments: number
  activeShipments: number
  clearedShipments: number
  avgProcessingTime: number
  totalDutiesPaid: number
  complianceRate: number
  riskDistribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
}
