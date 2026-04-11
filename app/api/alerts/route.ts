import { NextRequest, NextResponse } from "next/server"
import { getFirebaseFirestore } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import { sendAlertNotification } from "@/lib/email/sendgrid"
import { getOptionalServerSession } from "@/lib/server-session"

export async function POST(req: NextRequest) {
    const session = await getOptionalServerSession()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await req.json()
        const { type, vesselName, location, severity } = body

        if (!type || !vesselName || !location || !severity) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const firestore = getFirebaseFirestore()
        const alertRef = firestore.collection("alerts").doc()

        await alertRef.set({
            organizationId: session.user.organizationId,
            userId: session.user.id,
            type,
            vesselName,
            location,
            severity,
            createdAt: FieldValue.serverTimestamp(),
            status: "active"
        })

        if (session.user.email) {
            void sendAlertNotification(
                session.user.email,
                type,
                vesselName,
                location,
                severity,
                `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/alerts`
            ).catch(console.error)
        }

        return NextResponse.json({ success: true, alertId: alertRef.id }, { status: 201 })
    } catch (error) {
        console.error("Alert creation error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
