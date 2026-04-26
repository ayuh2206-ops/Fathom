import "server-only"

import { getFirebaseFirestore } from "@/lib/firebase-admin"

export interface PortAgent {
    agentId: string
    agentName: string
    agentEmail: string | null
    agentPhone: string | null
    agentCompany: string | null
    country: string | null
    portsOperatedIn: string[]
    reputationScore: number
    totalInvoicesProcessed: number
    fraudFlagCount: number
    disputeCount: number
    averageOverchargePct: number
    createdAt: string
    updatedAt: string
}

export type ReputationLabel = "trusted" | "caution" | "flagged" | "unknown"

type PortAgentDocument = Omit<PortAgent, "agentId">

function normalizeString(value: string | null): string | null {
    if (!value) {
        return null
    }

    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
}

function toPortAgent(doc: FirebaseFirestore.DocumentSnapshot): PortAgent | null {
    if (!doc.exists) {
        return null
    }

    const data = (doc.data() ?? {}) as Partial<PortAgentDocument>

    return {
        agentId: doc.id,
        agentName: data.agentName ?? "Unknown Agent",
        agentEmail: data.agentEmail ?? null,
        agentPhone: data.agentPhone ?? null,
        agentCompany: data.agentCompany ?? null,
        country: data.country ?? null,
        portsOperatedIn: Array.isArray(data.portsOperatedIn) ? data.portsOperatedIn : [],
        reputationScore: typeof data.reputationScore === "number" ? data.reputationScore : 50,
        totalInvoicesProcessed:
            typeof data.totalInvoicesProcessed === "number" ? data.totalInvoicesProcessed : 0,
        fraudFlagCount: typeof data.fraudFlagCount === "number" ? data.fraudFlagCount : 0,
        disputeCount: typeof data.disputeCount === "number" ? data.disputeCount : 0,
        averageOverchargePct:
            typeof data.averageOverchargePct === "number" ? data.averageOverchargePct : 0,
        createdAt: data.createdAt ?? new Date().toISOString(),
        updatedAt: data.updatedAt ?? new Date().toISOString(),
    }
}

async function findByEmail(
    firestore: FirebaseFirestore.Firestore,
    email: string
): Promise<FirebaseFirestore.QueryDocumentSnapshot | null> {
    const snapshot = await firestore
        .collection("portAgents")
        .where("agentEmail", "==", email.toLowerCase())
        .limit(1)
        .get()

    return snapshot.docs[0] ?? null
}

async function findByName(
    firestore: FirebaseFirestore.Firestore,
    name: string
): Promise<FirebaseFirestore.QueryDocumentSnapshot | null> {
    const snapshot = await firestore
        .collection("portAgents")
        .where("agentName", "==", name)
        .limit(1)
        .get()

    return snapshot.docs[0] ?? null
}

export function getReputationLabel(score: number, totalProcessed: number): ReputationLabel {
    if (totalProcessed < 3) {
        return "unknown"
    }

    if (score >= 70) {
        return "trusted"
    }

    if (score >= 40) {
        return "caution"
    }

    return "flagged"
}

export async function findOrCreateAgent(agentData: {
    agentName: string | null
    agentEmail: string | null
    agentPhone: string | null
    agentCompany: string | null
    portLocode: string | null
}): Promise<string | null> {
    try {
        const agentName = normalizeString(agentData.agentName)
        if (!agentName) {
            return null
        }

        const firestore = getFirebaseFirestore()
        const normalizedEmail = normalizeString(agentData.agentEmail)?.toLowerCase() ?? null

        if (normalizedEmail) {
            const existingByEmail = await findByEmail(firestore, normalizedEmail)
            if (existingByEmail) {
                return existingByEmail.id
            }
        }

        const existingByName = await findByName(firestore, agentName)
        if (existingByName) {
            return existingByName.id
        }

        const now = new Date().toISOString()
        const ref = firestore.collection("portAgents").doc()
        await ref.set({
            agentName,
            agentEmail: normalizedEmail,
            agentPhone: normalizeString(agentData.agentPhone),
            agentCompany: normalizeString(agentData.agentCompany),
            country: null,
            portsOperatedIn: agentData.portLocode ? [agentData.portLocode] : [],
            reputationScore: 50,
            totalInvoicesProcessed: 0,
            fraudFlagCount: 0,
            disputeCount: 0,
            averageOverchargePct: 0,
            createdAt: now,
            updatedAt: now,
        } satisfies PortAgentDocument)

        return ref.id
    } catch (error) {
        console.warn("Failed to find or create agent:", error)
        return null
    }
}

export async function updateAgentAfterAnalysis(
    agentId: string,
    fraudScore: number,
    flagCount: number
): Promise<void> {
    void fraudScore

    try {
        const firestore = getFirebaseFirestore()
        const ref = firestore.collection("portAgents").doc(agentId)

        await firestore.runTransaction(async (transaction) => {
            const snapshot = await transaction.get(ref)
            if (!snapshot.exists) {
                return
            }

            const data = (snapshot.data() ?? {}) as Partial<PortAgentDocument>
            const totalInvoicesProcessed =
                (typeof data.totalInvoicesProcessed === "number" ? data.totalInvoicesProcessed : 0) + 1
            const fraudFlagCount =
                (typeof data.fraudFlagCount === "number" ? data.fraudFlagCount : 0) +
                (flagCount > 0 ? 1 : 0)
            const score = Math.max(
                0,
                Math.min(100, Math.round(100 - (fraudFlagCount / totalInvoicesProcessed) * 60))
            )

            transaction.set(
                ref,
                {
                    totalInvoicesProcessed,
                    fraudFlagCount,
                    reputationScore: score,
                    updatedAt: new Date().toISOString(),
                },
                { merge: true }
            )
        })
    } catch (error) {
        console.warn("Failed to update agent after analysis:", error)
    }
}

export async function getAgentById(agentId: string): Promise<PortAgent | null> {
    try {
        const firestore = getFirebaseFirestore()
        const doc = await firestore.collection("portAgents").doc(agentId).get()
        return toPortAgent(doc)
    } catch (error) {
        console.warn("Failed to fetch agent by id:", error)
        return null
    }
}

export async function lookupAgentByNameOrEmail(
    name: string | null,
    email: string | null
): Promise<(PortAgent & { reputationLabel: ReputationLabel }) | null> {
    try {
        const firestore = getFirebaseFirestore()
        const normalizedEmail = normalizeString(email)?.toLowerCase() ?? null
        const normalizedName = normalizeString(name)
        let doc: FirebaseFirestore.QueryDocumentSnapshot | null = null

        if (normalizedEmail) {
            doc = await findByEmail(firestore, normalizedEmail)
        }

        if (!doc && normalizedName) {
            doc = await findByName(firestore, normalizedName)
        }

        if (!doc) {
            return null
        }

        const agent = toPortAgent(doc)
        if (!agent) {
            return null
        }

        return {
            ...agent,
            reputationLabel: getReputationLabel(agent.reputationScore, agent.totalInvoicesProcessed),
        }
    } catch (error) {
        console.warn("Failed to lookup agent by name or email:", error)
        return null
    }
}
