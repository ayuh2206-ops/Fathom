export type FleetVesselStatus = "moving" | "anchored" | "moored" | "unknown"

export type FleetVessel = {
    id: string
    name: string
    mmsi: string
    imo: string | null
    type: string
    lat: number | null
    lng: number | null
    heading: number
    speed: number
    status: FleetVesselStatus
    nextPort: string
    eta: string
    lastUpdated: string | null
    source: "aisstream" | "manual"
}
