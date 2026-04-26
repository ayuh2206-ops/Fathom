import "server-only"

export type SeededVesselPosition = {
    latitude: number
    longitude: number
    heading: number
    speed: number
    lastUpdated: string | null
}

export type VesselPositionSeedSource = "mmsi" | "imo"

export type VesselPositionLookupResult = {
    position: SeededVesselPosition | null
    source: VesselPositionSeedSource | null
    reason: string | null
}

type VesselApiPayload =
    | {
          vesselPosition?: Record<string, unknown>
          data?: Record<string, unknown>
          latitude?: unknown
          longitude?: unknown
          heading?: unknown
          cog?: unknown
          sog?: unknown
          speed?: unknown
          timestamp?: unknown
          processedTimestamp?: unknown
          processed_timestamp?: unknown
          location?: {
              coordinates?: unknown
          }
          error?: {
              message?: unknown
          }
          message?: unknown
          detail?: unknown
      }
    | null

type VesselPositionsPayload =
    | {
          vesselPositions?: Array<Record<string, unknown>>
          data?: Array<Record<string, unknown>>
          error?: {
              message?: unknown
          }
          message?: unknown
          detail?: unknown
      }
    | null

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

function getCoordinates(value: unknown): unknown[] | null {
    if (
        typeof value === "object" &&
        value !== null &&
        "coordinates" in value &&
        Array.isArray((value as { coordinates?: unknown }).coordinates)
    ) {
        return (value as { coordinates: unknown[] }).coordinates
    }

    return null
}

function parsePosition(payload: VesselApiPayload): SeededVesselPosition | null {
    const candidate =
        payload?.vesselPosition && typeof payload.vesselPosition === "object"
            ? payload.vesselPosition
            : payload?.data && typeof payload.data === "object"
              ? payload.data
              : payload

    const latitude = asNumber(candidate?.latitude)
    const longitude = asNumber(candidate?.longitude)
    const coordinates = getCoordinates(candidate?.location)

    const fallbackLongitude = coordinates ? asNumber(coordinates[0]) : null
    const fallbackLatitude = coordinates ? asNumber(coordinates[1]) : null

    const resolvedLatitude = latitude ?? fallbackLatitude
    const resolvedLongitude = longitude ?? fallbackLongitude

    if (resolvedLatitude === null || resolvedLongitude === null) {
        return null
    }

    return {
        latitude: resolvedLatitude,
        longitude: resolvedLongitude,
        heading: asNumber(candidate?.heading ?? candidate?.cog) ?? 0,
        speed: asNumber(candidate?.sog ?? candidate?.speed) ?? 0,
        lastUpdated:
            asString(candidate?.timestamp) ??
            asString(candidate?.processedTimestamp) ??
            asString(candidate?.processed_timestamp),
    }
}

function getErrorMessage(payload: VesselApiPayload, status: number): string {
    return (
        asString(payload?.error?.message) ??
        asString(payload?.message) ??
        asString(payload?.detail) ??
        `VesselAPI responded with status ${status}`
    )
}

function getErrorMessageFromListPayload(payload: VesselPositionsPayload, status: number): string {
    return (
        asString(payload?.error?.message) ??
        asString(payload?.message) ??
        asString(payload?.detail) ??
        `VesselAPI responded with status ${status}`
    )
}

async function fetchJson<T>(url: string): Promise<{ ok: boolean; status: number; payload: T | null }> {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${process.env.VESSEL_API_KEY}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
    })

    return {
        ok: response.ok,
        status: response.status,
        payload: (await response.json().catch(() => null)) as T | null,
    }
}

async function fetchLatestPositionByIdentifier(
    identifier: string,
    idType: VesselPositionSeedSource
): Promise<{ position: SeededVesselPosition | null; reason: string | null }> {
    const response = await fetchJson<VesselApiPayload>(
        `https://api.vesselapi.com/v1/vessel/${encodeURIComponent(identifier)}/position?filter.idType=${idType}`
    )

    if (!response.ok) {
        return {
            position: null,
            reason: `${idType.toUpperCase()} latest-position lookup failed: ${getErrorMessage(
                response.payload,
                response.status
            )}`,
        }
    }

    const position = parsePosition(response.payload)

    if (!position) {
        return {
            position: null,
            reason: `${idType.toUpperCase()} latest-position lookup returned no coordinates`,
        }
    }

    return { position, reason: null }
}

async function fetchHistoricalPositionByIdentifier(
    identifier: string,
    idType: VesselPositionSeedSource
): Promise<{ position: SeededVesselPosition | null; reason: string | null }> {
    const now = new Date()
    const from = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30)
    const params = new URLSearchParams({
        "filter.ids": identifier,
        "filter.idType": idType,
        "time.from": from.toISOString(),
        "time.to": now.toISOString(),
        "pagination.limit": "1",
    })

    const response = await fetchJson<VesselPositionsPayload>(
        `https://api.vesselapi.com/v1/vessels/positions?${params.toString()}`
    )

    if (!response.ok) {
        return {
            position: null,
            reason: `${idType.toUpperCase()} historical-position lookup failed: ${getErrorMessageFromListPayload(
                response.payload,
                response.status
            )}`,
        }
    }

    const firstPosition =
        Array.isArray(response.payload?.vesselPositions) && response.payload.vesselPositions.length > 0
            ? response.payload.vesselPositions[0]
            : Array.isArray(response.payload?.data) && response.payload.data.length > 0
              ? response.payload.data[0]
              : null

    const position = parsePosition((firstPosition ?? null) as VesselApiPayload)

    if (!position) {
        return {
            position: null,
            reason: `${idType.toUpperCase()} historical-position lookup returned no coordinates`,
        }
    }

    return { position, reason: null }
}

async function fetchStaticVesselByIdentifier(
    identifier: string,
    idType: VesselPositionSeedSource
): Promise<{ found: boolean; reason: string | null }> {
    const response = await fetchJson<{ vessel?: Record<string, unknown>; error?: { message?: unknown }; message?: unknown; detail?: unknown }>(
        `https://api.vesselapi.com/v1/vessel/${encodeURIComponent(identifier)}?filter.idType=${idType}`
    )

    if (!response.ok) {
        return {
            found: false,
            reason: `${idType.toUpperCase()} static-vessel lookup failed: ${getErrorMessage(
                response.payload as VesselApiPayload,
                response.status
            )}`,
        }
    }

    return {
        found: Boolean(response.payload?.vessel),
        reason: response.payload?.vessel
            ? `${idType.toUpperCase()} vessel exists but VesselAPI has no position data in the last 30 days`
            : `${idType.toUpperCase()} static-vessel lookup returned no vessel`,
    }
}

async function fetchByIdentifier(
    identifier: string,
    idType: VesselPositionSeedSource
): Promise<{ position: SeededVesselPosition | null; reason: string | null }> {
    const latestResult = await fetchLatestPositionByIdentifier(identifier, idType)

    if (latestResult.position) {
        return latestResult
    }

    const historicalResult = await fetchHistoricalPositionByIdentifier(identifier, idType)

    if (historicalResult.position) {
        return historicalResult
    }

    const staticResult = await fetchStaticVesselByIdentifier(identifier, idType)

    if (staticResult.found) {
        return {
            position: null,
            reason: staticResult.reason,
        }
    }

    return {
        position: null,
        reason: [latestResult.reason, historicalResult.reason, staticResult.reason]
            .filter(Boolean)
            .join(" | "),
    }
}

export async function fetchSeededVesselPosition(params: {
    mmsi: string
    imo?: string | null
}): Promise<VesselPositionLookupResult> {
    if (!process.env.VESSEL_API_KEY) {
        return {
            position: null,
            source: null,
            reason: "VESSEL_API_KEY is not configured on the server",
        }
    }

    const attempts: Array<{ id: string; type: VesselPositionSeedSource }> = [{ id: params.mmsi, type: "mmsi" }]

    if (params.imo) {
        attempts.push({ id: params.imo, type: "imo" })
    }

    const failures: string[] = []

    for (const attempt of attempts) {
        try {
            const result = await fetchByIdentifier(attempt.id, attempt.type)

            if (result.position) {
                return {
                    position: result.position,
                    source: attempt.type,
                    reason: null,
                }
            }

            if (result.reason) {
                failures.push(result.reason)
            }
        } catch (error) {
            failures.push(
                `${attempt.type.toUpperCase()} lookup error: ${
                    error instanceof Error ? error.message : String(error)
                }`
            )
        }
    }

    return {
        position: null,
        source: null,
        reason: failures.join(" | ") || "VesselAPI returned no position data",
    }
}
