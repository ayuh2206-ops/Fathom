import { seedPortTariffs } from "@/lib/port-tariffs"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

// DELETE THIS ROUTE AFTER RUNNING ONCE IN PRODUCTION
export async function GET() {
    await seedPortTariffs()

    return NextResponse.json(
        { success: true, message: "Seeded 8 port tariffs" },
        { status: 200 }
    )
}
