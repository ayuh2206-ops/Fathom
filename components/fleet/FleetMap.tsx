"use client"

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Anchor, Navigation } from "lucide-react"

// Fix for default marker icon in Leaflet with Next.js
const createCustomIcon = (heading: number) => L.divIcon({
    className: 'custom-boat-icon',
    html: `<div style="transform: rotate(${heading}deg); width: 24px; height: 24px; background: #0ea5e9; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 0 10px rgba(14, 165, 233, 0.5);">
    <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 10px solid white; transform: translateY(-2px);"></div>
  </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
})

interface Vessel {
    id: string
    name: string
    imo: string
    lat: number
    lng: number
    heading: number
    speed: number
    status: 'moving' | 'anchored' | 'moored'
    nextPort: string
    eta: string
}

interface FleetMapProps {
    vessels: Vessel[]
}

export default function FleetMap({ vessels }: FleetMapProps) {
    // Fix for window undefined on server render
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return <div className="h-[600px] w-full bg-slate-900 animate-pulse rounded-lg" />

    return (
        <div className="h-[600px] w-full rounded-lg overflow-hidden border border-white/10 relative z-0">
            <MapContainer
                center={[20, 0]}
                zoom={3}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', background: '#020617' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {vessels.map((vessel) => (
                    <Marker
                        key={vessel.id}
                        position={[vessel.lat, vessel.lng]}
                        icon={createCustomIcon(vessel.heading)}
                    >
                        <Popup className="bg-slate-950 border border-white/10 text-slate-100 p-0 overflow-hidden rounded-md min-w-[200px]">
                            <div className="p-3 bg-slate-900 border-b border-white/10 flex justify-between items-center">
                                <span className="font-bold flex items-center gap-2">
                                    <Anchor className="h-4 w-4 text-ocean" />
                                    {vessel.name}
                                </span>
                                <Badge variant={vessel.status === 'moving' ? 'default' : 'secondary'} className="text-xs">
                                    {vessel.status}
                                </Badge>
                            </div>
                            <div className="p-3 space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Navigation className="h-4 w-4" />
                                    <span>Heading: {vessel.heading}° @ {vessel.speed} kn</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-white/5">
                                    <span className="text-slate-500">Next Port:</span>
                                    <span className="text-white">{vessel.nextPort}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">ETA:</span>
                                    <span className="text-white">{vessel.eta}</span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Map Legend Overlay */}
            <Card className="absolute bottom-4 left-4 p-4 bg-slate-950/90 border-white/10 backdrop-blur-sm shadow-xl z-[1000] w-48">
                <h4 className="text-sm font-semibold text-white mb-3">Fleet Status</h4>
                <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Moving
                        </span>
                        <span className="text-white font-mono">{vessels.filter(v => v.status === 'moving').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            Anchored
                        </span>
                        <span className="text-white font-mono">{vessels.filter(v => v.status === 'anchored').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                            In Port
                        </span>
                        <span className="text-white font-mono">{vessels.filter(v => v.status === 'moored').length}</span>
                    </div>
                </div>
            </Card>
        </div>
    )
}
