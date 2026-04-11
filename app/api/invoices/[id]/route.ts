import type { DisputeDraft, ExtractedInvoiceFields, FraudAnalysisResult } from "@/lib/ai/invoice-analyzer"
import { getFirebaseFirestore, getFirebaseStorage } from "@/lib/firebase-admin"
import { getSignedInvoiceFileUrl } from "@/lib/invoices/file-url"
import { getOptionalServerSession } from "@/lib/server-session"
import { Timestamp } from "firebase-admin/firestore"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

type FraudFlag = FraudAnalysisResult["flags"][number]

type InvoiceDocument = {
    invoiceNumber?: string
    vendor?: string
    amount?: number
    currency?: string
    status?: string
    fraudScore?: number | null
    riskLevel?: FraudAnalysisResult["riskLevel"] | null
    filePath?: string
    fileName?: string
    fileUrl?: string | null
    mimeType?: string | null
    organizationId?: string
    extractedFields?: ExtractedInvoiceFields | null
    fraudFlags?: FraudFlag[]
    fraudSummary?: string | null
    recommendedAction?: FraudAnalysisResult["recommendedAction"] | null
    disputeDraft?: DisputeDraft | null
    analyzedAt?: Timestamp | string | Date | null
    analysisError?: string | null
    aiAnalysis?: {
        extractedFields: ExtractedInvoiceFields
        fraudResult: FraudAnalysisResult
        disputeDraft: DisputeDraft | null
    } | null
    createdAt?: Timestamp | string | Date | null
}

function toIsoNullable(value: unknown): string | null {
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

async function getAuthenticatedOrg() {
    const session = await getOptionalServerSession()
    const organizationId = session?.user?.organizationId

    if (!session?.user?.id || !organizationId) {
        return null
    }

    return {
        userId: session.user.id,
        organizationId,
    }
}

function toNullableNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value
    }

    return null
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
    const authContext = await getAuthenticatedOrg()
    if (!authContext) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const firestore = getFirebaseFirestore()
        const doc = await firestore.collection("invoices").doc(params.id).get()
        if (!doc.exists) {
            return NextResponse.json({ message: "Invoice not found" }, { status: 404 })
        }

        const data = doc.data()
        if (data?.organizationId !== authContext.organizationId) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        let fileUrl: string | null = data?.fileUrl ? String(data.fileUrl) : null
        const filePath = data?.filePath as string | undefined
        if (filePath) {
            fileUrl = await getSignedInvoiceFileUrl(filePath)
        }

        return NextResponse.json(
            {
                invoice: {
                    id: doc.id,
                    invoiceNumber: String(data.invoiceNumber || `INV-${doc.id.slice(0, 8)}`),
                    vendor: String(data.vendor || "Unknown Vendor"),
                    amount: Number(data.amount || 0),
                    currency: String(data.currency || "USD"),
                    status: String(data.status || "pending"),
                    fraudScore: toNullableNumber(data.fraudScore),
                    riskLevel: (data as InvoiceDocument).riskLevel ?? null,
                    filePath: String(data.filePath || ""),
                    fileName: String(data.fileName || ""),
                    fileUrl,
                    mimeType: (data as InvoiceDocument).mimeType ?? null,
                    organizationId: String(data.organizationId),
                    extractedFields: (data as InvoiceDocument).extractedFields ?? null,
                    fraudFlags: Array.isArray((data as InvoiceDocument).fraudFlags)
                        ? (data as InvoiceDocument).fraudFlags
                        : [],
                    fraudSummary: (data as InvoiceDocument).fraudSummary ?? null,
                    recommendedAction: (data as InvoiceDocument).recommendedAction ?? null,
                    disputeDraft: (data as InvoiceDocument).disputeDraft ?? null,
                    analyzedAt: toIsoNullable((data as InvoiceDocument).analyzedAt),
                    analysisError: (data as InvoiceDocument).analysisError ?? null,
                    createdAt: toIsoNullable(data.createdAt) ?? new Date().toISOString(),
                    aiAnalysis: (data as InvoiceDocument).aiAnalysis ?? null,
                },
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Fetch invoice error:", error)
        return NextResponse.json({ message: "Failed to fetch invoice" }, { status: 500 })
    }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    const authContext = await getAuthenticatedOrg()
    if (!authContext) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const firestore = getFirebaseFirestore()
        const storage = getFirebaseStorage()
        const ref = firestore.collection("invoices").doc(params.id)
        const doc = await ref.get()

        if (!doc.exists) {
            return NextResponse.json({ message: "Invoice not found" }, { status: 404 })
        }

        const data = doc.data()
        if (data?.organizationId !== authContext.organizationId) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const filePath = data?.filePath as string | undefined
        if (filePath) {
            await storage.bucket().file(filePath).delete({ ignoreNotFound: true })
        }

        await ref.delete()

        return NextResponse.json({ message: "Invoice deleted" }, { status: 200 })
    } catch (error) {
        console.error("Delete invoice error:", error)
        return NextResponse.json({ message: "Failed to delete invoice" }, { status: 500 })
    }
}
