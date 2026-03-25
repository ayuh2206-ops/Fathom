import { generateVerificationToken, hashPassword } from "@/lib/auth"
import { getFirebaseFirestore } from "@/lib/firebase-admin"
import { isStrongPassword, normalizeEmail } from "@/lib/user-utils"
import { FieldValue } from "firebase-admin/firestore"
import { NextResponse } from "next/server"
import { z } from "zod"

const registerSchema = z.object({
    fullName: z.string().min(2).max(120),
    email: z.string().email(),
    password: z.string().min(8).max(200),
    companyName: z.string().min(2).max(160).optional(),
    companySize: z.string().max(50).optional(),
    fleetSize: z.string().max(50).optional(),
    phone: z.string().max(50).optional(),
    plan: z.enum(["scout", "navigator", "admiral", "trial"]).default("scout"),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const parsed = registerSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid registration payload", errors: parsed.error.flatten() },
                { status: 400 }
            )
        }

        if (!isStrongPassword(parsed.data.password)) {
            return NextResponse.json(
                { message: "Password must be at least 8 characters with at least 1 uppercase letter and 1 number." },
                { status: 400 }
            )
        }

        const fullName = parsed.data.fullName.trim()
        const email = normalizeEmail(parsed.data.email)
        const passwordHash = await hashPassword(parsed.data.password)
        const verificationToken = generateVerificationToken()
        const firestore = getFirebaseFirestore()

        const organizationRef = firestore.collection("organizations").doc()
        const userRef = firestore.collection("users").doc()
        const userEmailRef = firestore.collection("userEmails").doc(email)

        await firestore.runTransaction(async (tx) => {
            const existingEmail = await tx.get(userEmailRef)

            if (existingEmail.exists) {
                throw new Error("EMAIL_EXISTS")
            }

            tx.set(organizationRef, {
                name: parsed.data.companyName?.trim() || `${fullName}'s Organization`,
                subscriptionPlan: parsed.data.plan,
                companySize: parsed.data.companySize || null,
                fleetSize: parsed.data.fleetSize || null,
                phone: parsed.data.phone || null,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            })

            tx.set(userRef, {
                email,
                fullName,
                passwordHash,
                organizationId: organizationRef.id,
                role: "owner",
                emailVerified: null,
                verificationToken,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            })

            tx.set(userEmailRef, {
                userId: userRef.id,
                email,
                createdAt: FieldValue.serverTimestamp(),
            })
        })

        return NextResponse.json({ message: "User registered successfully" }, { status: 201 })
    } catch (error) {
        if (error instanceof Error && error.message === "EMAIL_EXISTS") {
            return NextResponse.json({ message: "User already exists" }, { status: 409 })
        }

        console.error("Registration Error:", error)
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
    }
}
