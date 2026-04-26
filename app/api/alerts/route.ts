import { getFirebaseFirestore } from "@/lib/firebase-admin"
import { sendAlertNotification } from "@/lib/email/sendgrid"
import { getOptionalServerSession } from "@/lib/server-session"
import { FieldValue } from "firebase-admin/firestore"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

function toIsoTimestamp(value: unknown): string | null {
    if (!value) {
        return null
    }

    if (typeof value === "string") {
        return value
    }

    if (typeof value === "object" && value !== null && "toDate" in value) {
        try {
            return (value as { toDate: () => Date }).toDate().toISOString()
        } catch {
            return null
        }
    }

    return null
}

export async function GET() {
    const session = await getOptionalServerSession()

    if (!session?.user?.id || !session.user.organizationId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const firestore = getFirebaseFirestore()
        const snapshot = await firestore
            .collection("alerts")
            .where("organizationId", "==", session.user.organizationId)
            .orderBy("timestamp", "desc")
            .limit(100)
            .get()

        return NextResponse.json(
            {
                alerts: snapshot.docs.map((doc) => {
                    const data = doc.data()

                    return {
                        id: doc.id,
                        ...data,
                        timestamp: toIsoTimestamp(data.timestamp),
                    }
                }),
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Alert list error:", error)
        return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const session = await getOptionalServerSession()
    if (!session?.user?.id || !session.user.organizationId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
            portName: location,
            severity,
            status: "open",
            createdAt: FieldValue.serverTimestamp(),
            timestamp: FieldValue.serverTimestamp(),
        })

        if (session.user.email) {
            void sendAlertNotification(
                session.user.email,
                type,
                vesselName,
                location,
                severity,
                `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/alerts`
            ).catch(console.error)
        }

        return NextResponse.json({ success: true, alertId: alertRef.id }, { status: 201 })
    } catch (error) {
        console.error("Alert creation error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
