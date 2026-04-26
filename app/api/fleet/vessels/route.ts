import { getDashboardAccessContext } from "@/lib/dashboard-access"
import { getFirebaseFirestore } from "@/lib/firebase-admin"
import { fetchSeededVesselPosition, type VesselPositionSeedSource } from "@/lib/vessel-api"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { NextResponse } from "next/server"
import { z } from "zod"

export const runtime = "nodejs"

type TrackedVesselDocument = {
    organizationId: string
    createdBy: string
    name: string
    mmsi: string
    imo: string | null
    type: string
    createdAt?: Timestamp | string | Date | null
    updatedAt?: Timestamp | string | Date | null
}

type VesselDocument = {
    name?: string
    mmsi?: string
    imo?: string | null
    type?: string
    lat?: number | null
    lng?: number | null
    heading?: number | null
    speed?: number | null
    status?: string | null
    nextPort?: string | null
    eta?: string | null
    lastUpdated?: Timestamp | string | Date | null
    source?: "aisstream" | "manual" | "vesselapi"
    positionSeedSource?: VesselPositionSeedSource | null
    positionSeedError?: string | null
    positionSeedAttemptedAt?: Timestamp | string | Date | null
}

const createTrackedVesselSchema = z.object({
    name: z.string().trim().min(1).max(120),
    mmsi: z.string().trim().regex(/^\d{9}$/, "MMSI must be 9 digits"),
    imo: z
        .string()
        .trim()
        .regex(/^\d{7}$/, "IMO must be 7 digits")
        .optional()
        .or(z.literal("")),
    type: z.string().trim().min(1).max(40),
})

function toIso(value: unknown): string | null {
    if (!value) {
        return null
    }

    if (value instanceof Timestamp) {
        return value.toDate().toISOString()
    }

    if (typeof value === "string") {
        return value
    }

    if (value instanceof Date) {
        return value.toISOString()
    }

    return null
}

function getTrackedVesselId(organizationId: string, mmsi: string) {
    return `${organizationId}_${mmsi}`
}

function toFleetVessel(id: string, tracked: TrackedVesselDocument, vessel: VesselDocument | undefined) {
    return {
        id,
        name: vessel?.name ?? tracked.name,
        mmsi: tracked.mmsi,
        imo: vessel?.imo ?? tracked.imo ?? null,
        type: vessel?.type ?? tracked.type,
        lat: typeof vessel?.lat === "number" ? vessel.lat : null,
        lng: typeof vessel?.lng === "number" ? vessel.lng : null,
        heading: typeof vessel?.heading === "number" ? vessel.heading : 0,
        speed: typeof vessel?.speed === "number" ? vessel.speed : 0,
        status:
            vessel?.status === "moving" ||
            vessel?.status === "anchored" ||
            vessel?.status === "moored"
                ? vessel.status
                : "unknown",
        nextPort: vessel?.nextPort ?? "Unknown",
        eta: vessel?.eta ?? "Unavailable",
        lastUpdated: toIso(vessel?.lastUpdated ?? tracked.updatedAt),
        source: vessel?.source ?? "manual",
    }
}

export async function GET() {
    const access = await getDashboardAccessContext()

    if (!access) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const firestore = getFirebaseFirestore()
        const [trackedSnapshot, vesselSnapshot] = await Promise.all([
            firestore
                .collection("trackedVessels")
                .where("organizationId", "==", access.organizationId)
                .get(),
            firestore
                .collection("vessels")
                .where("organizationId", "==", access.organizationId)
                .get(),
        ])

        const vesselMap = new Map(
            vesselSnapshot.docs.map((doc) => [doc.id, doc.data() as VesselDocument] as const)
        )

        const vessels = trackedSnapshot.docs
            .map((doc) => toFleetVessel(doc.id, doc.data() as TrackedVesselDocument, vesselMap.get(doc.id)))
            .sort((left, right) => left.name.localeCompare(right.name))

        return NextResponse.json({ vessels }, { status: 200 })
    } catch (error) {
        console.error("Fleet vessel list error:", error)
        return NextResponse.json({ error: "Failed to load tracked vessels" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const access = await getDashboardAccessContext()

    if (!access) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json().catch(() => ({}))
        const parsed = createTrackedVesselSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? "Invalid vessel payload" },
                { status: 400 }
            )
        }

        const firestore = getFirebaseFirestore()
        const mmsi = parsed.data.mmsi.trim()
        const positionLookup = await fetchSeededVesselPosition({
            mmsi,
            imo: parsed.data.imo?.trim() || null,
        })
        const seededPosition = positionLookup.position
        const trackedVesselId = getTrackedVesselId(access.organizationId, mmsi)
        const trackedRef = firestore.collection("trackedVessels").doc(trackedVesselId)
        const vesselRef = firestore.collection("vessels").doc(trackedVesselId)

        const trackedPayload: TrackedVesselDocument = {
            organizationId: access.organizationId,
            createdBy: access.userId,
            name: parsed.data.name.trim(),
            mmsi,
            imo: parsed.data.imo?.trim() || null,
            type: parsed.data.type.trim(),
        }

        await trackedRef.set(
            {
                ...trackedPayload,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
        )

        if (!seededPosition && positionLookup.reason) {
            console.warn(
                `[fleet/vessels] Seed position unavailable for ${trackedPayload.name} (${mmsi}): ${positionLookup.reason}`
            )
        }

        await vesselRef.set(
            {
                id: trackedVesselId,
                organizationId: access.organizationId,
                name: trackedPayload.name,
                mmsi,
                imo: trackedPayload.imo,
                type: trackedPayload.type,
                lat: seededPosition?.latitude ?? null,
                lng: seededPosition?.longitude ?? null,
                heading: seededPosition?.heading ?? 0,
                speed: seededPosition?.speed ?? 0,
                status: "unknown",
                nextPort: "Unknown",
                eta: "Unavailable",
                lastUpdated: seededPosition?.lastUpdated ?? FieldValue.serverTimestamp(),
                source: seededPosition ? "vesselapi" : "manual",
                positionSeedSource: positionLookup.source,
                positionSeedError: positionLookup.reason,
                positionSeedAttemptedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
        )

        return NextResponse.json(
            {
                vessel: toFleetVessel(trackedVesselId, trackedPayload, {
                    name: trackedPayload.name,
                    mmsi,
                    imo: trackedPayload.imo,
                    type: trackedPayload.type,
                    lat: seededPosition?.latitude ?? null,
                    lng: seededPosition?.longitude ?? null,
                    heading: seededPosition?.heading ?? 0,
                    speed: seededPosition?.speed ?? 0,
                    status: "unknown",
                    nextPort: "Unknown",
                    eta: "Unavailable",
                    lastUpdated: seededPosition?.lastUpdated ?? new Date(),
                    source: seededPosition ? "vesselapi" : "manual",
                    positionSeedSource: positionLookup.source,
                    positionSeedError: positionLookup.reason,
                    positionSeedAttemptedAt: new Date(),
                }),
                positionSeedSource: positionLookup.source,
                positionSeedError: positionLookup.reason,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Fleet vessel create error:", error)
        return NextResponse.json({ error: "Failed to create tracked vessel" }, { status: 500 })
    }
}
