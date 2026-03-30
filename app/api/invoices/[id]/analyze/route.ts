import {
    type DisputeDraft,
    type ExtractedInvoiceFields,
    type FraudAnalysisResult,
    analyzeForFraud,
    extractInvoiceFields,
    generateDisputeDraft,
} from "@/lib/ai/invoice-analyzer"
import { authOptions } from "@/lib/auth-options"
import { admin, getFirebaseFirestore, getFirebaseStorage } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { sendInvoiceAnalysisComplete } from "@/lib/email/sendgrid"
import { rateLimit } from "@/lib/rate-limit"

export const runtime = "nodejs"

type InvoiceStatus =
    | "uploaded"
    | "pending"
    | "processed"
    | "analyzed"
    | "flagged"
    | "approved"
    | "disputed"
    | "paid"

type FraudFlag = FraudAnalysisResult["flags"][number]

type HistoricalContext = {
    avgDetentionRate: number
    avgDemurrageRate: number
    knownVendors: string[]
}

type InvoiceDocument = {
    organizationId?: string
    invoiceNumber?: string
    vendor?: string
    amount?: number
    currency?: string
    status?: InvoiceStatus
    fraudScore?: number | null
    riskLevel?: FraudAnalysisResult["riskLevel"] | null
    filePath?: string
    fileName?: string
    fileUrl?: string | null
    mimeType?: string | null
    extractedFields?: ExtractedInvoiceFields | null
    fraudFlags?: FraudFlag[]
    fraudSummary?: string | null
    recommendedAction?: FraudAnalysisResult["recommendedAction"] | null
    disputeDraft?: DisputeDraft | null
    analyzedAt?: Timestamp | string | Date | null
    analysisError?: string | null
    createdAt?: Timestamp | string | Date | null
    updatedAt?: Timestamp | string | Date | null
    aiAnalysis?: {
        extractedFields: ExtractedInvoiceFields
        fraudResult: FraudAnalysisResult
        disputeDraft: DisputeDraft | null
    } | null
}

function toIso(value: unknown): string | null {
    if (!value) {
        return null
    }

    if (value instanceof Timestamp) {
        return value.toDate().toISOString()
    }

    if (typeof value === "string") {
        return value
    }

    if (value instanceof Date) {
        return value.toISOString()
    }

    return null
}

function toNullableNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value
    }

    return null
}

function inferMimeType(fileName?: string, mimeType?: string | null): string {
    if (mimeType) {
        return mimeType
    }

    const normalized = fileName?.toLowerCase() ?? ""

    if (normalized.endsWith(".pdf")) {
        return "application/pdf"
    }

    if (normalized.endsWith(".png")) {
        return "image/png"
    }

    if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) {
        return "image/jpeg"
    }

    return "application/octet-stream"
}

function serializeInvoice(doc: FirebaseFirestore.DocumentSnapshot, fileUrl: string | null) {
    const data = (doc.data() ?? {}) as InvoiceDocument

    return {
        id: doc.id,
        invoiceNumber: String(data.invoiceNumber || `INV-${doc.id.slice(0, 8)}`),
        vendor: String(data.vendor || "Unknown Vendor"),
        amount: Number(data.amount || 0),
        currency: String(data.currency || "USD"),
        status: String(data.status || "pending"),
        fraudScore: toNullableNumber(data.fraudScore),
        riskLevel: data.riskLevel ?? null,
        filePath: String(data.filePath || ""),
        fileName: String(data.fileName || ""),
        fileUrl,
        mimeType: inferMimeType(data.fileName, data.mimeType),
        organizationId: String(data.organizationId || ""),
        extractedFields: data.extractedFields ?? null,
        fraudFlags: Array.isArray(data.fraudFlags) ? data.fraudFlags : [],
        fraudSummary: data.fraudSummary ?? null,
        recommendedAction: data.recommendedAction ?? null,
        disputeDraft: data.disputeDraft ?? null,
        analyzedAt: toIso(data.analyzedAt),
        analysisError: data.analysisError ?? null,
        createdAt: toIso(data.createdAt) ?? new Date().toISOString(),
        aiAnalysis: data.aiAnalysis ?? null,
    }
}

async function getSignedFileUrl(filePath?: string): Promise<string | null> {
    if (!filePath) {
        return null
    }

    const storage = getFirebaseStorage()
    const [signedUrl] = await storage.bucket().file(filePath).getSignedUrl({
        action: "read",
        expires: Date.now() + 15 * 60 * 1000,
    })

    return signedUrl
}

function getAverageRateFromLineItems(
    extractedFields: ExtractedInvoiceFields | null | undefined,
    chargeType: "detention" | "demurrage"
): number | null {
    if (!extractedFields) {
        return null
    }

    const matchingLineItems = extractedFields.lineItems.filter(
        (lineItem) => lineItem.chargeType?.toLowerCase() === chargeType
    )

    if (matchingLineItems.length === 0) {
        return null
    }

    let totalAmount = 0
    let totalQuantity = 0

    for (const lineItem of matchingLineItems) {
        const lineAmount = lineItem.totalPrice ?? lineItem.unitPrice ?? null
        const lineQuantity = lineItem.quantity ?? 1

        if (lineAmount === null) {
            continue
        }

        totalAmount += lineAmount
        totalQuantity += lineQuantity
    }

    if (totalQuantity === 0) {
        return null
    }

    return totalAmount / totalQuantity
}

async function buildHistoricalContext(
    firestore: FirebaseFirestore.Firestore,
    organizationId: string,
    currentInvoiceId: string
): Promise<HistoricalContext> {
    const snapshot = await firestore
        .collection("invoices")
        .where("organizationId", "==", organizationId)
        .limit(25)
        .get()

    const vendorSet = new Set<string>()
    let detentionTotal = 0
    let detentionCount = 0
    let demurrageTotal = 0
    let demurrageCount = 0

    for (const document of snapshot.docs) {
        if (document.id === currentInvoiceId) {
            continue
        }

        const data = (document.data() ?? {}) as InvoiceDocument
        const vendorName = typeof data.vendor === "string" ? data.vendor.trim() : ""
        if (vendorName) {
            vendorSet.add(vendorName)
        }

        const detentionRate = getAverageRateFromLineItems(data.extractedFields, "detention")
        if (detentionRate !== null) {
            detentionTotal += detentionRate
            detentionCount += 1
        }

        const demurrageRate = getAverageRateFromLineItems(data.extractedFields, "demurrage")
        if (demurrageRate !== null) {
            demurrageTotal += demurrageRate
            demurrageCount += 1
        }
    }

    return {
        avgDetentionRate: detentionCount > 0 ? Number((detentionTotal / detentionCount).toFixed(2)) : 0,
        avgDemurrageRate: demurrageCount > 0 ? Number((demurrageTotal / demurrageCount).toFixed(2)) : 0,
        knownVendors: Array.from(vendorSet).sort(),
    }
}

export async function POST(_: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session.user.organizationId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAllowed = rateLimit(`invoice-analyze:${session.user.organizationId}`, 10, 60 * 60 * 1000)
    if (!isAllowed) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
        )
    }

    const firestore = getFirebaseFirestore()
    const invoiceRef = firestore.collection("invoices").doc(params.id)
    const invoiceDoc = await invoiceRef.get()

    if (!invoiceDoc.exists) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const invoiceData = (invoiceDoc.data() ?? {}) as InvoiceDocument

    if (invoiceData.organizationId !== session.user.organizationId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const invoiceStatus = invoiceData.status ?? "pending"
    const hasExistingAnalysis =
        (invoiceStatus === "analyzed" || invoiceStatus === "flagged") &&
        invoiceData.aiAnalysis !== null &&
        invoiceData.aiAnalysis !== undefined

    if (hasExistingAnalysis) {
        const signedFileUrl = await getSignedFileUrl(invoiceData.filePath)
        return NextResponse.json({ invoice: serializeInvoice(invoiceDoc, signedFileUrl) }, { status: 200 })
    }

    try {
        if (!invoiceData.filePath) {
            throw new Error("Invoice file path is missing.")
        }

        const storage = getFirebaseStorage()
        const [fileBuffer] = await storage.bucket().file(invoiceData.filePath).download()
        const mimeType = inferMimeType(invoiceData.fileName, invoiceData.mimeType)
        const extractedFields = await extractInvoiceFields(fileBuffer, mimeType)
        const historicalContext = await buildHistoricalContext(
            firestore,
            session.user.organizationId,
            invoiceDoc.id
        )
        const fraudResult = await analyzeForFraud(extractedFields, historicalContext)
        const disputeDraft =
            fraudResult.recommendedAction === "dispute" || fraudResult.recommendedAction === "escalate"
                ? await generateDisputeDraft(extractedFields, fraudResult, session.user.name || "FATHOM Operator")
                : null

        const nextStatus: InvoiceStatus = fraudResult.fraudScore >= 61 ? "flagged" : "analyzed"

        await invoiceRef.set(
            {
                createdAt: invoiceData.createdAt ?? admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
                status: nextStatus,
                fraudScore: fraudResult.fraudScore,
                riskLevel: fraudResult.riskLevel,
                extractedFields,
                fraudFlags: fraudResult.flags,
                fraudSummary: fraudResult.summary,
                recommendedAction: fraudResult.recommendedAction,
                disputeDraft,
                analysisError: null,
                mimeType,
                aiAnalysis: {
                    extractedFields,
                    fraudResult,
                    disputeDraft,
                },
            },
            { merge: true }
        )

        const updatedDoc = await invoiceRef.get()
        const signedFileUrl = await getSignedFileUrl(invoiceData.filePath)

        if (session.user.email) {
            const invoiceNumberStr = String(invoiceData.invoiceNumber || `INV-${invoiceDoc.id.slice(0, 8)}`)
            void sendInvoiceAnalysisComplete(
                session.user.email,
                invoiceNumberStr,
                fraudResult.fraudScore,
                fraudResult.riskLevel,
                `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/invoices/${invoiceDoc.id}`
            ).catch(console.error)
        }

        return NextResponse.json({ invoice: serializeInvoice(updatedDoc, signedFileUrl) }, { status: 200 })
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown AI analysis error"

        await invoiceRef.set(
            {
                createdAt: invoiceData.createdAt ?? admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                status: "pending",
                analysisError: errorMessage,
            },
            { merge: true }
        )

        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}
