import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { getFirebaseFirestore } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import { sendTeamInvite } from "@/lib/email/sendgrid"

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { email } = await req.json()
        if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 })

        const firestore = getFirebaseFirestore()
        
        // Get org name
        const orgDoc = await firestore.collection("organizations").doc(session.user.organizationId).get()
        const orgName = orgDoc.data()?.name || "Your Organization"
        
        const inviteRef = firestore.collection("invites").doc()

        await inviteRef.set({
            organizationId: session.user.organizationId,
            inviterId: session.user.id,
            email,
            status: "pending",
            createdAt: FieldValue.serverTimestamp()
        })

        const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/register?invite=${inviteRef.id}`
        
        void sendTeamInvite(
            email,
            session.user.name || "A team member",
            orgName,
            inviteUrl
        ).catch(console.error)

        return NextResponse.json({ success: true, inviteId: inviteRef.id }, { status: 201 })
    } catch (error) {
        console.error("Invite error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
