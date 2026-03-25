"use client"

import { useState, useMemo } from 'react'
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Anchor, Navigation, Map as MapIcon } from "lucide-react"

// Ensure access token is set in .env.local
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

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
    const [popupInfo, setPopupInfo] = useState<Vessel | null>(null)

    const markers = useMemo(() => vessels.map(vessel => (
        <Marker
            key={vessel.id}
            longitude={vessel.lng}
            latitude={vessel.lat}
            anchor="center"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={(e: any) => {
                e.originalEvent.stopPropagation();
                setPopupInfo(vessel);
            }}
        >
            <div
                className="cursor-pointer transition-transform duration-300 hover:scale-125"
                style={{
                    transform: `rotate(${vessel.heading}deg)`,
                    width: '24px',
                    height: '24px',
                    background: '#0ea5e9',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                    boxShadow: '0 0 10px rgba(14, 165, 233, 0.5)'
                }}
            >
                <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '10px solid white', transform: 'translateY(-2px)' }} />
            </div>
        </Marker>
    )), [vessels]);

    if (!MAPBOX_TOKEN) {
        return (
            <div className="h-[600px] w-full rounded-lg border border-red-500/30 bg-slate-900/50 flex flex-col items-center justify-center text-center p-6 relative z-0">
                <MapIcon className="h-12 w-12 text-red-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Mapbox API Key Required</h3>
                <p className="text-slate-400 max-w-md">
                    To render the 3D WebGL map, please add your Mapbox API Key to <code className="bg-black px-2 py-1 rounded text-blue-400">.env.local</code> as <code className="bg-black px-2 py-1 rounded text-blue-400">NEXT_PUBLIC_MAPBOX_TOKEN</code>
                </p>
                <p className="text-xs text-slate-500 mt-4">(You mentioned you haven&apos;t bought the API credentials yet. This is where it plugs in!)</p>
            </div>
        )
    }

    return (
        <div className="h-[600px] w-full rounded-lg overflow-hidden border border-white/10 relative z-0">
            <Map
                initialViewState={{
                    longitude: 0,
                    latitude: 20,
                    zoom: 2.5
                }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
            >
                <NavigationControl position="top-left" />

                {markers}

                {popupInfo && (
                    <Popup
                        longitude={popupInfo.lng}
                        latitude={popupInfo.lat}
                        anchor="bottom"
                        onClose={() => setPopupInfo(null)}
                        closeButton={false}
                        className="fathom-mapbox-popup"
                        maxWidth="300px"
                    >
                        <div className="bg-slate-950 border border-white/10 text-slate-100 p-0 overflow-hidden rounded-md min-w-[200px] shadow-2xl">
                            <div className="p-3 bg-slate-900 border-b border-white/10 flex justify-between items-center">
                                <span className="font-bold flex items-center gap-2">
                                    <Anchor className="h-4 w-4 text-ocean" />
                                    {popupInfo.name}
                                </span>
                                <Badge variant={popupInfo.status === 'moving' ? 'default' : 'secondary'} className="text-xs">
                                    {popupInfo.status}
                                </Badge>
                            </div>
                            <div className="p-3 space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Navigation className="h-4 w-4" />
                                    <span>Heading: {popupInfo.heading}° @ {popupInfo.speed} kn</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-white/5">
                                    <span className="text-slate-500">Next Port:</span>
                                    <span className="text-white">{popupInfo.nextPort}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">ETA:</span>
                                    <span className="text-white">{popupInfo.eta}</span>
                                </div>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>

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
