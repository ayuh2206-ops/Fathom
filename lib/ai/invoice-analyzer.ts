import "server-only"

import OpenAI from "openai"
import { fromBuffer } from "pdf2pic"

async function convertPdfToImage(pdfBuffer: Buffer): Promise<string> {
   const options = {
     density: 300,
     saveFilename: "invoice_page",
     savePath: "/tmp",
     format: "png",
     width: 1600,
     height: 2262
   };
   const convert = fromBuffer(pdfBuffer, options);
   const result = await convert(1, { responseType: "base64" });
   return result.base64 as string;
}

export interface ExtractedInvoiceFields {
    invoiceNumber: string | null
    invoiceDate: string | null
    dueDate: string | null
    vendorName: string | null
    vendorAddress: string | null
    clientName: string | null
    currency: string | null
    subtotal: number | null
    taxAmount: number | null
    totalAmount: number | null
    lineItems: Array<{
        description: string
        quantity: number | null
        unitPrice: number | null
        totalPrice: number | null
        chargeType: string | null
    }>
    portOfLoading: string | null
    portOfDischarge: string | null
    vesselName: string | null
    billOfLadingNumber: string | null
    containerNumbers: string[]
    detentionDays: number | null
    demurrageDays: number | null
    freeTimeDays: number | null
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
    }>
    summary: string
    recommendedAction: "approve" | "review" | "dispute" | "escalate"
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

type UserContentPart =
    | {
        type: "text"
        text: string
    }
    | {
        type: "image_url"
        image_url: {
            url: string
            detail?: "auto" | "low" | "high"
        }
    }
    | {
        type: "file"
        file: {
            file_data: string
            filename: string
        }
    }

const EXTRACTION_MODEL = "gpt-4o-mini"

const EMPTY_EXTRACTED_FIELDS: ExtractedInvoiceFields = {
    invoiceNumber: null,
    invoiceDate: null,
    dueDate: null,
    vendorName: null,
    vendorAddress: null,
    clientName: null,
    currency: null,
    subtotal: null,
    taxAmount: null,
    totalAmount: null,
    lineItems: [],
    portOfLoading: null,
    portOfDischarge: null,
    vesselName: null,
    billOfLadingNumber: null,
    containerNumbers: [],
    detentionDays: null,
    demurrageDays: null,
    freeTimeDays: null,
}

let openAIClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
    if (openAIClient) {
        return openAIClient
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
        throw new Error("Missing OPENAI_API_KEY. AI invoice analysis cannot run without it.")
    }

    openAIClient = new OpenAI({
        apiKey,
        maxRetries: 2,
    })

    return openAIClient
}

function parseJson(content: string): JsonObject {
    const parsed = JSON.parse(content) as unknown

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("OpenAI response did not contain a JSON object.")
    }

    return parsed as JsonObject
}

function getMessageContent(messageContent: string | null | undefined): string {
    if (!messageContent) {
        throw new Error("OpenAI response did not contain message content.")
    }

    return messageContent
}

function asString(value: unknown): string | null {
    if (typeof value !== "string") {
        return null
    }

    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
}

function asCurrency(value: unknown): string | null {
    const normalized = asString(value)
    return normalized ? normalized.toUpperCase() : null
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

    return parsed.toISOString().split("T")[0] ?? null
}

function asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return []
    }

    return value
        .map((entry) => asString(entry))
        .filter((entry): entry is string => entry !== null)
}

function asObject(value: unknown): JsonObject | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null
    }

    return value as JsonObject
}

function asChargeSeverity(value: unknown): "low" | "medium" | "high" {
    const normalized = asString(value)?.toLowerCase()

    if (normalized === "low" || normalized === "medium" || normalized === "high") {
        return normalized
    }

    return "medium"
}

function asRiskLevel(value: unknown, fraudScore: number): "low" | "medium" | "high" | "critical" {
    const normalized = asString(value)?.toLowerCase()

    if (
        normalized === "low" ||
        normalized === "medium" ||
        normalized === "high" ||
        normalized === "critical"
    ) {
        return normalized
    }

    if (fraudScore >= 81) {
        return "critical"
    }

    if (fraudScore >= 61) {
        return "high"
    }

    if (fraudScore >= 31) {
        return "medium"
    }

    return "low"
}

function asRecommendedAction(value: unknown, fraudScore: number): "approve" | "review" | "dispute" | "escalate" {
    const normalized = asString(value)?.toLowerCase()

    if (
        normalized === "approve" ||
        normalized === "review" ||
        normalized === "dispute" ||
        normalized === "escalate"
    ) {
        return normalized
    }

    if (fraudScore >= 81) {
        return "escalate"
    }

    if (fraudScore >= 61) {
        return "dispute"
    }

    if (fraudScore >= 31) {
        return "review"
    }

    return "approve"
}

function normalizeExtractedFields(data: JsonObject): ExtractedInvoiceFields {
    const rawLineItems = Array.isArray(data.lineItems) ? data.lineItems : []
    const lineItems = rawLineItems
        .map((lineItem) => {
            const normalized = asObject(lineItem)
            if (!normalized) {
                return null
            }

            return {
                description: asString(normalized.description) ?? "Unknown charge",
                quantity: asNumber(normalized.quantity),
                unitPrice: asNumber(normalized.unitPrice),
                totalPrice: asNumber(normalized.totalPrice),
                chargeType: asString(normalized.chargeType),
            }
        })
        .filter((lineItem): lineItem is ExtractedInvoiceFields["lineItems"][number] => lineItem !== null)

    return {
        invoiceNumber: asString(data.invoiceNumber),
        invoiceDate: asDate(data.invoiceDate),
        dueDate: asDate(data.dueDate),
        vendorName: asString(data.vendorName),
        vendorAddress: asString(data.vendorAddress),
        clientName: asString(data.clientName),
        currency: asCurrency(data.currency),
        subtotal: asNumber(data.subtotal),
        taxAmount: asNumber(data.taxAmount),
        totalAmount: asNumber(data.totalAmount),
        lineItems,
        portOfLoading: asString(data.portOfLoading),
        portOfDischarge: asString(data.portOfDischarge),
        vesselName: asString(data.vesselName),
        billOfLadingNumber: asString(data.billOfLadingNumber),
        containerNumbers: asStringArray(data.containerNumbers),
        detentionDays: asNumber(data.detentionDays),
        demurrageDays: asNumber(data.demurrageDays),
        freeTimeDays: asNumber(data.freeTimeDays),
    }
}

function normalizeFraudAnalysisResult(data: JsonObject): FraudAnalysisResult {
    const fraudScore = Math.max(0, Math.min(100, asNumber(data.fraudScore) ?? 0))
    const rawFlags = Array.isArray(data.flags) ? data.flags : []
    const flags = rawFlags
        .map((flag) => {
            const normalized = asObject(flag)
            if (!normalized) {
                return null
            }

            return {
                type: asString(normalized.type) ?? "UNKNOWN_FLAG",
                description: asString(normalized.description) ?? "No description provided.",
                severity: asChargeSeverity(normalized.severity),
                affectedField: asString(normalized.affectedField) ?? "unknown",
                chargeAmount: asNumber(normalized.chargeAmount),
            }
        })
        .filter((flag): flag is FraudAnalysisResult["flags"][number] => flag !== null)

    return {
        fraudScore,
        riskLevel: asRiskLevel(data.riskLevel, fraudScore),
        flags,
        summary: asString(data.summary) ?? "No significant anomalies were identified by the automated review.",
        recommendedAction: asRecommendedAction(data.recommendedAction, fraudScore),
    }
}

function normalizeDisputeDraft(data: JsonObject): DisputeDraft {
    return {
        subject: asString(data.subject) ?? "Invoice Dispute Review",
        body: asString(data.body) ?? "No dispute draft could be generated.",
        keyPoints: asStringArray(data.keyPoints),
        estimatedRecoveryAmount: asNumber(data.estimatedRecoveryAmount),
    }
}

async function getFileContentParts(fileBuffer: Buffer, mimeType: string): Promise<UserContentPart[]> {
    let base64 = "";
    let finalMimeType = mimeType;

    if (mimeType === "application/pdf") {
        base64 = await convertPdfToImage(fileBuffer);
        finalMimeType = "image/png";
    } else {
        base64 = fileBuffer.toString("base64");
    }

    return [
        {
            type: "text",
            text: "Review this freight invoice image. Extract only the fields that are explicitly present in the invoice and do not infer missing values.",
        },
        {
            type: "image_url",
            image_url: {
                url: `data:${finalMimeType};base64,${base64}`,
                detail: "high",
            },
        },
    ]
}

export async function extractInvoiceFields(fileBuffer: Buffer, mimeType: string): Promise<ExtractedInvoiceFields> {
    try {
        const client = getOpenAIClient()
        const completion = await client.chat.completions.create({
            model: EXTRACTION_MODEL,
            response_format: { type: "json_object" },
            temperature: 0.1,
            messages: [
                {
                    role: "system",
                    content: "You are a maritime freight invoice parser. Extract all fields from the invoice image/document provided. Return ONLY valid JSON matching the ExtractedInvoiceFields schema. Use null for any field you cannot find. Do not guess — only extract what is explicitly present.",
                },
                {
                    role: "user",
                    content: await getFileContentParts(fileBuffer, mimeType),
                },
            ],
        })

        const content = getMessageContent(completion.choices[0]?.message?.content)
        return normalizeExtractedFields(parseJson(content))
    } catch (error: unknown) {
        console.error("Invoice field extraction failed:", error)
        return { ...EMPTY_EXTRACTED_FIELDS }
    }
}

export async function analyzeForFraud(
    extracted: ExtractedInvoiceFields,
    historicalContext?: FraudHistoricalContext
): Promise<FraudAnalysisResult> {
    const client = getOpenAIClient()
    const completion = await client.chat.completions.create({
        model: EXTRACTION_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.2,
        messages: [
            {
                role: "system",
                content: "You are a maritime freight audit specialist. Analyze the provided invoice fields for fraud indicators common in shipping: detention/demurrage overcharges, duplicate line items, phantom charges for services not rendered, rate spikes above market norms, missing documentation fields, and suspicious vendor patterns. Return ONLY valid JSON matching the FraudAnalysisResult schema. Be conservative — only flag genuine anomalies.",
            },
            {
                role: "user",
                content: JSON.stringify({
                    extracted,
                    historicalContext: historicalContext ?? {
                        avgDetentionRate: 0,
                        avgDemurrageRate: 0,
                        knownVendors: [],
                    },
                }),
            },
        ],
    })

    const content = getMessageContent(completion.choices[0]?.message?.content)
    return normalizeFraudAnalysisResult(parseJson(content))
}

export async function generateDisputeDraft(
    extracted: ExtractedInvoiceFields,
    fraudResult: FraudAnalysisResult,
    operatorName: string
): Promise<DisputeDraft> {
    if (fraudResult.recommendedAction !== "dispute" && fraudResult.recommendedAction !== "escalate") {
        return {
            subject: "",
            body: "",
            keyPoints: [],
            estimatedRecoveryAmount: null,
        }
    }

    const client = getOpenAIClient()
    const completion = await client.chat.completions.create({
        model: EXTRACTION_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.3,
        messages: [
            {
                role: "system",
                content: "You are a maritime legal specialist drafting formal invoice dispute letters for port operators. Write professional, factual dispute correspondence. Reference specific charge line items, applicable INCOTERMS or industry standards where relevant, and request itemized documentation to support charges.",
            },
            {
                role: "user",
                content: JSON.stringify({
                    operatorName,
                    extracted,
                    fraudFlags: fraudResult.flags,
                    fraudScore: fraudResult.fraudScore,
                    riskLevel: fraudResult.riskLevel,
                    summary: fraudResult.summary,
                    recommendedAction: fraudResult.recommendedAction,
                }),
            },
        ],
    })

    const content = getMessageContent(completion.choices[0]?.message?.content)
    return normalizeDisputeDraft(parseJson(content))
}
