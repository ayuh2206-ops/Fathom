import "server-only"

import { HAIKU, MARITIME_SYSTEM_PROMPT, anthropic } from "@/lib/anthropic-client"

export interface ExtractedInvoiceFields {
    invoiceNumber: string | null
    invoiceDate: string | null
    dueDate: string | null
    vendorName: string | null
    vendorAddress: string | null
    vendorCountry: string | null
    clientName: string | null
    currency: string | null
    subtotal: number | null
    taxAmount: number | null
    totalAmount: number | null
    confidence: number
    lineItems: Array<{
        description: string
        quantity: number | null
        unit: string | null
        unitPrice: number | null
        totalPrice: number | null
        chargeType: string | null
        serviceCode: string | null
    }>
    portOfLoading: string | null
    portOfDischarge: string | null
    vesselName: string | null
    vesselIMO: string | null
    vesselMMSI: string | null
    vesselGT: number | null
    vesselType: string | null
    billOfLadingNumber: string | null
    containerNumbers: string[]
    detentionDays: number | null
    demurrageDays: number | null
    freeTimeDays: number | null
    portLocode: string | null
    portName: string | null
    agentName: string | null
    agentEmail: string | null
    agentPhone: string | null
    agentCompany: string | null
    arrivalDate: string | null
    departureDate: string | null
    detectedLanguage: string | null
}

export interface FraudAnalysisResult {
    fraudScore: number
    riskLevel: "low" | "medium" | "high" | "critical"
    flags: Array<{
        type: string
        description: string
        severity: "low" | "medium" | "high"
        affectedField: string
        chargeAmount: number | null
        officialRate?: number | null
    }>
    summary: string
    recommendedAction: "approve" | "review" | "dispute" | "escalate"
    totalDisputedAmount: number
    aisVerified: boolean
    aisNote: string | null
    agentId: string | null
}

export interface DisputeDraft {
    subject: string
    body: string
    keyPoints: string[]
    estimatedRecoveryAmount: number | null
}

export interface FraudHistoricalContext {
    avgDetentionRate: number
    avgDemurrageRate: number
    knownVendors: string[]
}

type JsonObject = Record<string, unknown>

type AiFraudPassResult = {
    additionalFlags: FraudAnalysisResult["flags"]
    aiScore: number
    summary: string
    recommendedAction: FraudAnalysisResult["recommendedAction"]
    totalDisputedAmount: number
}

const SERVICE_CODE_OPTIONS = [
    "PILOTAGE",
    "TOWAGE",
    "BERTH",
    "DEM",
    "DET",
    "AGENCY",
    "LAUNCH",
    "MOORING",
    "GARBAGE",
    "FRESH_WATER",
    "CUSTOMS",
    "ANCHORAGE",
    "PORT_DUES",
    "OTHER",
] as const

const EXTRACTION_PROMPT = `Extract ALL data from this maritime invoice. The invoice may be in any language — translate all values to English. Return ONLY a valid JSON object with no markdown formatting, no code blocks, no explanation — just the raw JSON object.

Required JSON structure:
{
  vendor: string or null,
  vendorCountry: string or null,
  invoiceNumber: string or null,
  invoiceDate: string or null (ISO date),
  vesselName: string or null,
  vesselIMO: string or null (7-digit IMO number only),
  vesselMMSI: string or null (9-digit MMSI number only),
  vesselGT: number or null (gross tonnage as number),
  vesselType: string or null (e.g. bulk carrier, container, tanker, general cargo),
  portName: string or null,
  portLocode: string or null (UN/LOCODE — infer from port name if not explicit: Rotterdam=NLRTM, Singapore=SGSIN, Dubai/Jebel Ali=AEDXB, Shanghai=CNSHA, Hamburg=DEHAM, Antwerp=BEANR, Los Angeles=USLAX, New York=USNYC, Mumbai/JNPT=INBOM, Chennai=INMAA, Kolkata=INCCU, Istanbul=TRIST, Piraeus=GRPIR, Santos=BRSSS, Buenos Aires=ARBUE, Lagos=NGLOS, Mombasa=KEMBA, Hong Kong=HKHKG, Busan=KRPUS, Yokohama=JPYOK),
  arrivalDate: string or null (ISO date vessel arrived at port),
  departureDate: string or null (ISO date vessel departed port),
  currency: string or null (3-letter ISO currency code),
  lineItems: [
    {
      description: string,
      serviceCode: string (must be exactly one of: PILOTAGE, TOWAGE, BERTH, DEM, DET, AGENCY, LAUNCH, MOORING, GARBAGE, FRESH_WATER, CUSTOMS, ANCHORAGE, PORT_DUES, OTHER),
      quantity: number or null,
      unit: string or null,
      unitPrice: number or null,
      totalPrice: number or null
    }
  ],
  totalAmount: number or null,
  agentName: string or null,
  agentEmail: string or null,
  agentPhone: string or null,
  agentCompany: string or null,
  detectedLanguage: string or null,
  confidence: number between 0 and 1
}

Also include these existing legacy fields when present: dueDate, vendorAddress, clientName, subtotal, taxAmount, portOfLoading, portOfDischarge, billOfLadingNumber, containerNumbers, detentionDays, demurrageDays, freeTimeDays.`

function getEmptyExtractedInvoiceFields(): ExtractedInvoiceFields {
    return {
        invoiceNumber: null,
        invoiceDate: null,
        dueDate: null,
        vendorName: null,
        vendorAddress: null,
        vendorCountry: null,
        clientName: null,
        currency: null,
        subtotal: null,
        taxAmount: null,
        totalAmount: null,
        confidence: 0,
        lineItems: [],
        portOfLoading: null,
        portOfDischarge: null,
        vesselName: null,
        vesselIMO: null,
        vesselMMSI: null,
        vesselGT: null,
        vesselType: null,
        billOfLadingNumber: null,
        containerNumbers: [],
        detentionDays: null,
        demurrageDays: null,
        freeTimeDays: null,
        portLocode: null,
        portName: null,
        agentName: null,
        agentEmail: null,
        agentPhone: null,
        agentCompany: null,
        arrivalDate: null,
        departureDate: null,
        detectedLanguage: null,
    }
}

function parseJson(content: string): JsonObject {
    const clean = content.replace(/```json|```/g, "").trim()
    const candidate = clean.slice(clean.indexOf("{"), clean.lastIndexOf("}") + 1) || clean
    const parsed = JSON.parse(candidate) as unknown

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Anthropic response did not contain a JSON object")
    }

    return parsed as JsonObject
}

function asObject(value: unknown): JsonObject | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null
    }

    return value as JsonObject
}

function asString(value: unknown): string | null {
    if (typeof value !== "string") {
        return null
    }

    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
}

function asNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value
    }

    if (typeof value === "string") {
        const normalized = value.replace(/[^0-9.-]/g, "")
        if (!normalized) {
            return null
        }

        const parsed = Number(normalized)
        return Number.isFinite(parsed) ? parsed : null
    }

    return null
}

function asDate(value: unknown): string | null {
    const normalized = asString(value)
    if (!normalized) {
        return null
    }

    const parsed = new Date(normalized)
    if (Number.isNaN(parsed.getTime())) {
        return null
    }

    return parsed.toISOString()
}

function asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return []
    }

    return value
        .map((entry) => asString(entry))
        .filter((entry): entry is string => entry !== null)
}

function asServiceCode(value: unknown): string | null {
    const normalized = asString(value)
    if (!normalized) {
        return null
    }

    const canonical = normalized.toUpperCase().replace(/[\s/-]+/g, "_")
    return SERVICE_CODE_OPTIONS.includes(canonical as (typeof SERVICE_CODE_OPTIONS)[number]) ? canonical : "OTHER"
}

function asPortLocode(value: unknown): string | null {
    const normalized = asString(value)
    if (!normalized) {
        return null
    }

    const compact = normalized.replace(/[^A-Z0-9]/gi, "").toUpperCase()
    return compact.length >= 5 ? compact.slice(0, 5) : compact || null
}

function asEmail(value: unknown): string | null {
    const normalized = asString(value)
    return normalized ? normalized.toLowerCase() : null
}

function asConfidence(value: unknown): number {
    const numeric = asNumber(value)
    if (numeric === null) {
        return 0
    }

    return Math.max(0, Math.min(1, numeric))
}

function getAnthropicText(
    response: Awaited<ReturnType<typeof anthropic.messages.create>>,
    firstOnly: boolean = false
): string {
    if (!("content" in response) || !Array.isArray(response.content)) {
        return ""
    }

    if (firstOnly) {
        const text = response.content[0]?.type === "text" ? response.content[0].text : ""
        return text.trim()
    }

    return response.content
        .map((block: { type: string; text?: string }) => (block.type === "text" ? block.text ?? "" : ""))
        .join("\n")
        .trim()
}

function normalizeExtractedFields(data: JsonObject): ExtractedInvoiceFields {
    const rawLineItems = Array.isArray(data.lineItems) ? data.lineItems : []
    const lineItems = rawLineItems
        .map((lineItem) => {
            const normalized = asObject(lineItem)
            if (!normalized) {
                return null
            }

            const serviceCode = asServiceCode(normalized.serviceCode)

            return {
                description: asString(normalized.description) ?? "Unknown charge",
                quantity: asNumber(normalized.quantity),
                unit: asString(normalized.unit),
                unitPrice: asNumber(normalized.unitPrice),
                totalPrice: asNumber(normalized.totalPrice),
                chargeType: asString(normalized.chargeType) ?? serviceCode,
                serviceCode,
            }
        })
        .filter((lineItem): lineItem is ExtractedInvoiceFields["lineItems"][number] => lineItem !== null)

    return {
        invoiceNumber: asString(data.invoiceNumber),
        invoiceDate: asDate(data.invoiceDate),
        dueDate: asDate(data.dueDate),
        vendorName: asString(data.vendorName ?? data.vendor),
        vendorAddress: asString(data.vendorAddress),
        vendorCountry: asString(data.vendorCountry),
        clientName: asString(data.clientName),
        currency: asString(data.currency)?.toUpperCase() ?? null,
        subtotal: asNumber(data.subtotal),
        taxAmount: asNumber(data.taxAmount),
        totalAmount: asNumber(data.totalAmount),
        confidence: asConfidence(data.confidence),
        lineItems,
        portOfLoading: asString(data.portOfLoading),
        portOfDischarge: asString(data.portOfDischarge),
        vesselName: asString(data.vesselName),
        vesselIMO: asString(data.vesselIMO)?.replace(/\D/g, "").slice(0, 7) ?? null,
        vesselMMSI: asString(data.vesselMMSI)?.replace(/\D/g, "").slice(0, 9) ?? null,
        vesselGT: asNumber(data.vesselGT),
        vesselType: asString(data.vesselType),
        billOfLadingNumber: asString(data.billOfLadingNumber),
        containerNumbers: asStringArray(data.containerNumbers),
        detentionDays: asNumber(data.detentionDays),
        demurrageDays: asNumber(data.demurrageDays),
        freeTimeDays: asNumber(data.freeTimeDays),
        portLocode: asPortLocode(data.portLocode),
        portName: asString(data.portName),
        agentName: asString(data.agentName),
        agentEmail: asEmail(data.agentEmail),
        agentPhone: asString(data.agentPhone),
        agentCompany: asString(data.agentCompany),
        arrivalDate: asDate(data.arrivalDate),
        departureDate: asDate(data.departureDate),
        detectedLanguage: asString(data.detectedLanguage),
    }
}

function normalizeFlag(value: unknown): FraudAnalysisResult["flags"][number] | null {
    const normalized = asObject(value)
    if (!normalized) {
        return null
    }

    const severity = asString(normalized.severity)?.toLowerCase()

    return {
        type: asString(normalized.type) ?? "UNKNOWN_FLAG",
        description: asString(normalized.description) ?? "No description provided.",
        severity:
            severity === "low" || severity === "medium" || severity === "high"
                ? severity
                : "medium",
        affectedField: asString(normalized.affectedField) ?? "unknown",
        chargeAmount: asNumber(normalized.chargeAmount),
        officialRate: asNumber(normalized.officialRate),
    }
}

function normalizeAiFraudPassResult(data: JsonObject): AiFraudPassResult {
    const rawFlags = Array.isArray(data.additionalFlags) ? data.additionalFlags : []

    return {
        additionalFlags: rawFlags
            .map((flag) => normalizeFlag(flag))
            .filter((flag): flag is FraudAnalysisResult["flags"][number] => flag !== null),
        aiScore: Math.max(0, Math.min(30, Math.round(asNumber(data.aiScore) ?? 0))),
        summary: asString(data.summary) ?? "No additional AI findings were identified.",
        recommendedAction: normalizeRecommendedAction(data.recommendedAction),
        totalDisputedAmount: Math.max(0, asNumber(data.totalDisputedAmount) ?? 0),
    }
}

function normalizeRecommendedAction(value: unknown): FraudAnalysisResult["recommendedAction"] {
    const normalized = asString(value)?.toLowerCase()

    if (
        normalized === "approve" ||
        normalized === "review" ||
        normalized === "dispute" ||
        normalized === "escalate"
    ) {
        return normalized
    }

    return "review"
}

function addFlag(
    flags: FraudAnalysisResult["flags"],
    nextFlag: FraudAnalysisResult["flags"][number]
) {
    const exists = flags.some(
        (flag) =>
            flag.type === nextFlag.type &&
            flag.affectedField === nextFlag.affectedField &&
            flag.description === nextFlag.description
    )

    if (!exists) {
        flags.push(nextFlag)
    }
}

function deriveRiskLevel(score: number): FraudAnalysisResult["riskLevel"] {
    if (score >= 80) {
        return "critical"
    }

    if (score >= 60) {
        return "high"
    }

    if (score >= 35) {
        return "medium"
    }

    return "low"
}

function deriveRecommendedAction(score: number): FraudAnalysisResult["recommendedAction"] {
    if (score >= 80) {
        return "escalate"
    }

    if (score >= 60) {
        return "dispute"
    }

    if (score >= 35) {
        return "review"
    }

    return "approve"
}

function mergeRecommendedAction(
    aiAction: FraudAnalysisResult["recommendedAction"],
    score: number
): FraudAnalysisResult["recommendedAction"] {
    const severityOrder: FraudAnalysisResult["recommendedAction"][] = [
        "approve",
        "review",
        "dispute",
        "escalate",
    ]
    const baseline = deriveRecommendedAction(score)

    return severityOrder.indexOf(aiAction) >= severityOrder.indexOf(baseline) ? aiAction : baseline
}

function getRuleDisputedAmount(flags: FraudAnalysisResult["flags"]): number {
    return Number(
        flags
            .reduce((sum, flag) => sum + (typeof flag.chargeAmount === "number" ? Math.max(0, flag.chargeAmount) : 0), 0)
            .toFixed(2)
    )
}

function getInvoiceHours(arrivalDate: string | null, departureDate: string | null): number | null {
    if (!arrivalDate || !departureDate) {
        return null
    }

    const arrival = new Date(arrivalDate)
    const departure = new Date(departureDate)
    if (Number.isNaN(arrival.getTime()) || Number.isNaN(departure.getTime())) {
        return null
    }

    const hours = (departure.getTime() - arrival.getTime()) / 3600000
    return Number.isFinite(hours) && hours > 0 ? Number(hours.toFixed(2)) : null
}

function getTowageExpectedCount(vesselGT: number | null): number | null {
    if (typeof vesselGT !== "number" || !Number.isFinite(vesselGT) || vesselGT <= 0) {
        return null
    }

    return Math.min(4, Math.max(1, Math.ceil(vesselGT / 10000)))
}

function findTariffBand(
    rates: unknown,
    vesselGT: number | null
): { gtMin: number; gtMax: number; rate: number } | null {
    if (!Array.isArray(rates) || vesselGT === null) {
        return null
    }

    for (const entry of rates) {
        const band = asObject(entry)
        if (!band) {
            continue
        }

        const gtMin = asNumber(band.gtMin)
        const gtMax = asNumber(band.gtMax)
        const rate = asNumber(band.rate)
        if (gtMin === null || gtMax === null || rate === null) {
            continue
        }

        if (vesselGT >= gtMin && vesselGT <= gtMax) {
            return { gtMin, gtMax, rate }
        }
    }

    return null
}

function calculateExpectedAmount(
    lineItem: ExtractedInvoiceFields["lineItems"][number],
    tariffService: JsonObject,
    extractedFields: ExtractedInvoiceFields
): number | null {
    const unit = asString(tariffService.unit)
    const quantity = lineItem.quantity ?? 1

    if (!unit || quantity <= 0) {
        return null
    }

    if (unit === "PER_PASSAGE") {
        const band = findTariffBand(tariffService.rates, extractedFields.vesselGT)
        if (!band) {
            return null
        }

        return Number((band.rate * quantity).toFixed(2))
    }

    const rate = asNumber(tariffService.rate)
    if (rate === null) {
        return null
    }

    if (unit === "PER_TUG_PER_HOUR") {
        const minHours = asNumber(tariffService.minHours) ?? 1
        return Number((rate * Math.max(quantity, minHours)).toFixed(2))
    }

    if (unit === "PER_GT_PER_DAY") {
        if (extractedFields.vesselGT === null) {
            return null
        }

        return Number((extractedFields.vesselGT * rate * quantity).toFixed(2))
    }

    if (unit === "PER_GT_PER_CALL") {
        if (extractedFields.vesselGT === null) {
            return null
        }

        return Number((extractedFields.vesselGT * rate * quantity).toFixed(2))
    }

    if (unit === "PER_OPERATION") {
        return Number((rate * quantity).toFixed(2))
    }

    return null
}

export async function extractInvoiceFields(fileBuffer: Buffer, mimeType: string): Promise<ExtractedInvoiceFields> {
    const base64 = fileBuffer.toString("base64")
    const normalizedMimeType = mimeType === "image/jpg" ? "image/jpeg" : mimeType

    const contentArray =
        normalizedMimeType === "application/pdf"
            ? [
                { type: "text" as const, text: EXTRACTION_PROMPT },
                {
                    type: "document" as const,
                    source: {
                        type: "base64" as const,
                        media_type: "application/pdf" as const,
                        data: base64,
                    },
                },
            ]
            : [
                { type: "text" as const, text: EXTRACTION_PROMPT },
                {
                    type: "image" as const,
                    source: {
                        type: "base64" as const,
                        media_type: normalizedMimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                        data: base64,
                    },
                },
            ]

    try {
        const response = await anthropic.messages.create({
            model: HAIKU,
            max_tokens: 2000,
            stream: false,
            system: MARITIME_SYSTEM_PROMPT,
            messages: [{ role: "user", content: contentArray }],
        })

        const text = getAnthropicText(response, true)
        const clean = text.replace(/```json|```/g, "").trim()
        return normalizeExtractedFields(parseJson(clean))
    } catch (error) {
        console.error("Invoice extraction failed:", error)
        return getEmptyExtractedInvoiceFields()
    }
}

export async function analyzeForFraud(
    extractedFields: ExtractedInvoiceFields,
    portTariff: unknown | null,
    aisData: unknown | null,
    agentHistory: unknown | null,
    historicalContext: FraudHistoricalContext
): Promise<FraudAnalysisResult> {
    const flags: FraudAnalysisResult["flags"] = []
    let ruleScore = 0

    const serviceCodeCounts = extractedFields.lineItems
        .map((lineItem) => lineItem.serviceCode)
        .filter((serviceCode): serviceCode is string => serviceCode !== null)
        .reduce<Map<string, number>>((counts, serviceCode) => {
            counts.set(serviceCode, (counts.get(serviceCode) ?? 0) + 1)
            return counts
        }, new Map())

    for (const [serviceCode, count] of Array.from(serviceCodeCounts.entries())) {
        if (count > 1) {
            addFlag(flags, {
                type: "DUPLICATE_SERVICE_CODE",
                severity: "medium",
                description: `Service ${serviceCode} billed ${count} times on same invoice`,
                affectedField: "lineItems.serviceCode",
                chargeAmount: null,
            })
            ruleScore += 20
        }
    }

    const serviceCodes = new Set(
        extractedFields.lineItems
            .map((lineItem) => lineItem.serviceCode)
            .filter((serviceCode): serviceCode is string => serviceCode !== null)
    )

    if (serviceCodes.has("ANCHORAGE") && serviceCodes.has("BERTH")) {
        addFlag(flags, {
            type: "ANCHORAGE_AND_BERTH_CONFLICT",
            severity: "medium",
            description:
                "Both anchorage and berth billed — vessel cannot be in two locations. Verify with AIS which occurred.",
            affectedField: "lineItems.serviceCode",
            chargeAmount: null,
        })
        ruleScore += 15
    }

    for (const lineItem of extractedFields.lineItems) {
        if (lineItem.serviceCode !== "TOWAGE") {
            continue
        }

        const expectedTugs = getTowageExpectedCount(extractedFields.vesselGT)
        const billedTugs = lineItem.quantity
        if (expectedTugs !== null && billedTugs !== null && billedTugs > expectedTugs) {
            addFlag(flags, {
                type: "EXCESSIVE_TUG_COUNT",
                severity: "high",
                description: `Invoice charges ${billedTugs} tugs but vessel GT ${extractedFields.vesselGT} only requires ${expectedTugs} tug(s) per standard formula`,
                affectedField: "lineItems.quantity",
                chargeAmount: lineItem.totalPrice,
            })
            ruleScore += 25
        }
    }

    if (serviceCodes.has("DEM") && serviceCodes.has("DET")) {
        addFlag(flags, {
            type: "DEM_DET_OVERLAP",
            severity: "high",
            description: "Both demurrage and detention billed — these cannot apply to the same time period",
            affectedField: "lineItems.serviceCode",
            chargeAmount: null,
        })
        ruleScore += 30
    }

    for (const lineItem of extractedFields.lineItems) {
        if (lineItem.serviceCode === "MOORING" && (lineItem.quantity ?? 0) > 2) {
            addFlag(flags, {
                type: "EXCESSIVE_MOORING_OPERATIONS",
                severity: "medium",
                description: `Standard port call has 2 mooring operations maximum (arrival + departure). Invoice claims ${lineItem.quantity} operations.`,
                affectedField: "lineItems.quantity",
                chargeAmount: lineItem.totalPrice,
            })
            ruleScore += 15
        }
    }

    const normalizedPortTariff = asObject(portTariff)
    const tariffServices = asObject(normalizedPortTariff?.services)
    if (tariffServices) {
        for (const lineItem of extractedFields.lineItems) {
            const serviceCode = lineItem.serviceCode
            if (!serviceCode) {
                continue
            }

            const serviceTariff = asObject(tariffServices[serviceCode])
            const actualAmount = lineItem.totalPrice
            if (!serviceTariff || actualAmount === null) {
                continue
            }

            const expectedAmount = calculateExpectedAmount(lineItem, serviceTariff, extractedFields)
            if (expectedAmount === null || expectedAmount <= 0) {
                continue
            }

            if (actualAmount > expectedAmount * 1.1) {
                const variance = ((actualAmount - expectedAmount) / expectedAmount) * 100
                addFlag(flags, {
                    type: `TARIFF_OVERCHARGE_${serviceCode}`,
                    severity: variance > 50 ? "high" : "medium",
                    description: `Official ${extractedFields.portName ?? extractedFields.portLocode ?? "port"} tariff for ${serviceCode}: ${expectedAmount}. Billed: ${actualAmount}. Overcharge: ${variance.toFixed(0)}%.`,
                    affectedField: "lineItems.totalPrice",
                    chargeAmount: Number((actualAmount - expectedAmount).toFixed(2)),
                    officialRate: expectedAmount,
                })
                ruleScore += variance > 50 ? 25 : 10
            }
        }
    }

    const normalizedAisData = asObject(aisData)
    if ((normalizedAisData?.found as boolean | undefined) === false && extractedFields.vesselMMSI) {
        addFlag(flags, {
            type: "VESSEL_NOT_IN_AIS",
            severity: "high",
            description: `No AIS signal found for vessel MMSI ${extractedFields.vesselMMSI} near ${extractedFields.portName ?? extractedFields.portLocode ?? "the claimed port"} on invoice dates. Vessel may not have called at this port.`,
            affectedField: "vesselMMSI",
            chargeAmount: extractedFields.totalAmount,
        })
        ruleScore += 35
    }

    if ((normalizedAisData?.found as boolean | undefined) === true) {
        const stayHours = asNumber(normalizedAisData?.stayHours)
        const invoiceHours = getInvoiceHours(extractedFields.arrivalDate, extractedFields.departureDate)

        if (stayHours !== null && invoiceHours !== null && invoiceHours > 0) {
            const discrepancyPct = Math.abs(invoiceHours - stayHours) / invoiceHours
            if (discrepancyPct > 0.2) {
                const differenceHours = Math.abs(invoiceHours - stayHours)
                addFlag(flags, {
                    type: "STAY_DURATION_MISMATCH",
                    severity: "high",
                    description: `Invoice claims ${invoiceHours} hours at port. AIS data shows ${stayHours} hours. Discrepancy of ${differenceHours.toFixed(2)} hours (${(discrepancyPct * 100).toFixed(0)}%).`,
                    affectedField: "arrivalDate",
                    chargeAmount: null,
                })
                ruleScore += 25
            }
        }
    }

    ruleScore = Math.min(70, ruleScore)

    let aiResult: AiFraudPassResult = {
        additionalFlags: [],
        aiScore: 0,
        summary: flags.length > 0 ? `Rule-based analysis identified ${flags.length} fraud indicators.` : "No fraud indicators were identified.",
        recommendedAction: flags.length > 0 ? "review" : "approve",
        totalDisputedAmount: getRuleDisputedAmount(flags),
    }

    try {
        const prompt = `RULE-BASED FLAGS ALREADY DETECTED: ${JSON.stringify(flags)}

INVOICE DATA: ${JSON.stringify(extractedFields)}

PORT TARIFF DATA: ${portTariff ? JSON.stringify(portTariff) : "Not available for this port"}

AIS DATA: ${aisData ? JSON.stringify(aisData) : "Not available"}

AGENT HISTORY: ${agentHistory ? JSON.stringify(agentHistory) : "No prior history for this agent"}

HISTORICAL CONTEXT: ${JSON.stringify(historicalContext)}

Based on your maritime expertise, identify additional fraud patterns not already captured in the rule-based flags. Look for: unusual service combinations for this vessel type, charges not applicable to this vessel size/type, seasonal anomalies, port-specific practices being violated, and any pattern inconsistencies.

Return ONLY this JSON with no markdown:
{
  additionalFlags: [{ type: string, description: string, severity: 'low'|'medium'|'high', affectedField: string, chargeAmount: number or null, officialRate: number or null }],
  aiScore: number between 0 and 30,
  summary: string (2-3 sentences summarizing all findings),
  recommendedAction: 'approve'|'review'|'dispute'|'escalate',
  totalDisputedAmount: number (sum of all overcharge amounts in invoice currency)
}`

        const aiResponse = await anthropic.messages.create({
            model: HAIKU,
            max_tokens: 1000,
            stream: false,
            system: MARITIME_SYSTEM_PROMPT,
            messages: [{ role: "user", content: prompt }],
        })

        aiResult = normalizeAiFraudPassResult(parseJson(getAnthropicText(aiResponse)))
    } catch (error) {
        console.warn("AI fraud analysis pass failed, falling back to rule-only result:", error)
    }

    for (const flag of aiResult.additionalFlags) {
        addFlag(flags, flag)
    }

    const fraudScore = Math.min(100, ruleScore + (aiResult.aiScore ?? 0))
    const totalDisputedAmount = Number(
        Math.max(aiResult.totalDisputedAmount ?? 0, getRuleDisputedAmount(flags)).toFixed(2)
    )
    const aisVerified = Boolean(normalizedAisData?.found)
    const aisNote = normalizedAisData
        ? aisVerified
            ? `AIS verified via ${asString(normalizedAisData.source) ?? "external source"}.`
            : "AIS data did not verify the claimed port call."
        : null

    return {
        fraudScore,
        riskLevel: deriveRiskLevel(fraudScore),
        flags,
        summary: aiResult.summary,
        recommendedAction: mergeRecommendedAction(aiResult.recommendedAction, fraudScore),
        totalDisputedAmount,
        aisVerified,
        aisNote,
        agentId: asString(asObject(agentHistory)?.agentId),
    }
}

export async function generateDisputeDraft(
    extractedFields: ExtractedInvoiceFields,
    fraudResult: FraudAnalysisResult,
    organizationName: string
): Promise<DisputeDraft> {
    if (fraudResult.recommendedAction !== "dispute" && fraudResult.recommendedAction !== "escalate") {
        return {
            subject: "",
            body: "",
            keyPoints: [],
            estimatedRecoveryAmount: null,
        }
    }

    try {
        const prompt = `Write a formal maritime commercial dispute letter. Use professional maritime industry correspondence style. Reference applicable maritime law where relevant (Hague-Visby Rules, BIMCO standard terms).

INVOICE DETAILS:
Invoice Number: ${extractedFields.invoiceNumber ?? "Unknown"}
Vessel: ${extractedFields.vesselName ?? "Unknown"} (IMO: ${extractedFields.vesselIMO ?? "Unknown"})
Port: ${extractedFields.portName ?? "Unknown"} (${extractedFields.portLocode ?? "Unknown"})
Port Agent: ${extractedFields.agentName ?? "Unknown"} at ${extractedFields.agentCompany ?? "Unknown"}
Total Invoice Amount: ${extractedFields.currency ?? "USD"} ${extractedFields.totalAmount ?? 0}
Total Disputed Amount: ${extractedFields.currency ?? "USD"} ${fraudResult.totalDisputedAmount}

DISPUTED ITEMS WITH EVIDENCE:
${fraudResult.flags.map((flag) => `${flag.type}: ${flag.description}`).join("\n")}

AI FRAUD ANALYSIS SUMMARY:
${fraudResult.summary}

Write the complete dispute letter from ${organizationName} to the port agent. The letter must:
1. Reference the invoice number and vessel in the opening
2. List each disputed charge with our calculated correct amount vs their billed amount
3. Cite the evidence (AIS data, official port tariffs, standard maritime rules)
4. Demand a credit note or revised invoice within 14 days
5. State that unresolved disputes will be escalated to the P&I Club
6. Maintain firm but professional tone throughout
7. Be 350-450 words

Return ONLY the letter text, no JSON, no markdown, no explanations.`

        const response = await anthropic.messages.create({
            model: HAIKU,
            max_tokens: 1400,
            stream: false,
            system: MARITIME_SYSTEM_PROMPT,
            messages: [{ role: "user", content: prompt }],
        })

        const body = getAnthropicText(response)

        return {
            subject: `Invoice Dispute: ${extractedFields.invoiceNumber ?? "Unspecified Invoice"} - ${extractedFields.vesselName ?? "Unknown Vessel"}`,
            body,
            keyPoints: fraudResult.flags.map((flag) => flag.description),
            estimatedRecoveryAmount: fraudResult.totalDisputedAmount,
        }
    } catch (error) {
        console.error("Dispute draft generation failed:", error)
        return {
            subject: `Invoice Dispute: ${extractedFields.invoiceNumber ?? "Unspecified Invoice"}`,
            body: `Dear ${extractedFields.agentName ?? "Port Agent"},

${organizationName} disputes several charges on invoice ${extractedFields.invoiceNumber ?? "Unknown"} for vessel ${extractedFields.vesselName ?? "Unknown"} at ${extractedFields.portName ?? extractedFields.portLocode ?? "the referenced port"}.

The following concerns require immediate correction:
${fraudResult.flags.map((flag) => `- ${flag.description}`).join("\n")}

Please issue a credit note or revised invoice within 14 days. If this matter remains unresolved, it will be escalated to the P&I Club.

Regards,
${organizationName}`,
            keyPoints: fraudResult.flags.map((flag) => flag.description),
            estimatedRecoveryAmount: fraudResult.totalDisputedAmount,
        }
    }
}
