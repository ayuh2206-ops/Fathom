import { NextRequest, NextResponse } from "next/server"
import { getFirebaseFirestore } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import { sendDisputeStatusUpdate } from "@/lib/email/sendgrid"
import { getOptionalServerSession } from "@/lib/server-session"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getOptionalServerSession()
    if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { status } = await req.json()
        if (!status) return NextResponse.json({ error: "Missing status" }, { status: 400 })

        const firestore = getFirebaseFirestore()
        const disputeRef = firestore.collection("disputes").doc(params.id)
        const doc = await disputeRef.get()
        if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 })

        const data = doc.data()!
        if (data.organizationId !== session.user.organizationId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await disputeRef.update({
            status,
            updatedAt: FieldValue.serverTimestamp()
        })

        if (session.user.email) {
            void sendDisputeStatusUpdate(
                session.user.email,
                data.vendorName || "Vendor",
                status,
                `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/disputes/${params.id}`
            ).catch(console.error)
        }

        return NextResponse.json({ success: true, status }, { status: 200 })
    } catch (error) {
        console.error("Dispute update error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
