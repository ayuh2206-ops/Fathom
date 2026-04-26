import { createHmac, timingSafeEqual } from "crypto"

export const ADMIN_SESSION_COOKIE = "fathom_admin_session"
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12

const SESSION_VERSION = 1

function getRequiredEnv(name: "ADMIN_USERNAME" | "ADMIN_PASSWORD" | "ADMIN_PANEL_SECRET"): string {
    const value = process.env[name]

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}. Admin authentication cannot be initialized without it.`)
    }

    return value
}

export function isAdminAuthConfigured(): boolean {
    return Boolean(
        process.env.ADMIN_USERNAME &&
        process.env.ADMIN_PASSWORD &&
        process.env.ADMIN_PANEL_SECRET
    )
}

function getAdminUsername(): string { return getRequiredEnv("ADMIN_USERNAME") }
function getAdminPassword(): string { return getRequiredEnv("ADMIN_PASSWORD") }
function getAdminSecret(): string { return getRequiredEnv("ADMIN_PANEL_SECRET") }

function safeEqual(a: string, b: string): boolean {
    const aBuffer = Buffer.from(a, "utf8")
    const bBuffer = Buffer.from(b, "utf8")

    if (aBuffer.length !== bBuffer.length) {
        return false
    }

    return timingSafeEqual(aBuffer, bBuffer)
}

function signPayload(payload: string): string | null {
    try {
        return createHmac("sha256", getAdminSecret()).update(payload).digest("base64url")
    } catch {
        return null
    }
}

/**
 * Verify the internal admin username and password.
 * Rotate these credentials and `ADMIN_PANEL_SECRET` before any production deployment.
 */
export function verifyAdminCredentials(name: string, password: string): boolean {
    return safeEqual(name, getAdminUsername()) && safeEqual(password, getAdminPassword())
}

export function createAdminSessionToken(username: string): string {
    const issuedAt = Math.floor(Date.now() / 1000)
    const payload = {
        sub: username,
        iat: issuedAt,
        exp: issuedAt + ADMIN_SESSION_MAX_AGE_SECONDS,
        v: SESSION_VERSION,
    }

    const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")
    const signature = signPayload(encodedPayload)
    if (!signature) return ""

    return `${encodedPayload}.${signature}`
}

export function verifyAdminSessionToken(token?: string | null): boolean {
    if (!token) {
        return false
    }

    // If admin env vars are not configured, tokens can never be valid
    if (!isAdminAuthConfigured()) {
        return false
    }

    const [encodedPayload, signature] = token.split(".")
    if (!encodedPayload || !signature) {
        return false
    }

    const expectedSignature = signPayload(encodedPayload)
    if (!expectedSignature || !safeEqual(signature, expectedSignature)) {
        return false
    }

    try {
        const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as {
            sub?: string
            exp?: number
            v?: number
        }

        if (payload.v !== SESSION_VERSION) {
            return false
        }

        try {
            if (payload.sub !== getAdminUsername()) {
                return false
            }
        } catch {
            return false
        }

        if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
            return false
        }

        return true
    } catch {
        return false
    }
}
