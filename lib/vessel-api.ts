import "server-only"

export type SeededVesselPosition = {
    latitude: number
    longitude: number
    heading: number
    speed: number
    lastUpdated: string | null
}

function asNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value
    }

    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : null
    }

    return null
}

function asString(value: unknown): string | null {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}

export async function fetchSeededVesselPosition(mmsi: string): Promise<SeededVesselPosition | null> {
    if (!process.env.VESSEL_API_KEY) {
        console.warn("VESSEL_API_KEY not set - skipping VesselAPI seed lookup")
        return null
    }

    try {
        const response = await fetch(
            `https://api.vesselapi.com/v1/vessel/${encodeURIComponent(mmsi)}/position?filter.idType=mmsi`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.VESSEL_API_KEY}`,
                },
                cache: "no-store",
                signal: AbortSignal.timeout(10000),
            }
        )

        if (!response.ok) {
            console.warn(`VesselAPI seed lookup failed for MMSI ${mmsi}: ${response.status}`)
            return null
        }

        const data = (await response.json()) as
            | {
                  vesselPosition?: Record<string, unknown>
                  latitude?: unknown
                  longitude?: unknown
                  heading?: unknown
                  sog?: unknown
                  speed?: unknown
                  timestamp?: unknown
              }
            | null

        const payload =
            data?.vesselPosition && typeof data.vesselPosition === "object"
                ? data.vesselPosition
                : data

        const latitude = asNumber(payload?.latitude)
        const longitude = asNumber(payload?.longitude)

        if (latitude === null || longitude === null) {
            return null
        }

        return {
            latitude,
            longitude,
            heading: asNumber(payload?.heading) ?? 0,
            speed: asNumber(payload?.sog ?? payload?.speed) ?? 0,
            lastUpdated: asString(payload?.timestamp),
        }
    } catch (error) {
        console.warn(`VesselAPI seed lookup error for MMSI ${mmsi}:`, error)
        return null
    }
}
