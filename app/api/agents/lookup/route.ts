import { lookupAgentByNameOrEmail } from "@/lib/agent-registry"
import { getOptionalServerSession } from "@/lib/server-session"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
    const session = await getOptionalServerSession()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = (await req.json().catch(() => ({}))) as {
            agentName?: string | null
            agentEmail?: string | null
        }

        const agent = await lookupAgentByNameOrEmail(body.agentName ?? null, body.agentEmail ?? null)

        return NextResponse.json(
            {
                agent,
                reputationLabel: agent?.reputationLabel ?? "unknown",
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Agent lookup error:", error)
        return NextResponse.json({ error: "Failed to lookup agent" }, { status: 500 })
    }
}
