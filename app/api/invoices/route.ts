import { getFirebaseFirestore, getFirebaseStorage } from "@/lib/firebase-admin"
import { getOptionalServerSession } from "@/lib/server-session"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { NextResponse } from "next/server"
import path from "path"

export const runtime = "nodejs"
export const maxDuration = 120

const MAX_INVOICE_SIZE_BYTES = 10 * 1024 * 1024
const SUPPORTED_TYPES = new Set([
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
])

type InvoiceRecord = {
    id: string
    invoiceNumber: string
    vendor: string
    amount: number
    currency: string
    status: string
    fraudScore: number
    filePath: string
    fileName: string
    fileUrl: string | null
    mimeType: string | null
    organizationId: string
    createdAt: string
}

function toIso(value: unknown): string {
    if (value instanceof Timestamp) {
        return value.toDate().toISOString()
    }

    if (typeof value === "string") {
        return value
    }

    return new Date().toISOString()
}

function toInvoiceRecord(doc: FirebaseFirestore.DocumentSnapshot): InvoiceRecord {
    const data = doc.data() || {}

    return {
        id: doc.id,
        invoiceNumber: String(data.invoiceNumber || `INV-${doc.id.slice(0, 8)}`),
        vendor: String(data.vendor || "Unknown Vendor"),
        amount: Number(data.amount || 0),
        currency: String(data.currency || "USD"),
        status: String(data.status || "uploaded"),
        fraudScore: Number(data.fraudScore || 0),
        filePath: String(data.filePath || ""),
        fileName: String(data.fileName || ""),
        fileUrl: data.fileUrl ? String(data.fileUrl) : null,
        mimeType: data.mimeType ? String(data.mimeType) : null,
        organizationId: String(data.organizationId),
        createdAt: toIso(data.createdAt),
    }
}

function sanitizeFilename(fileName: string): string {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
}

export async function GET() {
    const session = await getOptionalServerSession()

    if (!session?.user?.id || !session.user.organizationId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const firestore = getFirebaseFirestore()
        const snapshot = await firestore
            .collection("invoices")
            .where("organizationId", "==", session.user.organizationId)
            .get()

        const invoices = snapshot.docs
            .map(toInvoiceRecord)
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

        return NextResponse.json({ invoices }, { status: 200 })
    } catch (error) {
        console.error("Invoice list error:", error)
        return NextResponse.json({ message: "Failed to fetch invoices" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getOptionalServerSession()

    if (!session?.user?.id || !session.user.organizationId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const firestore = getFirebaseFirestore()
        const storage = getFirebaseStorage()
        const formData = await req.formData()
        const file = formData.get("file")

        if (!(file instanceof File)) {
            return NextResponse.json({ message: "File is required" }, { status: 400 })
        }

        if (!SUPPORTED_TYPES.has(file.type)) {
            return NextResponse.json({ message: "Unsupported file type" }, { status: 400 })
        }

        if (file.size > MAX_INVOICE_SIZE_BYTES) {
            return NextResponse.json({ message: "File too large (max 10MB)" }, { status: 413 })
        }

        const invoiceId = crypto.randomUUID()
        const ext = path.extname(file.name) || ".pdf"
        const fileName = sanitizeFilename(`${invoiceId}${ext}`)
        const filePath = `organizations/${session.user.organizationId}/invoices/${fileName}`
        const bytes = await file.arrayBuffer()

        const bucket = storage.bucket()
        const storageFile = bucket.file(filePath)

        try {
            await storageFile.save(Buffer.from(bytes), {
                contentType: file.type,
                metadata: {
                    cacheControl: "private, max-age=0, no-transform",
                },
            })
        } catch (storageError: unknown) {
            const err = storageError instanceof Error ? storageError.message : String(storageError)
            throw new Error(`Firebase Storage upload failed: ${err}`)
        }

        const invoiceNumber = String(formData.get("invoiceNumber") || `INV-${invoiceId.slice(0, 8)}`)
        const vendor = String(formData.get("vendor") || "Unknown Vendor")
        const amountRaw = Number(formData.get("amount") || 0)
        const amount = Number.isFinite(amountRaw) ? amountRaw : 0
        const currency = String(formData.get("currency") || "USD").toUpperCase()

        const ref = firestore.collection("invoices").doc(invoiceId)
        await ref.set({
            organizationId: session.user.organizationId,
            uploadedBy: session.user.id,
            invoiceNumber,
            vendor,
            amount,
            currency,
            status: "pending",
            fraudScore: null,
            riskLevel: null,
            filePath,
            fileName: file.name,
            fileUrl: null,
            mimeType: file.type,
            extractedFields: null,
            fraudFlags: [],
            fraudSummary: null,
            recommendedAction: null,
            disputeDraft: null,
            aiAnalysis: null,
            analysisError: null,
            analyzedAt: null,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        })

        const analyzeUrl = new URL(`/api/invoices/${invoiceId}/analyze`, req.url)
        const cookieHeader = req.headers.get("cookie") ?? ""
        const analyzeResponse = await fetch(analyzeUrl, {
            method: "POST",
            headers: cookieHeader ? { cookie: cookieHeader } : undefined,
            cache: "no-store",
        })

        const payload = await analyzeResponse.json().catch(() => ({}))
        if (!analyzeResponse.ok) {
            const created = await ref.get()
            const message =
                typeof payload.error === "string"
                    ? payload.error
                    : typeof payload.message === "string"
                        ? payload.message
                        : "Invoice uploaded but analysis failed"

            return NextResponse.json(
                {
                    invoiceId,
                    invoice: toInvoiceRecord(created),
                    message,
                },
                { status: analyzeResponse.status }
            )
        }

        return NextResponse.json(payload, { status: 201 })
    } catch (error) {
        console.error("Invoice upload error:", error)
        const message = error instanceof Error ? error.message : "Failed to upload invoice"
        return NextResponse.json({ message }, { status: 500 })
    }
}
