import "server-only"

import { authOptions } from "@/lib/auth-options"
import { getServerSession } from "next-auth"

let warnedAboutMissingSecret = false

function isMissingNextAuthSecret(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false
    }

    const errorWithCode = error as Error & { code?: string }
    const message = error.message.toLowerCase()

    return (
        error.name === "MissingSecretError" ||
        errorWithCode.code === "NO_SECRET" ||
        message.includes("please define a `secret`") ||
        message.includes("server configuration")
    )
}

export async function getOptionalServerSession() {
    if (!process.env.NEXTAUTH_SECRET) {
        if (!warnedAboutMissingSecret) {
            console.warn("NEXTAUTH_SECRET is not configured. Treating server-session requests as unauthenticated.")
            warnedAboutMissingSecret = true
        }

        return null
    }

    try {
        return await getServerSession(authOptions)
    } catch (error) {
        if (isMissingNextAuthSecret(error)) {
            console.warn("NEXTAUTH_SECRET is not configured. Treating the current request as unauthenticated.")
            return null
        }

        throw error
    }
}
