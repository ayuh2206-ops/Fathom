import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const ADMIN_SESSION_COOKIE = "fathom_admin_session"
const SESSION_VERSION = 1

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

type AdminSessionPayload = {
    sub?: string
    exp?: number
    v?: number
}

function getRequiredEnv(name: "ADMIN_PANEL_SECRET" | "ADMIN_USERNAME"): string {
    const value = process.env[name]

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }

    return value
}

function toBase64Url(bytes: Uint8Array): string {
    let binary = ""

    for (let index = 0; index < bytes.length; index += 1) {
        binary += String.fromCharCode(bytes[index] ?? 0)
    }

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "")
}

function fromBase64Url(value: string): Uint8Array {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
    const paddingLength = normalized.length % 4 === 0 ? 0 : 4 - (normalized.length % 4)
    const padded = `${normalized}${"=".repeat(paddingLength)}`
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index)
    }

    return bytes
}

function safeEqual(left: string, right: string): boolean {
    if (left.length !== right.length) {
        return false
    }

    let mismatch = 0

    for (let index = 0; index < left.length; index += 1) {
        mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index)
    }

    return mismatch === 0
}

async function createSignature(payload: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        "raw",
        textEncoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    )

    const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload))

    return toBase64Url(new Uint8Array(signature))
}

async function hasValidAdminSession(request: NextRequest): Promise<boolean> {
    const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value

    if (!sessionToken) {
        return false
    }

    const [encodedPayload, providedSignature] = sessionToken.split(".")

    if (!encodedPayload || !providedSignature) {
        return false
    }

    const expectedSignature = await createSignature(encodedPayload, getRequiredEnv("ADMIN_PANEL_SECRET"))
    if (!safeEqual(providedSignature, expectedSignature)) {
        return false
    }

    try {
        const payload = JSON.parse(
            textDecoder.decode(fromBase64Url(encodedPayload))
        ) as AdminSessionPayload

        if (payload.v !== SESSION_VERSION) {
            return false
        }

        if (payload.sub !== getRequiredEnv("ADMIN_USERNAME")) {
            return false
        }

        if (typeof payload.exp !== "number") {
            return false
        }

        return payload.exp > Math.floor(Date.now() / 1000)
    } catch {
        return false
    }
}

function redirectToHome(request: NextRequest, queryParam: "authRequired" | "adminRequired"): NextResponse {
    const url = new URL("/", request.url)
    url.searchParams.set(queryParam, "true")

    return NextResponse.redirect(url)
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl

    if (pathname.startsWith("/dashboard")) {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

        if (!token) {
            const validAdminSession = await hasValidAdminSession(request)
            if (validAdminSession) {
                return NextResponse.next()
            }
            return redirectToHome(request, "authRequired")
        }

        return NextResponse.next()
    }

    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        const validAdminSession = await hasValidAdminSession(request)

        if (!validAdminSession) {
            return redirectToHome(request, "adminRequired")
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/dashboard/:path*", "/admin", "/admin/:path*"],
}
