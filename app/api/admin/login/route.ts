import {
    ADMIN_SESSION_COOKIE,
    ADMIN_SESSION_MAX_AGE_SECONDS,
    createAdminSessionToken,
    isAdminAuthConfigured,
    verifyAdminCredentials,
} from "@/lib/admin-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { getClientIp, rateLimit } from "@/lib/rate-limit"

export const runtime = "nodejs"

const adminLoginSchema = z.object({
    name: z.string().min(1),
    password: z.string().min(1),
})

export async function POST(request: Request) {
    try {
        const clientIp = getClientIp(request)
        const isAllowed = rateLimit(`admin-login:${clientIp}`, 5, 15 * 60 * 1000)

        if (!isAllowed) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 }
            )
        }

        const body = await request.json()
        const parsed = adminLoginSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ message: "Invalid payload" }, { status: 400 })
        }

        if (!isAdminAuthConfigured()) {
            return NextResponse.json(
                { message: "Admin authentication is not configured" },
                { status: 503 }
            )
        }

        const name = parsed.data.name.trim()
        const password = parsed.data.password
        const authenticated = verifyAdminCredentials(name, password)

        if (!authenticated) {
            return NextResponse.json({ message: "Invalid admin credentials" }, { status: 401 })
        }

        const response = NextResponse.json({ message: "Admin authenticated" }, { status: 200 })
        response.cookies.set({
            name: ADMIN_SESSION_COOKIE,
            value: createAdminSessionToken(name),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
        })

        return response
    } catch (error) {
        console.error("Admin login error:", error)
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
    }
}
