import type { Shipment, AIAgent, ProcessingLog } from "./types"
import {
  processDocumentIntake,
  validateDocument,
  classifyHSCode,
  calculateDuty,
  checkCompliance,
  calculateRiskScore,
  optimizeRoute,
} from "./ai-agents"

export class AgentOrchestrator {
  private agents: AIAgent[]
  private onAgentUpdate?: (agents: AIAgent[]) => void
  private onShipmentUpdate?: (shipment: Partial<Shipment>) => void
  private onLog?: (log: ProcessingLog) => void

  constructor(
    agents: AIAgent[],
    onAgentUpdate?: (agents: AIAgent[]) => void,
    onShipmentUpdate?: (shipment: Partial<Shipment>) => void,
    onLog?: (log: ProcessingLog) => void,
  ) {
    this.agents = agents
    this.onAgentUpdate = onAgentUpdate
    this.onShipmentUpdate = onShipmentUpdate
    this.onLog = onLog
  }

  private log(
    shipmentId: string,
    agentType: AIAgent["type"],
    agentName: string,
    action: string,
    details: string,
    status: ProcessingLog["status"] = "info",
    data?: Record<string, any>,
  ) {
    this.onLog?.({
      id: `${Date.now()}-${Math.random()}`,
      shipmentId,
      agentType,
      agentName,
      timestamp: new Date(),
      action,
      details,
      status,
      data,
    })
  }

  private updateAgent(agentType: AIAgent["type"], updates: Partial<AIAgent>) {
    this.agents = this.agents.map((agent) => (agent.type === agentType ? { ...agent, ...updates } : agent))
    this.onAgentUpdate?.(this.agents)
  }

  async processShipment(shipment: Shipment): Promise<Shipment> {
    const updatedShipment = { ...shipment }

    this.log(
      shipment.id,
      "document_intake",
      "System",
      "Processing Started",
      `Initiated processing for shipment ${shipment.id}`,
      "info",
    )

    // Step 1: Document Intake Agent
    await this.runDocumentIntakeAgent(updatedShipment)

    // Step 2: Validation Agent
    await this.runValidationAgent(updatedShipment)

    // Step 3: HS Code Classification Agent
    const hsCode = await this.runHSCodeAgent(updatedShipment)
    updatedShipment.hsCode = hsCode
    this.onShipmentUpdate?.({ hsCode })

    // Step 4: Duty Calculator Agent
    const dutyCalculation = await this.runDutyAgent(updatedShipment)
    updatedShipment.dutyCalculation = dutyCalculation
    this.onShipmentUpdate?.({ dutyCalculation })

    // Step 5: Compliance Checker Agent
    const complianceChecks = await this.runComplianceAgent(updatedShipment)
    updatedShipment.complianceChecks = complianceChecks
    this.onShipmentUpdate?.({ complianceChecks })

    // Step 6: Risk Scoring Agent
    const riskScore = await this.runRiskScoringAgent(updatedShipment)
    updatedShipment.riskScore = riskScore
    this.onShipmentUpdate?.({ riskScore })

    // Step 7: Route Optimization (Quantum)
    const optimizedRoute = await this.runRouteOptimization(updatedShipment)
    updatedShipment.optimizedRoute = optimizedRoute
    this.onShipmentUpdate?.({ optimizedRoute })

    // Final status update
    const finalStatus = this.determineFinalStatus(updatedShipment)
    updatedShipment.status = finalStatus
    updatedShipment.updatedAt = new Date()
    this.onShipmentUpdate?.({ status: finalStatus, updatedAt: new Date() })

    this.log(
      shipment.id,
      "report",
      "System",
      "Processing Completed",
      `Shipment ${shipment.id} processing completed with status: ${finalStatus}`,
      finalStatus === "cleared" ? "success" : finalStatus === "rejected" ? "error" : "warning",
      { finalStatus },
    )

    return updatedShipment
  }

  private async runDocumentIntakeAgent(shipment: Shipment) {
    this.log(
      shipment.id,
      "document_intake",
      "Document Intake Agent",
      "Starting Document Analysis",
      `Analyzing ${shipment.documents.length} documents`,
      "info",
    )

    this.updateAgent("document_intake", {
      status: "processing",
      progress: 0,
      currentTask: "Extracting data from documents",
    })

    const results = []
    for (let i = 0; i < shipment.documents.length; i++) {
      const doc = shipment.documents[i]

      this.log(
        shipment.id,
        "document_intake",
        "Document Intake Agent",
        "Processing Document",
        `Extracting data from ${doc.type}: ${doc.name}`,
        "info",
        { documentType: doc.type, documentName: doc.name },
      )

      const result = await processDocumentIntake(doc)
      results.push(result)

      const extractedFields = result.extractedFields || {}
      this.log(
        shipment.id,
        "document_intake",
        "Document Intake Agent",
        "Data Extracted",
        `Successfully extracted ${Object.keys(extractedFields).length} fields from ${doc.name}`,
        "success",
        { fieldsExtracted: Object.keys(extractedFields).length },
      )

      this.updateAgent("document_intake", {
        progress: ((i + 1) / shipment.documents.length) * 100,
      })
    }

    this.updateAgent("document_intake", {
      status: "completed",
      progress: 100,
      lastRun: new Date(),
    })

    this.log(
      shipment.id,
      "document_intake",
      "Document Intake Agent",
      "Document Intake Complete",
      `All ${shipment.documents.length} documents processed successfully`,
      "success",
    )

    return results
  }

  private async runValidationAgent(shipment: Shipment) {
    this.log(
      shipment.id,
      "validation",
      "Validation Agent",
      "Starting Validation",
      "Checking document completeness and accuracy",
      "info",
    )

    this.updateAgent("validation", {
      status: "processing",
      progress: 0,
      currentTask: "Validating document completeness",
    })

    for (let i = 0; i < shipment.documents.length; i++) {
      const doc = shipment.documents[i]

      this.log(
        shipment.id,
        "validation",
        "Validation Agent",
        "Validating Document",
        `Checking ${doc.type} for completeness and accuracy`,
        "info",
      )

      const validation = await validateDocument(doc)

      doc.validationStatus = validation.valid ? "valid" : "invalid"
      doc.validationErrors = validation.errors

      if (validation.valid) {
        this.log(
          shipment.id,
          "validation",
          "Validation Agent",
          "Validation Passed",
          `${doc.name} passed all validation checks`,
          "success",
        )
      } else {
        this.log(
          shipment.id,
          "validation",
          "Validation Agent",
          "Validation Issues Found",
          `${doc.name} has ${validation.errors.length} validation errors`,
          "warning",
          { errors: validation.errors },
        )
      }

      this.updateAgent("validation", {
        progress: ((i + 1) / shipment.documents.length) * 100,
      })
    }

    this.updateAgent("validation", {
      status: "completed",
      progress: 100,
      lastRun: new Date(),
    })

    const validDocs = shipment.documents.filter((d) => d.validationStatus === "valid").length
    this.log(
      shipment.id,
      "validation",
      "Validation Agent",
      "Validation Complete",
      `${validDocs}/${shipment.documents.length} documents validated successfully`,
      validDocs === shipment.documents.length ? "success" : "warning",
    )
  }

  private async runHSCodeAgent(shipment: Shipment) {
    this.log(
      shipment.id,
      "hs_code",
      "HS Code Agent",
      "Starting Classification",
      `Classifying: ${shipment.goods.description}`,
      "info",
    )

    this.updateAgent("hs_code", {
      status: "processing",
      progress: 0,
      currentTask: "Classifying goods with AI",
    })

    this.updateAgent("hs_code", { progress: 50 })

    const hsCode = await classifyHSCode(shipment.goods.description)

    this.log(
      shipment.id,
      "hs_code",
      "HS Code Agent",
      "Classification Complete",
      `Classified as ${hsCode.code} - ${hsCode.description} (${hsCode.confidence}% confidence)`,
      "success",
      { hsCode: hsCode.code, confidence: hsCode.confidence },
    )

    this.updateAgent("hs_code", {
      status: "completed",
      progress: 100,
      lastRun: new Date(),
    })

    return hsCode
  }

  private async runDutyAgent(shipment: Shipment) {
    this.log(
      shipment.id,
      "duty",
      "Duty Calculator Agent",
      "Calculating Duties",
      `Computing duties for ${shipment.exporter.country} → ${shipment.importer.country}`,
      "info",
    )

    this.updateAgent("duty", {
      status: "processing",
      progress: 0,
      currentTask: "Calculating duties and taxes",
    })

    this.updateAgent("duty", { progress: 50 })

    const dutyCalculation = await calculateDuty(
      shipment.hsCode?.code || "",
      shipment.goods.value,
      shipment.exporter.country,
      shipment.importer.country,
    )

    this.log(
      shipment.id,
      "duty",
      "Duty Calculator Agent",
      "Duty Calculation Complete",
      `Total duties: $${dutyCalculation.totalAmount.toFixed(2)} (Duty: $${dutyCalculation.dutyAmount.toFixed(2)}, Tax: $${dutyCalculation.taxAmount.toFixed(2)})`,
      "success",
      { totalAmount: dutyCalculation.totalAmount },
    )

    this.updateAgent("duty", {
      status: "completed",
      progress: 100,
      lastRun: new Date(),
    })

    return dutyCalculation
  }

  private async runComplianceAgent(shipment: Shipment) {
    this.log(
      shipment.id,
      "compliance",
      "Compliance Agent",
      "Starting Compliance Checks",
      "Checking regulatory requirements and restrictions",
      "info",
    )

    this.updateAgent("compliance", {
      status: "processing",
      progress: 0,
      currentTask: "Checking regulatory compliance",
    })

    this.updateAgent("compliance", { progress: 50 })

    const complianceChecks = await checkCompliance(shipment)

    complianceChecks.forEach((check) => {
      this.log(
        shipment.id,
        "compliance",
        "Compliance Agent",
        `${check.type} Check`,
        `${check.description}: ${check.status}`,
        check.status === "passed" ? "success" : check.status === "failed" ? "error" : "warning",
        { checkType: check.type, status: check.status },
      )
    })

    const passedChecks = complianceChecks.filter((c) => c.status === "passed").length
    this.log(
      shipment.id,
      "compliance",
      "Compliance Agent",
      "Compliance Checks Complete",
      `${passedChecks}/${complianceChecks.length} compliance checks passed`,
      passedChecks === complianceChecks.length ? "success" : "error",
    )

    this.updateAgent("compliance", {
      status: "completed",
      progress: 100,
      lastRun: new Date(),
    })

    return complianceChecks
  }

  private async runRiskScoringAgent(shipment: Shipment) {
    this.log(shipment.id, "risk", "Risk Scoring Agent", "Analyzing Risk Factors", "Evaluating shipment risk", "info")

    this.updateAgent("risk", {
      status: "processing",
      progress: 0,
      currentTask: "Calculating risk score",
    })

    this.updateAgent("risk", { progress: 50 })

    const riskScore = await calculateRiskScore(shipment)

    Object.entries(riskScore.factors).forEach(([factorName, score]) => {
      const formattedName = factorName.replace(/([A-Z])/g, " $1").trim()
      const impact = score < 70 ? "high" : score < 85 ? "medium" : "low"

      this.log(
        shipment.id,
        "risk",
        "Risk Scoring Agent",
        "Risk Factor Analyzed",
        `${formattedName}: ${score.toFixed(1)}% (Impact: ${impact})`,
        impact === "high" ? "warning" : "info",
        { factor: factorName, score, impact },
      )
    })

    this.log(
      shipment.id,
      "risk",
      "Risk Scoring Agent",
      "Risk Assessment Complete",
      `Risk Level: ${riskScore.level.toUpperCase()} (Score: ${riskScore.overall.toFixed(1)}/100)`,
      riskScore.level === "low"
        ? "success"
        : riskScore.level === "high" || riskScore.level === "critical"
          ? "warning"
          : "info",
      { riskLevel: riskScore.level, riskScore: riskScore.overall },
    )

    this.updateAgent("risk", {
      status: "completed",
      progress: 100,
      lastRun: new Date(),
    })

    return riskScore
  }

  private async runRouteOptimization(shipment: Shipment) {
    this.log(
      shipment.id,
      "report",
      "Quantum Optimizer",
      "Optimizing Route",
      "Running quantum algorithms for optimal routing",
      "info",
    )

    this.updateAgent("report", {
      status: "processing",
      progress: 0,
      currentTask: "Optimizing route with quantum algorithms",
    })

    this.updateAgent("report", { progress: 50 })

    const optimizedRoute = await optimizeRoute(
      shipment.exporter.country,
      shipment.importer.country,
      shipment.goods.weight,
    )

    this.log(
      shipment.id,
      "report",
      "Quantum Optimizer",
      "Route Optimization Complete",
      `Optimal route: ${optimizedRoute.path.join(" → ")} (${optimizedRoute.estimatedDays} days, $${optimizedRoute.estimatedCost})`,
      "success",
      {
        path: optimizedRoute.path,
        days: optimizedRoute.estimatedDays,
        cost: optimizedRoute.estimatedCost,
      },
    )

    this.updateAgent("report", {
      status: "completed",
      progress: 100,
      lastRun: new Date(),
    })

    return optimizedRoute
  }

  private determineFinalStatus(shipment: Shipment): Shipment["status"] {
    // Check if any compliance checks failed
    const hasFailedCompliance = shipment.complianceChecks.some((check) => check.status === "failed")
    if (hasFailedCompliance) {
      return "rejected"
    }

    // Check risk level
    if (shipment.riskScore?.level === "critical" || shipment.riskScore?.level === "high") {
      return "pending_review"
    }

    // Check document validation
    const hasInvalidDocs = shipment.documents.some((doc) => doc.validationStatus === "invalid")
    if (hasInvalidDocs) {
      return "pending_review"
    }

    // All checks passed
    return "cleared"
  }
}
