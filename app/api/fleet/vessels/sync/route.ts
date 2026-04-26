import { getDashboardAccessContext } from "@/lib/dashboard-access"
import { fetchLiveFleetSnapshot } from "@/lib/fleet-live"
import { getFirebaseFirestore } from "@/lib/firebase-admin"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 120

type TrackedVesselDocument = {
    organizationId: string
    name: string
    mmsi: string
    imo: string | null
    type: string
    updatedAt?: Timestamp | string | Date | null
}

type VesselDocument = {
    name?: string
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
    source?: "aisstream" | "manual"
}

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

function toFleetResponse(id: string, tracked: TrackedVesselDocument, vessel: VesselDocument | undefined) {
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

export async function POST() {
    const access = await getDashboardAccessContext()

    if (!access) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const firestore = getFirebaseFirestore()
        const trackedSnapshot = await firestore
            .collection("trackedVessels")
            .where("organizationId", "==", access.organizationId)
            .get()

        if (trackedSnapshot.empty) {
            return NextResponse.json({ vessels: [] }, { status: 200 })
        }

        const syncResults = await Promise.all(
            trackedSnapshot.docs.map(async (trackedDoc) => {
                const tracked = trackedDoc.data() as TrackedVesselDocument
                const vesselRef = firestore.collection("vessels").doc(trackedDoc.id)
                const existingVessel = (await vesselRef.get()).data() as VesselDocument | undefined
                const snapshot = await fetchLiveFleetSnapshot(tracked.mmsi)

                if (!snapshot) {
                    await vesselRef.set(
                        {
                            id: trackedDoc.id,
                            organizationId: access.organizationId,
                            name: existingVessel?.name ?? tracked.name,
                            mmsi: tracked.mmsi,
                            imo: tracked.imo,
                            type: tracked.type,
                            source: existingVessel?.source ?? "manual",
                            updatedAt: FieldValue.serverTimestamp(),
                        },
                        { merge: true }
                    )

                    return toFleetResponse(trackedDoc.id, tracked, {
                        ...existingVessel,
                        name: existingVessel?.name ?? tracked.name,
                        imo: tracked.imo,
                        type: tracked.type,
                        source: existingVessel?.source ?? "manual",
                        lastUpdated: existingVessel?.lastUpdated ?? new Date(),
                    })
                }

                const mergedVessel: VesselDocument = {
                    name: snapshot.name ?? tracked.name,
                    imo: tracked.imo,
                    type: tracked.type,
                    lat: snapshot.lat,
                    lng: snapshot.lng,
                    heading: snapshot.heading,
                    speed: snapshot.speed,
                    status: snapshot.status,
                    nextPort: snapshot.nextPort,
                    eta: "Live AIS",
                    lastUpdated: snapshot.lastUpdated ?? new Date(),
                    source: "aisstream",
                }

                await vesselRef.set(
                    {
                        id: trackedDoc.id,
                        organizationId: access.organizationId,
                        mmsi: tracked.mmsi,
                        ...mergedVessel,
                        lastUpdated: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp(),
                    },
                    { merge: true }
                )

                return toFleetResponse(trackedDoc.id, tracked, mergedVessel)
            })
        )

        return NextResponse.json(
            { vessels: syncResults.sort((left, right) => left.name.localeCompare(right.name)) },
            { status: 200 }
        )
    } catch (error) {
        console.error("Fleet sync error:", error)
        return NextResponse.json({ error: "Failed to sync tracked vessels" }, { status: 500 })
    }
}
