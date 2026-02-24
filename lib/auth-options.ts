import { verifyPassword } from "@/lib/auth"
import { getFirebaseFirestore } from "@/lib/firebase-admin"
import { normalizeEmail } from "@/lib/user-utils"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { z } from "zod"

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

type FirestoreUser = {
    email: string
    fullName: string
    organizationId: string
    passwordHash: string
    role: "owner" | "admin" | "member" | "viewer"
}

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/",
        error: "/",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const parsed = credentialsSchema.safeParse(credentials)
                if (!parsed.success) {
                    return null
                }

                const email = normalizeEmail(parsed.data.email)
                const password = parsed.data.password
                const firestore = getFirebaseFirestore()

                const emailDoc = await firestore.collection("userEmails").doc(email).get()
                if (!emailDoc.exists) {
                    return null
                }

                const userId = emailDoc.data()?.userId as string | undefined
                if (!userId) {
                    return null
                }

                const userDoc = await firestore.collection("users").doc(userId).get()
                if (!userDoc.exists) {
                    return null
                }

                const user = userDoc.data() as FirestoreUser
                const isValid = await verifyPassword(password, user.passwordHash)
                if (!isValid) {
                    return null
                }

                return {
                    id: userDoc.id,
                    name: user.fullName,
                    email: user.email,
                    organizationId: user.organizationId,
                    role: user.role,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.organizationId = (user as { organizationId?: string }).organizationId
                token.role = (user as { role?: string }).role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.organizationId = token.organizationId as string
                session.user.role = token.role as string
            }
            return session
        },
    },
}
