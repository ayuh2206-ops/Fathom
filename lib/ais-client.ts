import "server-only"

import { getNodeWebSocket } from "@/lib/ws-server"

export interface AISStreamResult {
    found: boolean
    mmsi: string
    latitude: number | null
    longitude: number | null
    speed: number | null
    status: string | null
    destination: string | null
    nearPort: boolean
    distanceFromPortKm: number | null
    lastSeen: string | null
    source: "aisstream" | "datalastic" | "none"
    stayHours: number | null
    arrivalActual: string | null
    departureActual: string | null
}

const PORT_COORDINATES: Record<string, { lat: number; lng: number; radiusKm: number }> = {
    NLRTM: { lat: 51.9225, lng: 4.47917, radiusKm: 40 },
    SGSIN: { lat: 1.264, lng: 103.8236, radiusKm: 30 },
    AEDXB: { lat: 25.0657, lng: 55.1713, radiusKm: 35 },
    CNSHA: { lat: 31.2304, lng: 121.4737, radiusKm: 50 },
    DEHAM: { lat: 53.5753, lng: 9.9952, radiusKm: 30 },
    BEANR: { lat: 51.2993, lng: 4.3993, radiusKm: 25 },
    USLAX: { lat: 33.7395, lng: -118.2596, radiusKm: 30 },
    USNYC: { lat: 40.6643, lng: -74.0027, radiusKm: 35 },
    INBOM: { lat: 18.9633, lng: 72.8081, radiusKm: 25 },
    INMAA: { lat: 13.0827, lng: 80.2707, radiusKm: 25 },
    TRIST: { lat: 41.0082, lng: 28.9784, radiusKm: 30 },
    GRPIR: { lat: 37.9436, lng: 23.6481, radiusKm: 30 },
    HKHKG: { lat: 22.3569, lng: 114.1364, radiusKm: 25 },
    KRPUS: { lat: 35.1796, lng: 129.0756, radiusKm: 30 },
    JPYOK: { lat: 35.4437, lng: 139.638, radiusKm: 30 },
}

function getEmptyResult(mmsi: string): AISStreamResult {
    return {
        found: false,
        mmsi,
        latitude: null,
        longitude: null,
        speed: null,
        status: null,
        destination: null,
        nearPort: false,
        distanceFromPortKm: null,
        lastSeen: null,
        source: "none",
        stayHours: null,
        arrivalActual: null,
        departureActual: null,
    }
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const earthRadiusKm = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2

    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function checkVesselPosition(
    mmsi: string,
    portLocode: string,
    timeoutMs: number = 15000
): Promise<AISStreamResult> {
    if (!process.env.AISSTREAM_API_KEY) {
        console.warn("AISSTREAM_API_KEY not set — skipping AIS check")
        return getEmptyResult(mmsi)
    }

    const portCoords = PORT_COORDINATES[portLocode.toUpperCase()]
    const WebSocket = await getNodeWebSocket()

    return new Promise((resolve) => {
        let settled = false

        const finalize = (result: AISStreamResult) => {
            if (!settled) {
                settled = true
                resolve(result)
            }
        }

        const ws = new WebSocket("wss://stream.aisstream.io/v0/stream")
        const timeout = setTimeout(() => {
            try {
                ws.close()
            } catch {}

            finalize(getEmptyResult(mmsi))
        }, timeoutMs)

        ws.on("open", () => {
            ws.send(
                JSON.stringify({
                    APIKey: process.env.AISSTREAM_API_KEY,
                    BoundingBoxes: portCoords
                        ? [[portCoords.lat - 1, portCoords.lng - 1, portCoords.lat + 1, portCoords.lng + 1]]
                        : [[-90, -180, 90, 180]],
                    FiltersShipMMSI: [mmsi],
                    FilterMessageTypes: ["PositionReport"],
                })
            )
        })

        ws.on("message", (data: Buffer) => {
            try {
                const msg = JSON.parse(data.toString()) as {
                    Message?: {
                        PositionReport?: {
                            Latitude?: number
                            Longitude?: number
                            Sog?: number
                            NavigationalStatus?: string
                        }
                    }
                    MetaData?: {
                        Destination?: string
                        ShipName?: string
                    }
                }

                const pos = msg.Message?.PositionReport
                if (!pos) {
                    return
                }

                clearTimeout(timeout)
                try {
                    ws.close()
                } catch {}

                let distanceFromPortKm: number | null = null
                let nearPort = false

                if (
                    portCoords &&
                    typeof pos.Latitude === "number" &&
                    typeof pos.Longitude === "number"
                ) {
                    distanceFromPortKm = haversineKm(
                        pos.Latitude,
                        pos.Longitude,
                        portCoords.lat,
                        portCoords.lng
                    )
                    nearPort = distanceFromPortKm <= portCoords.radiusKm
                }

                finalize({
                    found: true,
                    mmsi,
                    latitude: typeof pos.Latitude === "number" ? pos.Latitude : null,
                    longitude: typeof pos.Longitude === "number" ? pos.Longitude : null,
                    speed: typeof pos.Sog === "number" ? pos.Sog : null,
                    status: typeof pos.NavigationalStatus === "string" ? pos.NavigationalStatus : null,
                    destination:
                        msg.MetaData?.Destination ??
                        msg.MetaData?.ShipName ??
                        null,
                    nearPort,
                    distanceFromPortKm,
                    lastSeen: new Date().toISOString(),
                    source: "aisstream",
                    stayHours: null,
                    arrivalActual: null,
                    departureActual: null,
                })
            } catch (error) {
                console.warn("AIS message parse error:", error)
            }
        })

        ws.on("error", (err) => {
            console.warn("AISStream WebSocket error:", err.message)
            clearTimeout(timeout)
            finalize(getEmptyResult(mmsi))
        })

        ws.on("close", () => {
            clearTimeout(timeout)
            if (!settled) {
                finalize(getEmptyResult(mmsi))
            }
        })
    })
}

export async function getPortCallHistory(
    mmsi: string,
    portLocode: string,
    dateFrom: string,
    dateTo: string
): Promise<AISStreamResult> {
    if (!process.env.DATALASTIC_API_KEY) {
        console.warn("DATALASTIC_API_KEY not set — skipping port call history lookup")
        return getEmptyResult(mmsi)
    }

    try {
        const url = `https://api.datalastic.com/api/v0/vessel-portcalls?mmsi=${encodeURIComponent(mmsi)}&date_from=${encodeURIComponent(dateFrom)}&date_to=${encodeURIComponent(dateTo)}&api-key=${encodeURIComponent(process.env.DATALASTIC_API_KEY)}`
        const res = await fetch(url, { signal: AbortSignal.timeout(10000), cache: "no-store" })

        if (!res.ok) {
            console.warn(`Datalastic error: ${res.status}`)
            return getEmptyResult(mmsi)
        }

        const data = (await res.json()) as {
            data?: Array<{
                port_unlocode?: string
                arrival?: string | null
                departure?: string | null
            }>
        }

        const call = data.data?.find(
            (entry) => entry.port_unlocode?.toUpperCase() === portLocode.toUpperCase()
        )

        if (!call) {
            return getEmptyResult(mmsi)
        }

        const arrivalActual = call.arrival ?? null
        const departureActual = call.departure ?? null
        let stayHours: number | null = null

        if (arrivalActual && departureActual) {
            stayHours =
                (new Date(departureActual).getTime() - new Date(arrivalActual).getTime()) /
                3600000
        }

        return {
            found: true,
            mmsi,
            latitude: null,
            longitude: null,
            speed: null,
            status: null,
            destination: null,
            nearPort: true,
            distanceFromPortKm: 0,
            lastSeen: departureActual ?? arrivalActual,
            source: "datalastic",
            stayHours,
            arrivalActual,
            departureActual,
        }
    } catch (err) {
        console.warn("Datalastic fetch error:", err)
        return getEmptyResult(mmsi)
    }
}

export async function getVesselAISData(
    mmsi: string,
    portLocode: string,
    dateFrom: string,
    dateTo: string
): Promise<AISStreamResult> {
    const historical = await getPortCallHistory(mmsi, portLocode, dateFrom, dateTo)
    if (historical.found) {
        return historical
    }

    return checkVesselPosition(mmsi, portLocode)
}
