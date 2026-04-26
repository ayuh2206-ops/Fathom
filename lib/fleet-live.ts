import "server-only"

import { getNodeWebSocket } from "@/lib/ws-server"
import type { FleetVesselStatus } from "@/types/fleet"

type AISMetadata = {
    ShipName?: string
    latitude?: number
    longitude?: number
    time_utc?: string
    Destination?: string
}

type AISPositionReport = {
    Latitude?: number
    Longitude?: number
    TrueHeading?: number
    Sog?: number
    NavigationalStatus?: number | string
}

type AISMessage = {
    MetaData?: AISMetadata
    Message?: {
        PositionReport?: AISPositionReport
        ShipStaticData?: {
            Destination?: string
        }
    }
}

export type LiveFleetSnapshot = {
    name: string | null
    lat: number | null
    lng: number | null
    heading: number
    speed: number
    status: FleetVesselStatus
    nextPort: string
    lastUpdated: string | null
}

const ANCHORED_STATUSES = new Set([1, "1", "at_anchor", "at anchor", "anchored"])
const MOORED_STATUSES = new Set([5, "5", "moored", "berthed", "docked", "in_port", "in port"])

function asFiniteNumber(value: unknown): number | null {
    return typeof value === "number" && Number.isFinite(value) ? value : null
}

function normalizeStatus(rawStatus: unknown, speed: number | null): FleetVesselStatus {
    if (ANCHORED_STATUSES.has(rawStatus as number | string)) {
        return "anchored"
    }

    if (MOORED_STATUSES.has(rawStatus as number | string)) {
        return "moored"
    }

    if (typeof rawStatus === "string") {
        const normalized = rawStatus.toLowerCase()

        if (normalized.includes("anchor")) {
            return "anchored"
        }

        if (
            normalized.includes("moor") ||
            normalized.includes("berth") ||
            normalized.includes("dock") ||
            normalized.includes("port")
        ) {
            return "moored"
        }
    }

    if ((speed ?? 0) > 0.5) {
        return "moving"
    }

    return "unknown"
}

function toSnapshot(message: AISMessage): LiveFleetSnapshot | null {
    const metadata = message.MetaData
    const position = message.Message?.PositionReport
    const speed = asFiniteNumber(position?.Sog) ?? 0
    const lat = asFiniteNumber(position?.Latitude) ?? asFiniteNumber(metadata?.latitude)
    const lng = asFiniteNumber(position?.Longitude) ?? asFiniteNumber(metadata?.longitude)

    if (lat === null || lng === null) {
        return null
    }

    return {
        name: metadata?.ShipName?.trim() || null,
        lat,
        lng,
        heading: asFiniteNumber(position?.TrueHeading) ?? 0,
        speed,
        status: normalizeStatus(position?.NavigationalStatus, speed),
        nextPort:
            message.Message?.ShipStaticData?.Destination?.trim() ||
            metadata?.Destination?.trim() ||
            "Unknown",
        lastUpdated: metadata?.time_utc ?? new Date().toISOString(),
    }
}

export async function fetchLiveFleetSnapshot(mmsi: string, timeoutMs: number = 12000): Promise<LiveFleetSnapshot | null> {
    if (!process.env.AISSTREAM_API_KEY) {
        console.warn("AISSTREAM_API_KEY not set — skipping live fleet sync")
        return null
    }

    const WebSocket = await getNodeWebSocket()

    return new Promise((resolve) => {
        let settled = false
        const ws = new WebSocket("wss://stream.aisstream.io/v0/stream")

        const finalize = (snapshot: LiveFleetSnapshot | null) => {
            if (settled) {
                return
            }

            settled = true
            clearTimeout(timeout)

            try {
                ws.close()
            } catch {}

            resolve(snapshot)
        }

        const timeout = setTimeout(() => finalize(null), timeoutMs)

        ws.on("open", () => {
            ws.send(
                JSON.stringify({
                    APIKey: process.env.AISSTREAM_API_KEY,
                    BoundingBoxes: [[[-90, -180], [90, 180]]],
                    FiltersShipMMSI: [mmsi],
                    FilterMessageTypes: ["PositionReport"],
                })
            )
        })

        ws.on("message", (data: Buffer) => {
            try {
                const parsed = JSON.parse(data.toString()) as AISMessage
                const snapshot = toSnapshot(parsed)

                if (snapshot) {
                    finalize(snapshot)
                }
            } catch (error) {
                console.warn("Live fleet AIS parse error:", error)
            }
        })

        ws.on("error", (error) => {
            console.warn("Live fleet AIS websocket error:", error)
            finalize(null)
        })

        ws.on("close", () => {
            finalize(null)
        })
    })
}
