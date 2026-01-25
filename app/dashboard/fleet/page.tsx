"use client"

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
import { FleetList } from "@/components/fleet/FleetList"
import { AddVesselModal } from "@/components/fleet/AddVesselModal"
import { Button } from "@/components/ui/button"
import { Plus, List, Map as MapIcon, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Dynamically import Map to disable SSR
const FleetMap = dynamic(() => import('@/components/fleet/FleetMap'), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-slate-900 animate-pulse rounded-lg flex items-center justify-center text-slate-500">Loading Map...</div>
})

// MOCK DATA
const INITIAL_VESSELS = [
    { id: '1', name: 'EVER GIVEN', imo: '9811000', lat: 30.01, lng: 32.55, heading: 45, speed: 12.0, status: 'moving', nextPort: 'Rotterdam', eta: '2024-02-15 14:00' },
    { id: '2', name: 'MAERSK ALABAMA', imo: '9164263', lat: 25.10, lng: -55.20, heading: 270, speed: 16.5, status: 'moving', nextPort: 'Charleston', eta: '2024-02-12 09:30' },
    { id: '3', name: 'HMM ALGECIRAS', imo: '9863297', lat: 1.25, lng: 103.80, heading: 0, speed: 0, status: 'moored', nextPort: 'Singapore', eta: 'Arrived' },
    { id: '4', name: 'CMA CGM MARCO POLO', imo: '9454436', lat: 45.45, lng: -73.35, heading: 92, speed: 0.5, status: 'anchored', nextPort: 'Montreal', eta: '2024-02-10 18:00' },
]

export default function FleetPage() {
    const [vessels, setVessels] = useState<any[]>(INITIAL_VESSELS)
    const [view, setView] = useState("map")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // Simulation loop
    useEffect(() => {
        const interval = setInterval(() => {
            setVessels(current => current.map(v => {
                if (v.status === 'moving') {
                    return {
                        ...v,
                        lat: v.lat + (Math.random() - 0.5) * 0.05,
                        lng: v.lng + (Math.random() - 0.5) * 0.05,
                        speed: Math.max(0, Math.min(25, v.speed + (Math.random() - 0.5))),
                        heading: (v.heading + (Math.random() - 0.5) * 5) % 360
                    }
                }
                return v
            }))
        }, 2000) // Update every 2 seconds

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Fleet Management</h2>
                    <p className="text-slate-400">Track and manage your vessels in real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={() => window.location.reload()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button className="bg-ocean text-white hover:bg-ocean-dark" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vessel
                    </Button>
                </div>
            </div>

            {/* Tabs / View Toggle */}
            <Tabs defaultValue="map" value={view} onValueChange={setView} className="space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-slate-900 border border-white/10">
                        <TabsTrigger value="map" className="data-[state=active]:bg-ocean data-[state=active]:text-white"><MapIcon className="h-4 w-4 mr-2" /> Map View</TabsTrigger>
                        <TabsTrigger value="list" className="data-[state=active]:bg-ocean data-[state=active]:text-white"><List className="h-4 w-4 mr-2" /> List View</TabsTrigger>
                    </TabsList>

                    <div className="flex gap-4 text-sm text-slate-400">
                        <span>Total: <strong className="text-white">{vessels.length}</strong></span>
                        <span>Moving: <strong className="text-green-400">{vessels.filter(v => v.status === 'moving').length}</strong></span>
                    </div>
                </div>

                <TabsContent value="map" className="m-0 focus-visible:ring-0">
                    <FleetMap vessels={vessels} />
                </TabsContent>

                <TabsContent value="list" className="m-0 focus-visible:ring-0">
                    <FleetList vessels={vessels} onViewDetails={(id) => alert(`View details for ${id}`)} />
                </TabsContent>
            </Tabs>

            <AddVesselModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={(vessel) => setVessels([...vessels, vessel])}
            />
        </div>
    )
}
