import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth"
import { seedPortTariffs } from "@/lib/port-tariffs"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// DELETE THIS ROUTE AFTER RUNNING ONCE IN PRODUCTION
export async function GET(request: NextRequest) {
    const adminSessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value

    if (!verifyAdminSessionToken(adminSessionToken)) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await seedPortTariffs()

    return NextResponse.json(
        { success: true, message: "Seeded 8 port tariffs" },
        { status: 200 }
    )
}
