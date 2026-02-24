import { authOptions } from "@/lib/auth-options"
import { getFirebaseFirestore, getFirebaseStorage } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

function toIso(value: unknown): string {
    if (value instanceof Timestamp) {
        return value.toDate().toISOString()
    }

    if (typeof value === "string") {
        return value
    }

    return new Date().toISOString()
}

async function getAuthenticatedOrg() {
    const session = await getServerSession(authOptions)
    const organizationId = session?.user?.organizationId

    if (!session?.user?.id || !organizationId) {
        return null
    }

    return {
        userId: session.user.id,
        organizationId,
    }
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
    const authContext = await getAuthenticatedOrg()
    if (!authContext) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const firestore = getFirebaseFirestore()
        const storage = getFirebaseStorage()
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
            const [signedUrl] = await storage.bucket().file(filePath).getSignedUrl({
                action: "read",
                expires: Date.now() + 15 * 60 * 1000,
            })
            fileUrl = signedUrl
        }

        return NextResponse.json(
            {
                invoice: {
                    id: doc.id,
                    invoiceNumber: String(data.invoiceNumber || `INV-${doc.id.slice(0, 8)}`),
                    vendor: String(data.vendor || "Unknown Vendor"),
                    amount: Number(data.amount || 0),
                    currency: String(data.currency || "USD"),
                    status: String(data.status || "uploaded"),
                    fraudScore: Number(data.fraudScore || 0),
                    filePath: String(data.filePath || ""),
                    fileName: String(data.fileName || ""),
                    fileUrl,
                    organizationId: String(data.organizationId),
                    createdAt: toIso(data.createdAt),
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
