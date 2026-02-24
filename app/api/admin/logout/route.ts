import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST() {
    const response = NextResponse.json({ message: "Logged out" }, { status: 200 })
    response.cookies.set({
        name: ADMIN_SESSION_COOKIE,
        value: "",
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
    })

    return response
}
